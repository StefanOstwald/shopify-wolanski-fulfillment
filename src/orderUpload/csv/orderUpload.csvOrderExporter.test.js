import { CsvOrderExporter } from "./orderUpload.csvOrderExporter";
import { getEmptyOrder, orderIsExpressDelivery } from "./orderUpload.shopifyToWolanski";
import { expressDeliveryOrder } from "../test/orderFixtures";

require('dotenv').config();

describe("CsvOrderExporter", () => {
  test("has decently verfied file name", async () => {
    console.log(
      `CsvOrderExporter.genRemoteFileName(): ${JSON.stringify(
        CsvOrderExporter.genRemoteFileName(),
        null,
        2
      )}`
    );
    expect(CsvOrderExporter.genRemoteFileName()).not.toEqual(
      "1970-01-01-T-01-00-00.csv"
    );
  });

  describe("createCsvFileFromArray", () => {
    test("does not use double quotes", () => {
      const order = getEmptyOrder();
      const exporter = new CsvOrderExporter();
      exporter.orders = [order];
      const csv = exporter.genCsv();
      expect(csv.includes('"')).toBeFalsy();
    });
  });


  describe("replaceUnallowedCharsInAllStringsWithReplacer", () => {
    const delimiter = ";";
    const replacer = "-";

    test("doesnt touch dates", () => {
      const input = {
        dat: new Date(0),
      };
      expect(
        CsvOrderExporter.replaceUnallowedCharsInAllStringsWithReplacer(
          input,
          delimiter,
          replacer
        )
      ).toEqual(input);
    });

    test("replaces nested objects", () => {
      const input = {
        a: {
          b: {
            c: "aaa;aa",
            in: 123,
          },
        },
      };
      const output = {
        a: {
          b: {
            c: "aaa-aa",
            in: 123,
          },
        },
      };
      expect(
        CsvOrderExporter.replaceUnallowedCharsInAllStringsWithReplacer(
          input,
          delimiter,
          replacer
        )
      ).toEqual(output);
    });

    test("replaces objects in arrays", () => {
      const input = {
        a: {
          arr: [
            {
              item: {
                str: "arr;a",
              },
            },
          ],
        },
      };
      const output = {
        a: {
          arr: [
            {
              item: {
                str: "arr-a",
              },
            },
          ],
        },
      };
      expect(
        CsvOrderExporter.replaceUnallowedCharsInAllStringsWithReplacer(
          input,
          delimiter,
          replacer
        )
      ).toEqual(output);
    });

    test("replaces objects string arrays", () => {
      const input = {
        a: {
          arr: ["arr;a"],
        },
      };
      const output = {
        a: {
          arr: ["arr-a"],
        },
      };
      expect(
        CsvOrderExporter.replaceUnallowedCharsInAllStringsWithReplacer(
          input,
          delimiter,
          replacer
        )
      ).toEqual(output);
    });
  });

  describe("orderIsExpressDelivery", () => {
    const order = expressDeliveryOrder;
    const isExpressDelivery = orderIsExpressDelivery(order);
    expect(isExpressDelivery).toBeTruthy();
  });
});
