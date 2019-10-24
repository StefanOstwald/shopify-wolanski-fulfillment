import csvtojson from 'csvtojson';
import { slack } from '../../util/slack';

export class CsvTrackingParser {
  constructor() {
    this.parser = csvtojson({ delimiter: ';', trim: true, quote: 'off' });
  }

  async parseString(str) {
    this.parsedCsv = await this.parser.fromString(str);
  }

  getTrackingInfos() {
    const trackingInfos = [];
    this.parsedCsv.forEach((trackingInfo) => {
      try {
        const shopifyOrderId = typeof trackingInfo.Durchreichefeld === 'string' ?
          trackingInfo.Durchreichefeld.replace('shopifyOrderId:', '') : trackingInfo.Durchreichefeld;

        trackingInfos.push({
          shopifyOrderId,
          trackingUrl: trackingInfo.Sendungsverfolgung || null,
          trackingNumber: trackingInfo.PaketNr,
        });
      } catch (err) {
        slack.warn(`### Error ###\nmessage: ${err.message};\nstack: ${err.stack}`);
      }
    });
    return trackingInfos;
  }
}
