// import strEncode from 'str-encode';
import iconv from 'iconv-lite';


export function convertStringToLatin(str) {
  const encoding = 'win1252';
  return iconv.encode(str, encoding).toString();
}

export function encodeInLatin(obj) {
  if (typeof obj === 'string') { return convertStringToLatin(obj); }
  if (Array.isArray(obj)) { return obj.map(encodeInLatin); }
  if (typeof obj === 'object') {
    Object.keys(obj).forEach((key) => {
      obj[key] = encodeInLatin(obj[key]);
    });
    return obj;
  }
  console.log(`obj cannot be converted to latin: ${JSON.stringify(obj, null, 2)}`);
  return obj;
}

