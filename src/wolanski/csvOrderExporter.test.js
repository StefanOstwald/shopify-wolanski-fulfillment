import { assert } from 'chai';
import { describe, it } from 'mocha';
import { CsvOrderExporter } from './csvOrderExporter';
import { getEmptyOrder } from './shopifyToWolanski';

describe('CsvOrderExporter', () => {
  it('has decently verfied file name', async () => {
    console.log(`CsvOrderExporter.genFileName(): ${JSON.stringify(CsvOrderExporter.genFileName(), null, 2)}`);
    assert.notEqual(CsvOrderExporter.genFileName(), '1970-01-01-T-01-00-00.csv');
  });

  describe('createCsvFileFromArray', () => {
    it('does not use double quotes', () => {
      const order = getEmptyOrder();
      const exporter = new CsvOrderExporter();
      exporter.orders = order;
      const csv = exporter.genCsv();
      assert.isNotTrue(csv.includes('"'));
    });
  });

  describe('replaceDelimiterInAllStringsWithReplacer', () => {
    const delimiter = ';';
    const replacer = '-';

    it('doesnt touch dates', () => {
      const input = {
        dat: new Date(0),
      };
      assert.deepEqual(CsvOrderExporter.replaceDelimiterInAllStringsWithReplacer(input, delimiter, replacer), input);
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
      assert.deepEqual(CsvOrderExporter.replaceDelimiterInAllStringsWithReplacer(input, delimiter, replacer), output);
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
      assert.deepEqual(CsvOrderExporter.replaceDelimiterInAllStringsWithReplacer(input, delimiter, replacer), output);
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
      assert.deepEqual(CsvOrderExporter.replaceDelimiterInAllStringsWithReplacer(input, delimiter, replacer), output);
    });
  });
});
