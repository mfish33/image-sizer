import assert from 'assert';
import fs from 'fs';
import path from 'path';
import probe from '../src/index';
import { getArrayBuffer } from './common';
import { str2arr } from '../src/common';

describe('PNG', function () {
  it('should detect PNG', function () {
    const file = path.join(__dirname, 'fixtures', 'iojs_logo.png');

    const buffer = fs.readFileSync(file);
    const size = probe(getArrayBuffer(buffer));

    assert.deepStrictEqual(size, { width: 367, height: 187, type: 'png', mime: 'image/png', wUnits: 'px', hUnits: 'px' });
  });


  it('should skip PNG start pattern without IHDR', function () {
    const buf = Buffer.from(str2arr('\x89PNG\r\n\x1a\n                  '));

    assert.rejects(
      Promise.resolve(probe(getArrayBuffer(buf))),
      /unrecognized file format/
    );
  });
});
