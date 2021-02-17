import { Buffer } from 'buffer';
import { str2arr, sliceEq, readUInt16LE, readUInt16BE, readUInt32LE, readUInt32BE, ProbeResult } from '../common';

const SIG_1 = str2arr('II\x2A\0');
const SIG_2 = str2arr('MM\0\x2A');


function readUInt16(buffer:Buffer, offset:number, is_big_endian:boolean) {
  return is_big_endian ? readUInt16BE(buffer, offset) : readUInt16LE(buffer, offset);
}

function readUInt32(buffer:Buffer, offset:number, is_big_endian:boolean) {
  return is_big_endian ? readUInt32BE(buffer, offset) : readUInt32LE(buffer, offset);
}

function readIFDValue(data:Buffer, data_offset:number, is_big_endian:boolean) {
  const type       = readUInt16(data, data_offset + 2, is_big_endian);
  const values     = readUInt32(data, data_offset + 4, is_big_endian);

  if (values !== 1 || (type !== 3 && type !== 4)) return null;

  if (type === 3) {
    return readUInt16(data, data_offset + 8, is_big_endian);
  }

  return readUInt32(data, data_offset + 8, is_big_endian);
}

export default function (data:Buffer):ProbeResult | null {
  if (data.length < 8) return null;

  // check TIFF signature
  if (!sliceEq(data, 0, SIG_1) && !sliceEq(data, 0, SIG_2)) return null;

  const is_big_endian = (data[0] === 77 /* 'MM' */);
  const count = readUInt32(data, 4, is_big_endian) - 8;

  if (count < 0) return null;

  // skip until IFD
  let offset = count + 8;

  if (data.length - offset < 2) return null;

  // read number of IFD entries
  const ifd_size = readUInt16(data, offset + 0, is_big_endian) * 12;

  if (ifd_size <= 0) return null;

  offset += 2;

  // read all IFD entries
  if (data.length - offset < ifd_size) return null;

  let i, width, height, tag;

  for (i = 0; i < ifd_size; i += 12) {
    tag = readUInt16(data, offset + i, is_big_endian);

    if (tag === 256) {
      width = readIFDValue(data, offset + i, is_big_endian);
    } else if (tag === 257) {
      height = readIFDValue(data, offset + i, is_big_endian);
    }
  }

  if (width && height) {
    return {
      width:  width,
      height: height,
      type:   'tiff',
      mime:   'image/tiff',
      wUnits: 'px',
      hUnits: 'px'
    };
  }
  return null;
}
