import assert from 'assert';
import fs from 'fs';
import path from 'path';
import probe from '../src/index';
import { getArrayBuffer } from './common';

describe('PSD', function () {
  it('should detect PSD', function () {
    const file = path.join(__dirname, 'fixtures', 'empty.psd');

    const buffer = fs.readFileSync(file);
    const size = probe(getArrayBuffer(buffer));

    assert.deepStrictEqual(size, { width: 640, height: 400, type: 'psd', mime: 'image/vnd.adobe.photoshop', wUnits: 'px', hUnits: 'px' });
  });
});
