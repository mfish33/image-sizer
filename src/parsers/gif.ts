import { Buffer } from 'buffer';
import { str2arr, sliceEq, readUInt16LE, ProbeResult } from '../common';

const SIG_GIF87a = str2arr('GIF87a');
const SIG_GIF89a = str2arr('GIF89a');


export default function (data:Buffer):ProbeResult | null {
  if (data.length < 10) return null;

  if (!sliceEq(data, 0, SIG_GIF87a) && !sliceEq(data, 0, SIG_GIF89a)) return null;

  return {
    width:  readUInt16LE(data, 6),
    height: readUInt16LE(data, 8),
    type: 'gif',
    mime: 'image/gif',
    wUnits: 'px',
    hUnits: 'px'
  };
}
