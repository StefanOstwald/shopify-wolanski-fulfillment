import fs from 'fs';
import { slack } from '../util/slack';
import { convertShopifyOrdersToWolanskiStructure, getEmptyOrder } from '../wolanski/shopifyToWolanski';
import { CsvOrderExporter } from '../wolanski/csvOrderExporter';
import { WolanskiFtp } from '../wolanski/ftp';
import { TimeKeeper } from '../util/timeKeeper';
import { Shopify } from '../shopify';
import { encodeInLatin } from '../util/latinEncoding';

require('dotenv').config();

export class WorkflowNewOrderUpload {
  constructor() {
    this.csvName = '';
    this.csvFile = '';
    this.wolanskiOrders = [];
    this.shopifyOrders = [];
  }


  async queryOrders() {
    try {
      const shopify = new Shopify();
      this.shopifyOrders = await shopify.getOrdersInTimespane(
        TimeKeeper.previousTimeIntervallStart(),
        TimeKeeper.previousTimeIntervallEnd()
      );
      console.log(`this.shopifyOrders count: ${this.shopifyOrders.length}`);
    } catch (err) {
      console.log(`### Error ###\nmessage: ${err.message};\nstack: ${err.stack}`);
    }
  }

  convertOrdersToWolanskiStyleArray() {
    this.wolanskiOrders = convertShopifyOrdersToWolanskiStructure(this.shopifyOrders);
  }

  generateCsvFile() {
    const csvOrderExporter = new CsvOrderExporter();
    csvOrderExporter.orders = this.wolanskiOrders;
    csvOrderExporter.removeDelimiterFromCsvStrings();
    this.csvFile = csvOrderExporter.genCsv();
    this.csvName = CsvOrderExporter.genFileName();
    console.log(`FileCreater.genFileName();: ${JSON.stringify(CsvOrderExporter.genFileName(), null, 2)}`);
    console.log(`this.csvName : ${JSON.stringify(this.csvName, null, 2)}`);
  }

  convertToLatinEncoding() {
    this.csvFile = encodeInLatin(this.csvFile);
  }

  uploadCsvToFtp() {
    const ftp = new WolanskiFtp();
    return ftp.uploadOrders(this.csvFile, this.csvName);
  }

  addTestOrderForEncoding() {
    const testOrder = getEmptyOrder();
    testOrder.T_Name1 = 'no encoding';
    testOrder.T_Name2 = 'ae ä, Ae Ä, ue ü, Ue Ü, oe ö, Oe Ö, ss ß, Fragezeichen ?, Gleich =, add @, Euro €, Anführungszeichen unten „, Anführungzeichen oben “, Schreibmaschinen Anführungszeichen ", Strichpunkt (sollte gelöscht sein) ;, Doppelpunkt :, slash /, backslash \\, pipe |, a, cedille ç, a Accent grave à';
    this.wolanskiOrders.push(testOrder);
  }

  writeCsvToDisk() {
    fs.writeFileSync(`./${this.csvName}-latin1.csv`, this.csvFile, { encoding: 'latin1' });
    fs.writeFileSync('./latestExport-latin1.csv', this.csvFile, { encoding: 'latin1' });
    fs.writeFileSync(`./${this.csvName}-utf8.csv`, this.csvFile);
  }


  async executeWorkflow() {
    // await this.queryOrders();
    await this.convertOrdersToWolanskiStyleArray();
    this.addTestOrderForEncoding();
    await this.generateCsvFile();
    // this.convertToLatinEncoding();
    await this.writeCsvToDisk();
    await this.uploadCsvToFtp();
    slack.log('Orders are successfully transmitted to Wolanski');
  }

  async trigger(event) {
    if (TimeKeeper.isTimeForFullfillmentUpload() || event.forceExecution) {
      console.log('executing Wolanski workflow');
      await this.executeWorkflow();
      await slack.getActivePromise();
    } else {
      console.log(`it is not time for a fulfillment upload: ${TimeKeeper.getLocalTime().format()}`);
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
}
