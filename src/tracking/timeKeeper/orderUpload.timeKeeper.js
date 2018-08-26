import { isTimeForTask } from '../../util/timeHelper';

export class TrackingTimeKeeper {
  constructor(targetTrackingTimeHour, targetTrackingTimeMinute) {
    this.targetTrackingTimeHour = targetTrackingTimeHour || process.env.TRACKING_EXECUTION_TIME_HOUR || 18;
    this.targetTrackingTimeMin = targetTrackingTimeMinute || process.env.TRACKING_EXECUTION_TIME_MIN || 30;
  }

  isTimeForTask() {
    return isTimeForTask(this.targetTrackingTimeHour, this.targetTrackingTimeMin);
  }
}
