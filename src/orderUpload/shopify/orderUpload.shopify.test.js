import moment from 'moment-timezone';
import { getOrdersInTimespane } from './orderUpload.shopify';

require('dotenv').config();

describe('shopify orders', () => {
  test('can be colected', async () => {
    const now = moment();
    const orders = await getOrdersInTimespane(now, now);
    expect(Array.isArray(orders)).toBeTruthy();
    expect(orders.length).toEqual(0);
  });
});
