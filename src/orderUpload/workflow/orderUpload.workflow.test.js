import { WorkflowNewOrderUpload } from './orderUpload.workflow';
import { getEmptyOrder } from '../csv/orderUpload.shopifyToWolanski';
import { expressDeliveryOrder } from '../test/orderFixtures';

require('dotenv').config();

describe('workflow', () => {
  test('runs when shopify returns orders', async () => {
    const workflow = new WorkflowNewOrderUpload();
    await workflow.executeWorkflow();
  }, 10000);


  describe("correctly adds Express Delivery to comment", () => {
    const workflow = new WorkflowNewOrderUpload();
    workflow.allShopifyOrders = [expressDeliveryOrder];

    workflow.removeOrderWhichAreFlaggedToBeSkipped();
    workflow.convertOrdersToWolanskiStyleArray();
    workflow.generateCsvFile();
  
    expect(workflow.csvFileData.includes('## Express Versand ##')).toBeTruthy();
  });
});
