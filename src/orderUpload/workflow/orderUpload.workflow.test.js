import { WorkflowNewOrderUpload } from './orderUpload.workflow';
import { getEmptyOrder } from '../shopify/orderUpload.shopifyToWolanski';

require('dotenv').config();

describe('workflow', () => {
  test('runs when shopify returns orders', async () =>{
    const workflow = new WorkflowNewOrderUpload();
    await workflow.executeWorkflow();
  }, 10000);
});


function genTestOrderForEncoding() {
  const testOrder = getEmptyOrder();
  testOrder.T_Name1 = 'no encoding';
  testOrder.T_Name2 = 'ae ä, Ae Ä, ue ü, Ue Ü, oe ö, Oe Ö, ss ß, Fragezeichen ?, Gleich =, add @, Euro €, Anführungszeichen unten „, Anführungzeichen oben “, Schreibmaschinen Anführungszeichen ", Strichpunkt (sollte gelöscht sein) ;, Doppelpunkt :, slash /, backslash \\, pipe |, a, cedille ç, a Accent grave à';
  this.wolanskiOrders.push(testOrder);
}