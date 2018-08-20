import { slack } from '../util/slack';
import { convertShopifyOrdersToWolanskiStructure } from '../wolanski/shopifyToWolanski';
import { FileCreator } from '../wolanski/fileCreator';
import { WolanskiFtp } from '../wolanski/ftp';
import { TimeKeeper } from '../util/timeKeeper';
import { Shopify } from '../shopify';

require('dotenv').config();

export class WorkflowNewOrderUpload {
  async queryOrders() {
    try {
      const shopify = new Shopify();
      this.shopifyOrders = await shopify.getOrdersInTimespane(TimeKeeper.previousTimeIntervallStart(), TimeKeeper.previousTimeIntervallEnd());
      console.log(`this.shopifyOrders count: ${this.shopifyOrders.length}`);
    } catch (err) {
      console.log(`### Error ###\nmessage: ${err.message};\nstack: ${err.stack}`);
    }
  }

  convertOrdersToWolanskiCsv() {
    const csvArray = convertShopifyOrdersToWolanskiStructure(this.shopifyOrders);
    this.csvFile = FileCreator.createCsvFileFromArray(csvArray);
    this.csvName = FileCreator.genFileName();
    console.log(`FileCreater.genFileName();: ${JSON.stringify(FileCreator.genFileName(), null, 2)}`);
    console.log(`this.csvName : ${JSON.stringify(this.csvName, null, 2)}`);
  }

  uploadCsvToFtp() {
    const ftp = new WolanskiFtp();
    return ftp.uploadOrders(this.csvFile, this.csvName);
  }

  async executeWorkflow() {
    await this.queryOrders();
    await this.convertOrdersToWolanskiCsv();
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
