import moment from 'moment-timezone';

export function getTimezone() {
  const timeZone = process.env.MOMENTJS_LOCAL_TIMEZONE || 'Europe/Berlin';
  return timeZone;
}

export function getLocalTime() {
  return moment()
    .tz(getTimezone());
}

export function isTimeForTask(targetTimeHour, targetTimeMin) {
  const targetTime = getLocalTime()
    .hour(targetTimeHour)
    .minute(targetTimeMin);

  const halfHourBeforeTarget = targetTime.clone().subtract(30, 'm');
  const halfHourAfterTarget = targetTime.clone().add(30, 'm');

  return getLocalTime().isBetween(halfHourBeforeTarget, halfHourAfterTarget);
}
