import json2csv from 'json2csv';
import { getLocalTime } from '../../util/timeHelper';
import { getEmptyOrder } from './orderUpload.shopifyToWolanski';
import { slack } from '../../util/slack';

export class CsvOrderExporter {
  constructor() {
    this.orders = [];
    this.delimiter = ';';
    this.delimiterInStringReplacer = ' ';
  }

  removeDelimiterFromCsvStrings() {
    try {
      this.orders = CsvOrderExporter.replaceUnallowedCharsInAllStringsWithReplacer(
        this.orders,
        this.delimiter,
        this.delimiterInStringReplacer
      );
    } catch (err) {
      console.log(`### Error ###\nmessage: ${err.message};\nstack: ${err.stack}`);
      console.log(`this.orders: ${JSON.stringify(this.orders, null, 2)}`);
      slack.error('removeDelimiterFromCsvStrings failed. The order was processed without the filtering');
    }
  }

  genCsv() {
    const fields = Object.keys(getEmptyOrder());
    const file = json2csv({
      data: this.orders,
      fields,
      del: this.delimiter,
      quotes: '',
    });

    const fileWithWindowsEOL = file.replace(/\r\n|\r|\n/g, '\r\n');
    return fileWithWindowsEOL;
  }

  static genRemoteFileName() {
    return `${getLocalTime().format('YYYY-MM-DD')}.csv`;
  }

  static replaceUnallowedCharsInAllStringsWithReplacer(obj, delimiter = ';', replacer = ' ') {
    Object.keys(obj).forEach((key) => {
      if (typeof obj[key] === 'string') {
        obj[key] = obj[key].replace(delimiter, replacer);
        obj[key] = obj[key].replace(/\r\n|\r|\n/g, ' - ');
        return;
      }

      const valueContainsSubattributes = (!!obj[key]) && (obj[key] !== undefined) && (obj[key] !== null) && (typeof obj[key] === 'object') && (Object.keys(obj[key]).length > 0);
      if (valueContainsSubattributes) {
        obj[key] = CsvOrderExporter.replaceUnallowedCharsInAllStringsWithReplacer(obj[key], delimiter, replacer);
      }
    });

    return obj;
  }
}

