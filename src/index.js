import { WorkflowNewOrderUpload } from './orderUpload/workflow/orderUpload.workflow';
import { WorkflowTracking } from './tracking/workflow/tracking.workflow';

require('dotenv').config();

export const handler = async function(event, context) {
  const orderUpload = new WorkflowNewOrderUpload();
  await orderUpload.triggerSafely(event);

  const tracking = new WorkflowTracking();
  await tracking.triggerSafely(event);

  context.succeed();
};
