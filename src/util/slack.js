import rp from 'request-promise';

export class Slack {
  static log(txt) {
    console.log(`log: ${JSON.stringify(txt, null, 2)}`);
    const url = process.env.SLACK_NOTIFICATION_URL;
    return Slack.postTextToSlackUrlSafely(txt, url);
  }

  static error(txt) {
    console.log(`error: ${JSON.stringify(txt, null, 2)}`);
    const url = process.env.SLACK_ERROR_URL;
    return Slack.postTextToSlackUrlSafely(txt, url);
  }

  static postTextToSlackUrlSafely(txt, url) {
    if (!url) {
      console.log('SLACK ERROR: not sending as slack env var is not set');
    } else {
      try {
        return Slack.postTextToSlackUrl(txt, url);
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
    return rp(options);
  }
}
