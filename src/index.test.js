import { describe, it } from 'mocha';

const LambdaTester = require('lambda-tester');
const assert = require('assert');

const myHandler = require('../src/index').handler;

describe('lambda call', () => {
  it('doesnt brake on launch request', function() {
    const event = { forceExecution: true };

    this.timeout(5000);
    LambdaTester(myHandler)
      .event(event)
      .expectSucceed((result) => {
        console.log(`result: ${JSON.stringify(result, null, 2)}`);
      });
  });
});
