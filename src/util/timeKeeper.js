import moment from 'moment-timezone';

const targetUploadTimeHour = 12;
const targetUploadTimeMinute = 0;
const orderDeadlineHour = 11;
const orderDeadlineMinute = 30;

export class TimeKeeper {
  static isTimeForFullfillmentUpload() {
    const targetTime = TimeKeeper.getLocalTime()
      .startOf('day')
      .hour(targetUploadTimeHour)
      .minute(targetUploadTimeMinute);

    const halfHourBeforeTarget = targetTime.clone().subtract(30, 'm');
    const halfHourAfterTarget = targetTime.clone().add(30, 'm');

    return TimeKeeper.getLocalTime().isBetween(halfHourBeforeTarget, halfHourAfterTarget);
  }

  static getTimezone() {
    const timeZone = process.env.MOMENTJS_LOCAL_TIMEZONE || 'Europe/Berlin';
    return timeZone;
  }

  static getLocalTime() {
    return moment()
      .tz(TimeKeeper.getTimezone());
  }

  static previousTimeIntervallStart() {
    return TimeKeeper.previousTimeIntervallEnd().subtract(1, 'd');
    // return TimeKeeper.previousTimeIntervallEnd().subtract(300, 'd');
  }

  static previousTimeIntervallEnd() {
    return TimeKeeper.getLocalTime()
      .startOf('day')
      .hour(orderDeadlineHour)
      .minute(orderDeadlineMinute);
  }
}
