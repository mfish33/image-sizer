import { Buffer } from 'buffer';
import { str2arr, sliceEq, readUInt32BE, ProbeResult } from '../common';

const SIG_PNG  = str2arr('\x89PNG\r\n\x1a\n');
const SIG_IHDR = str2arr('IHDR');

export default function (data:Buffer):ProbeResult | null {
  if (data.length < 24) return null;

  // check PNG signature
  if (!sliceEq(data, 0, SIG_PNG)) return null;

  // check that first chunk is IHDR
  if (!sliceEq(data, 12, SIG_IHDR)) return null;

  return {
    width:  readUInt32BE(data, 16),
    height: readUInt32BE(data, 20),
    type: 'png',
    mime: 'image/png',
    wUnits: 'px',
    hUnits: 'px'
  };
}
