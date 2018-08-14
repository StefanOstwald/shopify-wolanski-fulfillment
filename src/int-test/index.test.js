import { describe, it } from 'mocha';
import { assert } from 'chai';
import LambdaTester from 'lambda-tester';
import { handler } from '../index';

describe('lambda call', () => {
  it('doesnt brake on launch request', function() {
    const event = { forceExecution: true };

    this.timeout(5000);
    LambdaTester(handler)
      .event(event)
      .expectSucceed((result) => {
        assert.isUndefined(result, JSON.stringify(result, null, 2));
      });
  });
});
