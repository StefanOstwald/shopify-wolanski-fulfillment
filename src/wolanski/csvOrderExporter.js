import json2csv from 'json2csv';
import _ from 'lodash';
import { getEmptyOrder } from './shopifyToWolanski';
import { TimeKeeper } from '../util/timeKeeper';

export class CsvOrderExporter {
  constructor() {
    this.orders = [];
    this.delimiter = ';';
    this.delimiterInStringReplacer = ' ';
  }

  addWolanskiOrder(order) {

  }

  removeDelimiterFromCsvStrings() {
    this.orders = CsvOrderExporter.replaceDelimiterInAllStringsWithReplacer(this.orders, this.delimiter, this.delimiterInStringReplacer);
  }

  genCsv() {
    const fields = Object.keys(getEmptyOrder());
    const file = json2csv({
      data: this.orders, fields, del: this.delimiter, quotes: '',
    });
    return file;
  }

  static genFileName() {
    return `${TimeKeeper.getLocalTime().format('YYYY-MM-DD-T-HH-mm-ss')}.csv`;
  }

  static replaceDelimiterInAllStringsWithReplacer(obj, delimiter = ';', replacer = ' ') {
    Object.keys(obj).forEach((key) => {
      if (typeof obj[key] === 'string') {
        obj[key] = obj[key].replace(delimiter, replacer);
        return;
      }

      const valueContainsSubattributes = typeof obj[key] === 'object' && Object.keys(obj[key]).length > 0;
      if (valueContainsSubattributes) {
        obj[key] = CsvOrderExporter.replaceDelimiterInAllStringsWithReplacer(obj[key], delimiter, replacer);
      }
    });

    return obj;
  }
}

