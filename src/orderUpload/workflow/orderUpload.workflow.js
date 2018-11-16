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
    this.allShopifyOrders = [];
    this.orderToSkip = [];
    this.fulfillmentShopifyOrders = [];
    this.codeInCommentToNotFulfillOrder = process.env.removeOrderWhichAreFlaggedToBeSkipped || '#dnf#';
  }

  async executeWorkflow() {
    await this.queryOrders();
    this.removeOrderWhichAreFlaggedToBeSkipped();
    await this.convertOrdersToWolanskiStyleArray();
    await this.generateCsvFile();
    await this.writeCsvToFileOnDisk();
    await this.uploadFileToFtp();
    await this.deleteFileOnDisk();
    this.logOrdersToSlack();
  }


  removeOrderWhichAreFlaggedToBeSkipped() {
    const orderShallBeSkipped = (order) => {
      const skipTag = this.codeInCommentToNotFulfillOrder.toLowerCase();
      const orderNote = order.note.toLowerCase();
      return typeof order.note === 'string' && orderNote.includes(skipTag);
    };

    this.orderToSkip = this.allShopifyOrders.filter(orderShallBeSkipped);
    this.fulfillmentShopifyOrders = this.allShopifyOrders.filter(order => !orderShallBeSkipped(order));
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
    this.allShopifyOrders = await shopify.getOrdersInTimespane(
      timeKeeper.previousTimeIntervallStart(),
      timeKeeper.previousTimeIntervallEnd()
    );
    console.log(`this.allShopifyOrders count: ${this.allShopifyOrders.length}`);
  }

  convertOrdersToWolanskiStyleArray() {
    this.wolanskiOrders = convertShopifyOrdersToWolanskiStructure(this.fulfillmentShopifyOrders);
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

  logOrdersToSlack() {
    const orderToLog = order => `
    *${order.name}*
    Shipping: ${order.shipping_address.name}; ${order.shipping_address.company}; ${order.shipping_address.address1}; ${order.shipping_address.address2}; ${order.shipping_address.zip}; ${order.shipping_address.city} 
    Billing: ${order.billing_address.name}; ${order.billing_address.company}; ${order.billing_address.address1}; ${order.billing_address.address2}; ${order.billing_address.zip}; ${order.billing_address.city} 
    Price: ${order.total_price} ${order.currency}
    Comment in order: ${order.note}
    `;

    const formatAsCode = str => `\`\`\` ${str} \`\`\``;

    let log = `${this.wolanskiOrders.length} orders were sent to Wolanski.
${this.orderToSkip.length} orders were skipped.`;

    let code = '';
    if (this.fulfillmentShopifyOrders.length > 0) {
      code += 'Orders sent to Wolanski\n';
      this.fulfillmentShopifyOrders.forEach((order) => {
        code += orderToLog(order);
      });
    }
    if (this.orderToSkip.length > 0) {
      code += 'Orders skipped\n';
      this.orderToSkip.forEach((order) => {
        code += orderToLog(order);
      });
    }

    if (code) {
      log += `\n${formatAsCode(code)}`;
    }

    slack.log(log);
  }
}
