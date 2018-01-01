import { assert } from 'chai';
import { describe, it } from 'mocha';
import moment from 'moment-timezone';
import { TimeKeeper } from './timeKeeper';

require('dotenv').config();

describe('timeKeeper', () => {
  it('previousTimeIntervallEnd', async () => {
    console.log(`previousTimeIntervallEnd:${console.log(TimeKeeper.previousTimeIntervallEnd())}`);
  });

  it('previousTimeIntervallStart', async () => {
    console.log(`previousTimeIntervallEnd:${console.log(TimeKeeper.previousTimeIntervallStart())}`);
  });

  it('moment works with timezone like in the example', () => {
    const june = moment('2014-06-01T12:00:00Z');
    console.log(june.tz('America/Los_Angeles').format('ha z')); // 5am PDT
    console.log(june.tz('America/New_York').format('ha z')); // 8am EDT
    console.log(june.tz('Europe/Berlin').format('ha z'));
  });

  it('works from scratch', () => {
    const targetTime = moment()
      .tz('Europe/Berlin')
      .startOf('day')
      .hour(11)
      .minute(30);
    console.log(`targetTime: ${JSON.stringify(targetTime, null, 2)}`);
  });
});
