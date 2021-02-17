import { Buffer } from 'buffer';
import { str2arr, sliceEq, readUInt16LE, readUInt32LE, ProbeResult } from '../common';

const SIG_RIFF    = str2arr('RIFF');
const SIG_WEBPVP8 = str2arr('WEBPVP8');


function parseVP8(data:Buffer) {
  if (data.length < 16 + 14) return null;

  if (data[16 + 7] !== 0x9D || data[16 + 8] !== 0x01 || data[16 + 9] !== 0x2A) {
    // bad code block signature
    return null;
  }

  return {
    width:  readUInt16LE(data, 16 + 10) & 0x3FFF,
    height: readUInt16LE(data, 16 + 12) & 0x3FFF,
    type:   'webp',
    mime:   'image/webp',
    wUnits: 'px',
    hUnits: 'px'
  };
}


function parseVP8L(data:Buffer) {
  if (data.length < 16 + 9) return null;

  if (data[16 + 4] !== 0x2F) return null;

  const bits = readUInt32LE(data, 16 + 5);

  return {
    width:  (bits & 0x3FFF) + 1,
    height: ((bits >> 14) & 0x3FFF) + 1,
    type:   'webp',
    mime:   'image/webp',
    wUnits: 'px',
    hUnits: 'px'
  };
}


function parseVP8X(data:Buffer) {
  if (data.length < 16 + 14) return null;

  return  {
    // TODO: replace with `data.readUIntLE(8, 3) + 1`
    //       when 0.10 support is dropped
    width:  ((data[16 + 10] << 16) | (data[16 + 9] << 8) | data[16 + 8]) + 1,
    height: ((data[16 + 13] << 16) | (data[16 + 12] << 8) | data[16 + 11]) + 1,
    type:   'webp',
    mime:   'image/webp',
    wUnits: 'px',
    hUnits: 'px'
  };
}


export default function (data:Buffer):ProbeResult | null {
  if (data.length < 16) return null;

  // check /^RIFF....WEBPVP8([ LX])$/ signature
  if (sliceEq(data, 0, SIG_RIFF) && sliceEq(data, 8, SIG_WEBPVP8)) {
    switch (data[15]) {
      case 32/*' '*/: return parseVP8(data);
      case 76/* L */: return parseVP8L(data);
      case 88/* X */: return parseVP8X(data);
    }
  }
  return null;
}
