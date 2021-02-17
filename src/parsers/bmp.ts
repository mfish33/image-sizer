import { Buffer } from 'buffer';
import { str2arr, sliceEq, readUInt16LE, ProbeResult } from '../common';

const SIG_BM = str2arr('BM');


export default function (data:Buffer):ProbeResult | null {
  if (data.length < 26) return null;

  if (!sliceEq(data, 0, SIG_BM)) return null;

  return {
    width:  readUInt16LE(data, 18),
    height: readUInt16LE(data, 22),
    type: 'bmp',
    mime: 'image/bmp',
    wUnits: 'px',
    hUnits: 'px'
  };
}
