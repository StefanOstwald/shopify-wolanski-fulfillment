import { assert } from 'chai';
import { describe, it } from 'mocha';
import { Shopify } from '.';
import moment from 'moment-timezone';

require('dotenv').config();

describe('shopify orders', () => {
  it('can be colected', async () => {
    const shopify = new Shopify();
    const now = moment();
    const orders = await shopify.getOrdersInTimespane(now,now);
    assert.isArray(orders);
    assert.equal(orders.length, 0);
  });
});
