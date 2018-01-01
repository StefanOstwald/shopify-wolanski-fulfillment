import { describe, it } from 'mocha';

const LambdaTester = require('lambda-tester');
const assert = require('assert');

const myHandler = require('./index').handler;

describe('lambda test', () => {
  it('wait for delay', () => {
    LambdaTester(myHandler)
      .event({})
      .expectSucceed((result) => {
        console.log(`result: ${JSON.stringify(result, null, 2)}`);
      });
  });
});
