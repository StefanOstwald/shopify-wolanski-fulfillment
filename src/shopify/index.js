import rp from 'request-promise';

export class Shopify {
  constructor(
    key = process.env.SHOPIFY_READ_KEY,
    pw = process.env.SHOPIFY_READ_PW,
    baseUrl = process.env.SHOPIFY_BASE_URL,
    informTracking = process.env.TRACKING_INFORM_CUSTOMER_ABOUT_TRACKING_INFO,
    locationId = process.env.SHOPIFY_LOCATION_ID
  ) {
    this.key = key;
    this.pw = pw;
    this.baseUrl = baseUrl;
    this.locationId = locationId ? parseInt(locationId, 10) : undefined;

    this.informCustomerAboutTracking =
      !!((!!informTracking && informTracking.toLowerCase() === 'true'));
  }

  static getRequestFramework() {
    return rp;
  }

  query(method, path, qs, body) {
    if (!path.startsWith('/')) { throw new Error('path needs to start with /'); }

    const options = {
      method,
      auth: {
        user: this.key,
        pass: this.pw,
      },
      qs,
      body,
      uri: this.baseUrl + path,
      json: true, // Automatically parses the JSON string in the response
    };

    return Shopify.getRequestFramework()(options);
  }

  get(path, queryParamter) {
    return this.query('GET', path, queryParamter);
  }

  post(path, queryParamter, body) {
    return this.query('POST', path, queryParamter, body);
  }

  /**
   *
   * @param startDate type moment
   * @param endDate type moment
   */
  async getOrdersInTimespane(startDate, endDate) {
    const queryParameter = {
      created_at_min: startDate.format(),
      created_at_max: endDate.format(),
    };
    const path = '/admin/orders.json';

    const apiReturn = await this.get(path, queryParameter);
    return apiReturn.orders;
  }

  async addTrackingToOrder({ shopifyOrderId, trackingUrl, trackingNumber }) {
    const body = {
      fulfillment: {
        location_id: await this.getLocationId(),
        tracking_number: trackingNumber,
        tracking_urls: [trackingUrl],
        notify_customer: this.informCustomerAboutTracking,
      }
    };
    const path = `/admin/orders/${shopifyOrderId}/fulfillments.json`;
    return this.post(path, null, body);
  }

  async getLocationId() {
    if (!this.locationId) {
      this.locationId = await this.getFirstLocationId();
    }
    return this.locationId;
  }

  async getFirstLocationId() {
    const path = '/admin/locations.json';
    const res = await this.get(path);

    if (!Array.isArray(res.locations) || res.locations.length === 0) {
      throw Error('Locations query result does not contain any location');
    }

    return res.locations[0].id;
  }
}
