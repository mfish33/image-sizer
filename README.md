Image-Sizer
================

[![CI](https://github.com/nodeca/probe-image-size/workflows/CI/badge.svg?branch=master)](https://github.com/mfish33/image-sizer/actions)
[![NPM version](https://img.shields.io/npm/v/image-sizer.svg?style=flat)](https://www.npmjs.org/package/image-sizer)
[![Coverage Status](https://coveralls.io/repos/github/mfish33/image-sizer/badge.svg?branch=master)](https://coveralls.io/github/mfish33/image-sizer?branch=master)

> Get image size from the raw image. Supported image types:
> JPG, GIF, PNG, WebP, BMP, TIFF, SVG, PSD, ICO.


Inspiration
-------
I wanted a library that could take an image binary within the browser and calculate the natural width and height of the image without rendering it on the DOM. There are currently a few other libraries that do this but they have to be used with patch-package due to their nodejs dependencies. This library is a fork of [probe-image-size](https://github.com/nodeca/probe-image-size) but is primarily intended for browser use but maintains full compatibility with node. The project has also been updated to typescript and the API has been simplified for the more focused purpose.

Install
-------

```bash
npm install image-sizer
```

Example
-------

```ts
import sizer from 'image-sizer'

let res = await fetch('http://example.com/image.jpg');
let data = await res.arrayBuffer()
let sizeInfo = sizer(data)
console.log(sizeInfo); // =>
/*
  {
    width: xx,
    height: yy,
    type: 'jpg',
    mime: 'image/jpeg',
    wUnits: 'px',
    hUnits: 'px',
  }
*/

// If you know the type of image you can run sizer with an extension
let sizeInfo = sizer(data,'jpeg')
console.log(sizeInfo); // =>
/*
  {
    width: xx,
    height: yy,
    type: 'jpg',
    mime: 'image/jpeg',
    wUnits: 'px',
    hUnits: 'px',
  }
*/

```


Similar projects
----------------

- [image-size](https://github.com/netroy/image-size)
- [probe-image-size](https://github.com/nodeca/probe-image-size)
