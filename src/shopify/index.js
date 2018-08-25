import rp from 'request-promise';

export class Shopify {
  constructor(key = process.env.SHOPIFY_READ_KEY, pw = process.env.SHOPIFY_READ_PW) {
    this.key = key;
    this.pw = pw;
  }

  async excuteQueryOrdersInTimespane(startDate, endDate) {
    console.log(`excuteQueryOrdersInTimespane startDate: ${startDate.format()}`);
    console.log(`excuteQueryOrdersInTimespane endDate: ${endDate.format()}`);

    const options = {
      method: 'GET',
      auth: {
        user: this.key,
        pass: this.pw,
      },
      qs: {
        created_at_min: startDate.format(),
        created_at_max: endDate.format(),
      },
      uri: 'https://innoki-shop.myshopify.com/admin/orders.json',
      json: true, // Automatically parses the JSON string in the response
    };
    let res;
    try {
      res = await rp(options);
    } catch (err) {
      console.log(`### Error ###\nmessage: ${err.message};\nstack: ${err.stack}`);
    }

    const shopifyContainsOrderArray = Array.isArray(res.orders);
    console.log(`Shopify result contains order array: ${shopifyContainsOrderArray}`);
    if (shopifyContainsOrderArray) {
      console.log(`Shopify contains ${res.orders.length} orders`);
    }

    return res;
  }

  /**
   *
   * @param {moment} startDate type moment
   * @param {moment} endDate type moment
   */
  async getOrdersInTimespane(startDate, endDate) {
    const apiReturn = await this.excuteQueryOrdersInTimespane(startDate, endDate);
    return apiReturn.orders;
  }
}
