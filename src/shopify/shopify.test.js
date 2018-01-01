import { assert } from 'chai';
import { describe, it } from 'mocha';
import rp from 'request-promise';
import { convertShopifyOrdersToWolanskiStructure } from '../wolanski/shopifyToWolanski';

require('dotenv').config();

describe('shopify orders', () => {
  it('can be colected', async () => {
    try {
      const customer = {
        method: 'GET',
        auth: {
          user: process.env.SHOPIFY_READ_KEY,
          pass: process.env.SHOPIFY_READ_PW,
        },
        body: {

        },
        uri: 'https://innoki-shop.myshopify.com/admin/orders.json?ids=115472334875',
        json: true, // Automatically parses the JSON string in the response
      };
      const res2 = await rp(customer);
      console.log(`orders: ${JSON.stringify(res2, null, 2)}`);
      const wolanskiOrder = convertShopifyOrdersToWolanskiStructure(res2.orders);
      console.log(`wolanskiOrder: ${JSON.stringify(wolanskiOrder, null, 2)}`);
    } catch (err) {
      console.log(`### Error ###\nmessage: ${err.message};\nstack: ${err.stack}`);
    }
  });
});
