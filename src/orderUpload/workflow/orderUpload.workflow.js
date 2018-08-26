import fs from 'fs';
import { slack } from '../../util/slack';
import { convertShopifyOrdersToWolanskiStructure, getEmptyOrder } from '../shopify/orderUpload.shopifyToWolanski';
import { CsvOrderExporter } from '../csv/orderUpload.csvOrderExporter';
import { WolanskiFtp } from '../../util/ftp';
import { TimeKeeper } from '../timeKeeper/orderUpload.timeKeeper';
import { encodeInLatin } from '../../util/latinEncoding';
import { getOrdersInTimespane } from '../shopify/orderUpload.shopify';
import { getLocalTime } from '../../util/timeHelper';

require('dotenv').config();

export class WorkflowNewOrderUpload {
  constructor() {
    this.csvNameOnFtp = '';
    this.csvFileData = '';
    this.csvFilePathOnDisk = './csvExports/newOrders-temp.csv';
    this.wolanskiOrders = [];
    this.shopifyOrders = [];
  }

  async executeWorkflow() {
    await this.queryOrders();
    await this.convertOrdersToWolanskiStyleArray();
    await this.generateCsvFile();
    await this.writeCsvToFileOnDisk();
    await this.uploadFileToFtp();
    await this.deleteFileOnDisk();
    slack.log('Orders are successfully transmitted to Wolanski');
  }

  async trigger(event) {
    if (new TimeKeeper().isTimeForFullfillmentUpload() || event.forceExecution) {
      console.log('executing Wolanski workflow');
      await this.executeWorkflow();
      await slack.getActivePromise();
    } else {
      console.log(`it is not time for a fulfillment upload: ${getLocalTime().format()}`);
    }
  }

  async triggerSafely(event) {
    try {
      return await this.trigger(event);
    } catch (err) {
      slack.error(err);
      console.log(`### Error ###\nmessage: ${err.message};\nstack: ${err.stack}`);
      throw err;
    }
  }

  async queryOrders() {
    const timeKeeper = new TimeKeeper();
    this.shopifyOrders = await getOrdersInTimespane(
      timeKeeper.previousTimeIntervallStart(),
      timeKeeper.previousTimeIntervallEnd()
    );
    console.log(`this.shopifyOrders count: ${this.shopifyOrders.length}`);
  }

  convertOrdersToWolanskiStyleArray() {
    this.wolanskiOrders = convertShopifyOrdersToWolanskiStructure(this.shopifyOrders);
  }

  generateCsvFile() {
    const csvOrderExporter = new CsvOrderExporter();
    csvOrderExporter.orders = this.wolanskiOrders;
    csvOrderExporter.removeDelimiterFromCsvStrings();
    this.csvFileData = csvOrderExporter.genCsv();
    this.csvNameOnFtp = CsvOrderExporter.genFileName();
    console.log(`FileCreater.genFileName();: ${JSON.stringify(CsvOrderExporter.genFileName(), null, 2)}`);
    console.log(`this.csvName : ${JSON.stringify(this.csvNameOnFtp, null, 2)}`);
  }

  convertToLatinEncoding() {
    this.csvFileData = encodeInLatin(this.csvFileData);
  }

  uploadFileToFtp() {
    const ftp = new WolanskiFtp();
    return ftp.uploadOrders(this.csvFilePathOnDisk, this.csvNameOnFtp);
  }

  writeCsvToFileOnDisk() {
    fs.writeFileSync(this.csvFilePathOnDisk, this.csvFileData, { encoding: 'latin1' });
  }

  deleteFileOnDisk() {
    fs.unlinkSync(this.csvFilePathOnDisk);
  }
}
