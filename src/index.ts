import { Buffer } from 'buffer';
import * as parsers from './parsers';
import { ProbeResult } from './common';
export { ProbeResult } from './common';

export default function (arrayBuffer:ArrayBuffer, fileExt?:string):ProbeResult | null {
  const buffer = Buffer.from(arrayBuffer);
  if (fileExt) {
    const fileExtLower = fileExt.toLowerCase();
    if (parsers[fileExtLower]) {
      return parsers[fileExtLower](buffer);
    }
    return null;
  }

  for (const key of Object.keys(parsers)) {
    const parsed = parsers[key](buffer);
    if (parsed) {
      return parsed;
    }
  }

  return null;
}
