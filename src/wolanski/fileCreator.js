import moment from 'moment-timezone';
import json2csv from 'json2csv';
import _ from 'lodash';
import { getEmptyOrder } from './shopifyToWolanski';
import { TimeKeeper } from '../util/timeKeeper';

export class FileCreator {
  static createCsvFileFromArray(csvArray) {
    const fields = _.keys(getEmptyOrder());
    const file = json2csv({ data: csvArray, fields, del: ';' });
    return file;
  }

  static genFileName() {
    return `${TimeKeeper.getLocalTime().format('YYYY-MM-DD-T-HH-mm-ss')}.csv`;
  }
}
