import json2csv from 'json2csv';
import { getLocalTime } from '../../util/timeHelper';
import { getEmptyOrder } from './orderUpload.shopifyToWolanski';

export class CsvOrderExporter {
  constructor() {
    this.orders = [];
    this.delimiter = ';';
    this.delimiterInStringReplacer = ' ';
  }

  removeDelimiterFromCsvStrings() {
    this.orders = CsvOrderExporter.replaceUnallowedCharsInAllStringsWithReplacer(
      this.orders,
      this.delimiter,
      this.delimiterInStringReplacer
    );
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

      const valueContainsSubattributes = (typeof obj[key] === 'object') && (obj[key] !== null) && (Object.keys(obj[key]).length > 0);
      if (valueContainsSubattributes) {
        obj[key] = CsvOrderExporter.replaceUnallowedCharsInAllStringsWithReplacer(obj[key], delimiter, replacer);
      }
    });

    return obj;
  }
}

