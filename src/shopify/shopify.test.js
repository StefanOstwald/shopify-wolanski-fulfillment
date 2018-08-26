import moment from 'moment-timezone';
import { Shopify } from '.';

require('dotenv').config();

describe('shopify orders', () => {
  test('can be colected', async () => {
    const now = moment();
    const shopify = new Shopify();
    const orders = await shopify.getOrdersInTimespane(now, now);
    expect(Array.isArray(orders)).toBeTruthy();
    expect(orders.length).toEqual(0);
  });
});
