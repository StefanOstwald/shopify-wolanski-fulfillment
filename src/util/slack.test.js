import { slack } from './slack';

describe('slack', () => {
  test('can send a log', async () => {
    await slack.log('test log');
  });
  test('can send an error', async () => {
    await slack.error('test error');
  });
});
