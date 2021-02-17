import assert from 'assert';
import fs from 'fs';
import path from 'path';
import probe from '../src/index';
import { getArrayBuffer } from './common';
import { str2arr } from '../src/common';

describe('WEBP', function () {
  it('should detect VP8', function () {
    const file = path.join(__dirname, 'fixtures', 'webp-vp8.webp');

    const buffer = fs.readFileSync(file);
    const size = probe(getArrayBuffer(buffer));

    assert.deepStrictEqual(size, { width: 1, height: 1, type: 'webp', mime: 'image/webp', wUnits: 'px', hUnits: 'px' });
  });


  it('should skip VP8 header with bad code block', function () {
    const buf = Buffer.from(str2arr('RIFF....WEBPVP8 ........................'));

    assert.rejects(
      Promise.resolve(probe(getArrayBuffer(buf))),
      /unrecognized file format/
    );
  });


  it('should detect VP8X', function () {
    const file = path.join(__dirname, 'fixtures', 'webp-vp8x.webp');

    const buffer = fs.readFileSync(file);
    const size = probe(getArrayBuffer(buffer));

    assert.deepStrictEqual(size, { width: 367, height: 187, type: 'webp', mime: 'image/webp', wUnits: 'px', hUnits: 'px' });
  });


  it('should detect VP8L (lossless)', function () {
    const file = path.join(__dirname, 'fixtures', 'webp-vp8l.webp');

    const buffer = fs.readFileSync(file);
    const size = probe(getArrayBuffer(buffer));

    assert.deepStrictEqual(size, { width: 367, height: 187, type: 'webp', mime: 'image/webp', wUnits: 'px', hUnits: 'px' });
  });


  it('should skip VP8L header with bad code block', function () {
    const buf = Buffer.from(str2arr('RIFF....WEBPVP8L........................'));

    assert.rejects(
      Promise.resolve(probe(getArrayBuffer(buf))),
      /unrecognized file format/
    );
  });

  it('coverage - truncated WEBP', function () {
    let buf;

    buf = str2arr('RIFF"\0\0\0WEBPVP8 ');
    assert.strictEqual(probe(buf), null);

    buf = str2arr('RIFF"\0\0\0WEBPVP8L');
    assert.strictEqual(probe(buf), null);

    buf = str2arr('RIFF"\0\0\0WEBPVP8X');
    assert.strictEqual(probe(buf), null);
  });
});

