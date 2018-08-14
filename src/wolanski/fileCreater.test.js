import { assert } from 'chai';
import { describe, it } from 'mocha';
import { FileCreator } from './fileCreator';

describe('fileCreater', () => {
  it('has decently verfied file name', async () => {
    console.log(`FileCreater.genFileName(): ${JSON.stringify(FileCreator.genFileName(), null, 2)}`);
    assert.notEqual(FileCreator.genFileName(), '1970-01-01-T-01-00-00.csv');
  });

  describe('replaceDelimiterInAllStringsWithReplacer', () => {
    const delimiter = ';';
    const replacer = '-';

    it('doesnt touch dates', () => {
      const input = {
        dat: new Date(0),
      };
      assert.deepEqual(FileCreator.replaceDelimiterInAllStringsWithReplacer(input, delimiter, replacer), input);
    });

    it('replaces nested objects', () => {
      const input = {
        a: {
          b: {
            c: 'aaa;aa',
            in: 123,
          },
        },
      };
      const output = {
        a: {
          b: {
            c: 'aaa-aa',
            in: 123,
          },
        },
      };
      assert.deepEqual(FileCreator.replaceDelimiterInAllStringsWithReplacer(input, delimiter, replacer), output);
    });

    it('replaces objects in arrays', () => {
      const input = {
        a: {
          arr: [{
            item: {
              str: 'arr;a',
            },
          }],
        },
      };
      const output = {
        a: {
          arr: [{
            item: {
              str: 'arr-a',
            },
          }],
        },
      };
      assert.deepEqual(FileCreator.replaceDelimiterInAllStringsWithReplacer(input, delimiter, replacer), output);
    });

    it('replaces objects string arrays', () => {
      const input = {
        a: {
          arr: ['arr;a'],
        },
      };
      const output = {
        a: {
          arr: ['arr-a'],
        },
      };
      assert.deepEqual(FileCreator.replaceDelimiterInAllStringsWithReplacer(input, delimiter, replacer), output);
    });
  });
});
