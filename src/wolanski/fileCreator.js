import moment from 'moment-timezone';
import json2csv from 'json2csv';
import _ from 'lodash';
import { getEmptyOrder } from './shopifyToWolanski';
import { TimeKeeper } from '../util/timeKeeper';
import windows1252 from 'windows-1252';

export class FileCreator {
  static createCsvFileFromArray(csvArray) {
    const delimiter = ';';
    const fields = _.keys(getEmptyOrder());
    const encodedFields = convertArrayToLatin(fields);
    const encodedCsvArray = convertArrayToLatin(csvArray);
    const file = json2csv({
      data: encodedCsvArray, fields: encodedFields, del: delimiter, quotes: '',
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


function convertArrayToLatin(arr) {
  return (Array.isArray(arr)) ? arr.map(convertStringToLatin) : arr;
}

function convertStringToLatin(str) {
  return windows1252.encode(str, {
    'mode': 'html'
  })
}