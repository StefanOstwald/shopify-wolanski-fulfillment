import { getLocalTime, isTimeForTask } from '../../util/timeHelper';

export class OrderUploadTimeKeeper {
  constructor(targetUploadTimeHour, targetUploadTimeMinute, bufferTimeBeforeForLastOrderBeforeTargetExecutionTime) {
    this.targetUploadTimeHour = targetUploadTimeHour || process.env.ORDER_UPLOAD_EXECUTION_TIME_HOUR || 12;
    this.targetUploadTimeMin = targetUploadTimeMinute || process.env.ORDER_UPLOAD_EXECUTION_TIME_MIN || 0;
    this.bufferTimeBeforeForLastOrderBeforeTargetExecutionTime =
      bufferTimeBeforeForLastOrderBeforeTargetExecutionTime ||
      process.env.ORDER_UPLOAD_BUFFER_TIME_FOR_LAST_ORDER_BEFORE_EXECUTION_TIME_MIN ||
      30;
  }

  isTimeForTask() {
    return isTimeForTask(this.targetUploadTimeHour, this.targetUploadTimeMin);
  }

  previousTimeIntervallStart() {
    return this.previousTimeIntervallEnd().subtract(1, 'd');
  }

  previousTimeIntervallEnd() {
    return getLocalTime()
      .startOf('day')
      .hour(this.targetUploadTimeHour)
      .minute(this.targetUploadTimeMin)
      .subtract(this.bufferTimeBeforeForLastOrderBeforeTargetExecutionTime, 'minutes');
  }
}
