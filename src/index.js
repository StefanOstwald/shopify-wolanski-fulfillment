import { WorkflowNewOrderUpload } from './orderUpload/workflow/orderUpload.workflow';

export const handler = function(event, context) {
  const workflow = new WorkflowNewOrderUpload();
  workflow.triggerSafely(event).then(res => context.succeed(res));
};
