import { assert } from 'chai';
import { describe, it } from 'mocha';
import { FileCreator } from './fileCreator';

describe('fileCreater', () => {
  it('has decently verfied file name', async () => {
    console.log(`FileCreater.genFileName(): ${JSON.stringify(FileCreator.genFileName(), null, 2)}`);
    assert.notEqual(FileCreator.genFileName(), '1970-01-01-T-01-00-00.csv');
  });
});
