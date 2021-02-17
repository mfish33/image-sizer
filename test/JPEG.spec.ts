import assert from 'assert';
import fs from 'fs';
import path from 'path';
import probe from '../src/index';
import { getArrayBuffer } from './common';
import { str2arr } from '../src/common';

describe('JPEG', function () {
  it('should detect JPEG', function () {
    const file = path.join(__dirname, 'fixtures', 'iojs_logo.jpeg');

    const buffer = fs.readFileSync(file);
    const size = probe(getArrayBuffer(buffer));

    assert.deepStrictEqual(size, { width: 367, height: 187, type: 'jpg', mime: 'image/jpeg', wUnits: 'px', hUnits: 'px' });
  });


  // regression test
  it('should not fail on empty JPEG markers', function () {
    const file = path.join(__dirname, 'fixtures', 'empty_comment.jpg');

    const buffer = fs.readFileSync(file);
    const size = probe(getArrayBuffer(buffer));

    assert.deepStrictEqual(size, { width: 40, height: 20, type: 'jpg', mime: 'image/jpeg', wUnits: 'px', hUnits: 'px' });
  });


  it('should not fail on bad JPEG', function () {
    // length of C0 is less than needed (should be 5+ bytes)
    const buf = Buffer.from('FFD8 FFC0 0004 00112233 FFD9'.replace(/ /g, ''), 'hex');

    assert.rejects(
      Promise.resolve(probe(getArrayBuffer(buf))),
      /unrecognized file format/
    );
  });


  it('should skip padding', function () {
    const buf = Buffer.from('FFD8 FFFFFFFFC00011 08000F000F03012200021101031101 FFFFD9'.replace(/ /g, ''), 'hex');


    const size = probe(getArrayBuffer(buf));

    assert.deepStrictEqual(size, { width: 15, height: 15, type: 'jpg', mime: 'image/jpeg', wUnits: 'px', hUnits: 'px' });
  });


  it('coverage - EOI before SOI', function () {
    const buf = Buffer.from('FFD8 FFD0 FFD9'.replace(/ /g, ''), 'hex');

    assert.rejects(
      Promise.resolve(probe(getArrayBuffer(buf))),
      /unrecognized file format/
    );
  });

  it('coverage - unknown marker', function () {
    const buf = Buffer.from('FFD8 FF05'.replace(/ /g, ''), 'hex');

    assert.rejects(
      Promise.resolve(probe(getArrayBuffer(buf))),
      /unrecognized file format/
    );
  });

  it('coverage - truncated JPEG', function () {
    let buf;

    buf = str2arr('FF'.replace(/ /g, ''), 'hex');
    assert.strictEqual(probe(buf), null);

    buf = str2arr('FFD8 FF'.replace(/ /g, ''), 'hex');
    assert.strictEqual(probe(buf), null);

    buf = str2arr('FFD8 FFC0 00'.replace(/ /g, ''), 'hex');
    assert.strictEqual(probe(buf), null);

    buf = str2arr('FFD8 FFC0 FFFF 00'.replace(/ /g, ''), 'hex');
    assert.strictEqual(probe(buf), null);
  });
});
