import rp from 'request-promise';

export class Shopify {
  constructor(
    key = process.env.SHOPIFY_KEY,
    pw = process.env.SHOPIFY_PW,
    baseUrl = process.env.SHOPIFY_BASE_URL,
    informTracking = process.env.TRACKING_INFORM_CUSTOMER_ABOUT_TRACKING_INFO,
    locationId = process.env.SHOPIFY_LOCATION_ID
  ) {
    // TODO add syntactic sugar
    this.initWithProcessEnvValues(key, pw, baseUrl, informTracking, locationId);
  }

  initWithProcessEnvValues(
    key = process.env.SHOPIFY_KEY,
    pw = process.env.SHOPIFY_PW,
    baseUrl = process.env.SHOPIFY_BASE_URL,
    informTracking = process.env.TRACKING_INFORM_CUSTOMER_ABOUT_TRACKING_INFO,
    locationId = process.env.SHOPIFY_LOCATION_ID
  ) {
    this.key = key;
    this.pw = pw;
    this.baseUrl = baseUrl;
    this.locationId = locationId ? parseInt(locationId, 10) : undefined;

    this.informCustomerAboutTracking =
      (typeof informTracking === 'string')
        ? informTracking.trim().toLowerCase() === 'true'
        : informTracking;
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
      status: 'open',
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
        notify_customer: this.informCustomerAboutTracking,
      },
    };
    if (trackingUrl) {
      body.fulfillment.tracking_urls = [trackingUrl];
    }
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
