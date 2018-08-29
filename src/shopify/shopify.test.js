import moment from 'moment-timezone';
import { Shopify } from '.';
import { getLocalTime } from '../util/timeHelper';

require('dotenv').config();

describe('shopify', () => {
  test('orders can be colected', async () => {
    const now = getLocalTime();
    const shopify = new Shopify();
    const orders = await shopify.getOrdersInTimespane(now, now);
    expect(Array.isArray(orders)).toBeTruthy();
    expect(orders.length).toEqual(0);
  });

  test('get LocationId', async () => {
    const shopify = new Shopify();
    const path = '/admin/locations.json';
    const locations = await shopify.get(path);
    console.log(`locations: ${JSON.stringify(locations, null, 2)}`);
  });
});
