import moment from 'moment';
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
    return './csvExports/tracking-temp.csv';
  }

  async executeWorkflow() {
    await this.downloadTrackingCsvFromFtp();
    if (this.trackingFileExistsOnFtp) {
      await this.loadTrackingInfo();
      await this.updateShopifyWithTrackingInfo();
      await this.deleteFileOnDisk();
      slack.log('Tracking: Shopify is updated with tracking information from Wolanski');
    } else {
      slack.log('Tracking: No tracking information found for today');
    }
  }

  async trigger(event) {
    if (this.trackingTimeKeeper.isTimeForTask() || event.forceExecution) {
      console.log('executing update tracking workflow');
      await this.executeWorkflow();
      await slack.getActivePromise();
    } else {
      console.log(`it is not time to update tracking information: ${getLocalTime().format()}`);
    }
  }

  async loadTrackingInfo() {
    this.csvString = fs.readFileSync(this.csvFilePathOnDisk, { encoding: 'latin1' });
    const csvTrackingParser = new CsvTrackingParser();
    await csvTrackingParser.parseString(this.csvString);
    this.trackingInfos = csvTrackingParser.getTrackingInfos();
  }

  async updateShopifyWithTrackingInfo() {
    const promises = [];
    this.trackingInfos.forEach((trackingInfo) => {
      promises.push(this.shopify.addTrackingToOrder(trackingInfo));
    });
    return Promise.all(promises);
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
    const csvFilenameOnFtp = getLocalTime().format('DD_MM_YYYY.csv');

    this.trackingFileExistsOnFtp = await this.ftp.fileExists(ftpFolder);
    if (this.trackingFileExistsOnFtp) {
      await this.ftp.downloadFile(this.csvFilePathOnDisk, ftpFolder + csvFilenameOnFtp);
    }

    await this.ftp.disconnect();
  }

  deleteFileOnDisk() {
    fs.unlinkSync(this.csvFilePathOnDisk);
  }
}
