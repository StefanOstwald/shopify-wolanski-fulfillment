import fs from 'fs';
import { slack } from '../../util/slack';
import { WolanskiFtp } from '../../util/ftp';
import { TrackingTimeKeeper } from '../timeKeeper/orderUpload.timeKeeper';
import { getLocalTime } from '../../util/timeHelper';
import { CsvTrackingParser } from '../csv/tracking.csvTrackingParser';
import { Shopify } from '../../shopify';

export class WorkflowTracking {
  constructor() {
    this.csvFilePathOnDisk = WorkflowTracking.defaultCsvFilePath();
    this.trackingFileExistsOnFtp = false;
    this.trackingInfos = [];
    this.trackingTimeKeeper = new TrackingTimeKeeper();
    this.shopify = new Shopify();
    this.ftp = new WolanskiFtp();
  }

  static defaultCsvFilePath() {
    return '/tmp/tracking-temp.csv';
  }

  async executeWorkflow() {
    await this.downloadTrackingCsvFromFtp();
    if (!this.trackingFileExistsOnFtp) {
      console.log('Tracking: No tracking information found for today');
      return;
    }
    await this.loadTrackingInfo();
    await this.updateShopifyWithAllTrackingInfos();
    await this.deleteFileOnDisk();
  }

  async trigger(event) {
    if (this.trackingTimeKeeper.isTimeForTask() || event.forceExecutionTracking) {
      console.log('executing update tracking workflow');
      await this.executeWorkflow();
      await slack.getActivePromise();
    } else {
      console.log(`it is not time to update tracking information: ${getLocalTime().format()}`);
    }
  }

  async loadTrackingInfo() {
    this.csvString = fs.readFileSync(this.csvFilePathOnDisk, { encoding: 'latin1' });
    console.log('local tracking file loaded');
    const csvTrackingParser = new CsvTrackingParser();
    await csvTrackingParser.parseString(this.csvString);
    this.trackingInfos = csvTrackingParser.getTrackingInfos();
  }

  async updateShopifyWithAllTrackingInfos() {
    for (let iRow = 0; iRow<this.trackingInfos.length; iRow++ ) {
      const iTrackingInfo = this.trackingInfos[iRow];
      
      if (!iTrackingInfo.shopifyOrderId) {
        slack.error(`ShopifyOrder is missing in row ${iRow}. The order has not been updated.\ntrackingInfo: ${JSON.stringify(iTrackingInfo, null, 2)}`);
        continue;
      }

      try {
        await this.shopify.addFulfillmentToOrder(iTrackingInfo);
      } catch (err) {
        slack.error(`### Error ###\nmessage: ${err.message};\nstack: ${err.stack}`);
      }
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

  async downloadTrackingCsvFromFtp() {
    await this.ftp.connect();

    const ftpFolder = process.env.WOLANSKI_FTP_TRACKING_DOWNLOAD_PATH || '/';
    const ftpFilename = `${getLocalTime().format('DD_MM_YYYY')}.csv`;

    this.trackingFileExistsOnFtp = await this.ftp.fileExists(ftpFolder, ftpFilename);
    if (this.trackingFileExistsOnFtp) {
      await this.ftp.downloadFile(this.csvFilePathOnDisk, ftpFolder + ftpFilename);
    }

    await this.ftp.disconnect();
  }

  deleteFileOnDisk() {
    fs.unlinkSync(this.csvFilePathOnDisk);
  }
}
