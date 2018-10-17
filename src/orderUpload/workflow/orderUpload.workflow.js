import fs from 'fs';
import { slack } from '../../util/slack';
import { convertShopifyOrdersToWolanskiStructure } from '../csv/orderUpload.shopifyToWolanski';
import { CsvOrderExporter } from '../csv/orderUpload.csvOrderExporter';
import { WolanskiFtp } from '../../util/ftp';
import { OrderUploadTimeKeeper } from '../timeKeeper/orderUpload.timeKeeper';
import { getLocalTime } from '../../util/timeHelper';
import { Shopify } from '../../shopify';

export class WorkflowNewOrderUpload {
  constructor() {
    this.csvNameOnFtp = '';
    this.csvFileData = '';
    this.csvFilePathOnDisk = '/tmp/newOrders-temp.csv';
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
  }

  async trigger(event) {
    if (new OrderUploadTimeKeeper().isTimeForTask() || event.forceExecutionOrderUpload) {
      console.log('executing order fulfillment workflow');
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
      slack.error(`### Error ###\nmessage: ${err.message};\nstack: ${err.stack}`);
      throw err;
    }
  }

  async queryOrders() {
    const timeKeeper = new OrderUploadTimeKeeper();
    const shopify = new Shopify();
    this.shopifyOrders = await shopify.getOrdersInTimespane(
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
    this.csvNameOnFtp = CsvOrderExporter.genRemoteFileName();
    console.log(`FileCreater.genRemoteFileName();: ${JSON.stringify(CsvOrderExporter.genRemoteFileName(), null, 2)}`);
    console.log(`this.csvName : ${JSON.stringify(this.csvNameOnFtp, null, 2)}`);
  }

  async uploadFileToFtp() {
    const ftp = new WolanskiFtp();
    await ftp.connect();
    const ftpRootPath = process.env.WOLANSKI_FTP_ORDER_UPLOAD_PATH || '/';
    await ftp.uploadFile(this.csvFilePathOnDisk, ftpRootPath + this.csvNameOnFtp);
    await ftp.disconnect();
  }

  writeCsvToFileOnDisk() {
    fs.writeFileSync(this.csvFilePathOnDisk, this.csvFileData, { encoding: 'latin1' });
  }

  deleteFileOnDisk() {
    fs.unlinkSync(this.csvFilePathOnDisk);
  }
}
