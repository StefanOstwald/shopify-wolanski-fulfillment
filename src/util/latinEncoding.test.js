import iconvLite from 'iconv-lite';
import strEncode from 'str-encode';
import { TextEncoder, TextDecoder } from 'text-encoding';
import { Iconv } from 'iconv';
import { Readable } from 'stream';
import encoding from 'encoding';

describe('string-util', () => {
  test('converts utf8 to latin', async () => {
    // const charsToCheck = [{ utf: 'ä', win1251: '' }];
    // ['ä', 'ö', 'ü', 'Ä', 'Ö', 'Ü', '?', 'ß'];
    // expect.isFalse(encodeInLatin('ä'));
    // expect.equal('ß'.charCodeAt(0).toString(16), 'df');
    // expect.equal(convertStringToLatin('ß').charCodeAt(0).toString(16), 'df');
    // expect.equal('ä'.charCodeAt(0).toString(16), 'e4');
    // console.log(convertStringToLatin('ä'));
    // expect.equal(convertStringToLatin('ä').charCodeAt(0).toString(10), 'df');
    await logEncoding('€');
    await logEncoding('ß');
    await logEncoding('ä');
    await logEncoding('?');
  });

  async function logEncoding(char) {
    await logWithEncoder(char, noEncoding);
    await logWithEncoder(char, iconvLiteEncoding);
    await logWithEncoder(char, iconvEncoding);
    await logWithEncoder(char, iconvEncoding2);
    await logWithEncoder(char, stringEncode);
    await logWithEncoder(char, textEncoding);
    await logWithEncoder(char, nodeBufferEncoding);
    await logWithEncoder(char, encodingFct);
    await logWithEncoder(char, encodingFct2);
  }

  async function logWithEncoder(char, encoderFunction) {
    const encodedChar = await encoderFunction(char);
    console.log(`${encoderFunction.name}: ${encodedChar} ${encodedChar.charCodeAt(0).toString(16)}`);
  }


  function noEncoding(char) {
    return char;
  }

  function encodingFct(char) {
    const buffer = encoding.convert(char, 'Latin_1', 'UTF-8', false);
    return buffer.toString('latin1');
  }

  function encodingFct2(char) {
    const buffer = encoding.convert(char, 'Latin_1', 'UTF-8', false);
    return buffer.toString();
  }

  function iconvEncoding(char) {
    const iconvConverter = new Iconv('UTF-8', 'latin1//TRANSLIT//IGNORE');
    // const iconvConverter = new Iconv('utf-8', 'latin1');
    const buffer = iconvConverter.convert(char);
    // return buffer.toString('utf8');
    return buffer.toString('latin1');
  }
  function iconvEncoding2(char) {
    const iconvConverter = new Iconv('UTF-8', 'latin1//TRANSLIT//IGNORE');
    // const iconvConverter = new Iconv('utf-8', 'latin1');
    const buffer = iconvConverter.convert(char);
    // return buffer.toString('utf8');
    return buffer.toString();
  }

  function iconvLiteEncoding(char) {
    const enc = 'win1252';
    return iconvLite.encode(char, enc).toString();
  }

  function stringEncode(char) {
    const enc = 'latin1';
    return strEncode(char, enc);
  }

  function textEncoding(char) {
    const enc = 'windows-1252';
    const uint8array = new TextEncoder().encode(char);
    return new TextDecoder(enc).decode(uint8array);
  }

  function nodeBufferEncoding(char) {
    return new Promise((resolve, reject) => {
      const readStream = new Readable();
      // eslint-disable-next-line
      readStream._read = () => {}; // needed for node compatibility
      readStream.push(char);
      readStream.push(null);
      readStream.setEncoding('latin1');

      const chunks = [];

      readStream.on('data', (chunk) => {
        chunks.push(chunk);
      });

      // Send the buffer or you can put it into a var
      readStream.on('end', () => {
        resolve(chunks.join(''));
      });
    });
  }
});
