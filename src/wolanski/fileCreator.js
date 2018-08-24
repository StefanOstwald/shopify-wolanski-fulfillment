import json2csv from 'json2csv';
import _ from 'lodash';
import { getEmptyOrder } from './shopifyToWolanski';
import { TimeKeeper } from '../util/timeKeeper';

export class FileCreator {
  static createCsvFileFromArray(csvArray) {
    const delimiter = ';';
    const csvArrayWithoutDelimiter = FileCreator.replaceDelimiterInAllStringsWithReplacer(csvArray, delimiter);
    const emptyOrder = getEmptyOrder();
    emptyOrder['aaaaaaäöüaaaaaa'] = 'aaaaaaäöüaaaaaa';
    const fields = _.keys(emptyOrder);
    // const fields = _.keys(getEmptyOrder());
    const file = json2csv({
      data: csvArray, fields, del: delimiter, quotes: '',
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
        obj[key] = FileCreator.replaceDelimiterInAllStringsWithReplacer(obj[key], delimiter, replacer);
      }
    });

    return obj;
  }
}

