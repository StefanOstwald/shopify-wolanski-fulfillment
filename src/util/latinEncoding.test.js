import { assert } from 'chai';
import { describe, it } from 'mocha';
import iconv from 'iconv-lite';
import strEncode from 'str-encode';
import { TextEncoder, TextDecoder } from 'text-encoding';
import { Iconv } from 'iconv';
import { encodeInLatin, convertStringToLatin } from './latinEncoding';

describe('string-util', () => {
  it('converts utf8 to latin', async () => {
    // const charsToCheck = [{ utf: 'ä', win1251: '' }];
    // ['ä', 'ö', 'ü', 'Ä', 'Ö', 'Ü', '?', 'ß'];
    // assert.isFalse(encodeInLatin('ä'));
    // assert.equal('ß'.charCodeAt(0).toString(16), 'df');
    // assert.equal(convertStringToLatin('ß').charCodeAt(0).toString(16), 'df');
    // assert.equal('ä'.charCodeAt(0).toString(16), 'e4');
    // console.log(convertStringToLatin('ä'));
    // assert.equal(convertStringToLatin('ä').charCodeAt(0).toString(10), 'df');
    logEncoding('ß');
    logEncoding('ä');
    logEncoding('?');
  });

  function logEncoding(char) {
    logWithEncoder(char, noEncoding);
    logWithEncoder(char, iconvLiteEncoding);
    logWithEncoder(char, iconvEncoding);
    logWithEncoder(char, stringEncode);
    logWithEncoder(char, textEncoding);
  }

  function logWithEncoder(char, encoderFunction) {
    console.log(`${encoderFunction.name}: ${encoderFunction(char)} ${encoderFunction(char).charCodeAt(0).toString(16)}`);
  }

  function noEncoding(char) {
    return char;
  }

  function iconvEncoding(char) {
    const iconv = new Iconv('utf-8', 'latin1');
    const buffer = iconv.convert(char);
    // return buffer.toString('utf8');
    return buffer.toString();
  }

  function iconvLiteEncoding(char) {
    const encoding = 'win1252';
    return iconv.encode(char, encoding).toString();
  }

  function stringEncode(char) {
    const encoding = 'latin1';
    return strEncode(char, encoding);
  }

  function textEncoding(char) {
    const encoding = 'windows-1252';
    const uint8array = new TextEncoder().encode(char);
    return new TextDecoder(encoding).decode(uint8array);
  }
});
