import rp from 'request-promise';

export class Shopify {
  constructor(key = process.env.SHOPIFY_READ_KEY, pw = process.env.SHOPIFY_READ_PW, baseUrl = process.env.SHOPIFY_BASE_URL) {
    this.key = key;
    this.pw = pw;
    this.baseUrl = baseUrl;
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
}
