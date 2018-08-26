import rp from 'request-promise';

class Slack {
  constructor() {
    this.queries = [];
  }

  log(txt) {
    console.log(`log: ${JSON.stringify(txt, null, 2)}`);
    const url = Slack.getNotificationUrl();
    const request = Slack.postTextToSlackUrlSafely(txt, url);
    this.queries.push(request);
    return request;
  }

  static getNotificationUrl() {
    return process.env.SLACK_NOTIFICATION_URL;
  }

  error(txt) {
    console.log(`error: ${JSON.stringify(txt, null, 2)}`);
    const url = Slack.getErrorUrl();
    const request = Slack.postTextToSlackUrlSafely(txt, url);
    this.queries.push(request);
    return request;
  }

  static getErrorUrl() {
    return process.env.SLACK_ERROR_URL;
  }

  getActivePromise() {
    return Promise.all(this.queries);
  }

  static async postTextToSlackUrlSafely(txt, url) {
    if (!url) {
      console.log(`SLACK ERROR: not sending as slack env var is not set. Msg for Slack: ${txt}`);
    } else {
      try {
        await Slack.postTextToSlackUrl(txt, url);
      } catch (err) {
        console.log(`### Error ###\nmessage: ${err.message};\nstack: ${err.stack}`);
      }
    }
  }

  static postTextToSlackUrl(txt, url) {
    const options = {
      method: 'POST',
      uri: url,
      json: true,
      body: {
        text: txt,
      },
    };
    return Slack.getRequestModule()(options);
  }

  static getRequestModule() {
    return rp;
  }
}

export const slack = new Slack();
