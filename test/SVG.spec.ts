import assert from 'assert';
import { Buffer } from 'buffer';
import fs from 'fs';
import path from 'path';
import probe from '../src/index';
import { getArrayBuffer } from './common';

describe('SVG', function () {
  it('should detect SVG', function () {
    const file = path.join(__dirname, 'fixtures', 'sample.svg');

    const buffer = fs.readFileSync(file);
    const size = probe(getArrayBuffer(buffer));

    assert.deepStrictEqual(size, { width: 744.09448819, height: 1052.3622047, type: 'svg', mime: 'image/svg+xml', wUnits: 'px', hUnits: 'px' });
  });

  it('should work with weirdly split chunks', function () {
    const size = probe(getArrayBuffer(Buffer.concat(([
      Buffer.from('   '),
      Buffer.from(' <s'),
      Buffer.from('vg width="5" height="5"></svg>')
    ]))));

    assert.deepStrictEqual(size, { width: 5, height: 5, type: 'svg', mime: 'image/svg+xml', wUnits: 'px', hUnits: 'px' });
  });

  it('should extract width info from viewbox', function () {
    const size = probe(getArrayBuffer(Buffer.from('<svg viewbox="0 0 800 600"></svg>')));

    assert.deepStrictEqual(size, { width: 800, height: 600, type: 'svg', mime: 'image/svg+xml', wUnits: 'px', hUnits: 'px' });
  });

  it('should extract width info from camel cased viewBox', function () {
    const size = probe(getArrayBuffer(Buffer.from('<svg viewBox="0 0 800 600"></svg>')));

    assert.deepStrictEqual(size, { width: 800, height: 600, type: 'svg', mime: 'image/svg+xml', wUnits: 'px', hUnits: 'px' });
  });

  it('should return width/height units', function () {
    const size = probe(getArrayBuffer(Buffer.from('<svg width="5in" height="4pt"></svg>')));

    assert.deepStrictEqual(size, { width: 5, height: 4, type: 'svg', mime: 'image/svg+xml', wUnits: 'in', hUnits: 'pt' });
  });

  it('should ignore stroke-width', function () {
    const size = probe(getArrayBuffer(Buffer.from('<svg stroke-width="2" width="5" height="4"></svg>')));

    assert.deepStrictEqual(size, { width: 5, height: 4, type: 'svg', mime: 'image/svg+xml', wUnits: 'px', hUnits: 'px' });
  });

  // /* eslint-disable max-nested-callbacks */
  describe('coverage', function () {
    it('too much data before doctype', function () {
      assert.rejects(
        Promise.resolve(probe(getArrayBuffer(Buffer.alloc(70000, 0x20)))),
        /unrecognized file format/
      );
    });

    it('too much data before svg', function () {
      assert.rejects(
        Promise.resolve(probe(getArrayBuffer(Buffer.concat([ Buffer.from('<svg'), Buffer.alloc(70000, 0x20) ])))),
        /unrecognized file format/
      );
    });

    it('single quotes (width/height)', function () {
      const size = probe(getArrayBuffer(Buffer.from("<svg width='5in' height='4pt'></svg>")));

      assert.deepStrictEqual(size, { width: 5, height: 4, type: 'svg', mime: 'image/svg+xml', wUnits: 'in', hUnits: 'pt' });
    });

    it('single quotes (viewbox)', function () {
      const size = probe(getArrayBuffer(Buffer.from("<svg width='1in' viewbox='0 0 100 50'>")));

      assert.deepStrictEqual(size, { width: 1, height: 0.5, type: 'svg', mime: 'image/svg+xml', wUnits: 'in', hUnits: 'in' });
    });

    it('height, no width', function () {
      const size = probe(getArrayBuffer(Buffer.from('<svg height="1in" viewbox="0 0 100 50">')));

      assert.deepStrictEqual(size, { width: 2, height: 1, type: 'svg', mime: 'image/svg+xml', wUnits: 'in', hUnits: 'in' });
    });

    it('width is invalid, no height', function () {
      assert.rejects(
        Promise.resolve(probe(getArrayBuffer(Buffer.from('<svg width="-1" viewbox="0 0 100 50">')))),
        /unrecognized file format/
      );
    });

    it('height is invalid, no width', function () {
      assert.rejects(
        Promise.resolve(probe(getArrayBuffer(Buffer.from('<svg height="foobar" viewbox="0 0 100 50">')))),
        /unrecognized file format/
      );
    });

    it('width is invalid (non positive)', function () {
      assert.rejects(
        Promise.resolve(probe(getArrayBuffer(Buffer.from('<svg width="0" height="5">')))),
        /unrecognized file format/
      );
    });

    it('width is invalid (Infinity)', function () {
      assert.rejects(
        Promise.resolve(probe(getArrayBuffer(Buffer.from('<svg width="Infinity" height="5">')))),
        /unrecognized file format/
      );
    });

    it('no viewbox, no height', function () {
      assert.rejects(
        Promise.resolve(probe(getArrayBuffer(Buffer.from('<svg width="5">')))),
        /unrecognized file format/
      );
    });

    it('viewbox units are different', function () {
      assert.rejects(
        Promise.resolve(probe(getArrayBuffer(Buffer.from('<svg width="5" viewbox="0 0 5px 3in">')))),
        /unrecognized file format/
      );
    });
  });
});
