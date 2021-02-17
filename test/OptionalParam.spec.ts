import assert from 'assert';
import fs from 'fs';
import path from 'path';
import probe from '../src/index';
import { getArrayBuffer } from './common';

describe('Should be able to use optional Param to test a specific file type', function () {
  it('Should immediately get size', function () {
    const file = path.join(__dirname, 'fixtures', 'iojs_logo.bmp');
    const buffer = fs.readFileSync(file);
    const size = probe(getArrayBuffer(buffer), 'bmp');

    assert.deepStrictEqual(size, { width: 367, height: 187, type: 'bmp', mime: 'image/bmp', wUnits: 'px', hUnits: 'px' });
  });

  it('Should also work uppercase', function () {
    const file = path.join(__dirname, 'fixtures', 'iojs_logo.bmp');
    const buffer = fs.readFileSync(file);
    const size = probe(getArrayBuffer(buffer), 'BMP');

    assert.deepStrictEqual(size, { width: 367, height: 187, type: 'bmp', mime: 'image/bmp', wUnits: 'px', hUnits: 'px' });
  });

  it('Should reject incorrect extension', function () {
    const file = path.join(__dirname, 'fixtures', 'iojs_logo.bmp');
    const buffer = fs.readFileSync(file);
    const size = probe(getArrayBuffer(buffer), 'PNG');

    assert.strictEqual(size, null);
  });

  it('Should reject incorrect non-existent extension', function () {
    const file = path.join(__dirname, 'fixtures', 'iojs_logo.bmp');
    const buffer = fs.readFileSync(file);
    const size = probe(getArrayBuffer(buffer), 'TEST');

    assert.strictEqual(size, null);
  });
});
