import LambdaTester from 'lambda-tester';
import { handler } from '../..';

describe('lambda call', () => {
  test('doesnt brake on launch request', () => {
    const event = { forceExecution: true };

    LambdaTester(handler)
      .event(event)
      .expectSucceed((result) => {
        expect(result).toBeUndefined();
      });
  }, 5000);
});
