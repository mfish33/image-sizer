import assert from 'assert';
import fs from 'fs';
import path from 'path';
import probe from '../src/index';
import { getArrayBuffer } from './common';

describe('ICO', function () {
  it('should detect ICO', function () {
    const file = path.join(__dirname, 'fixtures', 'google.ico');

    const buffer = fs.readFileSync(file);
    const size = probe(getArrayBuffer(buffer));

    assert.deepStrictEqual(size, {
      width: 128,
      height: 128,
      variants: [
        { height: 16, width: 16 },
        { height: 24, width: 24 },
        { height: 32, width: 32 },
        { height: 48, width: 48 },
        { height: 128, width: 128 }
      ],
      type: 'ico',
      mime: 'image/x-icon',
      wUnits: 'px',
      hUnits: 'px'
    });
  });


  it('should display 0 size as 256', function () {
    const file = path.join(__dirname, 'fixtures', 'google1.ico');

    const buffer = fs.readFileSync(file);
    const size = probe(getArrayBuffer(buffer));

    assert.deepStrictEqual(size, {
      width: 256,
      height: 256,
      variants: [
        { height: 256, width: 256 },
        { height: 24, width: 24 }
      ],
      type: 'ico',
      mime: 'image/x-icon',
      wUnits: 'px',
      hUnits: 'px'
    });
  });
});
