import csvtojson from 'csvtojson';

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
      trackingInfos.push({
        shopifyOrderId: trackingInfo.Durchreichefeld,
        trackingUrl: trackingInfo.Sendungsverfolgung || null,
        trackingNumber: trackingInfo.PaketNr,
      });
    });
    return trackingInfos;
  }
}
