import { WorkflowNewOrderUpload } from './workflows/workflowNewOrderUpload';

exports.handler = function(event, context) {
  const workflow = new WorkflowNewOrderUpload();
  workflow.triggerSafely(event).then(res => context.succeed(res));
};
