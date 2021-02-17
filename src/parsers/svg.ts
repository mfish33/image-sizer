import { Buffer } from 'buffer';
import { ProbeResult } from '../common'

function isWhiteSpace(chr:number):boolean {
  return chr === 0x20 || chr === 0x09 || chr === 0x0D || chr === 0x0A;
}

// Filter NaN, Infinity, < 0
function isFinitePositive(val:any):boolean {
  return typeof val === 'number' && isFinite(val) && val > 0;
}

function canBeSvg(buf:Buffer) {
  let i = 0;
  const max = buf.length;

  while (i < max && isWhiteSpace(buf[i])) i++;

  if (i === max) return false;
  return buf[i] === 0x3c; /* < */
}


const SVG_HEADER_RE  = /<svg\s[^>]+>/;
const SVG_WIDTH_RE   = /[^-]\bwidth="([^%]+?)"|[^-]\bwidth='([^%]+?)'/;
const SVG_HEIGHT_RE  = /\bheight="([^%]+?)"|\bheight='([^%]+?)'/;
const SVG_VIEWBOX_RE = /\bview[bB]ox="(.+?)"|\bview[bB]ox='(.+?)'/;
const SVG_UNITS_RE   = /in$|mm$|cm$|pt$|pc$|px$|em$|ex$/;

function svgAttrs(str:string) {
  const width   = str.match(SVG_WIDTH_RE);
  const height  = str.match(SVG_HEIGHT_RE);
  const viewbox = str.match(SVG_VIEWBOX_RE);

  return {
    width:   width && (width[1] || width[2]),
    height:  height && (height[1] || height[2]),
    viewbox: viewbox && (viewbox[1] || viewbox[2])
  };
}


function units(str:string) {
  if (!SVG_UNITS_RE.test(str)) return 'px';

  return str.match(SVG_UNITS_RE)[0];
}


export default function (data:Buffer):ProbeResult | null {
  if (!canBeSvg(data)) return null;

  let str = '';

  for (let i = 0; i < data.length; i++) {
    // 1. We can't rely on buffer features
    // 2. Don't care about UTF16 because ascii is enougth for our goals
    str += String.fromCharCode(data[i]);
  }

  if (!SVG_HEADER_RE.test(str)) return null;

  const attrs  = svgAttrs(str.match(SVG_HEADER_RE)[0]);
  const width  = parseFloat(attrs.width);
  const height = parseFloat(attrs.height);

  // Extract from direct values

  if (attrs.width && attrs.height) {
    if (!isFinitePositive(width) || !isFinitePositive(height)) return null;

    return {
      width:  width,
      height: height,
      type:   'svg',
      mime:   'image/svg+xml',
      wUnits: units(attrs.width),
      hUnits: units(attrs.height)
    };
  }

  // Extract from viewbox

  const parts = (attrs.viewbox || '').split(' ');
  const viewbox = {
    width:  parts[2],
    height: parts[3]
  };
  const vbWidth  = parseFloat(viewbox.width);
  const vbHeight = parseFloat(viewbox.height);

  if (!isFinitePositive(vbWidth) || !isFinitePositive(vbHeight)) return null;
  if (units(viewbox.width) !== units(viewbox.height)) return null;

  const ratio = vbWidth / vbHeight;

  if (attrs.width) {
    if (!isFinitePositive(width)) return null;

    return {
      width:  width,
      height: width / ratio,
      type:   'svg',
      mime:   'image/svg+xml',
      wUnits: units(attrs.width),
      hUnits: units(attrs.width)
    };
  }

  if (attrs.height) {
    if (!isFinitePositive(height)) return null;

    return {
      width:  height * ratio,
      height: height,
      type:   'svg',
      mime:   'image/svg+xml',
      wUnits: units(attrs.height),
      hUnits: units(attrs.height)
    };
  }

  return {
    width:  vbWidth,
    height: vbHeight,
    type:   'svg',
    mime:   'image/svg+xml',
    wUnits: units(viewbox.width),
    hUnits: units(viewbox.height)
  };
}
