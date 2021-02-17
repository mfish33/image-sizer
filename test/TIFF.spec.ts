import assert from 'assert';
import fs from 'fs';
import path from 'path';
import probe from '../src/index';
import { getArrayBuffer } from './common';
import { str2arr } from '../src/common';

describe('TIFF', function () {
  it('real image', function () {
    const file = path.join(__dirname, 'fixtures', 'iojs_logo.tiff');

    const buffer = fs.readFileSync(file);
    const size = probe(getArrayBuffer(buffer));

    assert.deepStrictEqual(size, { width: 367, height: 187, type: 'tiff', mime: 'image/tiff', wUnits: 'px', hUnits: 'px' });
  });


  it('real image, Big Endian', function () {
    const file = path.join(__dirname, 'fixtures', 'iojs_logo_be.tiff');

    const buffer = fs.readFileSync(file);
    const size = probe(getArrayBuffer(buffer));

    assert.deepStrictEqual(size, { width: 367, height: 187, type: 'tiff', mime: 'image/tiff', wUnits: 'px', hUnits: 'px' });
  });


  it('TIFF IFD is first in the file', function () {
    const file = path.join(__dirname, 'fixtures', 'meta_before_image.tiff');

    const buffer = fs.readFileSync(file);
    const size = probe(getArrayBuffer(buffer));

    assert.deepStrictEqual(size, { width: 15, height: 15, type: 'tiff', mime: 'image/tiff', wUnits: 'px', hUnits: 'px' });
  });


  it('bad TIFF IFD', function () {
    // zero entries in 1st ifd, invalid TIFF
    //                     sig     off      count next
    const buf = Buffer.from('49492a00 08000000 0000 00000000'.replace(/ /g, ''), 'hex');

    assert.rejects(
      Promise.resolve(probe(getArrayBuffer(buf))),
      /unrecognized file format/
    );
  });


  it('bad TIFF IFD offset', function () {
    // invalid 1st tiff offset
    //                     sig     off      count next
    const buf = Buffer.from('49492a00 00000000 0000 00000000'.replace(/ /g, ''), 'hex');

    assert.rejects(
      Promise.resolve(probe(getArrayBuffer(buf))),
      /unrecognized file format/
    );
  });


  it('bad TIFF IFD value', function () {
    // invalid ifd type (FF instead of 03 or 04)
    //                     sig     off  count next
    const buf = Buffer.from((
      '49492A00 08000000 0200' + // sig, off, count
      '0001 0000 01000000 FF000000' +
      '0101 0400 01000000 2A000000' +
      '00000000' // next
    ).replace(/ /g, ''), 'hex');

    assert.rejects(
      Promise.resolve(probe(getArrayBuffer(buf))),
      /unrecognized file format/
    );
  });

  it('coverage - truncated TIFF', function () {
    let buf;

    buf = str2arr('49492A00 08000000 02'.replace(/ /g, ''), 'hex');
    assert.strictEqual(probe(buf), null);

    buf = str2arr('49492A00 08000000 0200 00'.replace(/ /g, ''), 'hex');
    assert.strictEqual(probe(buf), null);
  });
});
