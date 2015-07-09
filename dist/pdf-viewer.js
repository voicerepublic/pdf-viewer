if(typeof Math.imul == "undefined" || (Math.imul(0xffffffff,5) == 0)) {
    Math.imul = function (a, b) {
        var ah  = (a >>> 16) & 0xffff;
        var al = a & 0xffff;
        var bh  = (b >>> 16) & 0xffff;
        var bl = b & 0xffff;
        // the shift by 0 fixes the sign on the high part
        // the final |0 converts the unsigned value into a signed value
        return ((al * bl) + (((ah * bl + al * bh) << 16) >>> 0)|0);
    }
}

/* -*- Mode: Java; tab-width: 2; indent-tabs-mode: nil; c-basic-offset: 2 -*- */
/* vim: set shiftwidth=2 tabstop=2 autoindent cindent expandtab: */
/* Copyright 2012 Mozilla Foundation
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *     http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */
/*jshint globalstrict: false */
/* globals PDFJS */

// Initializing PDFJS global object (if still undefined)
if (typeof PDFJS === 'undefined') {
  (typeof window !== 'undefined' ? window : this).PDFJS = {};
}

PDFJS.version = '1.1.3';
PDFJS.build = '05991e9';

(function pdfjsWrapper() {
  // Use strict in our context only - users might not want it
  'use strict';

/* -*- Mode: Java; tab-width: 2; indent-tabs-mode: nil; c-basic-offset: 2 -*- */
/* vim: set shiftwidth=2 tabstop=2 autoindent cindent expandtab: */
/* Copyright 2012 Mozilla Foundation
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *     http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */
/* globals Cmd, ColorSpace, Dict, MozBlobBuilder, Name, PDFJS, Ref, URL,
           Promise */

'use strict';

var globalScope = (typeof window === 'undefined') ? this : window;

var isWorker = (typeof window === 'undefined');

var FONT_IDENTITY_MATRIX = [0.001, 0, 0, 0.001, 0, 0];

var TextRenderingMode = {
  FILL: 0,
  STROKE: 1,
  FILL_STROKE: 2,
  INVISIBLE: 3,
  FILL_ADD_TO_PATH: 4,
  STROKE_ADD_TO_PATH: 5,
  FILL_STROKE_ADD_TO_PATH: 6,
  ADD_TO_PATH: 7,
  FILL_STROKE_MASK: 3,
  ADD_TO_PATH_FLAG: 4
};

var ImageKind = {
  GRAYSCALE_1BPP: 1,
  RGB_24BPP: 2,
  RGBA_32BPP: 3
};

var AnnotationType = {
  WIDGET: 1,
  TEXT: 2,
  LINK: 3
};

var StreamType = {
  UNKNOWN: 0,
  FLATE: 1,
  LZW: 2,
  DCT: 3,
  JPX: 4,
  JBIG: 5,
  A85: 6,
  AHX: 7,
  CCF: 8,
  RL: 9
};

var FontType = {
  UNKNOWN: 0,
  TYPE1: 1,
  TYPE1C: 2,
  CIDFONTTYPE0: 3,
  CIDFONTTYPE0C: 4,
  TRUETYPE: 5,
  CIDFONTTYPE2: 6,
  TYPE3: 7,
  OPENTYPE: 8,
  TYPE0: 9,
  MMTYPE1: 10
};

// The global PDFJS object exposes the API
// In production, it will be declared outside a global wrapper
// In development, it will be declared here
if (!globalScope.PDFJS) {
  globalScope.PDFJS = {};
}

globalScope.PDFJS.pdfBug = false;

PDFJS.VERBOSITY_LEVELS = {
  errors: 0,
  warnings: 1,
  infos: 5
};

// All the possible operations for an operator list.
var OPS = PDFJS.OPS = {
  // Intentionally start from 1 so it is easy to spot bad operators that will be
  // 0's.
  dependency: 1,
  setLineWidth: 2,
  setLineCap: 3,
  setLineJoin: 4,
  setMiterLimit: 5,
  setDash: 6,
  setRenderingIntent: 7,
  setFlatness: 8,
  setGState: 9,
  save: 10,
  restore: 11,
  transform: 12,
  moveTo: 13,
  lineTo: 14,
  curveTo: 15,
  curveTo2: 16,
  curveTo3: 17,
  closePath: 18,
  rectangle: 19,
  stroke: 20,
  closeStroke: 21,
  fill: 22,
  eoFill: 23,
  fillStroke: 24,
  eoFillStroke: 25,
  closeFillStroke: 26,
  closeEOFillStroke: 27,
  endPath: 28,
  clip: 29,
  eoClip: 30,
  beginText: 31,
  endText: 32,
  setCharSpacing: 33,
  setWordSpacing: 34,
  setHScale: 35,
  setLeading: 36,
  setFont: 37,
  setTextRenderingMode: 38,
  setTextRise: 39,
  moveText: 40,
  setLeadingMoveText: 41,
  setTextMatrix: 42,
  nextLine: 43,
  showText: 44,
  showSpacedText: 45,
  nextLineShowText: 46,
  nextLineSetSpacingShowText: 47,
  setCharWidth: 48,
  setCharWidthAndBounds: 49,
  setStrokeColorSpace: 50,
  setFillColorSpace: 51,
  setStrokeColor: 52,
  setStrokeColorN: 53,
  setFillColor: 54,
  setFillColorN: 55,
  setStrokeGray: 56,
  setFillGray: 57,
  setStrokeRGBColor: 58,
  setFillRGBColor: 59,
  setStrokeCMYKColor: 60,
  setFillCMYKColor: 61,
  shadingFill: 62,
  beginInlineImage: 63,
  beginImageData: 64,
  endInlineImage: 65,
  paintXObject: 66,
  markPoint: 67,
  markPointProps: 68,
  beginMarkedContent: 69,
  beginMarkedContentProps: 70,
  endMarkedContent: 71,
  beginCompat: 72,
  endCompat: 73,
  paintFormXObjectBegin: 74,
  paintFormXObjectEnd: 75,
  beginGroup: 76,
  endGroup: 77,
  beginAnnotations: 78,
  endAnnotations: 79,
  beginAnnotation: 80,
  endAnnotation: 81,
  paintJpegXObject: 82,
  paintImageMaskXObject: 83,
  paintImageMaskXObjectGroup: 84,
  paintImageXObject: 85,
  paintInlineImageXObject: 86,
  paintInlineImageXObjectGroup: 87,
  paintImageXObjectRepeat: 88,
  paintImageMaskXObjectRepeat: 89,
  paintSolidColorImageMask: 90,
  constructPath: 91
};

// A notice for devs. These are good for things that are helpful to devs, such
// as warning that Workers were disabled, which is important to devs but not
// end users.
function info(msg) {
  if (PDFJS.verbosity >= PDFJS.VERBOSITY_LEVELS.infos) {
    console.log('Info: ' + msg);
  }
}

// Non-fatal warnings.
function warn(msg) {
  if (PDFJS.verbosity >= PDFJS.VERBOSITY_LEVELS.warnings) {
    console.log('Warning: ' + msg);
  }
}

// Fatal errors that should trigger the fallback UI and halt execution by
// throwing an exception.
function error(msg) {
  // If multiple arguments were passed, pass them all to the log function.
  if (arguments.length > 1) {
    var logArguments = ['Error:'];
    logArguments.push.apply(logArguments, arguments);
    console.log.apply(console, logArguments);
    // Join the arguments into a single string for the lines below.
    msg = [].join.call(arguments, ' ');
  } else {
    console.log('Error: ' + msg);
  }
  console.log(backtrace());
  UnsupportedManager.notify(UNSUPPORTED_FEATURES.unknown);
  throw new Error(msg);
}

function backtrace() {
  try {
    throw new Error();
  } catch (e) {
    return e.stack ? e.stack.split('\n').slice(2).join('\n') : '';
  }
}

function assert(cond, msg) {
  if (!cond) {
    error(msg);
  }
}

var UNSUPPORTED_FEATURES = PDFJS.UNSUPPORTED_FEATURES = {
  unknown: 'unknown',
  forms: 'forms',
  javaScript: 'javaScript',
  smask: 'smask',
  shadingPattern: 'shadingPattern',
  font: 'font'
};

var UnsupportedManager = PDFJS.UnsupportedManager =
  (function UnsupportedManagerClosure() {
  var listeners = [];
  return {
    listen: function (cb) {
      listeners.push(cb);
    },
    notify: function (featureId) {
      warn('Unsupported feature "' + featureId + '"');
      for (var i = 0, ii = listeners.length; i < ii; i++) {
        listeners[i](featureId);
      }
    }
  };
})();

// Combines two URLs. The baseUrl shall be absolute URL. If the url is an
// absolute URL, it will be returned as is.
function combineUrl(baseUrl, url) {
  if (!url) {
    return baseUrl;
  }
  if (/^[a-z][a-z0-9+\-.]*:/i.test(url)) {
    return url;
  }
  var i;
  if (url.charAt(0) === '/') {
    // absolute path
    i = baseUrl.indexOf('://');
    if (url.charAt(1) === '/') {
      ++i;
    } else {
      i = baseUrl.indexOf('/', i + 3);
    }
    return baseUrl.substring(0, i) + url;
  } else {
    // relative path
    var pathLength = baseUrl.length;
    i = baseUrl.lastIndexOf('#');
    pathLength = i >= 0 ? i : pathLength;
    i = baseUrl.lastIndexOf('?', pathLength);
    pathLength = i >= 0 ? i : pathLength;
    var prefixLength = baseUrl.lastIndexOf('/', pathLength);
    return baseUrl.substring(0, prefixLength + 1) + url;
  }
}

// Validates if URL is safe and allowed, e.g. to avoid XSS.
function isValidUrl(url, allowRelative) {
  if (!url) {
    return false;
  }
  // RFC 3986 (http://tools.ietf.org/html/rfc3986#section-3.1)
  // scheme = ALPHA *( ALPHA / DIGIT / "+" / "-" / "." )
  var protocol = /^[a-z][a-z0-9+\-.]*(?=:)/i.exec(url);
  if (!protocol) {
    return allowRelative;
  }
  protocol = protocol[0].toLowerCase();
  switch (protocol) {
    case 'http':
    case 'https':
    case 'ftp':
    case 'mailto':
    case 'tel':
      return true;
    default:
      return false;
  }
}
PDFJS.isValidUrl = isValidUrl;

function shadow(obj, prop, value) {
  Object.defineProperty(obj, prop, { value: value,
                                     enumerable: true,
                                     configurable: true,
                                     writable: false });
  return value;
}
PDFJS.shadow = shadow;

var PasswordResponses = PDFJS.PasswordResponses = {
  NEED_PASSWORD: 1,
  INCORRECT_PASSWORD: 2
};

var PasswordException = (function PasswordExceptionClosure() {
  function PasswordException(msg, code) {
    this.name = 'PasswordException';
    this.message = msg;
    this.code = code;
  }

  PasswordException.prototype = new Error();
  PasswordException.constructor = PasswordException;

  return PasswordException;
})();
PDFJS.PasswordException = PasswordException;

var UnknownErrorException = (function UnknownErrorExceptionClosure() {
  function UnknownErrorException(msg, details) {
    this.name = 'UnknownErrorException';
    this.message = msg;
    this.details = details;
  }

  UnknownErrorException.prototype = new Error();
  UnknownErrorException.constructor = UnknownErrorException;

  return UnknownErrorException;
})();
PDFJS.UnknownErrorException = UnknownErrorException;

var InvalidPDFException = (function InvalidPDFExceptionClosure() {
  function InvalidPDFException(msg) {
    this.name = 'InvalidPDFException';
    this.message = msg;
  }

  InvalidPDFException.prototype = new Error();
  InvalidPDFException.constructor = InvalidPDFException;

  return InvalidPDFException;
})();
PDFJS.InvalidPDFException = InvalidPDFException;

var MissingPDFException = (function MissingPDFExceptionClosure() {
  function MissingPDFException(msg) {
    this.name = 'MissingPDFException';
    this.message = msg;
  }

  MissingPDFException.prototype = new Error();
  MissingPDFException.constructor = MissingPDFException;

  return MissingPDFException;
})();
PDFJS.MissingPDFException = MissingPDFException;

var UnexpectedResponseException =
    (function UnexpectedResponseExceptionClosure() {
  function UnexpectedResponseException(msg, status) {
    this.name = 'UnexpectedResponseException';
    this.message = msg;
    this.status = status;
  }

  UnexpectedResponseException.prototype = new Error();
  UnexpectedResponseException.constructor = UnexpectedResponseException;

  return UnexpectedResponseException;
})();
PDFJS.UnexpectedResponseException = UnexpectedResponseException;

var NotImplementedException = (function NotImplementedExceptionClosure() {
  function NotImplementedException(msg) {
    this.message = msg;
  }

  NotImplementedException.prototype = new Error();
  NotImplementedException.prototype.name = 'NotImplementedException';
  NotImplementedException.constructor = NotImplementedException;

  return NotImplementedException;
})();

var MissingDataException = (function MissingDataExceptionClosure() {
  function MissingDataException(begin, end) {
    this.begin = begin;
    this.end = end;
    this.message = 'Missing data [' + begin + ', ' + end + ')';
  }

  MissingDataException.prototype = new Error();
  MissingDataException.prototype.name = 'MissingDataException';
  MissingDataException.constructor = MissingDataException;

  return MissingDataException;
})();

var XRefParseException = (function XRefParseExceptionClosure() {
  function XRefParseException(msg) {
    this.message = msg;
  }

  XRefParseException.prototype = new Error();
  XRefParseException.prototype.name = 'XRefParseException';
  XRefParseException.constructor = XRefParseException;

  return XRefParseException;
})();


function bytesToString(bytes) {
  assert(bytes !== null && typeof bytes === 'object' &&
         bytes.length !== undefined, 'Invalid argument for bytesToString');
  var length = bytes.length;
  var MAX_ARGUMENT_COUNT = 8192;
  if (length < MAX_ARGUMENT_COUNT) {
    return String.fromCharCode.apply(null, bytes);
  }
  var strBuf = [];
  for (var i = 0; i < length; i += MAX_ARGUMENT_COUNT) {
    var chunkEnd = Math.min(i + MAX_ARGUMENT_COUNT, length);
    var chunk = bytes.subarray(i, chunkEnd);
    strBuf.push(String.fromCharCode.apply(null, chunk));
  }
  return strBuf.join('');
}

function stringToBytes(str) {
  assert(typeof str === 'string', 'Invalid argument for stringToBytes');
  var length = str.length;
  var bytes = new Uint8Array(length);
  for (var i = 0; i < length; ++i) {
    bytes[i] = str.charCodeAt(i) & 0xFF;
  }
  return bytes;
}

function string32(value) {
  return String.fromCharCode((value >> 24) & 0xff, (value >> 16) & 0xff,
                             (value >> 8) & 0xff, value & 0xff);
}

function log2(x) {
  var n = 1, i = 0;
  while (x > n) {
    n <<= 1;
    i++;
  }
  return i;
}

function readInt8(data, start) {
  return (data[start] << 24) >> 24;
}

function readUint16(data, offset) {
  return (data[offset] << 8) | data[offset + 1];
}

function readUint32(data, offset) {
  return ((data[offset] << 24) | (data[offset + 1] << 16) |
         (data[offset + 2] << 8) | data[offset + 3]) >>> 0;
}

// Lazy test the endianness of the platform
// NOTE: This will be 'true' for simulated TypedArrays
function isLittleEndian() {
  var buffer8 = new Uint8Array(2);
  buffer8[0] = 1;
  var buffer16 = new Uint16Array(buffer8.buffer);
  return (buffer16[0] === 1);
}

Object.defineProperty(PDFJS, 'isLittleEndian', {
  configurable: true,
  get: function PDFJS_isLittleEndian() {
    return shadow(PDFJS, 'isLittleEndian', isLittleEndian());
  }
});

  // Lazy test if the userAgant support CanvasTypedArrays
function hasCanvasTypedArrays() {
  var canvas = document.createElement('canvas');
  canvas.width = canvas.height = 1;
  var ctx = canvas.getContext('2d');
  var imageData = ctx.createImageData(1, 1);
  return (typeof imageData.data.buffer !== 'undefined');
}

Object.defineProperty(PDFJS, 'hasCanvasTypedArrays', {
  configurable: true,
  get: function PDFJS_hasCanvasTypedArrays() {
    return shadow(PDFJS, 'hasCanvasTypedArrays', hasCanvasTypedArrays());
  }
});

var Uint32ArrayView = (function Uint32ArrayViewClosure() {

  function Uint32ArrayView(buffer, length) {
    this.buffer = buffer;
    this.byteLength = buffer.length;
    this.length = length === undefined ? (this.byteLength >> 2) : length;
    ensureUint32ArrayViewProps(this.length);
  }
  Uint32ArrayView.prototype = Object.create(null);

  var uint32ArrayViewSetters = 0;
  function createUint32ArrayProp(index) {
    return {
      get: function () {
        var buffer = this.buffer, offset = index << 2;
        return (buffer[offset] | (buffer[offset + 1] << 8) |
          (buffer[offset + 2] << 16) | (buffer[offset + 3] << 24)) >>> 0;
      },
      set: function (value) {
        var buffer = this.buffer, offset = index << 2;
        buffer[offset] = value & 255;
        buffer[offset + 1] = (value >> 8) & 255;
        buffer[offset + 2] = (value >> 16) & 255;
        buffer[offset + 3] = (value >>> 24) & 255;
      }
    };
  }

  function ensureUint32ArrayViewProps(length) {
    while (uint32ArrayViewSetters < length) {
      Object.defineProperty(Uint32ArrayView.prototype,
        uint32ArrayViewSetters,
        createUint32ArrayProp(uint32ArrayViewSetters));
      uint32ArrayViewSetters++;
    }
  }

  return Uint32ArrayView;
})();

var IDENTITY_MATRIX = [1, 0, 0, 1, 0, 0];

var Util = PDFJS.Util = (function UtilClosure() {
  function Util() {}

  var rgbBuf = ['rgb(', 0, ',', 0, ',', 0, ')'];

  // makeCssRgb() can be called thousands of times. Using |rgbBuf| avoids
  // creating many intermediate strings.
  Util.makeCssRgb = function Util_makeCssRgb(r, g, b) {
    rgbBuf[1] = r;
    rgbBuf[3] = g;
    rgbBuf[5] = b;
    return rgbBuf.join('');
  };

  // Concatenates two transformation matrices together and returns the result.
  Util.transform = function Util_transform(m1, m2) {
    return [
      m1[0] * m2[0] + m1[2] * m2[1],
      m1[1] * m2[0] + m1[3] * m2[1],
      m1[0] * m2[2] + m1[2] * m2[3],
      m1[1] * m2[2] + m1[3] * m2[3],
      m1[0] * m2[4] + m1[2] * m2[5] + m1[4],
      m1[1] * m2[4] + m1[3] * m2[5] + m1[5]
    ];
  };

  // For 2d affine transforms
  Util.applyTransform = function Util_applyTransform(p, m) {
    var xt = p[0] * m[0] + p[1] * m[2] + m[4];
    var yt = p[0] * m[1] + p[1] * m[3] + m[5];
    return [xt, yt];
  };

  Util.applyInverseTransform = function Util_applyInverseTransform(p, m) {
    var d = m[0] * m[3] - m[1] * m[2];
    var xt = (p[0] * m[3] - p[1] * m[2] + m[2] * m[5] - m[4] * m[3]) / d;
    var yt = (-p[0] * m[1] + p[1] * m[0] + m[4] * m[1] - m[5] * m[0]) / d;
    return [xt, yt];
  };

  // Applies the transform to the rectangle and finds the minimum axially
  // aligned bounding box.
  Util.getAxialAlignedBoundingBox =
    function Util_getAxialAlignedBoundingBox(r, m) {

    var p1 = Util.applyTransform(r, m);
    var p2 = Util.applyTransform(r.slice(2, 4), m);
    var p3 = Util.applyTransform([r[0], r[3]], m);
    var p4 = Util.applyTransform([r[2], r[1]], m);
    return [
      Math.min(p1[0], p2[0], p3[0], p4[0]),
      Math.min(p1[1], p2[1], p3[1], p4[1]),
      Math.max(p1[0], p2[0], p3[0], p4[0]),
      Math.max(p1[1], p2[1], p3[1], p4[1])
    ];
  };

  Util.inverseTransform = function Util_inverseTransform(m) {
    var d = m[0] * m[3] - m[1] * m[2];
    return [m[3] / d, -m[1] / d, -m[2] / d, m[0] / d,
      (m[2] * m[5] - m[4] * m[3]) / d, (m[4] * m[1] - m[5] * m[0]) / d];
  };

  // Apply a generic 3d matrix M on a 3-vector v:
  //   | a b c |   | X |
  //   | d e f | x | Y |
  //   | g h i |   | Z |
  // M is assumed to be serialized as [a,b,c,d,e,f,g,h,i],
  // with v as [X,Y,Z]
  Util.apply3dTransform = function Util_apply3dTransform(m, v) {
    return [
      m[0] * v[0] + m[1] * v[1] + m[2] * v[2],
      m[3] * v[0] + m[4] * v[1] + m[5] * v[2],
      m[6] * v[0] + m[7] * v[1] + m[8] * v[2]
    ];
  };

  // This calculation uses Singular Value Decomposition.
  // The SVD can be represented with formula A = USV. We are interested in the
  // matrix S here because it represents the scale values.
  Util.singularValueDecompose2dScale =
    function Util_singularValueDecompose2dScale(m) {

    var transpose = [m[0], m[2], m[1], m[3]];

    // Multiply matrix m with its transpose.
    var a = m[0] * transpose[0] + m[1] * transpose[2];
    var b = m[0] * transpose[1] + m[1] * transpose[3];
    var c = m[2] * transpose[0] + m[3] * transpose[2];
    var d = m[2] * transpose[1] + m[3] * transpose[3];

    // Solve the second degree polynomial to get roots.
    var first = (a + d) / 2;
    var second = Math.sqrt((a + d) * (a + d) - 4 * (a * d - c * b)) / 2;
    var sx = first + second || 1;
    var sy = first - second || 1;

    // Scale values are the square roots of the eigenvalues.
    return [Math.sqrt(sx), Math.sqrt(sy)];
  };

  // Normalize rectangle rect=[x1, y1, x2, y2] so that (x1,y1) < (x2,y2)
  // For coordinate systems whose origin lies in the bottom-left, this
  // means normalization to (BL,TR) ordering. For systems with origin in the
  // top-left, this means (TL,BR) ordering.
  Util.normalizeRect = function Util_normalizeRect(rect) {
    var r = rect.slice(0); // clone rect
    if (rect[0] > rect[2]) {
      r[0] = rect[2];
      r[2] = rect[0];
    }
    if (rect[1] > rect[3]) {
      r[1] = rect[3];
      r[3] = rect[1];
    }
    return r;
  };

  // Returns a rectangle [x1, y1, x2, y2] corresponding to the
  // intersection of rect1 and rect2. If no intersection, returns 'false'
  // The rectangle coordinates of rect1, rect2 should be [x1, y1, x2, y2]
  Util.intersect = function Util_intersect(rect1, rect2) {
    function compare(a, b) {
      return a - b;
    }

    // Order points along the axes
    var orderedX = [rect1[0], rect1[2], rect2[0], rect2[2]].sort(compare),
        orderedY = [rect1[1], rect1[3], rect2[1], rect2[3]].sort(compare),
        result = [];

    rect1 = Util.normalizeRect(rect1);
    rect2 = Util.normalizeRect(rect2);

    // X: first and second points belong to different rectangles?
    if ((orderedX[0] === rect1[0] && orderedX[1] === rect2[0]) ||
        (orderedX[0] === rect2[0] && orderedX[1] === rect1[0])) {
      // Intersection must be between second and third points
      result[0] = orderedX[1];
      result[2] = orderedX[2];
    } else {
      return false;
    }

    // Y: first and second points belong to different rectangles?
    if ((orderedY[0] === rect1[1] && orderedY[1] === rect2[1]) ||
        (orderedY[0] === rect2[1] && orderedY[1] === rect1[1])) {
      // Intersection must be between second and third points
      result[1] = orderedY[1];
      result[3] = orderedY[2];
    } else {
      return false;
    }

    return result;
  };

  Util.sign = function Util_sign(num) {
    return num < 0 ? -1 : 1;
  };

  Util.appendToArray = function Util_appendToArray(arr1, arr2) {
    Array.prototype.push.apply(arr1, arr2);
  };

  Util.prependToArray = function Util_prependToArray(arr1, arr2) {
    Array.prototype.unshift.apply(arr1, arr2);
  };

  Util.extendObj = function extendObj(obj1, obj2) {
    for (var key in obj2) {
      obj1[key] = obj2[key];
    }
  };

  Util.getInheritableProperty = function Util_getInheritableProperty(dict,
                                                                     name) {
    while (dict && !dict.has(name)) {
      dict = dict.get('Parent');
    }
    if (!dict) {
      return null;
    }
    return dict.get(name);
  };

  Util.inherit = function Util_inherit(sub, base, prototype) {
    sub.prototype = Object.create(base.prototype);
    sub.prototype.constructor = sub;
    for (var prop in prototype) {
      sub.prototype[prop] = prototype[prop];
    }
  };

  Util.loadScript = function Util_loadScript(src, callback) {
    var script = document.createElement('script');
    var loaded = false;
    script.setAttribute('src', src);
    if (callback) {
      script.onload = function() {
        if (!loaded) {
          callback();
        }
        loaded = true;
      };
    }
    document.getElementsByTagName('head')[0].appendChild(script);
  };

  return Util;
})();

/**
 * PDF page viewport created based on scale, rotation and offset.
 * @class
 * @alias PDFJS.PageViewport
 */
var PageViewport = PDFJS.PageViewport = (function PageViewportClosure() {
  /**
   * @constructor
   * @private
   * @param viewBox {Array} xMin, yMin, xMax and yMax coordinates.
   * @param scale {number} scale of the viewport.
   * @param rotation {number} rotations of the viewport in degrees.
   * @param offsetX {number} offset X
   * @param offsetY {number} offset Y
   * @param dontFlip {boolean} if true, axis Y will not be flipped.
   */
  function PageViewport(viewBox, scale, rotation, offsetX, offsetY, dontFlip) {
    this.viewBox = viewBox;
    this.scale = scale;
    this.rotation = rotation;
    this.offsetX = offsetX;
    this.offsetY = offsetY;

    // creating transform to convert pdf coordinate system to the normal
    // canvas like coordinates taking in account scale and rotation
    var centerX = (viewBox[2] + viewBox[0]) / 2;
    var centerY = (viewBox[3] + viewBox[1]) / 2;
    var rotateA, rotateB, rotateC, rotateD;
    rotation = rotation % 360;
    rotation = rotation < 0 ? rotation + 360 : rotation;
    switch (rotation) {
      case 180:
        rotateA = -1; rotateB = 0; rotateC = 0; rotateD = 1;
        break;
      case 90:
        rotateA = 0; rotateB = 1; rotateC = 1; rotateD = 0;
        break;
      case 270:
        rotateA = 0; rotateB = -1; rotateC = -1; rotateD = 0;
        break;
      //case 0:
      default:
        rotateA = 1; rotateB = 0; rotateC = 0; rotateD = -1;
        break;
    }

    if (dontFlip) {
      rotateC = -rotateC; rotateD = -rotateD;
    }

    var offsetCanvasX, offsetCanvasY;
    var width, height;
    if (rotateA === 0) {
      offsetCanvasX = Math.abs(centerY - viewBox[1]) * scale + offsetX;
      offsetCanvasY = Math.abs(centerX - viewBox[0]) * scale + offsetY;
      width = Math.abs(viewBox[3] - viewBox[1]) * scale;
      height = Math.abs(viewBox[2] - viewBox[0]) * scale;
    } else {
      offsetCanvasX = Math.abs(centerX - viewBox[0]) * scale + offsetX;
      offsetCanvasY = Math.abs(centerY - viewBox[1]) * scale + offsetY;
      width = Math.abs(viewBox[2] - viewBox[0]) * scale;
      height = Math.abs(viewBox[3] - viewBox[1]) * scale;
    }
    // creating transform for the following operations:
    // translate(-centerX, -centerY), rotate and flip vertically,
    // scale, and translate(offsetCanvasX, offsetCanvasY)
    this.transform = [
      rotateA * scale,
      rotateB * scale,
      rotateC * scale,
      rotateD * scale,
      offsetCanvasX - rotateA * scale * centerX - rotateC * scale * centerY,
      offsetCanvasY - rotateB * scale * centerX - rotateD * scale * centerY
    ];

    this.width = width;
    this.height = height;
    this.fontScale = scale;
  }
  PageViewport.prototype = /** @lends PDFJS.PageViewport.prototype */ {
    /**
     * Clones viewport with additional properties.
     * @param args {Object} (optional) If specified, may contain the 'scale' or
     * 'rotation' properties to override the corresponding properties in
     * the cloned viewport.
     * @returns {PDFJS.PageViewport} Cloned viewport.
     */
    clone: function PageViewPort_clone(args) {
      args = args || {};
      var scale = 'scale' in args ? args.scale : this.scale;
      var rotation = 'rotation' in args ? args.rotation : this.rotation;
      return new PageViewport(this.viewBox.slice(), scale, rotation,
                              this.offsetX, this.offsetY, args.dontFlip);
    },
    /**
     * Converts PDF point to the viewport coordinates. For examples, useful for
     * converting PDF location into canvas pixel coordinates.
     * @param x {number} X coordinate.
     * @param y {number} Y coordinate.
     * @returns {Object} Object that contains 'x' and 'y' properties of the
     * point in the viewport coordinate space.
     * @see {@link convertToPdfPoint}
     * @see {@link convertToViewportRectangle}
     */
    convertToViewportPoint: function PageViewport_convertToViewportPoint(x, y) {
      return Util.applyTransform([x, y], this.transform);
    },
    /**
     * Converts PDF rectangle to the viewport coordinates.
     * @param rect {Array} xMin, yMin, xMax and yMax coordinates.
     * @returns {Array} Contains corresponding coordinates of the rectangle
     * in the viewport coordinate space.
     * @see {@link convertToViewportPoint}
     */
    convertToViewportRectangle:
      function PageViewport_convertToViewportRectangle(rect) {
      var tl = Util.applyTransform([rect[0], rect[1]], this.transform);
      var br = Util.applyTransform([rect[2], rect[3]], this.transform);
      return [tl[0], tl[1], br[0], br[1]];
    },
    /**
     * Converts viewport coordinates to the PDF location. For examples, useful
     * for converting canvas pixel location into PDF one.
     * @param x {number} X coordinate.
     * @param y {number} Y coordinate.
     * @returns {Object} Object that contains 'x' and 'y' properties of the
     * point in the PDF coordinate space.
     * @see {@link convertToViewportPoint}
     */
    convertToPdfPoint: function PageViewport_convertToPdfPoint(x, y) {
      return Util.applyInverseTransform([x, y], this.transform);
    }
  };
  return PageViewport;
})();

var PDFStringTranslateTable = [
  0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0,
  0x2D8, 0x2C7, 0x2C6, 0x2D9, 0x2DD, 0x2DB, 0x2DA, 0x2DC, 0, 0, 0, 0, 0, 0, 0,
  0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0,
  0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0,
  0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0,
  0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0x2022, 0x2020, 0x2021, 0x2026, 0x2014,
  0x2013, 0x192, 0x2044, 0x2039, 0x203A, 0x2212, 0x2030, 0x201E, 0x201C,
  0x201D, 0x2018, 0x2019, 0x201A, 0x2122, 0xFB01, 0xFB02, 0x141, 0x152, 0x160,
  0x178, 0x17D, 0x131, 0x142, 0x153, 0x161, 0x17E, 0, 0x20AC
];

function stringToPDFString(str) {
  var i, n = str.length, strBuf = [];
  if (str[0] === '\xFE' && str[1] === '\xFF') {
    // UTF16BE BOM
    for (i = 2; i < n; i += 2) {
      strBuf.push(String.fromCharCode(
        (str.charCodeAt(i) << 8) | str.charCodeAt(i + 1)));
    }
  } else {
    for (i = 0; i < n; ++i) {
      var code = PDFStringTranslateTable[str.charCodeAt(i)];
      strBuf.push(code ? String.fromCharCode(code) : str.charAt(i));
    }
  }
  return strBuf.join('');
}

function stringToUTF8String(str) {
  return decodeURIComponent(escape(str));
}

function isEmptyObj(obj) {
  for (var key in obj) {
    return false;
  }
  return true;
}

function isBool(v) {
  return typeof v === 'boolean';
}

function isInt(v) {
  return typeof v === 'number' && ((v | 0) === v);
}

function isNum(v) {
  return typeof v === 'number';
}

function isString(v) {
  return typeof v === 'string';
}

function isName(v) {
  return v instanceof Name;
}

function isCmd(v, cmd) {
  return v instanceof Cmd && (cmd === undefined || v.cmd === cmd);
}

function isDict(v, type) {
  if (!(v instanceof Dict)) {
    return false;
  }
  if (!type) {
    return true;
  }
  var dictType = v.get('Type');
  return isName(dictType) && dictType.name === type;
}

function isArray(v) {
  return v instanceof Array;
}

function isStream(v) {
  return typeof v === 'object' && v !== null && v.getBytes !== undefined;
}

function isArrayBuffer(v) {
  return typeof v === 'object' && v !== null && v.byteLength !== undefined;
}

function isRef(v) {
  return v instanceof Ref;
}

/**
 * Promise Capability object.
 *
 * @typedef {Object} PromiseCapability
 * @property {Promise} promise - A promise object.
 * @property {function} resolve - Fullfills the promise.
 * @property {function} reject - Rejects the promise.
 */

/**
 * Creates a promise capability object.
 * @alias PDFJS.createPromiseCapability
 *
 * @return {PromiseCapability} A capability object contains:
 * - a Promise, resolve and reject methods.
 */
function createPromiseCapability() {
  var capability = {};
  capability.promise = new Promise(function (resolve, reject) {
    capability.resolve = resolve;
    capability.reject = reject;
  });
  return capability;
}

PDFJS.createPromiseCapability = createPromiseCapability;

/**
 * Polyfill for Promises:
 * The following promise implementation tries to generally implement the
 * Promise/A+ spec. Some notable differences from other promise libaries are:
 * - There currently isn't a seperate deferred and promise object.
 * - Unhandled rejections eventually show an error if they aren't handled.
 *
 * Based off of the work in:
 * https://bugzilla.mozilla.org/show_bug.cgi?id=810490
 */
(function PromiseClosure() {
  if (globalScope.Promise) {
    // Promises existing in the DOM/Worker, checking presence of all/resolve
    if (typeof globalScope.Promise.all !== 'function') {
      globalScope.Promise.all = function (iterable) {
        var count = 0, results = [], resolve, reject;
        var promise = new globalScope.Promise(function (resolve_, reject_) {
          resolve = resolve_;
          reject = reject_;
        });
        iterable.forEach(function (p, i) {
          count++;
          p.then(function (result) {
            results[i] = result;
            count--;
            if (count === 0) {
              resolve(results);
            }
          }, reject);
        });
        if (count === 0) {
          resolve(results);
        }
        return promise;
      };
    }
    if (typeof globalScope.Promise.resolve !== 'function') {
      globalScope.Promise.resolve = function (value) {
        return new globalScope.Promise(function (resolve) { resolve(value); });
      };
    }
    if (typeof globalScope.Promise.reject !== 'function') {
      globalScope.Promise.reject = function (reason) {
        return new globalScope.Promise(function (resolve, reject) {
          reject(reason);
        });
      };
    }
    if (typeof globalScope.Promise.prototype.catch !== 'function') {
      globalScope.Promise.prototype.catch = function (onReject) {
        return globalScope.Promise.prototype.then(undefined, onReject);
      };
    }
    return;
  }
  var STATUS_PENDING = 0;
  var STATUS_RESOLVED = 1;
  var STATUS_REJECTED = 2;

  // In an attempt to avoid silent exceptions, unhandled rejections are
  // tracked and if they aren't handled in a certain amount of time an
  // error is logged.
  var REJECTION_TIMEOUT = 500;

  var HandlerManager = {
    handlers: [],
    running: false,
    unhandledRejections: [],
    pendingRejectionCheck: false,

    scheduleHandlers: function scheduleHandlers(promise) {
      if (promise._status === STATUS_PENDING) {
        return;
      }

      this.handlers = this.handlers.concat(promise._handlers);
      promise._handlers = [];

      if (this.running) {
        return;
      }
      this.running = true;

      setTimeout(this.runHandlers.bind(this), 0);
    },

    runHandlers: function runHandlers() {
      var RUN_TIMEOUT = 1; // ms
      var timeoutAt = Date.now() + RUN_TIMEOUT;
      while (this.handlers.length > 0) {
        var handler = this.handlers.shift();

        var nextStatus = handler.thisPromise._status;
        var nextValue = handler.thisPromise._value;

        try {
          if (nextStatus === STATUS_RESOLVED) {
            if (typeof handler.onResolve === 'function') {
              nextValue = handler.onResolve(nextValue);
            }
          } else if (typeof handler.onReject === 'function') {
              nextValue = handler.onReject(nextValue);
              nextStatus = STATUS_RESOLVED;

              if (handler.thisPromise._unhandledRejection) {
                this.removeUnhandeledRejection(handler.thisPromise);
              }
          }
        } catch (ex) {
          nextStatus = STATUS_REJECTED;
          nextValue = ex;
        }

        handler.nextPromise._updateStatus(nextStatus, nextValue);
        if (Date.now() >= timeoutAt) {
          break;
        }
      }

      if (this.handlers.length > 0) {
        setTimeout(this.runHandlers.bind(this), 0);
        return;
      }

      this.running = false;
    },

    addUnhandledRejection: function addUnhandledRejection(promise) {
      this.unhandledRejections.push({
        promise: promise,
        time: Date.now()
      });
      this.scheduleRejectionCheck();
    },

    removeUnhandeledRejection: function removeUnhandeledRejection(promise) {
      promise._unhandledRejection = false;
      for (var i = 0; i < this.unhandledRejections.length; i++) {
        if (this.unhandledRejections[i].promise === promise) {
          this.unhandledRejections.splice(i);
          i--;
        }
      }
    },

    scheduleRejectionCheck: function scheduleRejectionCheck() {
      if (this.pendingRejectionCheck) {
        return;
      }
      this.pendingRejectionCheck = true;
      setTimeout(function rejectionCheck() {
        this.pendingRejectionCheck = false;
        var now = Date.now();
        for (var i = 0; i < this.unhandledRejections.length; i++) {
          if (now - this.unhandledRejections[i].time > REJECTION_TIMEOUT) {
            var unhandled = this.unhandledRejections[i].promise._value;
            var msg = 'Unhandled rejection: ' + unhandled;
            if (unhandled.stack) {
              msg += '\n' + unhandled.stack;
            }
            warn(msg);
            this.unhandledRejections.splice(i);
            i--;
          }
        }
        if (this.unhandledRejections.length) {
          this.scheduleRejectionCheck();
        }
      }.bind(this), REJECTION_TIMEOUT);
    }
  };

  function Promise(resolver) {
    this._status = STATUS_PENDING;
    this._handlers = [];
    try {
      resolver.call(this, this._resolve.bind(this), this._reject.bind(this));
    } catch (e) {
      this._reject(e);
    }
  }
  /**
   * Builds a promise that is resolved when all the passed in promises are
   * resolved.
   * @param {array} array of data and/or promises to wait for.
   * @return {Promise} New dependant promise.
   */
  Promise.all = function Promise_all(promises) {
    var resolveAll, rejectAll;
    var deferred = new Promise(function (resolve, reject) {
      resolveAll = resolve;
      rejectAll = reject;
    });
    var unresolved = promises.length;
    var results = [];
    if (unresolved === 0) {
      resolveAll(results);
      return deferred;
    }
    function reject(reason) {
      if (deferred._status === STATUS_REJECTED) {
        return;
      }
      results = [];
      rejectAll(reason);
    }
    for (var i = 0, ii = promises.length; i < ii; ++i) {
      var promise = promises[i];
      var resolve = (function(i) {
        return function(value) {
          if (deferred._status === STATUS_REJECTED) {
            return;
          }
          results[i] = value;
          unresolved--;
          if (unresolved === 0) {
            resolveAll(results);
          }
        };
      })(i);
      if (Promise.isPromise(promise)) {
        promise.then(resolve, reject);
      } else {
        resolve(promise);
      }
    }
    return deferred;
  };

  /**
   * Checks if the value is likely a promise (has a 'then' function).
   * @return {boolean} true if value is thenable
   */
  Promise.isPromise = function Promise_isPromise(value) {
    return value && typeof value.then === 'function';
  };

  /**
   * Creates resolved promise
   * @param value resolve value
   * @returns {Promise}
   */
  Promise.resolve = function Promise_resolve(value) {
    return new Promise(function (resolve) { resolve(value); });
  };

  /**
   * Creates rejected promise
   * @param reason rejection value
   * @returns {Promise}
   */
  Promise.reject = function Promise_reject(reason) {
    return new Promise(function (resolve, reject) { reject(reason); });
  };

  Promise.prototype = {
    _status: null,
    _value: null,
    _handlers: null,
    _unhandledRejection: null,

    _updateStatus: function Promise__updateStatus(status, value) {
      if (this._status === STATUS_RESOLVED ||
          this._status === STATUS_REJECTED) {
        return;
      }

      if (status === STATUS_RESOLVED &&
          Promise.isPromise(value)) {
        value.then(this._updateStatus.bind(this, STATUS_RESOLVED),
                   this._updateStatus.bind(this, STATUS_REJECTED));
        return;
      }

      this._status = status;
      this._value = value;

      if (status === STATUS_REJECTED && this._handlers.length === 0) {
        this._unhandledRejection = true;
        HandlerManager.addUnhandledRejection(this);
      }

      HandlerManager.scheduleHandlers(this);
    },

    _resolve: function Promise_resolve(value) {
      this._updateStatus(STATUS_RESOLVED, value);
    },

    _reject: function Promise_reject(reason) {
      this._updateStatus(STATUS_REJECTED, reason);
    },

    then: function Promise_then(onResolve, onReject) {
      var nextPromise = new Promise(function (resolve, reject) {
        this.resolve = resolve;
        this.reject = reject;
      });
      this._handlers.push({
        thisPromise: this,
        onResolve: onResolve,
        onReject: onReject,
        nextPromise: nextPromise
      });
      HandlerManager.scheduleHandlers(this);
      return nextPromise;
    },

    catch: function Promise_catch(onReject) {
      return this.then(undefined, onReject);
    }
  };

  globalScope.Promise = Promise;
})();

var StatTimer = (function StatTimerClosure() {
  function rpad(str, pad, length) {
    while (str.length < length) {
      str += pad;
    }
    return str;
  }
  function StatTimer() {
    this.started = {};
    this.times = [];
    this.enabled = true;
  }
  StatTimer.prototype = {
    time: function StatTimer_time(name) {
      if (!this.enabled) {
        return;
      }
      if (name in this.started) {
        warn('Timer is already running for ' + name);
      }
      this.started[name] = Date.now();
    },
    timeEnd: function StatTimer_timeEnd(name) {
      if (!this.enabled) {
        return;
      }
      if (!(name in this.started)) {
        warn('Timer has not been started for ' + name);
      }
      this.times.push({
        'name': name,
        'start': this.started[name],
        'end': Date.now()
      });
      // Remove timer from started so it can be called again.
      delete this.started[name];
    },
    toString: function StatTimer_toString() {
      var i, ii;
      var times = this.times;
      var out = '';
      // Find the longest name for padding purposes.
      var longest = 0;
      for (i = 0, ii = times.length; i < ii; ++i) {
        var name = times[i]['name'];
        if (name.length > longest) {
          longest = name.length;
        }
      }
      for (i = 0, ii = times.length; i < ii; ++i) {
        var span = times[i];
        var duration = span.end - span.start;
        out += rpad(span['name'], ' ', longest) + ' ' + duration + 'ms\n';
      }
      return out;
    }
  };
  return StatTimer;
})();

PDFJS.createBlob = function createBlob(data, contentType) {
  if (typeof Blob !== 'undefined') {
    return new Blob([data], { type: contentType });
  }
  // Blob builder is deprecated in FF14 and removed in FF18.
  var bb = new MozBlobBuilder();
  bb.append(data);
  return bb.getBlob(contentType);
};

PDFJS.createObjectURL = (function createObjectURLClosure() {
  // Blob/createObjectURL is not available, falling back to data schema.
  var digits =
    'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789+/=';

  return function createObjectURL(data, contentType) {
    if (!PDFJS.disableCreateObjectURL &&
        typeof URL !== 'undefined' && URL.createObjectURL) {
      var blob = PDFJS.createBlob(data, contentType);
      return URL.createObjectURL(blob);
    }

    var buffer = 'data:' + contentType + ';base64,';
    for (var i = 0, ii = data.length; i < ii; i += 3) {
      var b1 = data[i] & 0xFF;
      var b2 = data[i + 1] & 0xFF;
      var b3 = data[i + 2] & 0xFF;
      var d1 = b1 >> 2, d2 = ((b1 & 3) << 4) | (b2 >> 4);
      var d3 = i + 1 < ii ? ((b2 & 0xF) << 2) | (b3 >> 6) : 64;
      var d4 = i + 2 < ii ? (b3 & 0x3F) : 64;
      buffer += digits[d1] + digits[d2] + digits[d3] + digits[d4];
    }
    return buffer;
  };
})();

function MessageHandler(name, comObj) {
  this.name = name;
  this.comObj = comObj;
  this.callbackIndex = 1;
  this.postMessageTransfers = true;
  var callbacksCapabilities = this.callbacksCapabilities = {};
  var ah = this.actionHandler = {};

  ah['console_log'] = [function ahConsoleLog(data) {
    console.log.apply(console, data);
  }];
  ah['console_error'] = [function ahConsoleError(data) {
    console.error.apply(console, data);
  }];
  ah['_unsupported_feature'] = [function ah_unsupportedFeature(data) {
    UnsupportedManager.notify(data);
  }];

  comObj.onmessage = function messageHandlerComObjOnMessage(event) {
    var data = event.data;
    if (data.isReply) {
      var callbackId = data.callbackId;
      if (data.callbackId in callbacksCapabilities) {
        var callback = callbacksCapabilities[callbackId];
        delete callbacksCapabilities[callbackId];
        if ('error' in data) {
          callback.reject(data.error);
        } else {
          callback.resolve(data.data);
        }
      } else {
        error('Cannot resolve callback ' + callbackId);
      }
    } else if (data.action in ah) {
      var action = ah[data.action];
      if (data.callbackId) {
        Promise.resolve().then(function () {
          return action[0].call(action[1], data.data);
        }).then(function (result) {
          comObj.postMessage({
            isReply: true,
            callbackId: data.callbackId,
            data: result
          });
        }, function (reason) {
          comObj.postMessage({
            isReply: true,
            callbackId: data.callbackId,
            error: reason
          });
        });
      } else {
        action[0].call(action[1], data.data);
      }
    } else {
      error('Unknown action from worker: ' + data.action);
    }
  };
}

MessageHandler.prototype = {
  on: function messageHandlerOn(actionName, handler, scope) {
    var ah = this.actionHandler;
    if (ah[actionName]) {
      error('There is already an actionName called "' + actionName + '"');
    }
    ah[actionName] = [handler, scope];
  },
  /**
   * Sends a message to the comObj to invoke the action with the supplied data.
   * @param {String} actionName Action to call.
   * @param {JSON} data JSON data to send.
   * @param {Array} [transfers] Optional list of transfers/ArrayBuffers
   */
  send: function messageHandlerSend(actionName, data, transfers) {
    var message = {
      action: actionName,
      data: data
    };
    this.postMessage(message, transfers);
  },
  /**
   * Sends a message to the comObj to invoke the action with the supplied data.
   * Expects that other side will callback with the response.
   * @param {String} actionName Action to call.
   * @param {JSON} data JSON data to send.
   * @param {Array} [transfers] Optional list of transfers/ArrayBuffers.
   * @returns {Promise} Promise to be resolved with response data.
   */
  sendWithPromise:
    function messageHandlerSendWithPromise(actionName, data, transfers) {
    var callbackId = this.callbackIndex++;
    var message = {
      action: actionName,
      data: data,
      callbackId: callbackId
    };
    var capability = createPromiseCapability();
    this.callbacksCapabilities[callbackId] = capability;
    try {
      this.postMessage(message, transfers);
    } catch (e) {
      capability.reject(e);
    }
    return capability.promise;
  },
  /**
   * Sends raw message to the comObj.
   * @private
   * @param message {Object} Raw message.
   * @param transfers List of transfers/ArrayBuffers, or undefined.
   */
  postMessage: function (message, transfers) {
    if (transfers && this.postMessageTransfers) {
      this.comObj.postMessage(message, transfers);
    } else {
      this.comObj.postMessage(message);
    }
  }
};

function loadJpegStream(id, imageUrl, objs) {
  var img = new Image();
  img.onload = (function loadJpegStream_onloadClosure() {
    objs.resolve(id, img);
  });
  img.onerror = (function loadJpegStream_onerrorClosure() {
    objs.resolve(id, null);
    warn('Error during JPEG image loading');
  });
  img.src = imageUrl;
}


/**
 * The maximum allowed image size in total pixels e.g. width * height. Images
 * above this value will not be drawn. Use -1 for no limit.
 * @var {number}
 */
PDFJS.maxImageSize = (PDFJS.maxImageSize === undefined ?
                      -1 : PDFJS.maxImageSize);

/**
 * The url of where the predefined Adobe CMaps are located. Include trailing
 * slash.
 * @var {string}
 */
PDFJS.cMapUrl = (PDFJS.cMapUrl === undefined ? null : PDFJS.cMapUrl);

/**
 * Specifies if CMaps are binary packed.
 * @var {boolean}
 */
PDFJS.cMapPacked = PDFJS.cMapPacked === undefined ? false : PDFJS.cMapPacked;

/**
 * By default fonts are converted to OpenType fonts and loaded via font face
 * rules. If disabled, the font will be rendered using a built in font renderer
 * that constructs the glyphs with primitive path commands.
 * @var {boolean}
 */
PDFJS.disableFontFace = (PDFJS.disableFontFace === undefined ?
                         false : PDFJS.disableFontFace);

/**
 * Path for image resources, mainly for annotation icons. Include trailing
 * slash.
 * @var {string}
 */
PDFJS.imageResourcesPath = (PDFJS.imageResourcesPath === undefined ?
                            '' : PDFJS.imageResourcesPath);

/**
 * Disable the web worker and run all code on the main thread. This will happen
 * automatically if the browser doesn't support workers or sending typed arrays
 * to workers.
 * @var {boolean}
 */
PDFJS.disableWorker = (PDFJS.disableWorker === undefined ?
                       false : PDFJS.disableWorker);

/**
 * Path and filename of the worker file. Required when the worker is enabled in
 * development mode. If unspecified in the production build, the worker will be
 * loaded based on the location of the pdf.js file.
 * @var {string}
 */
PDFJS.workerSrc = (PDFJS.workerSrc === undefined ? null : PDFJS.workerSrc);

/**
 * Disable range request loading of PDF files. When enabled and if the server
 * supports partial content requests then the PDF will be fetched in chunks.
 * Enabled (false) by default.
 * @var {boolean}
 */
PDFJS.disableRange = (PDFJS.disableRange === undefined ?
                      false : PDFJS.disableRange);

/**
 * Disable streaming of PDF file data. By default PDF.js attempts to load PDF
 * in chunks. This default behavior can be disabled.
 * @var {boolean}
 */
PDFJS.disableStream = (PDFJS.disableStream === undefined ?
                       false : PDFJS.disableStream);

/**
 * Disable pre-fetching of PDF file data. When range requests are enabled PDF.js
 * will automatically keep fetching more data even if it isn't needed to display
 * the current page. This default behavior can be disabled.
 *
 * NOTE: It is also necessary to disable streaming, see above,
 *       in order for disabling of pre-fetching to work correctly.
 * @var {boolean}
 */
PDFJS.disableAutoFetch = (PDFJS.disableAutoFetch === undefined ?
                          false : PDFJS.disableAutoFetch);

/**
 * Enables special hooks for debugging PDF.js.
 * @var {boolean}
 */
PDFJS.pdfBug = (PDFJS.pdfBug === undefined ? false : PDFJS.pdfBug);

/**
 * Enables transfer usage in postMessage for ArrayBuffers.
 * @var {boolean}
 */
PDFJS.postMessageTransfers = (PDFJS.postMessageTransfers === undefined ?
                              true : PDFJS.postMessageTransfers);

/**
 * Disables URL.createObjectURL usage.
 * @var {boolean}
 */
PDFJS.disableCreateObjectURL = (PDFJS.disableCreateObjectURL === undefined ?
                                false : PDFJS.disableCreateObjectURL);

/**
 * Disables WebGL usage.
 * @var {boolean}
 */
PDFJS.disableWebGL = (PDFJS.disableWebGL === undefined ?
                      true : PDFJS.disableWebGL);

/**
 * Disables fullscreen support, and by extension Presentation Mode,
 * in browsers which support the fullscreen API.
 * @var {boolean}
 */
PDFJS.disableFullscreen = (PDFJS.disableFullscreen === undefined ?
                           false : PDFJS.disableFullscreen);

/**
 * Enables CSS only zooming.
 * @var {boolean}
 */
PDFJS.useOnlyCssZoom = (PDFJS.useOnlyCssZoom === undefined ?
                        false : PDFJS.useOnlyCssZoom);

/**
 * Controls the logging level.
 * The constants from PDFJS.VERBOSITY_LEVELS should be used:
 * - errors
 * - warnings [default]
 * - infos
 * @var {number}
 */
PDFJS.verbosity = (PDFJS.verbosity === undefined ?
                   PDFJS.VERBOSITY_LEVELS.warnings : PDFJS.verbosity);

/**
 * The maximum supported canvas size in total pixels e.g. width * height.
 * The default value is 4096 * 4096. Use -1 for no limit.
 * @var {number}
 */
PDFJS.maxCanvasPixels = (PDFJS.maxCanvasPixels === undefined ?
                         16777216 : PDFJS.maxCanvasPixels);

/**
 * Opens external links in a new window if enabled. The default behavior opens
 * external links in the PDF.js window.
 * @var {boolean}
 */
PDFJS.openExternalLinksInNewWindow = (
  PDFJS.openExternalLinksInNewWindow === undefined ?
    false : PDFJS.openExternalLinksInNewWindow);

/**
 * Document initialization / loading parameters object.
 *
 * @typedef {Object} DocumentInitParameters
 * @property {string}     url   - The URL of the PDF.
 * @property {TypedArray|Array|string} data - Binary PDF data. Use typed arrays
 *   (Uint8Array) to improve the memory usage. If PDF data is BASE64-encoded,
 *   use atob() to convert it to a binary string first.
 * @property {Object}     httpHeaders - Basic authentication headers.
 * @property {boolean}    withCredentials - Indicates whether or not cross-site
 *   Access-Control requests should be made using credentials such as cookies
 *   or authorization headers. The default is false.
 * @property {string}     password - For decrypting password-protected PDFs.
 * @property {TypedArray} initialData - A typed array with the first portion or
 *   all of the pdf data. Used by the extension since some data is already
 *   loaded before the switch to range requests.
 * @property {number}     length - The PDF file length. It's used for progress
 *   reports and range requests operations.
 * @property {PDFDataRangeTransport} range
 */

/**
 * @typedef {Object} PDFDocumentStats
 * @property {Array} streamTypes - Used stream types in the document (an item
 *   is set to true if specific stream ID was used in the document).
 * @property {Array} fontTypes - Used font type in the document (an item is set
 *   to true if specific font ID was used in the document).
 */

/**
 * This is the main entry point for loading a PDF and interacting with it.
 * NOTE: If a URL is used to fetch the PDF data a standard XMLHttpRequest(XHR)
 * is used, which means it must follow the same origin rules that any XHR does
 * e.g. No cross domain requests without CORS.
 *
 * @param {string|TypedArray|DocumentInitParameters|PDFDataRangeTransport} src
 * Can be a url to where a PDF is located, a typed array (Uint8Array)
 * already populated with data or parameter object.
 *
 * @param {PDFDataRangeTransport} pdfDataRangeTransport (deprecated) It is used
 * if you want to manually serve range requests for data in the PDF.
 *
 * @param {function} passwordCallback (deprecated) It is used to request a
 * password if wrong or no password was provided. The callback receives two
 * parameters: function that needs to be called with new password and reason
 * (see {PasswordResponses}).
 *
 * @param {function} progressCallback (deprecated) It is used to be able to
 * monitor the loading progress of the PDF file (necessary to implement e.g.
 * a loading bar). The callback receives an {Object} with the properties:
 * {number} loaded and {number} total.
 *
 * @return {PDFDocumentLoadingTask}
 */
PDFJS.getDocument = function getDocument(src,
                                         pdfDataRangeTransport,
                                         passwordCallback,
                                         progressCallback) {
  var task = new PDFDocumentLoadingTask();

  // Support of the obsolete arguments (for compatibility with API v1.0)
  if (pdfDataRangeTransport) {
    if (!(pdfDataRangeTransport instanceof PDFDataRangeTransport)) {
      // Not a PDFDataRangeTransport instance, trying to add missing properties.
      pdfDataRangeTransport = Object.create(pdfDataRangeTransport);
      pdfDataRangeTransport.length = src.length;
      pdfDataRangeTransport.initialData = src.initialData;
    }
    src = Object.create(src);
    src.range = pdfDataRangeTransport;
  }
  task.onPassword = passwordCallback || null;
  task.onProgress = progressCallback || null;

  var workerInitializedCapability, transport;
  var source;
  if (typeof src === 'string') {
    source = { url: src };
  } else if (isArrayBuffer(src)) {
    source = { data: src };
  } else if (src instanceof PDFDataRangeTransport) {
    source = { range: src };
  } else {
    if (typeof src !== 'object') {
      error('Invalid parameter in getDocument, need either Uint8Array, ' +
        'string or a parameter object');
    }
    if (!src.url && !src.data && !src.range) {
      error('Invalid parameter object: need either .data, .range or .url');
    }

    source = src;
  }

  var params = {};
  for (var key in source) {
    if (key === 'url' && typeof window !== 'undefined') {
      // The full path is required in the 'url' field.
      params[key] = combineUrl(window.location.href, source[key]);
      continue;
    } else if (key === 'range') {
      continue;
    } else if (key === 'data' && !(source[key] instanceof Uint8Array)) {
      // Converting string or array-like data to Uint8Array.
      var pdfBytes = source[key];
      if (typeof pdfBytes === 'string') {
        params[key] = stringToBytes(pdfBytes);
      } else if (typeof pdfBytes === 'object' && pdfBytes !== null &&
                 !isNaN(pdfBytes.length)) {
        params[key] = new Uint8Array(pdfBytes);
      } else {
        error('Invalid PDF binary data: either typed array, string or ' +
              'array-like object is expected in the data property.');
      }
      continue;
    }
    params[key] = source[key];
  }

  workerInitializedCapability = createPromiseCapability();
  transport = new WorkerTransport(workerInitializedCapability, source.range);
  workerInitializedCapability.promise.then(function transportInitialized() {
    transport.fetchDocument(task, params);
  });

  return task;
};

/**
 * PDF document loading operation.
 * @class
 */
var PDFDocumentLoadingTask = (function PDFDocumentLoadingTaskClosure() {
  /** @constructs PDFDocumentLoadingTask */
  function PDFDocumentLoadingTask() {
    this._capability = createPromiseCapability();

    /**
     * Callback to request a password if wrong or no password was provided.
     * The callback receives two parameters: function that needs to be called
     * with new password and reason (see {PasswordResponses}).
     */
    this.onPassword = null;

    /**
     * Callback to be able to monitor the loading progress of the PDF file
     * (necessary to implement e.g. a loading bar). The callback receives
     * an {Object} with the properties: {number} loaded and {number} total.
     */
    this.onProgress = null;
  }

  PDFDocumentLoadingTask.prototype =
      /** @lends PDFDocumentLoadingTask.prototype */ {
    /**
     * @return {Promise}
     */
    get promise() {
      return this._capability.promise;
    },

    // TODO add cancel or abort method

    /**
     * Registers callbacks to indicate the document loading completion.
     *
     * @param {function} onFulfilled The callback for the loading completion.
     * @param {function} onRejected The callback for the loading failure.
     * @return {Promise} A promise that is resolved after the onFulfilled or
     *                   onRejected callback.
     */
    then: function PDFDocumentLoadingTask_then(onFulfilled, onRejected) {
      return this.promise.then.apply(this.promise, arguments);
    }
  };

  return PDFDocumentLoadingTask;
})();

/**
 * Abstract class to support range requests file loading.
 * @class
 */
var PDFDataRangeTransport = (function pdfDataRangeTransportClosure() {
  /**
   * @constructs PDFDataRangeTransport
   * @param {number} length
   * @param {Uint8Array} initialData
   */
  function PDFDataRangeTransport(length, initialData) {
    this.length = length;
    this.initialData = initialData;

    this._rangeListeners = [];
    this._progressListeners = [];
    this._progressiveReadListeners = [];
    this._readyCapability = createPromiseCapability();
  }
  PDFDataRangeTransport.prototype =
      /** @lends PDFDataRangeTransport.prototype */ {
    addRangeListener:
        function PDFDataRangeTransport_addRangeListener(listener) {
      this._rangeListeners.push(listener);
    },

    addProgressListener:
        function PDFDataRangeTransport_addProgressListener(listener) {
      this._progressListeners.push(listener);
    },

    addProgressiveReadListener:
        function PDFDataRangeTransport_addProgressiveReadListener(listener) {
      this._progressiveReadListeners.push(listener);
    },

    onDataRange: function PDFDataRangeTransport_onDataRange(begin, chunk) {
      var listeners = this._rangeListeners;
      for (var i = 0, n = listeners.length; i < n; ++i) {
        listeners[i](begin, chunk);
      }
    },

    onDataProgress: function PDFDataRangeTransport_onDataProgress(loaded) {
      this._readyCapability.promise.then(function () {
        var listeners = this._progressListeners;
        for (var i = 0, n = listeners.length; i < n; ++i) {
          listeners[i](loaded);
        }
      }.bind(this));
    },

    onDataProgressiveRead:
        function PDFDataRangeTransport_onDataProgress(chunk) {
      this._readyCapability.promise.then(function () {
        var listeners = this._progressiveReadListeners;
        for (var i = 0, n = listeners.length; i < n; ++i) {
          listeners[i](chunk);
        }
      }.bind(this));
    },

    transportReady: function PDFDataRangeTransport_transportReady() {
      this._readyCapability.resolve();
    },

    requestDataRange:
        function PDFDataRangeTransport_requestDataRange(begin, end) {
      throw new Error('Abstract method PDFDataRangeTransport.requestDataRange');
    }
  };
  return PDFDataRangeTransport;
})();

PDFJS.PDFDataRangeTransport = PDFDataRangeTransport;

/**
 * Proxy to a PDFDocument in the worker thread. Also, contains commonly used
 * properties that can be read synchronously.
 * @class
 */
var PDFDocumentProxy = (function PDFDocumentProxyClosure() {
  function PDFDocumentProxy(pdfInfo, transport) {
    this.pdfInfo = pdfInfo;
    this.transport = transport;
  }
  PDFDocumentProxy.prototype = /** @lends PDFDocumentProxy.prototype */ {
    /**
     * @return {number} Total number of pages the PDF contains.
     */
    get numPages() {
      return this.pdfInfo.numPages;
    },
    /**
     * @return {string} A unique ID to identify a PDF. Not guaranteed to be
     * unique.
     */
    get fingerprint() {
      return this.pdfInfo.fingerprint;
    },
    /**
     * @param {number} pageNumber The page number to get. The first page is 1.
     * @return {Promise} A promise that is resolved with a {@link PDFPageProxy}
     * object.
     */
    getPage: function PDFDocumentProxy_getPage(pageNumber) {
      return this.transport.getPage(pageNumber);
    },
    /**
     * @param {{num: number, gen: number}} ref The page reference. Must have
     *   the 'num' and 'gen' properties.
     * @return {Promise} A promise that is resolved with the page index that is
     * associated with the reference.
     */
    getPageIndex: function PDFDocumentProxy_getPageIndex(ref) {
      return this.transport.getPageIndex(ref);
    },
    /**
     * @return {Promise} A promise that is resolved with a lookup table for
     * mapping named destinations to reference numbers.
     *
     * This can be slow for large documents: use getDestination instead
     */
    getDestinations: function PDFDocumentProxy_getDestinations() {
      return this.transport.getDestinations();
    },
    /**
     * @param {string} id The named destination to get.
     * @return {Promise} A promise that is resolved with all information
     * of the given named destination.
     */
    getDestination: function PDFDocumentProxy_getDestination(id) {
      return this.transport.getDestination(id);
    },
    /**
     * @return {Promise} A promise that is resolved with a lookup table for
     * mapping named attachments to their content.
     */
    getAttachments: function PDFDocumentProxy_getAttachments() {
      return this.transport.getAttachments();
    },
    /**
     * @return {Promise} A promise that is resolved with an array of all the
     * JavaScript strings in the name tree.
     */
    getJavaScript: function PDFDocumentProxy_getJavaScript() {
      return this.transport.getJavaScript();
    },
    /**
     * @return {Promise} A promise that is resolved with an {Array} that is a
     * tree outline (if it has one) of the PDF. The tree is in the format of:
     * [
     *  {
     *   title: string,
     *   bold: boolean,
     *   italic: boolean,
     *   color: rgb array,
     *   dest: dest obj,
     *   items: array of more items like this
     *  },
     *  ...
     * ].
     */
    getOutline: function PDFDocumentProxy_getOutline() {
      return this.transport.getOutline();
    },
    /**
     * @return {Promise} A promise that is resolved with an {Object} that has
     * info and metadata properties.  Info is an {Object} filled with anything
     * available in the information dictionary and similarly metadata is a
     * {Metadata} object with information from the metadata section of the PDF.
     */
    getMetadata: function PDFDocumentProxy_getMetadata() {
      return this.transport.getMetadata();
    },
    /**
     * @return {Promise} A promise that is resolved with a TypedArray that has
     * the raw data from the PDF.
     */
    getData: function PDFDocumentProxy_getData() {
      return this.transport.getData();
    },
    /**
     * @return {Promise} A promise that is resolved when the document's data
     * is loaded. It is resolved with an {Object} that contains the length
     * property that indicates size of the PDF data in bytes.
     */
    getDownloadInfo: function PDFDocumentProxy_getDownloadInfo() {
      return this.transport.downloadInfoCapability.promise;
    },
    /**
     * @return {Promise} A promise this is resolved with current stats about
     * document structures (see {@link PDFDocumentStats}).
     */
    getStats: function PDFDocumentProxy_getStats() {
      return this.transport.getStats();
    },
    /**
     * Cleans up resources allocated by the document, e.g. created @font-face.
     */
    cleanup: function PDFDocumentProxy_cleanup() {
      this.transport.startCleanup();
    },
    /**
     * Destroys current document instance and terminates worker.
     */
    destroy: function PDFDocumentProxy_destroy() {
      this.transport.destroy();
    }
  };
  return PDFDocumentProxy;
})();

/**
 * Page text content.
 *
 * @typedef {Object} TextContent
 * @property {array} items - array of {@link TextItem}
 * @property {Object} styles - {@link TextStyles} objects, indexed by font
 *                    name.
 */

/**
 * Page text content part.
 *
 * @typedef {Object} TextItem
 * @property {string} str - text content.
 * @property {string} dir - text direction: 'ttb', 'ltr' or 'rtl'.
 * @property {array} transform - transformation matrix.
 * @property {number} width - width in device space.
 * @property {number} height - height in device space.
 * @property {string} fontName - font name used by pdf.js for converted font.
 */

/**
 * Text style.
 *
 * @typedef {Object} TextStyle
 * @property {number} ascent - font ascent.
 * @property {number} descent - font descent.
 * @property {boolean} vertical - text is in vertical mode.
 * @property {string} fontFamily - possible font family
 */

/**
 * Page render parameters.
 *
 * @typedef {Object} RenderParameters
 * @property {Object} canvasContext - A 2D context of a DOM Canvas object.
 * @property {PDFJS.PageViewport} viewport - Rendering viewport obtained by
 *                                calling of PDFPage.getViewport method.
 * @property {string} intent - Rendering intent, can be 'display' or 'print'
 *                    (default value is 'display').
 * @property {Object} imageLayer - (optional) An object that has beginLayout,
 *                    endLayout and appendImage functions.
 * @property {function} continueCallback - (deprecated) A function that will be
 *                      called each time the rendering is paused.  To continue
 *                      rendering call the function that is the first argument
 *                      to the callback.
 */

/**
 * PDF page operator list.
 *
 * @typedef {Object} PDFOperatorList
 * @property {Array} fnArray - Array containing the operator functions.
 * @property {Array} argsArray - Array containing the arguments of the
 *                               functions.
 */

/**
 * Proxy to a PDFPage in the worker thread.
 * @class
 */
var PDFPageProxy = (function PDFPageProxyClosure() {
  function PDFPageProxy(pageIndex, pageInfo, transport) {
    this.pageIndex = pageIndex;
    this.pageInfo = pageInfo;
    this.transport = transport;
    this.stats = new StatTimer();
    this.stats.enabled = !!globalScope.PDFJS.enableStats;
    this.commonObjs = transport.commonObjs;
    this.objs = new PDFObjects();
    this.cleanupAfterRender = false;
    this.pendingDestroy = false;
    this.intentStates = {};
  }
  PDFPageProxy.prototype = /** @lends PDFPageProxy.prototype */ {
    /**
     * @return {number} Page number of the page. First page is 1.
     */
    get pageNumber() {
      return this.pageIndex + 1;
    },
    /**
     * @return {number} The number of degrees the page is rotated clockwise.
     */
    get rotate() {
      return this.pageInfo.rotate;
    },
    /**
     * @return {Object} The reference that points to this page. It has 'num' and
     * 'gen' properties.
     */
    get ref() {
      return this.pageInfo.ref;
    },
    /**
     * @return {Array} An array of the visible portion of the PDF page in the
     * user space units - [x1, y1, x2, y2].
     */
    get view() {
      return this.pageInfo.view;
    },
    /**
     * @param {number} scale The desired scale of the viewport.
     * @param {number} rotate Degrees to rotate the viewport. If omitted this
     * defaults to the page rotation.
     * @return {PDFJS.PageViewport} Contains 'width' and 'height' properties
     * along with transforms required for rendering.
     */
    getViewport: function PDFPageProxy_getViewport(scale, rotate) {
      if (arguments.length < 2) {
        rotate = this.rotate;
      }
      return new PDFJS.PageViewport(this.view, scale, rotate, 0, 0);
    },
    /**
     * @return {Promise} A promise that is resolved with an {Array} of the
     * annotation objects.
     */
    getAnnotations: function PDFPageProxy_getAnnotations() {
      if (this.annotationsPromise) {
        return this.annotationsPromise;
      }

      var promise = this.transport.getAnnotations(this.pageIndex);
      this.annotationsPromise = promise;
      return promise;
    },
    /**
     * Begins the process of rendering a page to the desired context.
     * @param {RenderParameters} params Page render parameters.
     * @return {RenderTask} An object that contains the promise, which
     *                      is resolved when the page finishes rendering.
     */
    render: function PDFPageProxy_render(params) {
      var stats = this.stats;
      stats.time('Overall');

      // If there was a pending destroy cancel it so no cleanup happens during
      // this call to render.
      this.pendingDestroy = false;

      var renderingIntent = (params.intent === 'print' ? 'print' : 'display');

      if (!this.intentStates[renderingIntent]) {
        this.intentStates[renderingIntent] = {};
      }
      var intentState = this.intentStates[renderingIntent];

      // If there's no displayReadyCapability yet, then the operatorList
      // was never requested before. Make the request and create the promise.
      if (!intentState.displayReadyCapability) {
        intentState.receivingOperatorList = true;
        intentState.displayReadyCapability = createPromiseCapability();
        intentState.operatorList = {
          fnArray: [],
          argsArray: [],
          lastChunk: false
        };

        this.stats.time('Page Request');
        this.transport.messageHandler.send('RenderPageRequest', {
          pageIndex: this.pageNumber - 1,
          intent: renderingIntent
        });
      }

      var internalRenderTask = new InternalRenderTask(complete, params,
                                                      this.objs,
                                                      this.commonObjs,
                                                      intentState.operatorList,
                                                      this.pageNumber);
      if (!intentState.renderTasks) {
        intentState.renderTasks = [];
      }
      intentState.renderTasks.push(internalRenderTask);
      var renderTask = internalRenderTask.task;

      // Obsolete parameter support
      if (params.continueCallback) {
        renderTask.onContinue = params.continueCallback;
      }

      var self = this;
      intentState.displayReadyCapability.promise.then(
        function pageDisplayReadyPromise(transparency) {
          if (self.pendingDestroy) {
            complete();
            return;
          }
          stats.time('Rendering');
          internalRenderTask.initalizeGraphics(transparency);
          internalRenderTask.operatorListChanged();
        },
        function pageDisplayReadPromiseError(reason) {
          complete(reason);
        }
      );

      function complete(error) {
        var i = intentState.renderTasks.indexOf(internalRenderTask);
        if (i >= 0) {
          intentState.renderTasks.splice(i, 1);
        }

        if (self.cleanupAfterRender) {
          self.pendingDestroy = true;
        }
        self._tryDestroy();

        if (error) {
          internalRenderTask.capability.reject(error);
        } else {
          internalRenderTask.capability.resolve();
        }
        stats.timeEnd('Rendering');
        stats.timeEnd('Overall');
      }

      return renderTask;
    },

    /**
     * @return {Promise} A promise resolved with an {@link PDFOperatorList}
     * object that represents page's operator list.
     */
    getOperatorList: function PDFPageProxy_getOperatorList() {
      function operatorListChanged() {
        if (intentState.operatorList.lastChunk) {
          intentState.opListReadCapability.resolve(intentState.operatorList);
        }
      }

      var renderingIntent = 'oplist';
      if (!this.intentStates[renderingIntent]) {
        this.intentStates[renderingIntent] = {};
      }
      var intentState = this.intentStates[renderingIntent];

      if (!intentState.opListReadCapability) {
        var opListTask = {};
        opListTask.operatorListChanged = operatorListChanged;
        intentState.receivingOperatorList = true;
        intentState.opListReadCapability = createPromiseCapability();
        intentState.renderTasks = [];
        intentState.renderTasks.push(opListTask);
        intentState.operatorList = {
          fnArray: [],
          argsArray: [],
          lastChunk: false
        };

        this.transport.messageHandler.send('RenderPageRequest', {
          pageIndex: this.pageIndex,
          intent: renderingIntent
        });
      }
      return intentState.opListReadCapability.promise;
    },

    /**
     * @return {Promise} That is resolved a {@link TextContent}
     * object that represent the page text content.
     */
    getTextContent: function PDFPageProxy_getTextContent() {
      return this.transport.messageHandler.sendWithPromise('GetTextContent', {
        pageIndex: this.pageNumber - 1
      });
    },
    /**
     * Destroys resources allocated by the page.
     */
    destroy: function PDFPageProxy_destroy() {
      this.pendingDestroy = true;
      this._tryDestroy();
    },
    /**
     * For internal use only. Attempts to clean up if rendering is in a state
     * where that's possible.
     * @ignore
     */
    _tryDestroy: function PDFPageProxy__destroy() {
      if (!this.pendingDestroy ||
          Object.keys(this.intentStates).some(function(intent) {
            var intentState = this.intentStates[intent];
            return (intentState.renderTasks.length !== 0 ||
                    intentState.receivingOperatorList);
          }, this)) {
        return;
      }

      Object.keys(this.intentStates).forEach(function(intent) {
        delete this.intentStates[intent];
      }, this);
      this.objs.clear();
      this.annotationsPromise = null;
      this.pendingDestroy = false;
    },
    /**
     * For internal use only.
     * @ignore
     */
    _startRenderPage: function PDFPageProxy_startRenderPage(transparency,
                                                            intent) {
      var intentState = this.intentStates[intent];
      // TODO Refactor RenderPageRequest to separate rendering
      // and operator list logic
      if (intentState.displayReadyCapability) {
        intentState.displayReadyCapability.resolve(transparency);
      }
    },
    /**
     * For internal use only.
     * @ignore
     */
    _renderPageChunk: function PDFPageProxy_renderPageChunk(operatorListChunk,
                                                            intent) {
      var intentState = this.intentStates[intent];
      var i, ii;
      // Add the new chunk to the current operator list.
      for (i = 0, ii = operatorListChunk.length; i < ii; i++) {
        intentState.operatorList.fnArray.push(operatorListChunk.fnArray[i]);
        intentState.operatorList.argsArray.push(
          operatorListChunk.argsArray[i]);
      }
      intentState.operatorList.lastChunk = operatorListChunk.lastChunk;

      // Notify all the rendering tasks there are more operators to be consumed.
      for (i = 0; i < intentState.renderTasks.length; i++) {
        intentState.renderTasks[i].operatorListChanged();
      }

      if (operatorListChunk.lastChunk) {
        intentState.receivingOperatorList = false;
        this._tryDestroy();
      }
    }
  };
  return PDFPageProxy;
})();

/**
 * For internal use only.
 * @ignore
 */
var WorkerTransport = (function WorkerTransportClosure() {
  function WorkerTransport(workerInitializedCapability, pdfDataRangeTransport) {
    this.pdfDataRangeTransport = pdfDataRangeTransport;
    this.workerInitializedCapability = workerInitializedCapability;
    this.commonObjs = new PDFObjects();

    this.loadingTask = null;

    this.pageCache = [];
    this.pagePromises = [];
    this.downloadInfoCapability = createPromiseCapability();

    // If worker support isn't disabled explicit and the browser has worker
    // support, create a new web worker and test if it/the browser fullfills
    // all requirements to run parts of pdf.js in a web worker.
    // Right now, the requirement is, that an Uint8Array is still an Uint8Array
    // as it arrives on the worker. Chrome added this with version 15.
    if (!globalScope.PDFJS.disableWorker && typeof Worker !== 'undefined') {
      var workerSrc = PDFJS.workerSrc;
      if (!workerSrc) {
        error('No PDFJS.workerSrc specified');
      }

      try {
        // Some versions of FF can't create a worker on localhost, see:
        // https://bugzilla.mozilla.org/show_bug.cgi?id=683280
        var worker = new Worker(workerSrc);
        var messageHandler = new MessageHandler('main', worker);
        this.messageHandler = messageHandler;

        messageHandler.on('test', function transportTest(data) {
          var supportTypedArray = data && data.supportTypedArray;
          if (supportTypedArray) {
            this.worker = worker;
            if (!data.supportTransfers) {
              PDFJS.postMessageTransfers = false;
            }
            this.setupMessageHandler(messageHandler);
            workerInitializedCapability.resolve();
          } else {
            this.setupFakeWorker();
          }
        }.bind(this));

        var testObj = new Uint8Array([PDFJS.postMessageTransfers ? 255 : 0]);
        // Some versions of Opera throw a DATA_CLONE_ERR on serializing the
        // typed array. Also, checking if we can use transfers.
        try {
          messageHandler.send('test', testObj, [testObj.buffer]);
        } catch (ex) {
          info('Cannot use postMessage transfers');
          testObj[0] = 0;
          messageHandler.send('test', testObj);
        }
        return;
      } catch (e) {
        info('The worker has been disabled.');
      }
    }
    // Either workers are disabled, not supported or have thrown an exception.
    // Thus, we fallback to a faked worker.
    this.setupFakeWorker();
  }
  WorkerTransport.prototype = {
    destroy: function WorkerTransport_destroy() {
      this.pageCache = [];
      this.pagePromises = [];
      var self = this;
      this.messageHandler.sendWithPromise('Terminate', null).then(function () {
        FontLoader.clear();
        if (self.worker) {
          self.worker.terminate();
        }
      });
    },

    setupFakeWorker: function WorkerTransport_setupFakeWorker() {
      globalScope.PDFJS.disableWorker = true;

      if (!PDFJS.fakeWorkerFilesLoadedCapability) {
        PDFJS.fakeWorkerFilesLoadedCapability = createPromiseCapability();
        // In the developer build load worker_loader which in turn loads all the
        // other files and resolves the promise. In production only the
        // pdf.worker.js file is needed.
        Util.loadScript(PDFJS.workerSrc, function() {
          PDFJS.fakeWorkerFilesLoadedCapability.resolve();
        });
      }
      PDFJS.fakeWorkerFilesLoadedCapability.promise.then(function () {
        warn('Setting up fake worker.');
        // If we don't use a worker, just post/sendMessage to the main thread.
        var fakeWorker = {
          postMessage: function WorkerTransport_postMessage(obj) {
            fakeWorker.onmessage({data: obj});
          },
          terminate: function WorkerTransport_terminate() {}
        };

        var messageHandler = new MessageHandler('main', fakeWorker);
        this.setupMessageHandler(messageHandler);

        // If the main thread is our worker, setup the handling for the messages
        // the main thread sends to it self.
        PDFJS.WorkerMessageHandler.setup(messageHandler);

        this.workerInitializedCapability.resolve();
      }.bind(this));
    },

    setupMessageHandler:
      function WorkerTransport_setupMessageHandler(messageHandler) {
      this.messageHandler = messageHandler;

      function updatePassword(password) {
        messageHandler.send('UpdatePassword', password);
      }

      var pdfDataRangeTransport = this.pdfDataRangeTransport;
      if (pdfDataRangeTransport) {
        pdfDataRangeTransport.addRangeListener(function(begin, chunk) {
          messageHandler.send('OnDataRange', {
            begin: begin,
            chunk: chunk
          });
        });

        pdfDataRangeTransport.addProgressListener(function(loaded) {
          messageHandler.send('OnDataProgress', {
            loaded: loaded
          });
        });

        pdfDataRangeTransport.addProgressiveReadListener(function(chunk) {
          messageHandler.send('OnDataRange', {
            chunk: chunk
          });
        });

        messageHandler.on('RequestDataRange',
          function transportDataRange(data) {
            pdfDataRangeTransport.requestDataRange(data.begin, data.end);
          }, this);
      }

      messageHandler.on('GetDoc', function transportDoc(data) {
        var pdfInfo = data.pdfInfo;
        this.numPages = data.pdfInfo.numPages;
        var pdfDocument = new PDFDocumentProxy(pdfInfo, this);
        this.pdfDocument = pdfDocument;
        this.loadingTask._capability.resolve(pdfDocument);
      }, this);

      messageHandler.on('NeedPassword',
                        function transportNeedPassword(exception) {
        var loadingTask = this.loadingTask;
        if (loadingTask.onPassword) {
          return loadingTask.onPassword(updatePassword,
                                        PasswordResponses.NEED_PASSWORD);
        }
        loadingTask._capability.reject(
          new PasswordException(exception.message, exception.code));
      }, this);

      messageHandler.on('IncorrectPassword',
                        function transportIncorrectPassword(exception) {
        var loadingTask = this.loadingTask;
        if (loadingTask.onPassword) {
          return loadingTask.onPassword(updatePassword,
                                        PasswordResponses.INCORRECT_PASSWORD);
        }
        loadingTask._capability.reject(
          new PasswordException(exception.message, exception.code));
      }, this);

      messageHandler.on('InvalidPDF', function transportInvalidPDF(exception) {
        this.loadingTask._capability.reject(
          new InvalidPDFException(exception.message));
      }, this);

      messageHandler.on('MissingPDF', function transportMissingPDF(exception) {
        this.loadingTask._capability.reject(
          new MissingPDFException(exception.message));
      }, this);

      messageHandler.on('UnexpectedResponse',
                        function transportUnexpectedResponse(exception) {
        this.loadingTask._capability.reject(
          new UnexpectedResponseException(exception.message, exception.status));
      }, this);

      messageHandler.on('UnknownError',
                        function transportUnknownError(exception) {
        this.loadingTask._capability.reject(
          new UnknownErrorException(exception.message, exception.details));
      }, this);

      messageHandler.on('DataLoaded', function transportPage(data) {
        this.downloadInfoCapability.resolve(data);
      }, this);

      messageHandler.on('PDFManagerReady', function transportPage(data) {
        if (this.pdfDataRangeTransport) {
          this.pdfDataRangeTransport.transportReady();
        }
      }, this);

      messageHandler.on('StartRenderPage', function transportRender(data) {
        var page = this.pageCache[data.pageIndex];

        page.stats.timeEnd('Page Request');
        page._startRenderPage(data.transparency, data.intent);
      }, this);

      messageHandler.on('RenderPageChunk', function transportRender(data) {
        var page = this.pageCache[data.pageIndex];

        page._renderPageChunk(data.operatorList, data.intent);
      }, this);

      messageHandler.on('commonobj', function transportObj(data) {
        var id = data[0];
        var type = data[1];
        if (this.commonObjs.hasData(id)) {
          return;
        }

        switch (type) {
          case 'Font':
            var exportedData = data[2];

            var font;
            if ('error' in exportedData) {
              var error = exportedData.error;
              warn('Error during font loading: ' + error);
              this.commonObjs.resolve(id, error);
              break;
            } else {
              font = new FontFaceObject(exportedData);
            }

            FontLoader.bind(
              [font],
              function fontReady(fontObjs) {
                this.commonObjs.resolve(id, font);
              }.bind(this)
            );
            break;
          case 'FontPath':
            this.commonObjs.resolve(id, data[2]);
            break;
          default:
            error('Got unknown common object type ' + type);
        }
      }, this);

      messageHandler.on('obj', function transportObj(data) {
        var id = data[0];
        var pageIndex = data[1];
        var type = data[2];
        var pageProxy = this.pageCache[pageIndex];
        var imageData;
        if (pageProxy.objs.hasData(id)) {
          return;
        }

        switch (type) {
          case 'JpegStream':
            imageData = data[3];
            loadJpegStream(id, imageData, pageProxy.objs);
            break;
          case 'Image':
            imageData = data[3];
            pageProxy.objs.resolve(id, imageData);

            // heuristics that will allow not to store large data
            var MAX_IMAGE_SIZE_TO_STORE = 8000000;
            if (imageData && 'data' in imageData &&
                imageData.data.length > MAX_IMAGE_SIZE_TO_STORE) {
              pageProxy.cleanupAfterRender = true;
            }
            break;
          default:
            error('Got unknown object type ' + type);
        }
      }, this);

      messageHandler.on('DocProgress', function transportDocProgress(data) {
        var loadingTask = this.loadingTask;
        if (loadingTask.onProgress) {
          loadingTask.onProgress({
            loaded: data.loaded,
            total: data.total
          });
        }
      }, this);

      messageHandler.on('PageError', function transportError(data) {
        var page = this.pageCache[data.pageNum - 1];
        var intentState = page.intentStates[data.intent];
        if (intentState.displayReadyCapability) {
          intentState.displayReadyCapability.reject(data.error);
        } else {
          error(data.error);
        }
      }, this);

      messageHandler.on('JpegDecode', function(data) {
        var imageUrl = data[0];
        var components = data[1];
        if (components !== 3 && components !== 1) {
          return Promise.reject(
            new Error('Only 3 components or 1 component can be returned'));
        }

        return new Promise(function (resolve, reject) {
          var img = new Image();
          img.onload = function () {
            var width = img.width;
            var height = img.height;
            var size = width * height;
            var rgbaLength = size * 4;
            var buf = new Uint8Array(size * components);
            var tmpCanvas = createScratchCanvas(width, height);
            var tmpCtx = tmpCanvas.getContext('2d');
            tmpCtx.drawImage(img, 0, 0);
            var data = tmpCtx.getImageData(0, 0, width, height).data;
            var i, j;

            if (components === 3) {
              for (i = 0, j = 0; i < rgbaLength; i += 4, j += 3) {
                buf[j] = data[i];
                buf[j + 1] = data[i + 1];
                buf[j + 2] = data[i + 2];
              }
            } else if (components === 1) {
              for (i = 0, j = 0; i < rgbaLength; i += 4, j++) {
                buf[j] = data[i];
              }
            }
            resolve({ data: buf, width: width, height: height});
          };
          img.onerror = function () {
            reject(new Error('JpegDecode failed to load image'));
          };
          img.src = imageUrl;
        });
      });
    },

    fetchDocument: function WorkerTransport_fetchDocument(loadingTask, source) {
      this.loadingTask = loadingTask;

      source.disableAutoFetch = PDFJS.disableAutoFetch;
      source.disableStream = PDFJS.disableStream;
      source.chunkedViewerLoading = !!this.pdfDataRangeTransport;
      if (this.pdfDataRangeTransport) {
        source.length = this.pdfDataRangeTransport.length;
        source.initialData = this.pdfDataRangeTransport.initialData;
      }
      this.messageHandler.send('GetDocRequest', {
        source: source,
        disableRange: PDFJS.disableRange,
        maxImageSize: PDFJS.maxImageSize,
        cMapUrl: PDFJS.cMapUrl,
        cMapPacked: PDFJS.cMapPacked,
        disableFontFace: PDFJS.disableFontFace,
        disableCreateObjectURL: PDFJS.disableCreateObjectURL,
        verbosity: PDFJS.verbosity
      });
    },

    getData: function WorkerTransport_getData() {
      return this.messageHandler.sendWithPromise('GetData', null);
    },

    getPage: function WorkerTransport_getPage(pageNumber, capability) {
      if (pageNumber <= 0 || pageNumber > this.numPages ||
          (pageNumber|0) !== pageNumber) {
        return Promise.reject(new Error('Invalid page request'));
      }

      var pageIndex = pageNumber - 1;
      if (pageIndex in this.pagePromises) {
        return this.pagePromises[pageIndex];
      }
      var promise = this.messageHandler.sendWithPromise('GetPage', {
        pageIndex: pageIndex
      }).then(function (pageInfo) {
        var page = new PDFPageProxy(pageIndex, pageInfo, this);
        this.pageCache[pageIndex] = page;
        return page;
      }.bind(this));
      this.pagePromises[pageIndex] = promise;
      return promise;
    },

    getPageIndex: function WorkerTransport_getPageIndexByRef(ref) {
      return this.messageHandler.sendWithPromise('GetPageIndex', { ref: ref });
    },

    getAnnotations: function WorkerTransport_getAnnotations(pageIndex) {
      return this.messageHandler.sendWithPromise('GetAnnotations',
        { pageIndex: pageIndex });
    },

    getDestinations: function WorkerTransport_getDestinations() {
      return this.messageHandler.sendWithPromise('GetDestinations', null);
    },

    getDestination: function WorkerTransport_getDestination(id) {
      return this.messageHandler.sendWithPromise('GetDestination', { id: id } );
    },

    getAttachments: function WorkerTransport_getAttachments() {
      return this.messageHandler.sendWithPromise('GetAttachments', null);
    },

    getJavaScript: function WorkerTransport_getJavaScript() {
      return this.messageHandler.sendWithPromise('GetJavaScript', null);
    },

    getOutline: function WorkerTransport_getOutline() {
      return this.messageHandler.sendWithPromise('GetOutline', null);
    },

    getMetadata: function WorkerTransport_getMetadata() {
      return this.messageHandler.sendWithPromise('GetMetadata', null).
        then(function transportMetadata(results) {
        return {
          info: results[0],
          metadata: (results[1] ? new PDFJS.Metadata(results[1]) : null)
        };
      });
    },

    getStats: function WorkerTransport_getStats() {
      return this.messageHandler.sendWithPromise('GetStats', null);
    },

    startCleanup: function WorkerTransport_startCleanup() {
      this.messageHandler.sendWithPromise('Cleanup', null).
        then(function endCleanup() {
        for (var i = 0, ii = this.pageCache.length; i < ii; i++) {
          var page = this.pageCache[i];
          if (page) {
            page.destroy();
          }
        }
        this.commonObjs.clear();
        FontLoader.clear();
      }.bind(this));
    }
  };
  return WorkerTransport;

})();

/**
 * A PDF document and page is built of many objects. E.g. there are objects
 * for fonts, images, rendering code and such. These objects might get processed
 * inside of a worker. The `PDFObjects` implements some basic functions to
 * manage these objects.
 * @ignore
 */
var PDFObjects = (function PDFObjectsClosure() {
  function PDFObjects() {
    this.objs = {};
  }

  PDFObjects.prototype = {
    /**
     * Internal function.
     * Ensures there is an object defined for `objId`.
     */
    ensureObj: function PDFObjects_ensureObj(objId) {
      if (this.objs[objId]) {
        return this.objs[objId];
      }

      var obj = {
        capability: createPromiseCapability(),
        data: null,
        resolved: false
      };
      this.objs[objId] = obj;

      return obj;
    },

    /**
     * If called *without* callback, this returns the data of `objId` but the
     * object needs to be resolved. If it isn't, this function throws.
     *
     * If called *with* a callback, the callback is called with the data of the
     * object once the object is resolved. That means, if you call this
     * function and the object is already resolved, the callback gets called
     * right away.
     */
    get: function PDFObjects_get(objId, callback) {
      // If there is a callback, then the get can be async and the object is
      // not required to be resolved right now
      if (callback) {
        this.ensureObj(objId).capability.promise.then(callback);
        return null;
      }

      // If there isn't a callback, the user expects to get the resolved data
      // directly.
      var obj = this.objs[objId];

      // If there isn't an object yet or the object isn't resolved, then the
      // data isn't ready yet!
      if (!obj || !obj.resolved) {
        error('Requesting object that isn\'t resolved yet ' + objId);
      }

      return obj.data;
    },

    /**
     * Resolves the object `objId` with optional `data`.
     */
    resolve: function PDFObjects_resolve(objId, data) {
      var obj = this.ensureObj(objId);

      obj.resolved = true;
      obj.data = data;
      obj.capability.resolve(data);
    },

    isResolved: function PDFObjects_isResolved(objId) {
      var objs = this.objs;

      if (!objs[objId]) {
        return false;
      } else {
        return objs[objId].resolved;
      }
    },

    hasData: function PDFObjects_hasData(objId) {
      return this.isResolved(objId);
    },

    /**
     * Returns the data of `objId` if object exists, null otherwise.
     */
    getData: function PDFObjects_getData(objId) {
      var objs = this.objs;
      if (!objs[objId] || !objs[objId].resolved) {
        return null;
      } else {
        return objs[objId].data;
      }
    },

    clear: function PDFObjects_clear() {
      this.objs = {};
    }
  };
  return PDFObjects;
})();

/**
 * Allows controlling of the rendering tasks.
 * @class
 */
var RenderTask = (function RenderTaskClosure() {
  function RenderTask(internalRenderTask) {
    this._internalRenderTask = internalRenderTask;

    /**
     * Callback for incremental rendering -- a function that will be called
     * each time the rendering is paused.  To continue rendering call the
     * function that is the first argument to the callback.
     * @type {function}
     */
    this.onContinue = null;
  }

  RenderTask.prototype = /** @lends RenderTask.prototype */ {
    /**
     * Promise for rendering task completion.
     * @return {Promise}
     */
    get promise() {
      return this._internalRenderTask.capability.promise;
    },

    /**
     * Cancels the rendering task. If the task is currently rendering it will
     * not be cancelled until graphics pauses with a timeout. The promise that
     * this object extends will resolved when cancelled.
     */
    cancel: function RenderTask_cancel() {
      this._internalRenderTask.cancel();
    },

    /**
     * Registers callbacks to indicate the rendering task completion.
     *
     * @param {function} onFulfilled The callback for the rendering completion.
     * @param {function} onRejected The callback for the rendering failure.
     * @return {Promise} A promise that is resolved after the onFulfilled or
     *                   onRejected callback.
     */
    then: function RenderTask_then(onFulfilled, onRejected) {
      return this.promise.then.apply(this.promise, arguments);
    }
  };

  return RenderTask;
})();

/**
 * For internal use only.
 * @ignore
 */
var InternalRenderTask = (function InternalRenderTaskClosure() {

  function InternalRenderTask(callback, params, objs, commonObjs, operatorList,
                              pageNumber) {
    this.callback = callback;
    this.params = params;
    this.objs = objs;
    this.commonObjs = commonObjs;
    this.operatorListIdx = null;
    this.operatorList = operatorList;
    this.pageNumber = pageNumber;
    this.running = false;
    this.graphicsReadyCallback = null;
    this.graphicsReady = false;
    this.cancelled = false;
    this.capability = createPromiseCapability();
    this.task = new RenderTask(this);
    // caching this-bound methods
    this._continueBound = this._continue.bind(this);
    this._scheduleNextBound = this._scheduleNext.bind(this);
    this._nextBound = this._next.bind(this);
  }

  InternalRenderTask.prototype = {

    initalizeGraphics:
        function InternalRenderTask_initalizeGraphics(transparency) {

      if (this.cancelled) {
        return;
      }
      if (PDFJS.pdfBug && 'StepperManager' in globalScope &&
          globalScope.StepperManager.enabled) {
        this.stepper = globalScope.StepperManager.create(this.pageNumber - 1);
        this.stepper.init(this.operatorList);
        this.stepper.nextBreakPoint = this.stepper.getNextBreakPoint();
      }

      var params = this.params;
      this.gfx = new CanvasGraphics(params.canvasContext, this.commonObjs,
                                    this.objs, params.imageLayer);

      this.gfx.beginDrawing(params.viewport, transparency);
      this.operatorListIdx = 0;
      this.graphicsReady = true;
      if (this.graphicsReadyCallback) {
        this.graphicsReadyCallback();
      }
    },

    cancel: function InternalRenderTask_cancel() {
      this.running = false;
      this.cancelled = true;
      this.callback('cancelled');
    },

    operatorListChanged: function InternalRenderTask_operatorListChanged() {
      if (!this.graphicsReady) {
        if (!this.graphicsReadyCallback) {
          this.graphicsReadyCallback = this._continueBound;
        }
        return;
      }

      if (this.stepper) {
        this.stepper.updateOperatorList(this.operatorList);
      }

      if (this.running) {
        return;
      }
      this._continue();
    },

    _continue: function InternalRenderTask__continue() {
      this.running = true;
      if (this.cancelled) {
        return;
      }
      if (this.task.onContinue) {
        this.task.onContinue.call(this.task, this._scheduleNextBound);
      } else {
        this._scheduleNext();
      }
    },

    _scheduleNext: function InternalRenderTask__scheduleNext() {
      window.requestAnimationFrame(this._nextBound);
    },

    _next: function InternalRenderTask__next() {
      if (this.cancelled) {
        return;
      }
      this.operatorListIdx = this.gfx.executeOperatorList(this.operatorList,
                                        this.operatorListIdx,
                                        this._continueBound,
                                        this.stepper);
      if (this.operatorListIdx === this.operatorList.argsArray.length) {
        this.running = false;
        if (this.operatorList.lastChunk) {
          this.gfx.endDrawing();
          this.callback();
        }
      }
    }

  };

  return InternalRenderTask;
})();


var Metadata = PDFJS.Metadata = (function MetadataClosure() {
  function fixMetadata(meta) {
    return meta.replace(/>\\376\\377([^<]+)/g, function(all, codes) {
      var bytes = codes.replace(/\\([0-3])([0-7])([0-7])/g,
                                function(code, d1, d2, d3) {
        return String.fromCharCode(d1 * 64 + d2 * 8 + d3 * 1);
      });
      var chars = '';
      for (var i = 0; i < bytes.length; i += 2) {
        var code = bytes.charCodeAt(i) * 256 + bytes.charCodeAt(i + 1);
        chars += code >= 32 && code < 127 && code !== 60 && code !== 62 &&
          code !== 38 && false ? String.fromCharCode(code) :
          '&#x' + (0x10000 + code).toString(16).substring(1) + ';';
      }
      return '>' + chars;
    });
  }

  function Metadata(meta) {
    if (typeof meta === 'string') {
      // Ghostscript produces invalid metadata
      meta = fixMetadata(meta);

      var parser = new DOMParser();
      meta = parser.parseFromString(meta, 'application/xml');
    } else if (!(meta instanceof Document)) {
      error('Metadata: Invalid metadata object');
    }

    this.metaDocument = meta;
    this.metadata = {};
    this.parse();
  }

  Metadata.prototype = {
    parse: function Metadata_parse() {
      var doc = this.metaDocument;
      var rdf = doc.documentElement;

      if (rdf.nodeName.toLowerCase() !== 'rdf:rdf') { // Wrapped in <xmpmeta>
        rdf = rdf.firstChild;
        while (rdf && rdf.nodeName.toLowerCase() !== 'rdf:rdf') {
          rdf = rdf.nextSibling;
        }
      }

      var nodeName = (rdf) ? rdf.nodeName.toLowerCase() : null;
      if (!rdf || nodeName !== 'rdf:rdf' || !rdf.hasChildNodes()) {
        return;
      }

      var children = rdf.childNodes, desc, entry, name, i, ii, length, iLength;
      for (i = 0, length = children.length; i < length; i++) {
        desc = children[i];
        if (desc.nodeName.toLowerCase() !== 'rdf:description') {
          continue;
        }

        for (ii = 0, iLength = desc.childNodes.length; ii < iLength; ii++) {
          if (desc.childNodes[ii].nodeName.toLowerCase() !== '#text') {
            entry = desc.childNodes[ii];
            name = entry.nodeName.toLowerCase();
            this.metadata[name] = entry.textContent.trim();
          }
        }
      }
    },

    get: function Metadata_get(name) {
      return this.metadata[name] || null;
    },

    has: function Metadata_has(name) {
      return typeof this.metadata[name] !== 'undefined';
    }
  };

  return Metadata;
})();


// <canvas> contexts store most of the state we need natively.
// However, PDF needs a bit more state, which we store here.

// Minimal font size that would be used during canvas fillText operations.
var MIN_FONT_SIZE = 16;
// Maximum font size that would be used during canvas fillText operations.
var MAX_FONT_SIZE = 100;
var MAX_GROUP_SIZE = 4096;

// Heuristic value used when enforcing minimum line widths.
var MIN_WIDTH_FACTOR = 0.65;

var COMPILE_TYPE3_GLYPHS = true;
var MAX_SIZE_TO_COMPILE = 1000;

var FULL_CHUNK_HEIGHT = 16;

function createScratchCanvas(width, height) {
  var canvas = document.createElement('canvas');
  canvas.width = width;
  canvas.height = height;
  return canvas;
}

function addContextCurrentTransform(ctx) {
  // If the context doesn't expose a `mozCurrentTransform`, add a JS based on.
  if (!ctx.mozCurrentTransform) {
    // Store the original context
    ctx._scaleX = ctx._scaleX || 1.0;
    ctx._scaleY = ctx._scaleY || 1.0;
    ctx._originalSave = ctx.save;
    ctx._originalRestore = ctx.restore;
    ctx._originalRotate = ctx.rotate;
    ctx._originalScale = ctx.scale;
    ctx._originalTranslate = ctx.translate;
    ctx._originalTransform = ctx.transform;
    ctx._originalSetTransform = ctx.setTransform;

    ctx._transformMatrix = [ctx._scaleX, 0, 0, ctx._scaleY, 0, 0];
    ctx._transformStack = [];

    Object.defineProperty(ctx, 'mozCurrentTransform', {
      get: function getCurrentTransform() {
        return this._transformMatrix;
      }
    });

    Object.defineProperty(ctx, 'mozCurrentTransformInverse', {
      get: function getCurrentTransformInverse() {
        // Calculation done using WolframAlpha:
        // http://www.wolframalpha.com/input/?
        //   i=Inverse+{{a%2C+c%2C+e}%2C+{b%2C+d%2C+f}%2C+{0%2C+0%2C+1}}

        var m = this._transformMatrix;
        var a = m[0], b = m[1], c = m[2], d = m[3], e = m[4], f = m[5];

        var ad_bc = a * d - b * c;
        var bc_ad = b * c - a * d;

        return [
          d / ad_bc,
          b / bc_ad,
          c / bc_ad,
          a / ad_bc,
          (d * e - c * f) / bc_ad,
          (b * e - a * f) / ad_bc
        ];
      }
    });

    ctx.save = function ctxSave() {
      var old = this._transformMatrix;
      this._transformStack.push(old);
      this._transformMatrix = old.slice(0, 6);

      this._originalSave();
    };

    ctx.restore = function ctxRestore() {
      var prev = this._transformStack.pop();
      if (prev) {
        this._transformMatrix = prev;
        this._originalRestore();
      }
    };

    ctx.translate = function ctxTranslate(x, y) {
      var m = this._transformMatrix;
      m[4] = m[0] * x + m[2] * y + m[4];
      m[5] = m[1] * x + m[3] * y + m[5];

      this._originalTranslate(x, y);
    };

    ctx.scale = function ctxScale(x, y) {
      var m = this._transformMatrix;
      m[0] = m[0] * x;
      m[1] = m[1] * x;
      m[2] = m[2] * y;
      m[3] = m[3] * y;

      this._originalScale(x, y);
    };

    ctx.transform = function ctxTransform(a, b, c, d, e, f) {
      var m = this._transformMatrix;
      this._transformMatrix = [
        m[0] * a + m[2] * b,
        m[1] * a + m[3] * b,
        m[0] * c + m[2] * d,
        m[1] * c + m[3] * d,
        m[0] * e + m[2] * f + m[4],
        m[1] * e + m[3] * f + m[5]
      ];

      ctx._originalTransform(a, b, c, d, e, f);
    };

    ctx.setTransform = function ctxSetTransform(a, b, c, d, e, f) {
      this._transformMatrix = [a, b, c, d, e, f];

      ctx._originalSetTransform(a, b, c, d, e, f);
    };

    ctx.rotate = function ctxRotate(angle) {
      var cosValue = Math.cos(angle);
      var sinValue = Math.sin(angle);

      var m = this._transformMatrix;
      this._transformMatrix = [
        m[0] * cosValue + m[2] * sinValue,
        m[1] * cosValue + m[3] * sinValue,
        m[0] * (-sinValue) + m[2] * cosValue,
        m[1] * (-sinValue) + m[3] * cosValue,
        m[4],
        m[5]
      ];

      this._originalRotate(angle);
    };
  }
}

var CachedCanvases = (function CachedCanvasesClosure() {
  var cache = {};
  return {
    getCanvas: function CachedCanvases_getCanvas(id, width, height,
                                                 trackTransform) {
      var canvasEntry;
      if (cache[id] !== undefined) {
        canvasEntry = cache[id];
        canvasEntry.canvas.width = width;
        canvasEntry.canvas.height = height;
        // reset canvas transform for emulated mozCurrentTransform, if needed
        canvasEntry.context.setTransform(1, 0, 0, 1, 0, 0);
      } else {
        var canvas = createScratchCanvas(width, height);
        var ctx = canvas.getContext('2d');
        if (trackTransform) {
          addContextCurrentTransform(ctx);
        }
        cache[id] = canvasEntry = {canvas: canvas, context: ctx};
      }
      return canvasEntry;
    },
    clear: function () {
      for (var id in cache) {
        var canvasEntry = cache[id];
        // Zeroing the width and height causes Firefox to release graphics
        // resources immediately, which can greatly reduce memory consumption.
        canvasEntry.canvas.width = 0;
        canvasEntry.canvas.height = 0;
        delete cache[id];
      }
    }
  };
})();

function compileType3Glyph(imgData) {
  var POINT_TO_PROCESS_LIMIT = 1000;

  var width = imgData.width, height = imgData.height;
  var i, j, j0, width1 = width + 1;
  var points = new Uint8Array(width1 * (height + 1));
  var POINT_TYPES =
      new Uint8Array([0, 2, 4, 0, 1, 0, 5, 4, 8, 10, 0, 8, 0, 2, 1, 0]);

  // decodes bit-packed mask data
  var lineSize = (width + 7) & ~7, data0 = imgData.data;
  var data = new Uint8Array(lineSize * height), pos = 0, ii;
  for (i = 0, ii = data0.length; i < ii; i++) {
    var mask = 128, elem = data0[i];
    while (mask > 0) {
      data[pos++] = (elem & mask) ? 0 : 255;
      mask >>= 1;
    }
  }

  // finding iteresting points: every point is located between mask pixels,
  // so there will be points of the (width + 1)x(height + 1) grid. Every point
  // will have flags assigned based on neighboring mask pixels:
  //   4 | 8
  //   --P--
  //   2 | 1
  // We are interested only in points with the flags:
  //   - outside corners: 1, 2, 4, 8;
  //   - inside corners: 7, 11, 13, 14;
  //   - and, intersections: 5, 10.
  var count = 0;
  pos = 0;
  if (data[pos] !== 0) {
    points[0] = 1;
    ++count;
  }
  for (j = 1; j < width; j++) {
    if (data[pos] !== data[pos + 1]) {
      points[j] = data[pos] ? 2 : 1;
      ++count;
    }
    pos++;
  }
  if (data[pos] !== 0) {
    points[j] = 2;
    ++count;
  }
  for (i = 1; i < height; i++) {
    pos = i * lineSize;
    j0 = i * width1;
    if (data[pos - lineSize] !== data[pos]) {
      points[j0] = data[pos] ? 1 : 8;
      ++count;
    }
    // 'sum' is the position of the current pixel configuration in the 'TYPES'
    // array (in order 8-1-2-4, so we can use '>>2' to shift the column).
    var sum = (data[pos] ? 4 : 0) + (data[pos - lineSize] ? 8 : 0);
    for (j = 1; j < width; j++) {
      sum = (sum >> 2) + (data[pos + 1] ? 4 : 0) +
            (data[pos - lineSize + 1] ? 8 : 0);
      if (POINT_TYPES[sum]) {
        points[j0 + j] = POINT_TYPES[sum];
        ++count;
      }
      pos++;
    }
    if (data[pos - lineSize] !== data[pos]) {
      points[j0 + j] = data[pos] ? 2 : 4;
      ++count;
    }

    if (count > POINT_TO_PROCESS_LIMIT) {
      return null;
    }
  }

  pos = lineSize * (height - 1);
  j0 = i * width1;
  if (data[pos] !== 0) {
    points[j0] = 8;
    ++count;
  }
  for (j = 1; j < width; j++) {
    if (data[pos] !== data[pos + 1]) {
      points[j0 + j] = data[pos] ? 4 : 8;
      ++count;
    }
    pos++;
  }
  if (data[pos] !== 0) {
    points[j0 + j] = 4;
    ++count;
  }
  if (count > POINT_TO_PROCESS_LIMIT) {
    return null;
  }

  // building outlines
  var steps = new Int32Array([0, width1, -1, 0, -width1, 0, 0, 0, 1]);
  var outlines = [];
  for (i = 0; count && i <= height; i++) {
    var p = i * width1;
    var end = p + width;
    while (p < end && !points[p]) {
      p++;
    }
    if (p === end) {
      continue;
    }
    var coords = [p % width1, i];

    var type = points[p], p0 = p, pp;
    do {
      var step = steps[type];
      do {
        p += step;
      } while (!points[p]);

      pp = points[p];
      if (pp !== 5 && pp !== 10) {
        // set new direction
        type = pp;
        // delete mark
        points[p] = 0;
      } else { // type is 5 or 10, ie, a crossing
        // set new direction
        type = pp & ((0x33 * type) >> 4);
        // set new type for "future hit"
        points[p] &= (type >> 2 | type << 2);
      }

      coords.push(p % width1);
      coords.push((p / width1) | 0);
      --count;
    } while (p0 !== p);
    outlines.push(coords);
    --i;
  }

  var drawOutline = function(c) {
    c.save();
    // the path shall be painted in [0..1]x[0..1] space
    c.scale(1 / width, -1 / height);
    c.translate(0, -height);
    c.beginPath();
    for (var i = 0, ii = outlines.length; i < ii; i++) {
      var o = outlines[i];
      c.moveTo(o[0], o[1]);
      for (var j = 2, jj = o.length; j < jj; j += 2) {
        c.lineTo(o[j], o[j+1]);
      }
    }
    c.fill();
    c.beginPath();
    c.restore();
  };

  return drawOutline;
}

var CanvasExtraState = (function CanvasExtraStateClosure() {
  function CanvasExtraState(old) {
    // Are soft masks and alpha values shapes or opacities?
    this.alphaIsShape = false;
    this.fontSize = 0;
    this.fontSizeScale = 1;
    this.textMatrix = IDENTITY_MATRIX;
    this.textMatrixScale = 1;
    this.fontMatrix = FONT_IDENTITY_MATRIX;
    this.leading = 0;
    // Current point (in user coordinates)
    this.x = 0;
    this.y = 0;
    // Start of text line (in text coordinates)
    this.lineX = 0;
    this.lineY = 0;
    // Character and word spacing
    this.charSpacing = 0;
    this.wordSpacing = 0;
    this.textHScale = 1;
    this.textRenderingMode = TextRenderingMode.FILL;
    this.textRise = 0;
    // Default fore and background colors
    this.fillColor = '#000000';
    this.strokeColor = '#000000';
    this.patternFill = false;
    // Note: fill alpha applies to all non-stroking operations
    this.fillAlpha = 1;
    this.strokeAlpha = 1;
    this.lineWidth = 1;
    this.activeSMask = null; // nonclonable field (see the save method below)

    this.old = old;
  }

  CanvasExtraState.prototype = {
    clone: function CanvasExtraState_clone() {
      return Object.create(this);
    },
    setCurrentPoint: function CanvasExtraState_setCurrentPoint(x, y) {
      this.x = x;
      this.y = y;
    }
  };
  return CanvasExtraState;
})();

var CanvasGraphics = (function CanvasGraphicsClosure() {
  // Defines the time the executeOperatorList is going to be executing
  // before it stops and shedules a continue of execution.
  var EXECUTION_TIME = 15;
  // Defines the number of steps before checking the execution time
  var EXECUTION_STEPS = 10;

  function CanvasGraphics(canvasCtx, commonObjs, objs, imageLayer) {
    this.ctx = canvasCtx;
    this.current = new CanvasExtraState();
    this.stateStack = [];
    this.pendingClip = null;
    this.pendingEOFill = false;
    this.res = null;
    this.xobjs = null;
    this.commonObjs = commonObjs;
    this.objs = objs;
    this.imageLayer = imageLayer;
    this.groupStack = [];
    this.processingType3 = null;
    // Patterns are painted relative to the initial page/form transform, see pdf
    // spec 8.7.2 NOTE 1.
    this.baseTransform = null;
    this.baseTransformStack = [];
    this.groupLevel = 0;
    this.smaskStack = [];
    this.smaskCounter = 0;
    this.tempSMask = null;
    if (canvasCtx) {
      addContextCurrentTransform(canvasCtx);
    }
    this.cachedGetSinglePixelWidth = null;
  }

  function putBinaryImageData(ctx, imgData) {
    if (typeof ImageData !== 'undefined' && imgData instanceof ImageData) {
      ctx.putImageData(imgData, 0, 0);
      return;
    }

    // Put the image data to the canvas in chunks, rather than putting the
    // whole image at once.  This saves JS memory, because the ImageData object
    // is smaller. It also possibly saves C++ memory within the implementation
    // of putImageData(). (E.g. in Firefox we make two short-lived copies of
    // the data passed to putImageData()). |n| shouldn't be too small, however,
    // because too many putImageData() calls will slow things down.
    //
    // Note: as written, if the last chunk is partial, the putImageData() call
    // will (conceptually) put pixels past the bounds of the canvas.  But
    // that's ok; any such pixels are ignored.

    var height = imgData.height, width = imgData.width;
    var partialChunkHeight = height % FULL_CHUNK_HEIGHT;
    var fullChunks = (height - partialChunkHeight) / FULL_CHUNK_HEIGHT;
    var totalChunks = partialChunkHeight === 0 ? fullChunks : fullChunks + 1;

    var chunkImgData = ctx.createImageData(width, FULL_CHUNK_HEIGHT);
    var srcPos = 0, destPos;
    var src = imgData.data;
    var dest = chunkImgData.data;
    var i, j, thisChunkHeight, elemsInThisChunk;

    // There are multiple forms in which the pixel data can be passed, and
    // imgData.kind tells us which one this is.
    if (imgData.kind === ImageKind.GRAYSCALE_1BPP) {
      // Grayscale, 1 bit per pixel (i.e. black-and-white).
      var srcLength = src.byteLength;
      var dest32 = PDFJS.hasCanvasTypedArrays ? new Uint32Array(dest.buffer) :
        new Uint32ArrayView(dest);
      var dest32DataLength = dest32.length;
      var fullSrcDiff = (width + 7) >> 3;
      var white = 0xFFFFFFFF;
      var black = (PDFJS.isLittleEndian || !PDFJS.hasCanvasTypedArrays) ?
        0xFF000000 : 0x000000FF;
      for (i = 0; i < totalChunks; i++) {
        thisChunkHeight =
          (i < fullChunks) ? FULL_CHUNK_HEIGHT : partialChunkHeight;
        destPos = 0;
        for (j = 0; j < thisChunkHeight; j++) {
          var srcDiff = srcLength - srcPos;
          var k = 0;
          var kEnd = (srcDiff > fullSrcDiff) ? width : srcDiff * 8 - 7;
          var kEndUnrolled = kEnd & ~7;
          var mask = 0;
          var srcByte = 0;
          for (; k < kEndUnrolled; k += 8) {
            srcByte = src[srcPos++];
            dest32[destPos++] = (srcByte & 128) ? white : black;
            dest32[destPos++] = (srcByte & 64) ? white : black;
            dest32[destPos++] = (srcByte & 32) ? white : black;
            dest32[destPos++] = (srcByte & 16) ? white : black;
            dest32[destPos++] = (srcByte & 8) ? white : black;
            dest32[destPos++] = (srcByte & 4) ? white : black;
            dest32[destPos++] = (srcByte & 2) ? white : black;
            dest32[destPos++] = (srcByte & 1) ? white : black;
          }
          for (; k < kEnd; k++) {
             if (mask === 0) {
               srcByte = src[srcPos++];
               mask = 128;
             }

            dest32[destPos++] = (srcByte & mask) ? white : black;
            mask >>= 1;
          }
        }
        // We ran out of input. Make all remaining pixels transparent.
        while (destPos < dest32DataLength) {
          dest32[destPos++] = 0;
        }

        ctx.putImageData(chunkImgData, 0, i * FULL_CHUNK_HEIGHT);
      }
    } else if (imgData.kind === ImageKind.RGBA_32BPP) {
      // RGBA, 32-bits per pixel.

      j = 0;
      elemsInThisChunk = width * FULL_CHUNK_HEIGHT * 4;
      for (i = 0; i < fullChunks; i++) {
        dest.set(src.subarray(srcPos, srcPos + elemsInThisChunk));
        srcPos += elemsInThisChunk;

        ctx.putImageData(chunkImgData, 0, j);
        j += FULL_CHUNK_HEIGHT;
      }
      if (i < totalChunks) {
        elemsInThisChunk = width * partialChunkHeight * 4;
        dest.set(src.subarray(srcPos, srcPos + elemsInThisChunk));
        ctx.putImageData(chunkImgData, 0, j);
      }

    } else if (imgData.kind === ImageKind.RGB_24BPP) {
      // RGB, 24-bits per pixel.
      thisChunkHeight = FULL_CHUNK_HEIGHT;
      elemsInThisChunk = width * thisChunkHeight;
      for (i = 0; i < totalChunks; i++) {
        if (i >= fullChunks) {
          thisChunkHeight = partialChunkHeight;
          elemsInThisChunk = width * thisChunkHeight;
        }

        destPos = 0;
        for (j = elemsInThisChunk; j--;) {
          dest[destPos++] = src[srcPos++];
          dest[destPos++] = src[srcPos++];
          dest[destPos++] = src[srcPos++];
          dest[destPos++] = 255;
        }
        ctx.putImageData(chunkImgData, 0, i * FULL_CHUNK_HEIGHT);
      }
    } else {
      error('bad image kind: ' + imgData.kind);
    }
  }

  function putBinaryImageMask(ctx, imgData) {
    var height = imgData.height, width = imgData.width;
    var partialChunkHeight = height % FULL_CHUNK_HEIGHT;
    var fullChunks = (height - partialChunkHeight) / FULL_CHUNK_HEIGHT;
    var totalChunks = partialChunkHeight === 0 ? fullChunks : fullChunks + 1;

    var chunkImgData = ctx.createImageData(width, FULL_CHUNK_HEIGHT);
    var srcPos = 0;
    var src = imgData.data;
    var dest = chunkImgData.data;

    for (var i = 0; i < totalChunks; i++) {
      var thisChunkHeight =
        (i < fullChunks) ? FULL_CHUNK_HEIGHT : partialChunkHeight;

      // Expand the mask so it can be used by the canvas.  Any required
      // inversion has already been handled.
      var destPos = 3; // alpha component offset
      for (var j = 0; j < thisChunkHeight; j++) {
        var mask = 0;
        for (var k = 0; k < width; k++) {
          if (!mask) {
            var elem = src[srcPos++];
            mask = 128;
          }
          dest[destPos] = (elem & mask) ? 0 : 255;
          destPos += 4;
          mask >>= 1;
        }
      }
      ctx.putImageData(chunkImgData, 0, i * FULL_CHUNK_HEIGHT);
    }
  }

  function copyCtxState(sourceCtx, destCtx) {
    var properties = ['strokeStyle', 'fillStyle', 'fillRule', 'globalAlpha',
                      'lineWidth', 'lineCap', 'lineJoin', 'miterLimit',
                      'globalCompositeOperation', 'font'];
    for (var i = 0, ii = properties.length; i < ii; i++) {
      var property = properties[i];
      if (sourceCtx[property] !== undefined) {
        destCtx[property] = sourceCtx[property];
      }
    }
    if (sourceCtx.setLineDash !== undefined) {
      destCtx.setLineDash(sourceCtx.getLineDash());
      destCtx.lineDashOffset =  sourceCtx.lineDashOffset;
    } else if (sourceCtx.mozDashOffset !== undefined) {
      destCtx.mozDash = sourceCtx.mozDash;
      destCtx.mozDashOffset = sourceCtx.mozDashOffset;
    }
  }

  function composeSMaskBackdrop(bytes, r0, g0, b0) {
    var length = bytes.length;
    for (var i = 3; i < length; i += 4) {
      var alpha = bytes[i];
      if (alpha === 0) {
        bytes[i - 3] = r0;
        bytes[i - 2] = g0;
        bytes[i - 1] = b0;
      } else if (alpha < 255) {
        var alpha_ = 255 - alpha;
        bytes[i - 3] = (bytes[i - 3] * alpha + r0 * alpha_) >> 8;
        bytes[i - 2] = (bytes[i - 2] * alpha + g0 * alpha_) >> 8;
        bytes[i - 1] = (bytes[i - 1] * alpha + b0 * alpha_) >> 8;
      }
    }
  }

  function composeSMaskAlpha(maskData, layerData) {
    var length = maskData.length;
    var scale = 1 / 255;
    for (var i = 3; i < length; i += 4) {
      var alpha = maskData[i];
      layerData[i] = (layerData[i] * alpha * scale) | 0;
    }
  }

  function composeSMaskLuminosity(maskData, layerData) {
    var length = maskData.length;
    for (var i = 3; i < length; i += 4) {
      var y = (maskData[i - 3] * 77) +  // * 0.3 / 255 * 0x10000
              (maskData[i - 2] * 152) + // * 0.59 ....
              (maskData[i - 1] * 28);   // * 0.11 ....
      layerData[i] = (layerData[i] * y) >> 16;
    }
  }

  function genericComposeSMask(maskCtx, layerCtx, width, height,
                               subtype, backdrop) {
    var hasBackdrop = !!backdrop;
    var r0 = hasBackdrop ? backdrop[0] : 0;
    var g0 = hasBackdrop ? backdrop[1] : 0;
    var b0 = hasBackdrop ? backdrop[2] : 0;

    var composeFn;
    if (subtype === 'Luminosity') {
      composeFn = composeSMaskLuminosity;
    } else {
      composeFn = composeSMaskAlpha;
    }

    // processing image in chunks to save memory
    var PIXELS_TO_PROCESS = 1048576;
    var chunkSize = Math.min(height, Math.ceil(PIXELS_TO_PROCESS / width));
    for (var row = 0; row < height; row += chunkSize) {
      var chunkHeight = Math.min(chunkSize, height - row);
      var maskData = maskCtx.getImageData(0, row, width, chunkHeight);
      var layerData = layerCtx.getImageData(0, row, width, chunkHeight);

      if (hasBackdrop) {
        composeSMaskBackdrop(maskData.data, r0, g0, b0);
      }
      composeFn(maskData.data, layerData.data);

      maskCtx.putImageData(layerData, 0, row);
    }
  }

  function composeSMask(ctx, smask, layerCtx) {
    var mask = smask.canvas;
    var maskCtx = smask.context;

    ctx.setTransform(smask.scaleX, 0, 0, smask.scaleY,
                     smask.offsetX, smask.offsetY);

    var backdrop = smask.backdrop || null;
    if (WebGLUtils.isEnabled) {
      var composed = WebGLUtils.composeSMask(layerCtx.canvas, mask,
        {subtype: smask.subtype, backdrop: backdrop});
      ctx.setTransform(1, 0, 0, 1, 0, 0);
      ctx.drawImage(composed, smask.offsetX, smask.offsetY);
      return;
    }
    genericComposeSMask(maskCtx, layerCtx, mask.width, mask.height,
                        smask.subtype, backdrop);
    ctx.drawImage(mask, 0, 0);
  }

  var LINE_CAP_STYLES = ['butt', 'round', 'square'];
  var LINE_JOIN_STYLES = ['miter', 'round', 'bevel'];
  var NORMAL_CLIP = {};
  var EO_CLIP = {};

  CanvasGraphics.prototype = {

    beginDrawing: function CanvasGraphics_beginDrawing(viewport, transparency) {
      // For pdfs that use blend modes we have to clear the canvas else certain
      // blend modes can look wrong since we'd be blending with a white
      // backdrop. The problem with a transparent backdrop though is we then
      // don't get sub pixel anti aliasing on text, so we fill with white if
      // we can.
      var width = this.ctx.canvas.width;
      var height = this.ctx.canvas.height;
      if (transparency) {
        this.ctx.clearRect(0, 0, width, height);
      } else {
        this.ctx.mozOpaque = true;
        this.ctx.save();
        this.ctx.fillStyle = 'rgb(255, 255, 255)';
        this.ctx.fillRect(0, 0, width, height);
        this.ctx.restore();
      }

      var transform = viewport.transform;

      this.ctx.save();
      this.ctx.transform.apply(this.ctx, transform);

      this.baseTransform = this.ctx.mozCurrentTransform.slice();

      if (this.imageLayer) {
        this.imageLayer.beginLayout();
      }
    },

    executeOperatorList: function CanvasGraphics_executeOperatorList(
                                    operatorList,
                                    executionStartIdx, continueCallback,
                                    stepper) {
      var argsArray = operatorList.argsArray;
      var fnArray = operatorList.fnArray;
      var i = executionStartIdx || 0;
      var argsArrayLen = argsArray.length;

      // Sometimes the OperatorList to execute is empty.
      if (argsArrayLen === i) {
        return i;
      }

      var chunkOperations = (argsArrayLen - i > EXECUTION_STEPS &&
                             typeof continueCallback === 'function');
      var endTime = chunkOperations ? Date.now() + EXECUTION_TIME : 0;
      var steps = 0;

      var commonObjs = this.commonObjs;
      var objs = this.objs;
      var fnId;

      while (true) {
        if (stepper !== undefined && i === stepper.nextBreakPoint) {
          stepper.breakIt(i, continueCallback);
          return i;
        }

        fnId = fnArray[i];

        if (fnId !== OPS.dependency) {
          this[fnId].apply(this, argsArray[i]);
        } else {
          var deps = argsArray[i];
          for (var n = 0, nn = deps.length; n < nn; n++) {
            var depObjId = deps[n];
            var common = depObjId[0] === 'g' && depObjId[1] === '_';
            var objsPool = common ? commonObjs : objs;

            // If the promise isn't resolved yet, add the continueCallback
            // to the promise and bail out.
            if (!objsPool.isResolved(depObjId)) {
              objsPool.get(depObjId, continueCallback);
              return i;
            }
          }
        }

        i++;

        // If the entire operatorList was executed, stop as were done.
        if (i === argsArrayLen) {
          return i;
        }

        // If the execution took longer then a certain amount of time and
        // `continueCallback` is specified, interrupt the execution.
        if (chunkOperations && ++steps > EXECUTION_STEPS) {
          if (Date.now() > endTime) {
            continueCallback();
            return i;
          }
          steps = 0;
        }

        // If the operatorList isn't executed completely yet OR the execution
        // time was short enough, do another execution round.
      }
    },

    endDrawing: function CanvasGraphics_endDrawing() {
      this.ctx.restore();
      CachedCanvases.clear();
      WebGLUtils.clear();

      if (this.imageLayer) {
        this.imageLayer.endLayout();
      }
    },

    // Graphics state
    setLineWidth: function CanvasGraphics_setLineWidth(width) {
      this.current.lineWidth = width;
      this.ctx.lineWidth = width;
    },
    setLineCap: function CanvasGraphics_setLineCap(style) {
      this.ctx.lineCap = LINE_CAP_STYLES[style];
    },
    setLineJoin: function CanvasGraphics_setLineJoin(style) {
      this.ctx.lineJoin = LINE_JOIN_STYLES[style];
    },
    setMiterLimit: function CanvasGraphics_setMiterLimit(limit) {
      this.ctx.miterLimit = limit;
    },
    setDash: function CanvasGraphics_setDash(dashArray, dashPhase) {
      var ctx = this.ctx;
      if (ctx.setLineDash !== undefined) {
        ctx.setLineDash(dashArray);
        ctx.lineDashOffset = dashPhase;
      } else {
        ctx.mozDash = dashArray;
        ctx.mozDashOffset = dashPhase;
      }
    },
    setRenderingIntent: function CanvasGraphics_setRenderingIntent(intent) {
      // Maybe if we one day fully support color spaces this will be important
      // for now we can ignore.
      // TODO set rendering intent?
    },
    setFlatness: function CanvasGraphics_setFlatness(flatness) {
      // There's no way to control this with canvas, but we can safely ignore.
      // TODO set flatness?
    },
    setGState: function CanvasGraphics_setGState(states) {
      for (var i = 0, ii = states.length; i < ii; i++) {
        var state = states[i];
        var key = state[0];
        var value = state[1];

        switch (key) {
          case 'LW':
            this.setLineWidth(value);
            break;
          case 'LC':
            this.setLineCap(value);
            break;
          case 'LJ':
            this.setLineJoin(value);
            break;
          case 'ML':
            this.setMiterLimit(value);
            break;
          case 'D':
            this.setDash(value[0], value[1]);
            break;
          case 'RI':
            this.setRenderingIntent(value);
            break;
          case 'FL':
            this.setFlatness(value);
            break;
          case 'Font':
            this.setFont(value[0], value[1]);
            break;
          case 'CA':
            this.current.strokeAlpha = state[1];
            break;
          case 'ca':
            this.current.fillAlpha = state[1];
            this.ctx.globalAlpha = state[1];
            break;
          case 'BM':
            if (value && value.name && (value.name !== 'Normal')) {
              var mode = value.name.replace(/([A-Z])/g,
                function(c) {
                  return '-' + c.toLowerCase();
                }
              ).substring(1);
              this.ctx.globalCompositeOperation = mode;
              if (this.ctx.globalCompositeOperation !== mode) {
                warn('globalCompositeOperation "' + mode +
                     '" is not supported');
              }
            } else {
              this.ctx.globalCompositeOperation = 'source-over';
            }
            break;
          case 'SMask':
            if (this.current.activeSMask) {
              this.endSMaskGroup();
            }
            this.current.activeSMask = value ? this.tempSMask : null;
            if (this.current.activeSMask) {
              this.beginSMaskGroup();
            }
            this.tempSMask = null;
            break;
        }
      }
    },
    beginSMaskGroup: function CanvasGraphics_beginSMaskGroup() {

      var activeSMask = this.current.activeSMask;
      var drawnWidth = activeSMask.canvas.width;
      var drawnHeight = activeSMask.canvas.height;
      var cacheId = 'smaskGroupAt' + this.groupLevel;
      var scratchCanvas = CachedCanvases.getCanvas(
        cacheId, drawnWidth, drawnHeight, true);

      var currentCtx = this.ctx;
      var currentTransform = currentCtx.mozCurrentTransform;
      this.ctx.save();

      var groupCtx = scratchCanvas.context;
      groupCtx.scale(1 / activeSMask.scaleX, 1 / activeSMask.scaleY);
      groupCtx.translate(-activeSMask.offsetX, -activeSMask.offsetY);
      groupCtx.transform.apply(groupCtx, currentTransform);

      copyCtxState(currentCtx, groupCtx);
      this.ctx = groupCtx;
      this.setGState([
        ['BM', 'Normal'],
        ['ca', 1],
        ['CA', 1]
      ]);
      this.groupStack.push(currentCtx);
      this.groupLevel++;
    },
    endSMaskGroup: function CanvasGraphics_endSMaskGroup() {
      var groupCtx = this.ctx;
      this.groupLevel--;
      this.ctx = this.groupStack.pop();

      composeSMask(this.ctx, this.current.activeSMask, groupCtx);
      this.ctx.restore();
    },
    save: function CanvasGraphics_save() {
      this.ctx.save();
      var old = this.current;
      this.stateStack.push(old);
      this.current = old.clone();
      this.current.activeSMask = null;
    },
    restore: function CanvasGraphics_restore() {
      if (this.stateStack.length !== 0) {
        if (this.current.activeSMask !== null) {
          this.endSMaskGroup();
        }

        this.current = this.stateStack.pop();
        this.ctx.restore();

        this.cachedGetSinglePixelWidth = null;
      }
    },
    transform: function CanvasGraphics_transform(a, b, c, d, e, f) {
      this.ctx.transform(a, b, c, d, e, f);

      this.cachedGetSinglePixelWidth = null;
    },

    // Path
    constructPath: function CanvasGraphics_constructPath(ops, args) {
      var ctx = this.ctx;
      var current = this.current;
      var x = current.x, y = current.y;
      for (var i = 0, j = 0, ii = ops.length; i < ii; i++) {
        switch (ops[i] | 0) {
          case OPS.rectangle:
            x = args[j++];
            y = args[j++];
            var width = args[j++];
            var height = args[j++];
            if (width === 0) {
              width = this.getSinglePixelWidth();
            }
            if (height === 0) {
              height = this.getSinglePixelWidth();
            }
            var xw = x + width;
            var yh = y + height;
            this.ctx.moveTo(x, y);
            this.ctx.lineTo(xw, y);
            this.ctx.lineTo(xw, yh);
            this.ctx.lineTo(x, yh);
            this.ctx.lineTo(x, y);
            this.ctx.closePath();
            break;
          case OPS.moveTo:
            x = args[j++];
            y = args[j++];
            ctx.moveTo(x, y);
            break;
          case OPS.lineTo:
            x = args[j++];
            y = args[j++];
            ctx.lineTo(x, y);
            break;
          case OPS.curveTo:
            x = args[j + 4];
            y = args[j + 5];
            ctx.bezierCurveTo(args[j], args[j + 1], args[j + 2], args[j + 3],
                              x, y);
            j += 6;
            break;
          case OPS.curveTo2:
            ctx.bezierCurveTo(x, y, args[j], args[j + 1],
                              args[j + 2], args[j + 3]);
            x = args[j + 2];
            y = args[j + 3];
            j += 4;
            break;
          case OPS.curveTo3:
            x = args[j + 2];
            y = args[j + 3];
            ctx.bezierCurveTo(args[j], args[j + 1], x, y, x, y);
            j += 4;
            break;
          case OPS.closePath:
            ctx.closePath();
            break;
        }
      }
      current.setCurrentPoint(x, y);
    },
    closePath: function CanvasGraphics_closePath() {
      this.ctx.closePath();
    },
    stroke: function CanvasGraphics_stroke(consumePath) {
      consumePath = typeof consumePath !== 'undefined' ? consumePath : true;
      var ctx = this.ctx;
      var strokeColor = this.current.strokeColor;
      // Prevent drawing too thin lines by enforcing a minimum line width.
      ctx.lineWidth = Math.max(this.getSinglePixelWidth() * MIN_WIDTH_FACTOR,
                               this.current.lineWidth);
      // For stroke we want to temporarily change the global alpha to the
      // stroking alpha.
      ctx.globalAlpha = this.current.strokeAlpha;
      if (strokeColor && strokeColor.hasOwnProperty('type') &&
          strokeColor.type === 'Pattern') {
        // for patterns, we transform to pattern space, calculate
        // the pattern, call stroke, and restore to user space
        ctx.save();
        ctx.strokeStyle = strokeColor.getPattern(ctx, this);
        ctx.stroke();
        ctx.restore();
      } else {
        ctx.stroke();
      }
      if (consumePath) {
        this.consumePath();
      }
      // Restore the global alpha to the fill alpha
      ctx.globalAlpha = this.current.fillAlpha;
    },
    closeStroke: function CanvasGraphics_closeStroke() {
      this.closePath();
      this.stroke();
    },
    fill: function CanvasGraphics_fill(consumePath) {
      consumePath = typeof consumePath !== 'undefined' ? consumePath : true;
      var ctx = this.ctx;
      var fillColor = this.current.fillColor;
      var isPatternFill = this.current.patternFill;
      var needRestore = false;

      if (isPatternFill) {
        ctx.save();
        ctx.fillStyle = fillColor.getPattern(ctx, this);
        needRestore = true;
      }

      if (this.pendingEOFill) {
        if (ctx.mozFillRule !== undefined) {
          ctx.mozFillRule = 'evenodd';
          ctx.fill();
          ctx.mozFillRule = 'nonzero';
        } else {
          try {
            ctx.fill('evenodd');
          } catch (ex) {
            // shouldn't really happen, but browsers might think differently
            ctx.fill();
          }
        }
        this.pendingEOFill = false;
      } else {
        ctx.fill();
      }

      if (needRestore) {
        ctx.restore();
      }
      if (consumePath) {
        this.consumePath();
      }
    },
    eoFill: function CanvasGraphics_eoFill() {
      this.pendingEOFill = true;
      this.fill();
    },
    fillStroke: function CanvasGraphics_fillStroke() {
      this.fill(false);
      this.stroke(false);

      this.consumePath();
    },
    eoFillStroke: function CanvasGraphics_eoFillStroke() {
      this.pendingEOFill = true;
      this.fillStroke();
    },
    closeFillStroke: function CanvasGraphics_closeFillStroke() {
      this.closePath();
      this.fillStroke();
    },
    closeEOFillStroke: function CanvasGraphics_closeEOFillStroke() {
      this.pendingEOFill = true;
      this.closePath();
      this.fillStroke();
    },
    endPath: function CanvasGraphics_endPath() {
      this.consumePath();
    },

    // Clipping
    clip: function CanvasGraphics_clip() {
      this.pendingClip = NORMAL_CLIP;
    },
    eoClip: function CanvasGraphics_eoClip() {
      this.pendingClip = EO_CLIP;
    },

    // Text
    beginText: function CanvasGraphics_beginText() {
      this.current.textMatrix = IDENTITY_MATRIX;
      this.current.textMatrixScale = 1;
      this.current.x = this.current.lineX = 0;
      this.current.y = this.current.lineY = 0;
    },
    endText: function CanvasGraphics_endText() {
      var paths = this.pendingTextPaths;
      var ctx = this.ctx;
      if (paths === undefined) {
        ctx.beginPath();
        return;
      }

      ctx.save();
      ctx.beginPath();
      for (var i = 0; i < paths.length; i++) {
        var path = paths[i];
        ctx.setTransform.apply(ctx, path.transform);
        ctx.translate(path.x, path.y);
        path.addToPath(ctx, path.fontSize);
      }
      ctx.restore();
      ctx.clip();
      ctx.beginPath();
      delete this.pendingTextPaths;
    },
    setCharSpacing: function CanvasGraphics_setCharSpacing(spacing) {
      this.current.charSpacing = spacing;
    },
    setWordSpacing: function CanvasGraphics_setWordSpacing(spacing) {
      this.current.wordSpacing = spacing;
    },
    setHScale: function CanvasGraphics_setHScale(scale) {
      this.current.textHScale = scale / 100;
    },
    setLeading: function CanvasGraphics_setLeading(leading) {
      this.current.leading = -leading;
    },
    setFont: function CanvasGraphics_setFont(fontRefName, size) {
      var fontObj = this.commonObjs.get(fontRefName);
      var current = this.current;

      if (!fontObj) {
        error('Can\'t find font for ' + fontRefName);
      }

      current.fontMatrix = (fontObj.fontMatrix ?
                            fontObj.fontMatrix : FONT_IDENTITY_MATRIX);

      // A valid matrix needs all main diagonal elements to be non-zero
      // This also ensures we bypass FF bugzilla bug #719844.
      if (current.fontMatrix[0] === 0 ||
          current.fontMatrix[3] === 0) {
        warn('Invalid font matrix for font ' + fontRefName);
      }

      // The spec for Tf (setFont) says that 'size' specifies the font 'scale',
      // and in some docs this can be negative (inverted x-y axes).
      if (size < 0) {
        size = -size;
        current.fontDirection = -1;
      } else {
        current.fontDirection = 1;
      }

      this.current.font = fontObj;
      this.current.fontSize = size;

      if (fontObj.isType3Font) {
        return; // we don't need ctx.font for Type3 fonts
      }

      var name = fontObj.loadedName || 'sans-serif';
      var bold = fontObj.black ? (fontObj.bold ? 'bolder' : 'bold') :
                                 (fontObj.bold ? 'bold' : 'normal');

      var italic = fontObj.italic ? 'italic' : 'normal';
      var typeface = '"' + name + '", ' + fontObj.fallbackName;

      // Some font backends cannot handle fonts below certain size.
      // Keeping the font at minimal size and using the fontSizeScale to change
      // the current transformation matrix before the fillText/strokeText.
      // See https://bugzilla.mozilla.org/show_bug.cgi?id=726227
      var browserFontSize = size < MIN_FONT_SIZE ? MIN_FONT_SIZE :
                            size > MAX_FONT_SIZE ? MAX_FONT_SIZE : size;
      this.current.fontSizeScale = size / browserFontSize;

      var rule = italic + ' ' + bold + ' ' + browserFontSize + 'px ' + typeface;
      this.ctx.font = rule;
    },
    setTextRenderingMode: function CanvasGraphics_setTextRenderingMode(mode) {
      this.current.textRenderingMode = mode;
    },
    setTextRise: function CanvasGraphics_setTextRise(rise) {
      this.current.textRise = rise;
    },
    moveText: function CanvasGraphics_moveText(x, y) {
      this.current.x = this.current.lineX += x;
      this.current.y = this.current.lineY += y;
    },
    setLeadingMoveText: function CanvasGraphics_setLeadingMoveText(x, y) {
      this.setLeading(-y);
      this.moveText(x, y);
    },
    setTextMatrix: function CanvasGraphics_setTextMatrix(a, b, c, d, e, f) {
      this.current.textMatrix = [a, b, c, d, e, f];
      this.current.textMatrixScale = Math.sqrt(a * a + b * b);

      this.current.x = this.current.lineX = 0;
      this.current.y = this.current.lineY = 0;
    },
    nextLine: function CanvasGraphics_nextLine() {
      this.moveText(0, this.current.leading);
    },

    paintChar: function CanvasGraphics_paintChar(character, x, y) {
      var ctx = this.ctx;
      var current = this.current;
      var font = current.font;
      var textRenderingMode = current.textRenderingMode;
      var fontSize = current.fontSize / current.fontSizeScale;
      var fillStrokeMode = textRenderingMode &
        TextRenderingMode.FILL_STROKE_MASK;
      var isAddToPathSet = !!(textRenderingMode &
        TextRenderingMode.ADD_TO_PATH_FLAG);

      var addToPath;
      if (font.disableFontFace || isAddToPathSet) {
        addToPath = font.getPathGenerator(this.commonObjs, character);
      }

      if (font.disableFontFace) {
        ctx.save();
        ctx.translate(x, y);
        ctx.beginPath();
        addToPath(ctx, fontSize);
        if (fillStrokeMode === TextRenderingMode.FILL ||
            fillStrokeMode === TextRenderingMode.FILL_STROKE) {
          ctx.fill();
        }
        if (fillStrokeMode === TextRenderingMode.STROKE ||
            fillStrokeMode === TextRenderingMode.FILL_STROKE) {
          ctx.stroke();
        }
        ctx.restore();
      } else {
        if (fillStrokeMode === TextRenderingMode.FILL ||
            fillStrokeMode === TextRenderingMode.FILL_STROKE) {
          ctx.fillText(character, x, y);
        }
        if (fillStrokeMode === TextRenderingMode.STROKE ||
            fillStrokeMode === TextRenderingMode.FILL_STROKE) {
          ctx.strokeText(character, x, y);
        }
      }

      if (isAddToPathSet) {
        var paths = this.pendingTextPaths || (this.pendingTextPaths = []);
        paths.push({
          transform: ctx.mozCurrentTransform,
          x: x,
          y: y,
          fontSize: fontSize,
          addToPath: addToPath
        });
      }
    },

    get isFontSubpixelAAEnabled() {
      // Checks if anti-aliasing is enabled when scaled text is painted.
      // On Windows GDI scaled fonts looks bad.
      var ctx = document.createElement('canvas').getContext('2d');
      ctx.scale(1.5, 1);
      ctx.fillText('I', 0, 10);
      var data = ctx.getImageData(0, 0, 10, 10).data;
      var enabled = false;
      for (var i = 3; i < data.length; i += 4) {
        if (data[i] > 0 && data[i] < 255) {
          enabled = true;
          break;
        }
      }
      return shadow(this, 'isFontSubpixelAAEnabled', enabled);
    },

    showText: function CanvasGraphics_showText(glyphs) {
      var current = this.current;
      var font = current.font;
      if (font.isType3Font) {
        return this.showType3Text(glyphs);
      }

      var fontSize = current.fontSize;
      if (fontSize === 0) {
        return;
      }

      var ctx = this.ctx;
      var fontSizeScale = current.fontSizeScale;
      var charSpacing = current.charSpacing;
      var wordSpacing = current.wordSpacing;
      var fontDirection = current.fontDirection;
      var textHScale = current.textHScale * fontDirection;
      var glyphsLength = glyphs.length;
      var vertical = font.vertical;
      var defaultVMetrics = font.defaultVMetrics;
      var widthAdvanceScale = fontSize * current.fontMatrix[0];

      var simpleFillText =
        current.textRenderingMode === TextRenderingMode.FILL &&
        !font.disableFontFace;

      ctx.save();
      ctx.transform.apply(ctx, current.textMatrix);
      ctx.translate(current.x, current.y + current.textRise);

      if (fontDirection > 0) {
        ctx.scale(textHScale, -1);
      } else {
        ctx.scale(textHScale, 1);
      }

      var lineWidth = current.lineWidth;
      var scale = current.textMatrixScale;
      if (scale === 0 || lineWidth === 0) {
        var fillStrokeMode = current.textRenderingMode &
          TextRenderingMode.FILL_STROKE_MASK;
        if (fillStrokeMode === TextRenderingMode.STROKE ||
            fillStrokeMode === TextRenderingMode.FILL_STROKE) {
          this.cachedGetSinglePixelWidth = null;
          lineWidth = this.getSinglePixelWidth() * MIN_WIDTH_FACTOR;
        }
      } else {
        lineWidth /= scale;
      }

      if (fontSizeScale !== 1.0) {
        ctx.scale(fontSizeScale, fontSizeScale);
        lineWidth /= fontSizeScale;
      }

      ctx.lineWidth = lineWidth;

      var x = 0, i;
      for (i = 0; i < glyphsLength; ++i) {
        var glyph = glyphs[i];
        if (glyph === null) {
          // word break
          x += fontDirection * wordSpacing;
          continue;
        } else if (isNum(glyph)) {
          x += -glyph * fontSize * 0.001;
          continue;
        }

        var restoreNeeded = false;
        var character = glyph.fontChar;
        var accent = glyph.accent;
        var scaledX, scaledY, scaledAccentX, scaledAccentY;
        var width = glyph.width;
        if (vertical) {
          var vmetric, vx, vy;
          vmetric = glyph.vmetric || defaultVMetrics;
          vx = glyph.vmetric ? vmetric[1] : width * 0.5;
          vx = -vx * widthAdvanceScale;
          vy = vmetric[2] * widthAdvanceScale;

          width = vmetric ? -vmetric[0] : width;
          scaledX = vx / fontSizeScale;
          scaledY = (x + vy) / fontSizeScale;
        } else {
          scaledX = x / fontSizeScale;
          scaledY = 0;
        }

        if (font.remeasure && width > 0 && this.isFontSubpixelAAEnabled) {
          // some standard fonts may not have the exact width, trying to
          // rescale per character
          var measuredWidth = ctx.measureText(character).width * 1000 /
            fontSize * fontSizeScale;
          var characterScaleX = width / measuredWidth;
          restoreNeeded = true;
          ctx.save();
          ctx.scale(characterScaleX, 1);
          scaledX /= characterScaleX;
        }

        if (simpleFillText && !accent) {
          // common case
          ctx.fillText(character, scaledX, scaledY);
        } else {
          this.paintChar(character, scaledX, scaledY);
          if (accent) {
            scaledAccentX = scaledX + accent.offset.x / fontSizeScale;
            scaledAccentY = scaledY - accent.offset.y / fontSizeScale;
            this.paintChar(accent.fontChar, scaledAccentX, scaledAccentY);
          }
        }

        var charWidth = width * widthAdvanceScale + charSpacing * fontDirection;
        x += charWidth;

        if (restoreNeeded) {
          ctx.restore();
        }
      }
      if (vertical) {
        current.y -= x * textHScale;
      } else {
        current.x += x * textHScale;
      }
      ctx.restore();
    },

    showType3Text: function CanvasGraphics_showType3Text(glyphs) {
      // Type3 fonts - each glyph is a "mini-PDF"
      var ctx = this.ctx;
      var current = this.current;
      var font = current.font;
      var fontSize = current.fontSize;
      var fontDirection = current.fontDirection;
      var charSpacing = current.charSpacing;
      var wordSpacing = current.wordSpacing;
      var textHScale = current.textHScale * fontDirection;
      var fontMatrix = current.fontMatrix || FONT_IDENTITY_MATRIX;
      var glyphsLength = glyphs.length;
      var isTextInvisible =
        current.textRenderingMode === TextRenderingMode.INVISIBLE;
      var i, glyph, width;

      if (isTextInvisible || fontSize === 0) {
        return;
      }

      ctx.save();
      ctx.transform.apply(ctx, current.textMatrix);
      ctx.translate(current.x, current.y);

      ctx.scale(textHScale, fontDirection);

      for (i = 0; i < glyphsLength; ++i) {
        glyph = glyphs[i];
        if (glyph === null) {
          // word break
          this.ctx.translate(wordSpacing, 0);
          current.x += wordSpacing * textHScale;
          continue;
        } else if (isNum(glyph)) {
          var spacingLength = -glyph * 0.001 * fontSize;
          this.ctx.translate(spacingLength, 0);
          current.x += spacingLength * textHScale;
          continue;
        }

        var operatorList = font.charProcOperatorList[glyph.operatorListId];
        if (!operatorList) {
          warn('Type3 character \"' + glyph.operatorListId +
               '\" is not available');
          continue;
        }
        this.processingType3 = glyph;
        this.save();
        ctx.scale(fontSize, fontSize);
        ctx.transform.apply(ctx, fontMatrix);
        this.executeOperatorList(operatorList);
        this.restore();

        var transformed = Util.applyTransform([glyph.width, 0], fontMatrix);
        width = transformed[0] * fontSize + charSpacing;

        ctx.translate(width, 0);
        current.x += width * textHScale;
      }
      ctx.restore();
      this.processingType3 = null;
    },

    // Type3 fonts
    setCharWidth: function CanvasGraphics_setCharWidth(xWidth, yWidth) {
      // We can safely ignore this since the width should be the same
      // as the width in the Widths array.
    },
    setCharWidthAndBounds: function CanvasGraphics_setCharWidthAndBounds(xWidth,
                                                                        yWidth,
                                                                        llx,
                                                                        lly,
                                                                        urx,
                                                                        ury) {
      // TODO According to the spec we're also suppose to ignore any operators
      // that set color or include images while processing this type3 font.
      this.ctx.rect(llx, lly, urx - llx, ury - lly);
      this.clip();
      this.endPath();
    },

    // Color
    getColorN_Pattern: function CanvasGraphics_getColorN_Pattern(IR) {
      var pattern;
      if (IR[0] === 'TilingPattern') {
        var color = IR[1];
        pattern = new TilingPattern(IR, color, this.ctx, this.objs,
                                    this.commonObjs, this.baseTransform);
      } else {
        pattern = getShadingPatternFromIR(IR);
      }
      return pattern;
    },
    setStrokeColorN: function CanvasGraphics_setStrokeColorN(/*...*/) {
      this.current.strokeColor = this.getColorN_Pattern(arguments);
    },
    setFillColorN: function CanvasGraphics_setFillColorN(/*...*/) {
      this.current.fillColor = this.getColorN_Pattern(arguments);
      this.current.patternFill = true;
    },
    setStrokeRGBColor: function CanvasGraphics_setStrokeRGBColor(r, g, b) {
      var color = Util.makeCssRgb(r, g, b);
      this.ctx.strokeStyle = color;
      this.current.strokeColor = color;
    },
    setFillRGBColor: function CanvasGraphics_setFillRGBColor(r, g, b) {
      var color = Util.makeCssRgb(r, g, b);
      this.ctx.fillStyle = color;
      this.current.fillColor = color;
      this.current.patternFill = false;
    },

    shadingFill: function CanvasGraphics_shadingFill(patternIR) {
      var ctx = this.ctx;

      this.save();
      var pattern = getShadingPatternFromIR(patternIR);
      ctx.fillStyle = pattern.getPattern(ctx, this, true);

      var inv = ctx.mozCurrentTransformInverse;
      if (inv) {
        var canvas = ctx.canvas;
        var width = canvas.width;
        var height = canvas.height;

        var bl = Util.applyTransform([0, 0], inv);
        var br = Util.applyTransform([0, height], inv);
        var ul = Util.applyTransform([width, 0], inv);
        var ur = Util.applyTransform([width, height], inv);

        var x0 = Math.min(bl[0], br[0], ul[0], ur[0]);
        var y0 = Math.min(bl[1], br[1], ul[1], ur[1]);
        var x1 = Math.max(bl[0], br[0], ul[0], ur[0]);
        var y1 = Math.max(bl[1], br[1], ul[1], ur[1]);

        this.ctx.fillRect(x0, y0, x1 - x0, y1 - y0);
      } else {
        // HACK to draw the gradient onto an infinite rectangle.
        // PDF gradients are drawn across the entire image while
        // Canvas only allows gradients to be drawn in a rectangle
        // The following bug should allow us to remove this.
        // https://bugzilla.mozilla.org/show_bug.cgi?id=664884

        this.ctx.fillRect(-1e10, -1e10, 2e10, 2e10);
      }

      this.restore();
    },

    // Images
    beginInlineImage: function CanvasGraphics_beginInlineImage() {
      error('Should not call beginInlineImage');
    },
    beginImageData: function CanvasGraphics_beginImageData() {
      error('Should not call beginImageData');
    },

    paintFormXObjectBegin: function CanvasGraphics_paintFormXObjectBegin(matrix,
                                                                        bbox) {
      this.save();
      this.baseTransformStack.push(this.baseTransform);

      if (isArray(matrix) && 6 === matrix.length) {
        this.transform.apply(this, matrix);
      }

      this.baseTransform = this.ctx.mozCurrentTransform;

      if (isArray(bbox) && 4 === bbox.length) {
        var width = bbox[2] - bbox[0];
        var height = bbox[3] - bbox[1];
        this.ctx.rect(bbox[0], bbox[1], width, height);
        this.clip();
        this.endPath();
      }
    },

    paintFormXObjectEnd: function CanvasGraphics_paintFormXObjectEnd() {
      this.restore();
      this.baseTransform = this.baseTransformStack.pop();
    },

    beginGroup: function CanvasGraphics_beginGroup(group) {
      this.save();
      var currentCtx = this.ctx;
      // TODO non-isolated groups - according to Rik at adobe non-isolated
      // group results aren't usually that different and they even have tools
      // that ignore this setting. Notes from Rik on implmenting:
      // - When you encounter an transparency group, create a new canvas with
      // the dimensions of the bbox
      // - copy the content from the previous canvas to the new canvas
      // - draw as usual
      // - remove the backdrop alpha:
      // alphaNew = 1 - (1 - alpha)/(1 - alphaBackdrop) with 'alpha' the alpha
      // value of your transparency group and 'alphaBackdrop' the alpha of the
      // backdrop
      // - remove background color:
      // colorNew = color - alphaNew *colorBackdrop /(1 - alphaNew)
      if (!group.isolated) {
        info('TODO: Support non-isolated groups.');
      }

      // TODO knockout - supposedly possible with the clever use of compositing
      // modes.
      if (group.knockout) {
        warn('Knockout groups not supported.');
      }

      var currentTransform = currentCtx.mozCurrentTransform;
      if (group.matrix) {
        currentCtx.transform.apply(currentCtx, group.matrix);
      }
      assert(group.bbox, 'Bounding box is required.');

      // Based on the current transform figure out how big the bounding box
      // will actually be.
      var bounds = Util.getAxialAlignedBoundingBox(
                    group.bbox,
                    currentCtx.mozCurrentTransform);
      // Clip the bounding box to the current canvas.
      var canvasBounds = [0,
                          0,
                          currentCtx.canvas.width,
                          currentCtx.canvas.height];
      bounds = Util.intersect(bounds, canvasBounds) || [0, 0, 0, 0];
      // Use ceil in case we're between sizes so we don't create canvas that is
      // too small and make the canvas at least 1x1 pixels.
      var offsetX = Math.floor(bounds[0]);
      var offsetY = Math.floor(bounds[1]);
      var drawnWidth = Math.max(Math.ceil(bounds[2]) - offsetX, 1);
      var drawnHeight = Math.max(Math.ceil(bounds[3]) - offsetY, 1);
      var scaleX = 1, scaleY = 1;
      if (drawnWidth > MAX_GROUP_SIZE) {
        scaleX = drawnWidth / MAX_GROUP_SIZE;
        drawnWidth = MAX_GROUP_SIZE;
      }
      if (drawnHeight > MAX_GROUP_SIZE) {
        scaleY = drawnHeight / MAX_GROUP_SIZE;
        drawnHeight = MAX_GROUP_SIZE;
      }

      var cacheId = 'groupAt' + this.groupLevel;
      if (group.smask) {
        // Using two cache entries is case if masks are used one after another.
        cacheId +=  '_smask_' + ((this.smaskCounter++) % 2);
      }
      var scratchCanvas = CachedCanvases.getCanvas(
        cacheId, drawnWidth, drawnHeight, true);
      var groupCtx = scratchCanvas.context;

      // Since we created a new canvas that is just the size of the bounding box
      // we have to translate the group ctx.
      groupCtx.scale(1 / scaleX, 1 / scaleY);
      groupCtx.translate(-offsetX, -offsetY);
      groupCtx.transform.apply(groupCtx, currentTransform);

      if (group.smask) {
        // Saving state and cached mask to be used in setGState.
        this.smaskStack.push({
          canvas: scratchCanvas.canvas,
          context: groupCtx,
          offsetX: offsetX,
          offsetY: offsetY,
          scaleX: scaleX,
          scaleY: scaleY,
          subtype: group.smask.subtype,
          backdrop: group.smask.backdrop
        });
      } else {
        // Setup the current ctx so when the group is popped we draw it at the
        // right location.
        currentCtx.setTransform(1, 0, 0, 1, 0, 0);
        currentCtx.translate(offsetX, offsetY);
        currentCtx.scale(scaleX, scaleY);
      }
      // The transparency group inherits all off the current graphics state
      // except the blend mode, soft mask, and alpha constants.
      copyCtxState(currentCtx, groupCtx);
      this.ctx = groupCtx;
      this.setGState([
        ['BM', 'Normal'],
        ['ca', 1],
        ['CA', 1]
      ]);
      this.groupStack.push(currentCtx);
      this.groupLevel++;
    },

    endGroup: function CanvasGraphics_endGroup(group) {
      this.groupLevel--;
      var groupCtx = this.ctx;
      this.ctx = this.groupStack.pop();
      // Turn off image smoothing to avoid sub pixel interpolation which can
      // look kind of blurry for some pdfs.
      if (this.ctx.imageSmoothingEnabled !== undefined) {
        this.ctx.imageSmoothingEnabled = false;
      } else {
        this.ctx.mozImageSmoothingEnabled = false;
      }
      if (group.smask) {
        this.tempSMask = this.smaskStack.pop();
      } else {
        this.ctx.drawImage(groupCtx.canvas, 0, 0);
      }
      this.restore();
    },

    beginAnnotations: function CanvasGraphics_beginAnnotations() {
      this.save();
      this.current = new CanvasExtraState();
    },

    endAnnotations: function CanvasGraphics_endAnnotations() {
      this.restore();
    },

    beginAnnotation: function CanvasGraphics_beginAnnotation(rect, transform,
                                                             matrix) {
      this.save();

      if (isArray(rect) && 4 === rect.length) {
        var width = rect[2] - rect[0];
        var height = rect[3] - rect[1];
        this.ctx.rect(rect[0], rect[1], width, height);
        this.clip();
        this.endPath();
      }

      this.transform.apply(this, transform);
      this.transform.apply(this, matrix);
    },

    endAnnotation: function CanvasGraphics_endAnnotation() {
      this.restore();
    },

    paintJpegXObject: function CanvasGraphics_paintJpegXObject(objId, w, h) {
      var domImage = this.objs.get(objId);
      if (!domImage) {
        warn('Dependent image isn\'t ready yet');
        return;
      }

      this.save();

      var ctx = this.ctx;
      // scale the image to the unit square
      ctx.scale(1 / w, -1 / h);

      ctx.drawImage(domImage, 0, 0, domImage.width, domImage.height,
                    0, -h, w, h);
      if (this.imageLayer) {
        var currentTransform = ctx.mozCurrentTransformInverse;
        var position = this.getCanvasPosition(0, 0);
        this.imageLayer.appendImage({
          objId: objId,
          left: position[0],
          top: position[1],
          width: w / currentTransform[0],
          height: h / currentTransform[3]
        });
      }
      this.restore();
    },

    paintImageMaskXObject: function CanvasGraphics_paintImageMaskXObject(img) {
      var ctx = this.ctx;
      var width = img.width, height = img.height;
      var fillColor = this.current.fillColor;
      var isPatternFill = this.current.patternFill;

      var glyph = this.processingType3;

      if (COMPILE_TYPE3_GLYPHS && glyph && glyph.compiled === undefined) {
        if (width <= MAX_SIZE_TO_COMPILE && height <= MAX_SIZE_TO_COMPILE) {
          glyph.compiled =
            compileType3Glyph({data: img.data, width: width, height: height});
        } else {
          glyph.compiled = null;
        }
      }

      if (glyph && glyph.compiled) {
        glyph.compiled(ctx);
        return;
      }

      var maskCanvas = CachedCanvases.getCanvas('maskCanvas', width, height);
      var maskCtx = maskCanvas.context;
      maskCtx.save();

      putBinaryImageMask(maskCtx, img);

      maskCtx.globalCompositeOperation = 'source-in';

      maskCtx.fillStyle = isPatternFill ?
                          fillColor.getPattern(maskCtx, this) : fillColor;
      maskCtx.fillRect(0, 0, width, height);

      maskCtx.restore();

      this.paintInlineImageXObject(maskCanvas.canvas);
    },

    paintImageMaskXObjectRepeat:
      function CanvasGraphics_paintImageMaskXObjectRepeat(imgData, scaleX,
                                                          scaleY, positions) {
      var width = imgData.width;
      var height = imgData.height;
      var fillColor = this.current.fillColor;
      var isPatternFill = this.current.patternFill;

      var maskCanvas = CachedCanvases.getCanvas('maskCanvas', width, height);
      var maskCtx = maskCanvas.context;
      maskCtx.save();

      putBinaryImageMask(maskCtx, imgData);

      maskCtx.globalCompositeOperation = 'source-in';

      maskCtx.fillStyle = isPatternFill ?
                          fillColor.getPattern(maskCtx, this) : fillColor;
      maskCtx.fillRect(0, 0, width, height);

      maskCtx.restore();

      var ctx = this.ctx;
      for (var i = 0, ii = positions.length; i < ii; i += 2) {
        ctx.save();
        ctx.transform(scaleX, 0, 0, scaleY, positions[i], positions[i + 1]);
        ctx.scale(1, -1);
        ctx.drawImage(maskCanvas.canvas, 0, 0, width, height,
          0, -1, 1, 1);
        ctx.restore();
      }
    },

    paintImageMaskXObjectGroup:
      function CanvasGraphics_paintImageMaskXObjectGroup(images) {
      var ctx = this.ctx;

      var fillColor = this.current.fillColor;
      var isPatternFill = this.current.patternFill;
      for (var i = 0, ii = images.length; i < ii; i++) {
        var image = images[i];
        var width = image.width, height = image.height;

        var maskCanvas = CachedCanvases.getCanvas('maskCanvas', width, height);
        var maskCtx = maskCanvas.context;
        maskCtx.save();

        putBinaryImageMask(maskCtx, image);

        maskCtx.globalCompositeOperation = 'source-in';

        maskCtx.fillStyle = isPatternFill ?
                            fillColor.getPattern(maskCtx, this) : fillColor;
        maskCtx.fillRect(0, 0, width, height);

        maskCtx.restore();

        ctx.save();
        ctx.transform.apply(ctx, image.transform);
        ctx.scale(1, -1);
        ctx.drawImage(maskCanvas.canvas, 0, 0, width, height,
                      0, -1, 1, 1);
        ctx.restore();
      }
    },

    paintImageXObject: function CanvasGraphics_paintImageXObject(objId) {
      var imgData = this.objs.get(objId);
      if (!imgData) {
        warn('Dependent image isn\'t ready yet');
        return;
      }

      this.paintInlineImageXObject(imgData);
    },

    paintImageXObjectRepeat:
      function CanvasGraphics_paintImageXObjectRepeat(objId, scaleX, scaleY,
                                                          positions) {
      var imgData = this.objs.get(objId);
      if (!imgData) {
        warn('Dependent image isn\'t ready yet');
        return;
      }

      var width = imgData.width;
      var height = imgData.height;
      var map = [];
      for (var i = 0, ii = positions.length; i < ii; i += 2) {
        map.push({transform: [scaleX, 0, 0, scaleY, positions[i],
                 positions[i + 1]], x: 0, y: 0, w: width, h: height});
      }
      this.paintInlineImageXObjectGroup(imgData, map);
    },

    paintInlineImageXObject:
      function CanvasGraphics_paintInlineImageXObject(imgData) {
      var width = imgData.width;
      var height = imgData.height;
      var ctx = this.ctx;

      this.save();
      // scale the image to the unit square
      ctx.scale(1 / width, -1 / height);

      var currentTransform = ctx.mozCurrentTransformInverse;
      var a = currentTransform[0], b = currentTransform[1];
      var widthScale = Math.max(Math.sqrt(a * a + b * b), 1);
      var c = currentTransform[2], d = currentTransform[3];
      var heightScale = Math.max(Math.sqrt(c * c + d * d), 1);

      var imgToPaint, tmpCanvas;
      // instanceof HTMLElement does not work in jsdom node.js module
      if (imgData instanceof HTMLElement || !imgData.data) {
        imgToPaint = imgData;
      } else {
        tmpCanvas = CachedCanvases.getCanvas('inlineImage', width, height);
        var tmpCtx = tmpCanvas.context;
        putBinaryImageData(tmpCtx, imgData);
        imgToPaint = tmpCanvas.canvas;
      }

      var paintWidth = width, paintHeight = height;
      var tmpCanvasId = 'prescale1';
      // Vertial or horizontal scaling shall not be more than 2 to not loose the
      // pixels during drawImage operation, painting on the temporary canvas(es)
      // that are twice smaller in size
      while ((widthScale > 2 && paintWidth > 1) ||
             (heightScale > 2 && paintHeight > 1)) {
        var newWidth = paintWidth, newHeight = paintHeight;
        if (widthScale > 2 && paintWidth > 1) {
          newWidth = Math.ceil(paintWidth / 2);
          widthScale /= paintWidth / newWidth;
        }
        if (heightScale > 2 && paintHeight > 1) {
          newHeight = Math.ceil(paintHeight / 2);
          heightScale /= paintHeight / newHeight;
        }
        tmpCanvas = CachedCanvases.getCanvas(tmpCanvasId, newWidth, newHeight);
        tmpCtx = tmpCanvas.context;
        tmpCtx.clearRect(0, 0, newWidth, newHeight);
        tmpCtx.drawImage(imgToPaint, 0, 0, paintWidth, paintHeight,
                                     0, 0, newWidth, newHeight);
        imgToPaint = tmpCanvas.canvas;
        paintWidth = newWidth;
        paintHeight = newHeight;
        tmpCanvasId = tmpCanvasId === 'prescale1' ? 'prescale2' : 'prescale1';
      }
      ctx.drawImage(imgToPaint, 0, 0, paintWidth, paintHeight,
                                0, -height, width, height);

      if (this.imageLayer) {
        var position = this.getCanvasPosition(0, -height);
        this.imageLayer.appendImage({
          imgData: imgData,
          left: position[0],
          top: position[1],
          width: width / currentTransform[0],
          height: height / currentTransform[3]
        });
      }
      this.restore();
    },

    paintInlineImageXObjectGroup:
      function CanvasGraphics_paintInlineImageXObjectGroup(imgData, map) {
      var ctx = this.ctx;
      var w = imgData.width;
      var h = imgData.height;

      var tmpCanvas = CachedCanvases.getCanvas('inlineImage', w, h);
      var tmpCtx = tmpCanvas.context;
      putBinaryImageData(tmpCtx, imgData);

      for (var i = 0, ii = map.length; i < ii; i++) {
        var entry = map[i];
        ctx.save();
        ctx.transform.apply(ctx, entry.transform);
        ctx.scale(1, -1);
        ctx.drawImage(tmpCanvas.canvas, entry.x, entry.y, entry.w, entry.h,
                      0, -1, 1, 1);
        if (this.imageLayer) {
          var position = this.getCanvasPosition(entry.x, entry.y);
          this.imageLayer.appendImage({
            imgData: imgData,
            left: position[0],
            top: position[1],
            width: w,
            height: h
          });
        }
        ctx.restore();
      }
    },

    paintSolidColorImageMask:
      function CanvasGraphics_paintSolidColorImageMask() {
        this.ctx.fillRect(0, 0, 1, 1);
    },

    // Marked content

    markPoint: function CanvasGraphics_markPoint(tag) {
      // TODO Marked content.
    },
    markPointProps: function CanvasGraphics_markPointProps(tag, properties) {
      // TODO Marked content.
    },
    beginMarkedContent: function CanvasGraphics_beginMarkedContent(tag) {
      // TODO Marked content.
    },
    beginMarkedContentProps: function CanvasGraphics_beginMarkedContentProps(
                                        tag, properties) {
      // TODO Marked content.
    },
    endMarkedContent: function CanvasGraphics_endMarkedContent() {
      // TODO Marked content.
    },

    // Compatibility

    beginCompat: function CanvasGraphics_beginCompat() {
      // TODO ignore undefined operators (should we do that anyway?)
    },
    endCompat: function CanvasGraphics_endCompat() {
      // TODO stop ignoring undefined operators
    },

    // Helper functions

    consumePath: function CanvasGraphics_consumePath() {
      var ctx = this.ctx;
      if (this.pendingClip) {
        if (this.pendingClip === EO_CLIP) {
          if (ctx.mozFillRule !== undefined) {
            ctx.mozFillRule = 'evenodd';
            ctx.clip();
            ctx.mozFillRule = 'nonzero';
          } else {
            try {
              ctx.clip('evenodd');
            } catch (ex) {
              // shouldn't really happen, but browsers might think differently
              ctx.clip();
            }
          }
        } else {
          ctx.clip();
        }
        this.pendingClip = null;
      }
      ctx.beginPath();
    },
    getSinglePixelWidth: function CanvasGraphics_getSinglePixelWidth(scale) {
      if (this.cachedGetSinglePixelWidth === null) {
        var inverse = this.ctx.mozCurrentTransformInverse;
        // max of the current horizontal and vertical scale
        this.cachedGetSinglePixelWidth = Math.sqrt(Math.max(
          (inverse[0] * inverse[0] + inverse[1] * inverse[1]),
          (inverse[2] * inverse[2] + inverse[3] * inverse[3])));
      }
      return this.cachedGetSinglePixelWidth;
    },
    getCanvasPosition: function CanvasGraphics_getCanvasPosition(x, y) {
        var transform = this.ctx.mozCurrentTransform;
        return [
          transform[0] * x + transform[2] * y + transform[4],
          transform[1] * x + transform[3] * y + transform[5]
        ];
    }
  };

  for (var op in OPS) {
    CanvasGraphics.prototype[OPS[op]] = CanvasGraphics.prototype[op];
  }

  return CanvasGraphics;
})();


var WebGLUtils = (function WebGLUtilsClosure() {
  function loadShader(gl, code, shaderType) {
    var shader = gl.createShader(shaderType);
    gl.shaderSource(shader, code);
    gl.compileShader(shader);
    var compiled = gl.getShaderParameter(shader, gl.COMPILE_STATUS);
    if (!compiled) {
      var errorMsg = gl.getShaderInfoLog(shader);
      throw new Error('Error during shader compilation: ' + errorMsg);
    }
    return shader;
  }
  function createVertexShader(gl, code) {
    return loadShader(gl, code, gl.VERTEX_SHADER);
  }
  function createFragmentShader(gl, code) {
    return loadShader(gl, code, gl.FRAGMENT_SHADER);
  }
  function createProgram(gl, shaders) {
    var program = gl.createProgram();
    for (var i = 0, ii = shaders.length; i < ii; ++i) {
      gl.attachShader(program, shaders[i]);
    }
    gl.linkProgram(program);
    var linked = gl.getProgramParameter(program, gl.LINK_STATUS);
    if (!linked) {
      var errorMsg = gl.getProgramInfoLog(program);
      throw new Error('Error during program linking: ' + errorMsg);
    }
    return program;
  }
  function createTexture(gl, image, textureId) {
    gl.activeTexture(textureId);
    var texture = gl.createTexture();
    gl.bindTexture(gl.TEXTURE_2D, texture);

    // Set the parameters so we can render any size image.
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.CLAMP_TO_EDGE);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.NEAREST);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.NEAREST);

    // Upload the image into the texture.
    gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, gl.RGBA, gl.UNSIGNED_BYTE, image);
    return texture;
  }

  var currentGL, currentCanvas;
  function generateGL() {
    if (currentGL) {
      return;
    }
    currentCanvas = document.createElement('canvas');
    currentGL = currentCanvas.getContext('webgl',
      { premultipliedalpha: false });
  }

  var smaskVertexShaderCode = '\
  attribute vec2 a_position;                                    \
  attribute vec2 a_texCoord;                                    \
                                                                \
  uniform vec2 u_resolution;                                    \
                                                                \
  varying vec2 v_texCoord;                                      \
                                                                \
  void main() {                                                 \
    vec2 clipSpace = (a_position / u_resolution) * 2.0 - 1.0;   \
    gl_Position = vec4(clipSpace * vec2(1, -1), 0, 1);          \
                                                                \
    v_texCoord = a_texCoord;                                    \
  }                                                             ';

  var smaskFragmentShaderCode = '\
  precision mediump float;                                      \
                                                                \
  uniform vec4 u_backdrop;                                      \
  uniform int u_subtype;                                        \
  uniform sampler2D u_image;                                    \
  uniform sampler2D u_mask;                                     \
                                                                \
  varying vec2 v_texCoord;                                      \
                                                                \
  void main() {                                                 \
    vec4 imageColor = texture2D(u_image, v_texCoord);           \
    vec4 maskColor = texture2D(u_mask, v_texCoord);             \
    if (u_backdrop.a > 0.0) {                                   \
      maskColor.rgb = maskColor.rgb * maskColor.a +             \
                      u_backdrop.rgb * (1.0 - maskColor.a);     \
    }                                                           \
    float lum;                                                  \
    if (u_subtype == 0) {                                       \
      lum = maskColor.a;                                        \
    } else {                                                    \
      lum = maskColor.r * 0.3 + maskColor.g * 0.59 +            \
            maskColor.b * 0.11;                                 \
    }                                                           \
    imageColor.a *= lum;                                        \
    imageColor.rgb *= imageColor.a;                             \
    gl_FragColor = imageColor;                                  \
  }                                                             ';

  var smaskCache = null;

  function initSmaskGL() {
    var canvas, gl;

    generateGL();
    canvas = currentCanvas;
    currentCanvas = null;
    gl = currentGL;
    currentGL = null;

    // setup a GLSL program
    var vertexShader = createVertexShader(gl, smaskVertexShaderCode);
    var fragmentShader = createFragmentShader(gl, smaskFragmentShaderCode);
    var program = createProgram(gl, [vertexShader, fragmentShader]);
    gl.useProgram(program);

    var cache = {};
    cache.gl = gl;
    cache.canvas = canvas;
    cache.resolutionLocation = gl.getUniformLocation(program, 'u_resolution');
    cache.positionLocation = gl.getAttribLocation(program, 'a_position');
    cache.backdropLocation = gl.getUniformLocation(program, 'u_backdrop');
    cache.subtypeLocation = gl.getUniformLocation(program, 'u_subtype');

    var texCoordLocation = gl.getAttribLocation(program, 'a_texCoord');
    var texLayerLocation = gl.getUniformLocation(program, 'u_image');
    var texMaskLocation = gl.getUniformLocation(program, 'u_mask');

    // provide texture coordinates for the rectangle.
    var texCoordBuffer = gl.createBuffer();
    gl.bindBuffer(gl.ARRAY_BUFFER, texCoordBuffer);
    gl.bufferData(gl.ARRAY_BUFFER, new Float32Array([
      0.0,  0.0,
      1.0,  0.0,
      0.0,  1.0,
      0.0,  1.0,
      1.0,  0.0,
      1.0,  1.0]), gl.STATIC_DRAW);
    gl.enableVertexAttribArray(texCoordLocation);
    gl.vertexAttribPointer(texCoordLocation, 2, gl.FLOAT, false, 0, 0);

    gl.uniform1i(texLayerLocation, 0);
    gl.uniform1i(texMaskLocation, 1);

    smaskCache = cache;
  }

  function composeSMask(layer, mask, properties) {
    var width = layer.width, height = layer.height;

    if (!smaskCache) {
      initSmaskGL();
    }
    var cache = smaskCache,canvas = cache.canvas, gl = cache.gl;
    canvas.width = width;
    canvas.height = height;
    gl.viewport(0, 0, gl.drawingBufferWidth, gl.drawingBufferHeight);
    gl.uniform2f(cache.resolutionLocation, width, height);

    if (properties.backdrop) {
      gl.uniform4f(cache.resolutionLocation, properties.backdrop[0],
                   properties.backdrop[1], properties.backdrop[2], 1);
    } else {
      gl.uniform4f(cache.resolutionLocation, 0, 0, 0, 0);
    }
    gl.uniform1i(cache.subtypeLocation,
                 properties.subtype === 'Luminosity' ? 1 : 0);

    // Create a textures
    var texture = createTexture(gl, layer, gl.TEXTURE0);
    var maskTexture = createTexture(gl, mask, gl.TEXTURE1);


    // Create a buffer and put a single clipspace rectangle in
    // it (2 triangles)
    var buffer = gl.createBuffer();
    gl.bindBuffer(gl.ARRAY_BUFFER, buffer);
    gl.bufferData(gl.ARRAY_BUFFER, new Float32Array([
      0, 0,
      width, 0,
      0, height,
      0, height,
      width, 0,
      width, height]), gl.STATIC_DRAW);
    gl.enableVertexAttribArray(cache.positionLocation);
    gl.vertexAttribPointer(cache.positionLocation, 2, gl.FLOAT, false, 0, 0);

    // draw
    gl.clearColor(0, 0, 0, 0);
    gl.enable(gl.BLEND);
    gl.blendFunc(gl.ONE, gl.ONE_MINUS_SRC_ALPHA);
    gl.clear(gl.COLOR_BUFFER_BIT);

    gl.drawArrays(gl.TRIANGLES, 0, 6);

    gl.flush();

    gl.deleteTexture(texture);
    gl.deleteTexture(maskTexture);
    gl.deleteBuffer(buffer);

    return canvas;
  }

  var figuresVertexShaderCode = '\
  attribute vec2 a_position;                                    \
  attribute vec3 a_color;                                       \
                                                                \
  uniform vec2 u_resolution;                                    \
  uniform vec2 u_scale;                                         \
  uniform vec2 u_offset;                                        \
                                                                \
  varying vec4 v_color;                                         \
                                                                \
  void main() {                                                 \
    vec2 position = (a_position + u_offset) * u_scale;          \
    vec2 clipSpace = (position / u_resolution) * 2.0 - 1.0;     \
    gl_Position = vec4(clipSpace * vec2(1, -1), 0, 1);          \
                                                                \
    v_color = vec4(a_color / 255.0, 1.0);                       \
  }                                                             ';

  var figuresFragmentShaderCode = '\
  precision mediump float;                                      \
                                                                \
  varying vec4 v_color;                                         \
                                                                \
  void main() {                                                 \
    gl_FragColor = v_color;                                     \
  }                                                             ';

  var figuresCache = null;

  function initFiguresGL() {
    var canvas, gl;

    generateGL();
    canvas = currentCanvas;
    currentCanvas = null;
    gl = currentGL;
    currentGL = null;

    // setup a GLSL program
    var vertexShader = createVertexShader(gl, figuresVertexShaderCode);
    var fragmentShader = createFragmentShader(gl, figuresFragmentShaderCode);
    var program = createProgram(gl, [vertexShader, fragmentShader]);
    gl.useProgram(program);

    var cache = {};
    cache.gl = gl;
    cache.canvas = canvas;
    cache.resolutionLocation = gl.getUniformLocation(program, 'u_resolution');
    cache.scaleLocation = gl.getUniformLocation(program, 'u_scale');
    cache.offsetLocation = gl.getUniformLocation(program, 'u_offset');
    cache.positionLocation = gl.getAttribLocation(program, 'a_position');
    cache.colorLocation = gl.getAttribLocation(program, 'a_color');

    figuresCache = cache;
  }

  function drawFigures(width, height, backgroundColor, figures, context) {
    if (!figuresCache) {
      initFiguresGL();
    }
    var cache = figuresCache, canvas = cache.canvas, gl = cache.gl;

    canvas.width = width;
    canvas.height = height;
    gl.viewport(0, 0, gl.drawingBufferWidth, gl.drawingBufferHeight);
    gl.uniform2f(cache.resolutionLocation, width, height);

    // count triangle points
    var count = 0;
    var i, ii, rows;
    for (i = 0, ii = figures.length; i < ii; i++) {
      switch (figures[i].type) {
        case 'lattice':
          rows = (figures[i].coords.length / figures[i].verticesPerRow) | 0;
          count += (rows - 1) * (figures[i].verticesPerRow - 1) * 6;
          break;
        case 'triangles':
          count += figures[i].coords.length;
          break;
      }
    }
    // transfer data
    var coords = new Float32Array(count * 2);
    var colors = new Uint8Array(count * 3);
    var coordsMap = context.coords, colorsMap = context.colors;
    var pIndex = 0, cIndex = 0;
    for (i = 0, ii = figures.length; i < ii; i++) {
      var figure = figures[i], ps = figure.coords, cs = figure.colors;
      switch (figure.type) {
        case 'lattice':
          var cols = figure.verticesPerRow;
          rows = (ps.length / cols) | 0;
          for (var row = 1; row < rows; row++) {
            var offset = row * cols + 1;
            for (var col = 1; col < cols; col++, offset++) {
              coords[pIndex] = coordsMap[ps[offset - cols - 1]];
              coords[pIndex + 1] = coordsMap[ps[offset - cols - 1] + 1];
              coords[pIndex + 2] = coordsMap[ps[offset - cols]];
              coords[pIndex + 3] = coordsMap[ps[offset - cols] + 1];
              coords[pIndex + 4] = coordsMap[ps[offset - 1]];
              coords[pIndex + 5] = coordsMap[ps[offset - 1] + 1];
              colors[cIndex] = colorsMap[cs[offset - cols - 1]];
              colors[cIndex + 1] = colorsMap[cs[offset - cols - 1] + 1];
              colors[cIndex + 2] = colorsMap[cs[offset - cols - 1] + 2];
              colors[cIndex + 3] = colorsMap[cs[offset - cols]];
              colors[cIndex + 4] = colorsMap[cs[offset - cols] + 1];
              colors[cIndex + 5] = colorsMap[cs[offset - cols] + 2];
              colors[cIndex + 6] = colorsMap[cs[offset - 1]];
              colors[cIndex + 7] = colorsMap[cs[offset - 1] + 1];
              colors[cIndex + 8] = colorsMap[cs[offset - 1] + 2];

              coords[pIndex + 6] = coords[pIndex + 2];
              coords[pIndex + 7] = coords[pIndex + 3];
              coords[pIndex + 8] = coords[pIndex + 4];
              coords[pIndex + 9] = coords[pIndex + 5];
              coords[pIndex + 10] = coordsMap[ps[offset]];
              coords[pIndex + 11] = coordsMap[ps[offset] + 1];
              colors[cIndex + 9] = colors[cIndex + 3];
              colors[cIndex + 10] = colors[cIndex + 4];
              colors[cIndex + 11] = colors[cIndex + 5];
              colors[cIndex + 12] = colors[cIndex + 6];
              colors[cIndex + 13] = colors[cIndex + 7];
              colors[cIndex + 14] = colors[cIndex + 8];
              colors[cIndex + 15] = colorsMap[cs[offset]];
              colors[cIndex + 16] = colorsMap[cs[offset] + 1];
              colors[cIndex + 17] = colorsMap[cs[offset] + 2];
              pIndex += 12;
              cIndex += 18;
            }
          }
          break;
        case 'triangles':
          for (var j = 0, jj = ps.length; j < jj; j++) {
            coords[pIndex] = coordsMap[ps[j]];
            coords[pIndex + 1] = coordsMap[ps[j] + 1];
            colors[cIndex] = colorsMap[cs[i]];
            colors[cIndex + 1] = colorsMap[cs[j] + 1];
            colors[cIndex + 2] = colorsMap[cs[j] + 2];
            pIndex += 2;
            cIndex += 3;
          }
          break;
      }
    }

    // draw
    if (backgroundColor) {
      gl.clearColor(backgroundColor[0] / 255, backgroundColor[1] / 255,
                    backgroundColor[2] / 255, 1.0);
    } else {
      gl.clearColor(0, 0, 0, 0);
    }
    gl.clear(gl.COLOR_BUFFER_BIT);

    var coordsBuffer = gl.createBuffer();
    gl.bindBuffer(gl.ARRAY_BUFFER, coordsBuffer);
    gl.bufferData(gl.ARRAY_BUFFER, coords, gl.STATIC_DRAW);
    gl.enableVertexAttribArray(cache.positionLocation);
    gl.vertexAttribPointer(cache.positionLocation, 2, gl.FLOAT, false, 0, 0);

    var colorsBuffer = gl.createBuffer();
    gl.bindBuffer(gl.ARRAY_BUFFER, colorsBuffer);
    gl.bufferData(gl.ARRAY_BUFFER, colors, gl.STATIC_DRAW);
    gl.enableVertexAttribArray(cache.colorLocation);
    gl.vertexAttribPointer(cache.colorLocation, 3, gl.UNSIGNED_BYTE, false,
                           0, 0);

    gl.uniform2f(cache.scaleLocation, context.scaleX, context.scaleY);
    gl.uniform2f(cache.offsetLocation, context.offsetX, context.offsetY);

    gl.drawArrays(gl.TRIANGLES, 0, count);

    gl.flush();

    gl.deleteBuffer(coordsBuffer);
    gl.deleteBuffer(colorsBuffer);

    return canvas;
  }

  function cleanup() {
    if (smaskCache && smaskCache.canvas) {
      smaskCache.canvas.width = 0;
      smaskCache.canvas.height = 0;
    }
    if (figuresCache && figuresCache.canvas) {
      figuresCache.canvas.width = 0;
      figuresCache.canvas.height = 0;
    }
    smaskCache = null;
    figuresCache = null;
  }

  return {
    get isEnabled() {
      if (PDFJS.disableWebGL) {
        return false;
      }
      var enabled = false;
      try {
        generateGL();
        enabled = !!currentGL;
      } catch (e) { }
      return shadow(this, 'isEnabled', enabled);
    },
    composeSMask: composeSMask,
    drawFigures: drawFigures,
    clear: cleanup
  };
})();


var ShadingIRs = {};

ShadingIRs.RadialAxial = {
  fromIR: function RadialAxial_fromIR(raw) {
    var type = raw[1];
    var colorStops = raw[2];
    var p0 = raw[3];
    var p1 = raw[4];
    var r0 = raw[5];
    var r1 = raw[6];
    return {
      type: 'Pattern',
      getPattern: function RadialAxial_getPattern(ctx) {
        var grad;
        if (type === 'axial') {
          grad = ctx.createLinearGradient(p0[0], p0[1], p1[0], p1[1]);
        } else if (type === 'radial') {
          grad = ctx.createRadialGradient(p0[0], p0[1], r0, p1[0], p1[1], r1);
        }

        for (var i = 0, ii = colorStops.length; i < ii; ++i) {
          var c = colorStops[i];
          grad.addColorStop(c[0], c[1]);
        }
        return grad;
      }
    };
  }
};

var createMeshCanvas = (function createMeshCanvasClosure() {
  function drawTriangle(data, context, p1, p2, p3, c1, c2, c3) {
    // Very basic Gouraud-shaded triangle rasterization algorithm.
    var coords = context.coords, colors = context.colors;
    var bytes = data.data, rowSize = data.width * 4;
    var tmp;
    if (coords[p1 + 1] > coords[p2 + 1]) {
      tmp = p1; p1 = p2; p2 = tmp; tmp = c1; c1 = c2; c2 = tmp;
    }
    if (coords[p2 + 1] > coords[p3 + 1]) {
      tmp = p2; p2 = p3; p3 = tmp; tmp = c2; c2 = c3; c3 = tmp;
    }
    if (coords[p1 + 1] > coords[p2 + 1]) {
      tmp = p1; p1 = p2; p2 = tmp; tmp = c1; c1 = c2; c2 = tmp;
    }
    var x1 = (coords[p1] + context.offsetX) * context.scaleX;
    var y1 = (coords[p1 + 1] + context.offsetY) * context.scaleY;
    var x2 = (coords[p2] + context.offsetX) * context.scaleX;
    var y2 = (coords[p2 + 1] + context.offsetY) * context.scaleY;
    var x3 = (coords[p3] + context.offsetX) * context.scaleX;
    var y3 = (coords[p3 + 1] + context.offsetY) * context.scaleY;
    if (y1 >= y3) {
      return;
    }
    var c1r = colors[c1], c1g = colors[c1 + 1], c1b = colors[c1 + 2];
    var c2r = colors[c2], c2g = colors[c2 + 1], c2b = colors[c2 + 2];
    var c3r = colors[c3], c3g = colors[c3 + 1], c3b = colors[c3 + 2];

    var minY = Math.round(y1), maxY = Math.round(y3);
    var xa, car, cag, cab;
    var xb, cbr, cbg, cbb;
    var k;
    for (var y = minY; y <= maxY; y++) {
      if (y < y2) {
        k = y < y1 ? 0 : y1 === y2 ? 1 : (y1 - y) / (y1 - y2);
        xa = x1 - (x1 - x2) * k;
        car = c1r - (c1r - c2r) * k;
        cag = c1g - (c1g - c2g) * k;
        cab = c1b - (c1b - c2b) * k;
      } else {
        k = y > y3 ? 1 : y2 === y3 ? 0 : (y2 - y) / (y2 - y3);
        xa = x2 - (x2 - x3) * k;
        car = c2r - (c2r - c3r) * k;
        cag = c2g - (c2g - c3g) * k;
        cab = c2b - (c2b - c3b) * k;
      }
      k = y < y1 ? 0 : y > y3 ? 1 : (y1 - y) / (y1 - y3);
      xb = x1 - (x1 - x3) * k;
      cbr = c1r - (c1r - c3r) * k;
      cbg = c1g - (c1g - c3g) * k;
      cbb = c1b - (c1b - c3b) * k;
      var x1_ = Math.round(Math.min(xa, xb));
      var x2_ = Math.round(Math.max(xa, xb));
      var j = rowSize * y + x1_ * 4;
      for (var x = x1_; x <= x2_; x++) {
        k = (xa - x) / (xa - xb);
        k = k < 0 ? 0 : k > 1 ? 1 : k;
        bytes[j++] = (car - (car - cbr) * k) | 0;
        bytes[j++] = (cag - (cag - cbg) * k) | 0;
        bytes[j++] = (cab - (cab - cbb) * k) | 0;
        bytes[j++] = 255;
      }
    }
  }

  function drawFigure(data, figure, context) {
    var ps = figure.coords;
    var cs = figure.colors;
    var i, ii;
    switch (figure.type) {
      case 'lattice':
        var verticesPerRow = figure.verticesPerRow;
        var rows = Math.floor(ps.length / verticesPerRow) - 1;
        var cols = verticesPerRow - 1;
        for (i = 0; i < rows; i++) {
          var q = i * verticesPerRow;
          for (var j = 0; j < cols; j++, q++) {
            drawTriangle(data, context,
              ps[q], ps[q + 1], ps[q + verticesPerRow],
              cs[q], cs[q + 1], cs[q + verticesPerRow]);
            drawTriangle(data, context,
              ps[q + verticesPerRow + 1], ps[q + 1], ps[q + verticesPerRow],
              cs[q + verticesPerRow + 1], cs[q + 1], cs[q + verticesPerRow]);
          }
        }
        break;
      case 'triangles':
        for (i = 0, ii = ps.length; i < ii; i += 3) {
          drawTriangle(data, context,
            ps[i], ps[i + 1], ps[i + 2],
            cs[i], cs[i + 1], cs[i + 2]);
        }
        break;
      default:
        error('illigal figure');
        break;
    }
  }

  function createMeshCanvas(bounds, combinesScale, coords, colors, figures,
                            backgroundColor) {
    // we will increase scale on some weird factor to let antialiasing take
    // care of "rough" edges
    var EXPECTED_SCALE = 1.1;
    // MAX_PATTERN_SIZE is used to avoid OOM situation.
    var MAX_PATTERN_SIZE = 3000; // 10in @ 300dpi shall be enough

    var offsetX = Math.floor(bounds[0]);
    var offsetY = Math.floor(bounds[1]);
    var boundsWidth = Math.ceil(bounds[2]) - offsetX;
    var boundsHeight = Math.ceil(bounds[3]) - offsetY;

    var width = Math.min(Math.ceil(Math.abs(boundsWidth * combinesScale[0] *
      EXPECTED_SCALE)), MAX_PATTERN_SIZE);
    var height = Math.min(Math.ceil(Math.abs(boundsHeight * combinesScale[1] *
      EXPECTED_SCALE)), MAX_PATTERN_SIZE);
    var scaleX = boundsWidth / width;
    var scaleY = boundsHeight / height;

    var context = {
      coords: coords,
      colors: colors,
      offsetX: -offsetX,
      offsetY: -offsetY,
      scaleX: 1 / scaleX,
      scaleY: 1 / scaleY
    };

    var canvas, tmpCanvas, i, ii;
    if (WebGLUtils.isEnabled) {
      canvas = WebGLUtils.drawFigures(width, height, backgroundColor,
                                      figures, context);

      // https://bugzilla.mozilla.org/show_bug.cgi?id=972126
      tmpCanvas = CachedCanvases.getCanvas('mesh', width, height, false);
      tmpCanvas.context.drawImage(canvas, 0, 0);
      canvas = tmpCanvas.canvas;
    } else {
      tmpCanvas = CachedCanvases.getCanvas('mesh', width, height, false);
      var tmpCtx = tmpCanvas.context;

      var data = tmpCtx.createImageData(width, height);
      if (backgroundColor) {
        var bytes = data.data;
        for (i = 0, ii = bytes.length; i < ii; i += 4) {
          bytes[i] = backgroundColor[0];
          bytes[i + 1] = backgroundColor[1];
          bytes[i + 2] = backgroundColor[2];
          bytes[i + 3] = 255;
        }
      }
      for (i = 0; i < figures.length; i++) {
        drawFigure(data, figures[i], context);
      }
      tmpCtx.putImageData(data, 0, 0);
      canvas = tmpCanvas.canvas;
    }

    return {canvas: canvas, offsetX: offsetX, offsetY: offsetY,
            scaleX: scaleX, scaleY: scaleY};
  }
  return createMeshCanvas;
})();

ShadingIRs.Mesh = {
  fromIR: function Mesh_fromIR(raw) {
    //var type = raw[1];
    var coords = raw[2];
    var colors = raw[3];
    var figures = raw[4];
    var bounds = raw[5];
    var matrix = raw[6];
    //var bbox = raw[7];
    var background = raw[8];
    return {
      type: 'Pattern',
      getPattern: function Mesh_getPattern(ctx, owner, shadingFill) {
        var scale;
        if (shadingFill) {
          scale = Util.singularValueDecompose2dScale(ctx.mozCurrentTransform);
        } else {
          // Obtain scale from matrix and current transformation matrix.
          scale = Util.singularValueDecompose2dScale(owner.baseTransform);
          if (matrix) {
            var matrixScale = Util.singularValueDecompose2dScale(matrix);
            scale = [scale[0] * matrixScale[0],
                     scale[1] * matrixScale[1]];
          }
        }


        // Rasterizing on the main thread since sending/queue large canvases
        // might cause OOM.
        var temporaryPatternCanvas = createMeshCanvas(bounds, scale, coords,
          colors, figures, shadingFill ? null : background);

        if (!shadingFill) {
          ctx.setTransform.apply(ctx, owner.baseTransform);
          if (matrix) {
            ctx.transform.apply(ctx, matrix);
          }
        }

        ctx.translate(temporaryPatternCanvas.offsetX,
                      temporaryPatternCanvas.offsetY);
        ctx.scale(temporaryPatternCanvas.scaleX,
                  temporaryPatternCanvas.scaleY);

        return ctx.createPattern(temporaryPatternCanvas.canvas, 'no-repeat');
      }
    };
  }
};

ShadingIRs.Dummy = {
  fromIR: function Dummy_fromIR() {
    return {
      type: 'Pattern',
      getPattern: function Dummy_fromIR_getPattern() {
        return 'hotpink';
      }
    };
  }
};

function getShadingPatternFromIR(raw) {
  var shadingIR = ShadingIRs[raw[0]];
  if (!shadingIR) {
    error('Unknown IR type: ' + raw[0]);
  }
  return shadingIR.fromIR(raw);
}

var TilingPattern = (function TilingPatternClosure() {
  var PaintType = {
    COLORED: 1,
    UNCOLORED: 2
  };

  var MAX_PATTERN_SIZE = 3000; // 10in @ 300dpi shall be enough

  function TilingPattern(IR, color, ctx, objs, commonObjs, baseTransform) {
    this.operatorList = IR[2];
    this.matrix = IR[3] || [1, 0, 0, 1, 0, 0];
    this.bbox = IR[4];
    this.xstep = IR[5];
    this.ystep = IR[6];
    this.paintType = IR[7];
    this.tilingType = IR[8];
    this.color = color;
    this.objs = objs;
    this.commonObjs = commonObjs;
    this.baseTransform = baseTransform;
    this.type = 'Pattern';
    this.ctx = ctx;
  }

  TilingPattern.prototype = {
    createPatternCanvas: function TilinPattern_createPatternCanvas(owner) {
      var operatorList = this.operatorList;
      var bbox = this.bbox;
      var xstep = this.xstep;
      var ystep = this.ystep;
      var paintType = this.paintType;
      var tilingType = this.tilingType;
      var color = this.color;
      var objs = this.objs;
      var commonObjs = this.commonObjs;

      info('TilingType: ' + tilingType);

      var x0 = bbox[0], y0 = bbox[1], x1 = bbox[2], y1 = bbox[3];

      var topLeft = [x0, y0];
      // we want the canvas to be as large as the step size
      var botRight = [x0 + xstep, y0 + ystep];

      var width = botRight[0] - topLeft[0];
      var height = botRight[1] - topLeft[1];

      // Obtain scale from matrix and current transformation matrix.
      var matrixScale = Util.singularValueDecompose2dScale(this.matrix);
      var curMatrixScale = Util.singularValueDecompose2dScale(
        this.baseTransform);
      var combinedScale = [matrixScale[0] * curMatrixScale[0],
        matrixScale[1] * curMatrixScale[1]];

      // MAX_PATTERN_SIZE is used to avoid OOM situation.
      // Use width and height values that are as close as possible to the end
      // result when the pattern is used. Too low value makes the pattern look
      // blurry. Too large value makes it look too crispy.
      width = Math.min(Math.ceil(Math.abs(width * combinedScale[0])),
        MAX_PATTERN_SIZE);

      height = Math.min(Math.ceil(Math.abs(height * combinedScale[1])),
        MAX_PATTERN_SIZE);

      var tmpCanvas = CachedCanvases.getCanvas('pattern', width, height, true);
      var tmpCtx = tmpCanvas.context;
      var graphics = new CanvasGraphics(tmpCtx, commonObjs, objs);
      graphics.groupLevel = owner.groupLevel;

      this.setFillAndStrokeStyleToContext(tmpCtx, paintType, color);

      this.setScale(width, height, xstep, ystep);
      this.transformToScale(graphics);

      // transform coordinates to pattern space
      var tmpTranslate = [1, 0, 0, 1, -topLeft[0], -topLeft[1]];
      graphics.transform.apply(graphics, tmpTranslate);

      this.clipBbox(graphics, bbox, x0, y0, x1, y1);

      graphics.executeOperatorList(operatorList);
      return tmpCanvas.canvas;
    },

    setScale: function TilingPattern_setScale(width, height, xstep, ystep) {
      this.scale = [width / xstep, height / ystep];
    },

    transformToScale: function TilingPattern_transformToScale(graphics) {
      var scale = this.scale;
      var tmpScale = [scale[0], 0, 0, scale[1], 0, 0];
      graphics.transform.apply(graphics, tmpScale);
    },

    scaleToContext: function TilingPattern_scaleToContext() {
      var scale = this.scale;
      this.ctx.scale(1 / scale[0], 1 / scale[1]);
    },

    clipBbox: function clipBbox(graphics, bbox, x0, y0, x1, y1) {
      if (bbox && isArray(bbox) && bbox.length === 4) {
        var bboxWidth = x1 - x0;
        var bboxHeight = y1 - y0;
        graphics.ctx.rect(x0, y0, bboxWidth, bboxHeight);
        graphics.clip();
        graphics.endPath();
      }
    },

    setFillAndStrokeStyleToContext:
      function setFillAndStrokeStyleToContext(context, paintType, color) {
        switch (paintType) {
          case PaintType.COLORED:
            var ctx = this.ctx;
            context.fillStyle = ctx.fillStyle;
            context.strokeStyle = ctx.strokeStyle;
            break;
          case PaintType.UNCOLORED:
            var cssColor = Util.makeCssRgb(color[0], color[1], color[2]);
            context.fillStyle = cssColor;
            context.strokeStyle = cssColor;
            break;
          default:
            error('Unsupported paint type: ' + paintType);
        }
      },

    getPattern: function TilingPattern_getPattern(ctx, owner) {
      var temporaryPatternCanvas = this.createPatternCanvas(owner);

      ctx = this.ctx;
      ctx.setTransform.apply(ctx, this.baseTransform);
      ctx.transform.apply(ctx, this.matrix);
      this.scaleToContext();

      return ctx.createPattern(temporaryPatternCanvas, 'repeat');
    }
  };

  return TilingPattern;
})();


PDFJS.disableFontFace = false;

var FontLoader = {
  insertRule: function fontLoaderInsertRule(rule) {
    var styleElement = document.getElementById('PDFJS_FONT_STYLE_TAG');
    if (!styleElement) {
      styleElement = document.createElement('style');
      styleElement.id = 'PDFJS_FONT_STYLE_TAG';
      document.documentElement.getElementsByTagName('head')[0].appendChild(
        styleElement);
    }

    var styleSheet = styleElement.sheet;
    styleSheet.insertRule(rule, styleSheet.cssRules.length);
  },

  clear: function fontLoaderClear() {
    var styleElement = document.getElementById('PDFJS_FONT_STYLE_TAG');
    if (styleElement) {
      styleElement.parentNode.removeChild(styleElement);
    }
    this.nativeFontFaces.forEach(function(nativeFontFace) {
      document.fonts.delete(nativeFontFace);
    });
    this.nativeFontFaces.length = 0;
  },
  get loadTestFont() {
    // This is a CFF font with 1 glyph for '.' that fills its entire width and
    // height.
    return shadow(this, 'loadTestFont', atob(
      'T1RUTwALAIAAAwAwQ0ZGIDHtZg4AAAOYAAAAgUZGVE1lkzZwAAAEHAAAABxHREVGABQAFQ' +
      'AABDgAAAAeT1MvMlYNYwkAAAEgAAAAYGNtYXABDQLUAAACNAAAAUJoZWFk/xVFDQAAALwA' +
      'AAA2aGhlYQdkA+oAAAD0AAAAJGhtdHgD6AAAAAAEWAAAAAZtYXhwAAJQAAAAARgAAAAGbm' +
      'FtZVjmdH4AAAGAAAAAsXBvc3T/hgAzAAADeAAAACAAAQAAAAEAALZRFsRfDzz1AAsD6AAA' +
      'AADOBOTLAAAAAM4KHDwAAAAAA+gDIQAAAAgAAgAAAAAAAAABAAADIQAAAFoD6AAAAAAD6A' +
      'ABAAAAAAAAAAAAAAAAAAAAAQAAUAAAAgAAAAQD6AH0AAUAAAKKArwAAACMAooCvAAAAeAA' +
      'MQECAAACAAYJAAAAAAAAAAAAAQAAAAAAAAAAAAAAAFBmRWQAwAAuAC4DIP84AFoDIQAAAA' +
      'AAAQAAAAAAAAAAACAAIAABAAAADgCuAAEAAAAAAAAAAQAAAAEAAAAAAAEAAQAAAAEAAAAA' +
      'AAIAAQAAAAEAAAAAAAMAAQAAAAEAAAAAAAQAAQAAAAEAAAAAAAUAAQAAAAEAAAAAAAYAAQ' +
      'AAAAMAAQQJAAAAAgABAAMAAQQJAAEAAgABAAMAAQQJAAIAAgABAAMAAQQJAAMAAgABAAMA' +
      'AQQJAAQAAgABAAMAAQQJAAUAAgABAAMAAQQJAAYAAgABWABYAAAAAAAAAwAAAAMAAAAcAA' +
      'EAAAAAADwAAwABAAAAHAAEACAAAAAEAAQAAQAAAC7//wAAAC7////TAAEAAAAAAAABBgAA' +
      'AQAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAEAAAAAAA' +
      'AAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAA' +
      'AAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAA' +
      'AAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAA' +
      'AAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAMAAA' +
      'AAAAD/gwAyAAAAAQAAAAAAAAAAAAAAAAAAAAABAAQEAAEBAQJYAAEBASH4DwD4GwHEAvgc' +
      'A/gXBIwMAYuL+nz5tQXkD5j3CBLnEQACAQEBIVhYWFhYWFhYWFhYWFhYWFhYWFhYWFhYWF' +
      'hYWFhYWFhYAAABAQAADwACAQEEE/t3Dov6fAH6fAT+fPp8+nwHDosMCvm1Cvm1DAz6fBQA' +
      'AAAAAAABAAAAAMmJbzEAAAAAzgTjFQAAAADOBOQpAAEAAAAAAAAADAAUAAQAAAABAAAAAg' +
      'ABAAAAAAAAAAAD6AAAAAAAAA=='
    ));
  },

  loadTestFontId: 0,

  loadingContext: {
    requests: [],
    nextRequestId: 0
  },

  isSyncFontLoadingSupported: (function detectSyncFontLoadingSupport() {
    if (isWorker) {
      return false;
    }

    // User agent string sniffing is bad, but there is no reliable way to tell
    // if font is fully loaded and ready to be used with canvas.
    var userAgent = window.navigator.userAgent;
    var m = /Mozilla\/5.0.*?rv:(\d+).*? Gecko/.exec(userAgent);
    if (m && m[1] >= 14) {
      return true;
    }
    // TODO other browsers
    if (userAgent === 'node') {
      return true;
    }
    return false;
  })(),

  nativeFontFaces: [],

  isFontLoadingAPISupported: (!isWorker && typeof document !== 'undefined' &&
                              !!document.fonts),

  addNativeFontFace: function fontLoader_addNativeFontFace(nativeFontFace) {
    this.nativeFontFaces.push(nativeFontFace);
    document.fonts.add(nativeFontFace);
  },

  bind: function fontLoaderBind(fonts, callback) {
    assert(!isWorker, 'bind() shall be called from main thread');

    var rules = [];
    var fontsToLoad = [];
    var fontLoadPromises = [];
    for (var i = 0, ii = fonts.length; i < ii; i++) {
      var font = fonts[i];

      // Add the font to the DOM only once or skip if the font
      // is already loaded.
      if (font.attached || font.loading === false) {
        continue;
      }
      font.attached = true;

      if (this.isFontLoadingAPISupported) {
        var nativeFontFace = font.createNativeFontFace();
        if (nativeFontFace) {
          fontLoadPromises.push(nativeFontFace.loaded);
        }
      } else {
        var rule = font.bindDOM();
        if (rule) {
          rules.push(rule);
          fontsToLoad.push(font);
        }
      }
    }

    var request = FontLoader.queueLoadingCallback(callback);
    if (this.isFontLoadingAPISupported) {
      Promise.all(fontsToLoad).then(function() {
        request.complete();
      });
    } else if (rules.length > 0 && !this.isSyncFontLoadingSupported) {
      FontLoader.prepareFontLoadEvent(rules, fontsToLoad, request);
    } else {
      request.complete();
    }
  },

  queueLoadingCallback: function FontLoader_queueLoadingCallback(callback) {
    function LoadLoader_completeRequest() {
      assert(!request.end, 'completeRequest() cannot be called twice');
      request.end = Date.now();

      // sending all completed requests in order how they were queued
      while (context.requests.length > 0 && context.requests[0].end) {
        var otherRequest = context.requests.shift();
        setTimeout(otherRequest.callback, 0);
      }
    }

    var context = FontLoader.loadingContext;
    var requestId = 'pdfjs-font-loading-' + (context.nextRequestId++);
    var request = {
      id: requestId,
      complete: LoadLoader_completeRequest,
      callback: callback,
      started: Date.now()
    };
    context.requests.push(request);
    return request;
  },

  prepareFontLoadEvent: function fontLoaderPrepareFontLoadEvent(rules,
                                                                fonts,
                                                                request) {
      /** Hack begin */
      // There's currently no event when a font has finished downloading so the
      // following code is a dirty hack to 'guess' when a font is
      // ready. It's assumed fonts are loaded in order, so add a known test
      // font after the desired fonts and then test for the loading of that
      // test font.

      function int32(data, offset) {
        return (data.charCodeAt(offset) << 24) |
               (data.charCodeAt(offset + 1) << 16) |
               (data.charCodeAt(offset + 2) << 8) |
               (data.charCodeAt(offset + 3) & 0xff);
      }

      function spliceString(s, offset, remove, insert) {
        var chunk1 = s.substr(0, offset);
        var chunk2 = s.substr(offset + remove);
        return chunk1 + insert + chunk2;
      }

      var i, ii;

      var canvas = document.createElement('canvas');
      canvas.width = 1;
      canvas.height = 1;
      var ctx = canvas.getContext('2d');

      var called = 0;
      function isFontReady(name, callback) {
        called++;
        // With setTimeout clamping this gives the font ~100ms to load.
        if(called > 30) {
          warn('Load test font never loaded.');
          callback();
          return;
        }
        ctx.font = '30px ' + name;
        ctx.fillText('.', 0, 20);
        var imageData = ctx.getImageData(0, 0, 1, 1);
        if (imageData.data[3] > 0) {
          callback();
          return;
        }
        setTimeout(isFontReady.bind(null, name, callback));
      }

      var loadTestFontId = 'lt' + Date.now() + this.loadTestFontId++;
      // Chromium seems to cache fonts based on a hash of the actual font data,
      // so the font must be modified for each load test else it will appear to
      // be loaded already.
      // TODO: This could maybe be made faster by avoiding the btoa of the full
      // font by splitting it in chunks before hand and padding the font id.
      var data = this.loadTestFont;
      var COMMENT_OFFSET = 976; // has to be on 4 byte boundary (for checksum)
      data = spliceString(data, COMMENT_OFFSET, loadTestFontId.length,
                          loadTestFontId);
      // CFF checksum is important for IE, adjusting it
      var CFF_CHECKSUM_OFFSET = 16;
      var XXXX_VALUE = 0x58585858; // the "comment" filled with 'X'
      var checksum = int32(data, CFF_CHECKSUM_OFFSET);
      for (i = 0, ii = loadTestFontId.length - 3; i < ii; i += 4) {
        checksum = (checksum - XXXX_VALUE + int32(loadTestFontId, i)) | 0;
      }
      if (i < loadTestFontId.length) { // align to 4 bytes boundary
        checksum = (checksum - XXXX_VALUE +
                    int32(loadTestFontId + 'XXX', i)) | 0;
      }
      data = spliceString(data, CFF_CHECKSUM_OFFSET, 4, string32(checksum));

      var url = 'url(data:font/opentype;base64,' + btoa(data) + ');';
      var rule = '@font-face { font-family:"' + loadTestFontId + '";src:' +
                 url + '}';
      FontLoader.insertRule(rule);

      var names = [];
      for (i = 0, ii = fonts.length; i < ii; i++) {
        names.push(fonts[i].loadedName);
      }
      names.push(loadTestFontId);

      var div = document.createElement('div');
      div.setAttribute('style',
                       'visibility: hidden;' +
                       'width: 10px; height: 10px;' +
                       'position: absolute; top: 0px; left: 0px;');
      for (i = 0, ii = names.length; i < ii; ++i) {
        var span = document.createElement('span');
        span.textContent = 'Hi';
        span.style.fontFamily = names[i];
        div.appendChild(span);
      }
      document.body.appendChild(div);

      isFontReady(loadTestFontId, function() {
        document.body.removeChild(div);
        request.complete();
      });
      /** Hack end */
  }
};

var FontFaceObject = (function FontFaceObjectClosure() {
  function FontFaceObject(name, file, properties) {
    this.compiledGlyphs = {};
    if (arguments.length === 1) {
      // importing translated data
      var data = arguments[0];
      for (var i in data) {
        this[i] = data[i];
      }
      return;
    }
  }
  FontFaceObject.prototype = {
    createNativeFontFace: function FontFaceObject_createNativeFontFace() {
      if (!this.data) {
        return null;
      }

      if (PDFJS.disableFontFace) {
        this.disableFontFace = true;
        return null;
      }

      var nativeFontFace = new FontFace(this.loadedName, this.data, {});

      FontLoader.addNativeFontFace(nativeFontFace);

      if (PDFJS.pdfBug && 'FontInspector' in globalScope &&
          globalScope['FontInspector'].enabled) {
        globalScope['FontInspector'].fontAdded(this);
      }
      return nativeFontFace;
    },

    bindDOM: function FontFaceObject_bindDOM() {
      if (!this.data) {
        return null;
      }

      if (PDFJS.disableFontFace) {
        this.disableFontFace = true;
        return null;
      }

      var data = bytesToString(new Uint8Array(this.data));
      var fontName = this.loadedName;

      // Add the font-face rule to the document
      var url = ('url(data:' + this.mimetype + ';base64,' +
                 window.btoa(data) + ');');
      var rule = '@font-face { font-family:"' + fontName + '";src:' + url + '}';
      FontLoader.insertRule(rule);

      if (PDFJS.pdfBug && 'FontInspector' in globalScope &&
          globalScope['FontInspector'].enabled) {
        globalScope['FontInspector'].fontAdded(this, url);
      }

      return rule;
    },

    getPathGenerator: function FontLoader_getPathGenerator(objs, character) {
      if (!(character in this.compiledGlyphs)) {
        var js = objs.get(this.loadedName + '_path_' + character);
        /*jshint -W054 */
        this.compiledGlyphs[character] = new Function('c', 'size', js);
      }
      return this.compiledGlyphs[character];
    }
  };
  return FontFaceObject;
})();


var ANNOT_MIN_SIZE = 10; // px

var AnnotationUtils = (function AnnotationUtilsClosure() {
  // TODO(mack): This dupes some of the logic in CanvasGraphics.setFont()
  function setTextStyles(element, item, fontObj) {

    var style = element.style;
    style.fontSize = item.fontSize + 'px';
    style.direction = item.fontDirection < 0 ? 'rtl': 'ltr';

    if (!fontObj) {
      return;
    }

    style.fontWeight = fontObj.black ?
      (fontObj.bold ? 'bolder' : 'bold') :
      (fontObj.bold ? 'bold' : 'normal');
    style.fontStyle = fontObj.italic ? 'italic' : 'normal';

    var fontName = fontObj.loadedName;
    var fontFamily = fontName ? '"' + fontName + '", ' : '';
    // Use a reasonable default font if the font doesn't specify a fallback
    var fallbackName = fontObj.fallbackName || 'Helvetica, sans-serif';
    style.fontFamily = fontFamily + fallbackName;
  }

  function initContainer(item, drawBorder) {
    var container = document.createElement('section');
    var cstyle = container.style;
    var width = item.rect[2] - item.rect[0];
    var height = item.rect[3] - item.rect[1];

    var bWidth = item.borderWidth || 0;
    if (bWidth) {
      width = width - 2 * bWidth;
      height = height - 2 * bWidth;
      cstyle.borderWidth = bWidth + 'px';
      var color = item.color;
      if (drawBorder && color) {
        cstyle.borderStyle = 'solid';
        cstyle.borderColor = Util.makeCssRgb(Math.round(color[0] * 255),
                                             Math.round(color[1] * 255),
                                             Math.round(color[2] * 255));
      }
    }
    cstyle.width = width + 'px';
    cstyle.height = height + 'px';
    return container;
  }

  function getHtmlElementForTextWidgetAnnotation(item, commonObjs) {
    var element = document.createElement('div');
    var width = item.rect[2] - item.rect[0];
    var height = item.rect[3] - item.rect[1];
    element.style.width = width + 'px';
    element.style.height = height + 'px';
    element.style.display = 'table';

    var content = document.createElement('div');
    content.textContent = item.fieldValue;
    var textAlignment = item.textAlignment;
    content.style.textAlign = ['left', 'center', 'right'][textAlignment];
    content.style.verticalAlign = 'middle';
    content.style.display = 'table-cell';

    var fontObj = item.fontRefName ?
      commonObjs.getData(item.fontRefName) : null;
    setTextStyles(content, item, fontObj);

    element.appendChild(content);

    return element;
  }

  function getHtmlElementForTextAnnotation(item) {
    var rect = item.rect;

    // sanity check because of OOo-generated PDFs
    if ((rect[3] - rect[1]) < ANNOT_MIN_SIZE) {
      rect[3] = rect[1] + ANNOT_MIN_SIZE;
    }
    if ((rect[2] - rect[0]) < ANNOT_MIN_SIZE) {
      rect[2] = rect[0] + (rect[3] - rect[1]); // make it square
    }

    var container = initContainer(item, false);
    container.className = 'annotText';

    var image  = document.createElement('img');
    image.style.height = container.style.height;
    image.style.width = container.style.width;
    var iconName = item.name;
    image.src = PDFJS.imageResourcesPath + 'annotation-' +
      iconName.toLowerCase() + '.svg';
    image.alt = '[{{type}} Annotation]';
    image.dataset.l10nId = 'text_annotation_type';
    image.dataset.l10nArgs = JSON.stringify({type: iconName});

    var contentWrapper = document.createElement('div');
    contentWrapper.className = 'annotTextContentWrapper';
    contentWrapper.style.left = Math.floor(rect[2] - rect[0] + 5) + 'px';
    contentWrapper.style.top = '-10px';

    var content = document.createElement('div');
    content.className = 'annotTextContent';
    content.setAttribute('hidden', true);

    var i, ii;
    if (item.hasBgColor) {
      var color = item.color;

      // Enlighten the color (70%)
      var BACKGROUND_ENLIGHT = 0.7;
      var r = BACKGROUND_ENLIGHT * (1.0 - color[0]) + color[0];
      var g = BACKGROUND_ENLIGHT * (1.0 - color[1]) + color[1];
      var b = BACKGROUND_ENLIGHT * (1.0 - color[2]) + color[2];
      content.style.backgroundColor = Util.makeCssRgb((r * 255) | 0,
                                                      (g * 255) | 0,
                                                      (b * 255) | 0);
    }

    var title = document.createElement('h1');
    var text = document.createElement('p');
    title.textContent = item.title;

    if (!item.content && !item.title) {
      content.setAttribute('hidden', true);
    } else {
      var e = document.createElement('span');
      var lines = item.content.split(/(?:\r\n?|\n)/);
      for (i = 0, ii = lines.length; i < ii; ++i) {
        var line = lines[i];
        e.appendChild(document.createTextNode(line));
        if (i < (ii - 1)) {
          e.appendChild(document.createElement('br'));
        }
      }
      text.appendChild(e);

      var pinned = false;

      var showAnnotation = function showAnnotation(pin) {
        if (pin) {
          pinned = true;
        }
        if (content.hasAttribute('hidden')) {
          container.style.zIndex += 1;
          content.removeAttribute('hidden');
        }
      };

      var hideAnnotation = function hideAnnotation(unpin) {
        if (unpin) {
          pinned = false;
        }
        if (!content.hasAttribute('hidden') && !pinned) {
          container.style.zIndex -= 1;
          content.setAttribute('hidden', true);
        }
      };

      var toggleAnnotation = function toggleAnnotation() {
        if (pinned) {
          hideAnnotation(true);
        } else {
          showAnnotation(true);
        }
      };

      image.addEventListener('click', function image_clickHandler() {
        toggleAnnotation();
      }, false);
      image.addEventListener('mouseover', function image_mouseOverHandler() {
        showAnnotation();
      }, false);
      image.addEventListener('mouseout', function image_mouseOutHandler() {
        hideAnnotation();
      }, false);

      content.addEventListener('click', function content_clickHandler() {
        hideAnnotation(true);
      }, false);
    }

    content.appendChild(title);
    content.appendChild(text);
    contentWrapper.appendChild(content);
    container.appendChild(image);
    container.appendChild(contentWrapper);

    return container;
  }

  function getHtmlElementForLinkAnnotation(item) {
    var container = initContainer(item, true);
    container.className = 'annotLink';

    var link = document.createElement('a');
    link.href = link.title = item.url || '';
    if (item.url && PDFJS.openExternalLinksInNewWindow) {
      link.target = '_blank';
    }

    container.appendChild(link);

    return container;
  }

  function getHtmlElement(data, objs) {
    switch (data.annotationType) {
      case AnnotationType.WIDGET:
        return getHtmlElementForTextWidgetAnnotation(data, objs);
      case AnnotationType.TEXT:
        return getHtmlElementForTextAnnotation(data);
      case AnnotationType.LINK:
        return getHtmlElementForLinkAnnotation(data);
      default:
        throw new Error('Unsupported annotationType: ' + data.annotationType);
    }
  }

  return {
    getHtmlElement: getHtmlElement
  };
})();
PDFJS.AnnotationUtils = AnnotationUtils;


var SVG_DEFAULTS = {
  fontStyle: 'normal',
  fontWeight: 'normal',
  fillColor: '#000000'
};

var convertImgDataToPng = (function convertImgDataToPngClosure() {
  var PNG_HEADER =
    new Uint8Array([0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a]);

  var CHUNK_WRAPPER_SIZE = 12;

  var crcTable = new Int32Array(256);
  for (var i = 0; i < 256; i++) {
    var c = i;
    for (var h = 0; h < 8; h++) {
      if (c & 1) {
        c = 0xedB88320 ^ ((c >> 1) & 0x7fffffff);
      } else {
        c = (c >> 1) & 0x7fffffff;
      }
    }
    crcTable[i] = c;
  }

  function crc32(data, start, end) {
    var crc = -1;
    for (var i = start; i < end; i++) {
      var a = (crc ^ data[i]) & 0xff;
      var b = crcTable[a];
      crc = (crc >>> 8) ^ b;
    }
    return crc ^ -1;
  }

  function writePngChunk(type, body, data, offset) {
    var p = offset;
    var len = body.length;

    data[p] = len >> 24 & 0xff;
    data[p + 1] = len >> 16 & 0xff;
    data[p + 2] = len >> 8 & 0xff;
    data[p + 3] = len & 0xff;
    p += 4;

    data[p] = type.charCodeAt(0) & 0xff;
    data[p + 1] = type.charCodeAt(1) & 0xff;
    data[p + 2] = type.charCodeAt(2) & 0xff;
    data[p + 3] = type.charCodeAt(3) & 0xff;
    p += 4;

    data.set(body, p);
    p += body.length;

    var crc = crc32(data, offset + 4, p);

    data[p] = crc >> 24 & 0xff;
    data[p + 1] = crc >> 16 & 0xff;
    data[p + 2] = crc >> 8 & 0xff;
    data[p + 3] = crc & 0xff;
  }

  function adler32(data, start, end) {
    var a = 1;
    var b = 0;
    for (var i = start; i < end; ++i) {
      a = (a + (data[i] & 0xff)) % 65521;
      b = (b + a) % 65521;
    }
    return (b << 16) | a;
  }

  function encode(imgData, kind) {
    var width = imgData.width;
    var height = imgData.height;
    var bitDepth, colorType, lineSize;
    var bytes = imgData.data;

    switch (kind) {
      case ImageKind.GRAYSCALE_1BPP:
        colorType = 0;
        bitDepth = 1;
        lineSize = (width + 7) >> 3;
        break;
      case ImageKind.RGB_24BPP:
        colorType = 2;
        bitDepth = 8;
        lineSize = width * 3;
        break;
      case ImageKind.RGBA_32BPP:
        colorType = 6;
        bitDepth = 8;
        lineSize = width * 4;
        break;
      default:
        throw new Error('invalid format');
    }

    // prefix every row with predictor 0
    var literals = new Uint8Array((1 + lineSize) * height);
    var offsetLiterals = 0, offsetBytes = 0;
    var y, i;
    for (y = 0; y < height; ++y) {
      literals[offsetLiterals++] = 0; // no prediction
      literals.set(bytes.subarray(offsetBytes, offsetBytes + lineSize),
                   offsetLiterals);
      offsetBytes += lineSize;
      offsetLiterals += lineSize;
    }

    if (kind === ImageKind.GRAYSCALE_1BPP) {
      // inverting for B/W
      offsetLiterals = 0;
      for (y = 0; y < height; y++) {
        offsetLiterals++; // skipping predictor
        for (i = 0; i < lineSize; i++) {
          literals[offsetLiterals++] ^= 0xFF;
        }
      }
    }

    var ihdr = new Uint8Array([
      width >> 24 & 0xff,
      width >> 16 & 0xff,
      width >> 8 & 0xff,
      width & 0xff,
      height >> 24 & 0xff,
      height >> 16 & 0xff,
      height >> 8 & 0xff,
      height & 0xff,
      bitDepth, // bit depth
      colorType, // color type
      0x00, // compression method
      0x00, // filter method
      0x00 // interlace method
    ]);

    var len = literals.length;
    var maxBlockLength = 0xFFFF;

    var deflateBlocks = Math.ceil(len / maxBlockLength);
    var idat = new Uint8Array(2 + len + deflateBlocks * 5 + 4);
    var pi = 0;
    idat[pi++] = 0x78; // compression method and flags
    idat[pi++] = 0x9c; // flags

    var pos = 0;
    while (len > maxBlockLength) {
      // writing non-final DEFLATE blocks type 0 and length of 65535
      idat[pi++] = 0x00;
      idat[pi++] = 0xff;
      idat[pi++] = 0xff;
      idat[pi++] = 0x00;
      idat[pi++] = 0x00;
      idat.set(literals.subarray(pos, pos + maxBlockLength), pi);
      pi += maxBlockLength;
      pos += maxBlockLength;
      len -= maxBlockLength;
    }

    // writing non-final DEFLATE blocks type 0
    idat[pi++] = 0x01;
    idat[pi++] = len & 0xff;
    idat[pi++] = len >> 8 & 0xff;
    idat[pi++] = (~len & 0xffff) & 0xff;
    idat[pi++] = (~len & 0xffff) >> 8 & 0xff;
    idat.set(literals.subarray(pos), pi);
    pi += literals.length - pos;

    var adler = adler32(literals, 0, literals.length); // checksum
    idat[pi++] = adler >> 24 & 0xff;
    idat[pi++] = adler >> 16 & 0xff;
    idat[pi++] = adler >> 8 & 0xff;
    idat[pi++] = adler & 0xff;

    // PNG will consists: header, IHDR+data, IDAT+data, and IEND.
    var pngLength = PNG_HEADER.length + (CHUNK_WRAPPER_SIZE * 3) +
                    ihdr.length + idat.length;
    var data = new Uint8Array(pngLength);
    var offset = 0;
    data.set(PNG_HEADER, offset);
    offset += PNG_HEADER.length;
    writePngChunk('IHDR', ihdr, data, offset);
    offset += CHUNK_WRAPPER_SIZE + ihdr.length;
    writePngChunk('IDATA', idat, data, offset);
    offset += CHUNK_WRAPPER_SIZE + idat.length;
    writePngChunk('IEND', new Uint8Array(0), data, offset);

    return PDFJS.createObjectURL(data, 'image/png');
  }

  return function convertImgDataToPng(imgData) {
    var kind = (imgData.kind === undefined ?
                ImageKind.GRAYSCALE_1BPP : imgData.kind);
    return encode(imgData, kind);
  };
})();

var SVGExtraState = (function SVGExtraStateClosure() {
  function SVGExtraState() {
    this.fontSizeScale = 1;
    this.fontWeight = SVG_DEFAULTS.fontWeight;
    this.fontSize = 0;

    this.textMatrix = IDENTITY_MATRIX;
    this.fontMatrix = FONT_IDENTITY_MATRIX;
    this.leading = 0;

    // Current point (in user coordinates)
    this.x = 0;
    this.y = 0;

    // Start of text line (in text coordinates)
    this.lineX = 0;
    this.lineY = 0;

    // Character and word spacing
    this.charSpacing = 0;
    this.wordSpacing = 0;
    this.textHScale = 1;
    this.textRise = 0;

    // Default foreground and background colors
    this.fillColor = SVG_DEFAULTS.fillColor;
    this.strokeColor = '#000000';

    this.fillAlpha = 1;
    this.strokeAlpha = 1;
    this.lineWidth = 1;
    this.lineJoin = '';
    this.lineCap = '';
    this.miterLimit = 0;

    this.dashArray = [];
    this.dashPhase = 0;

    this.dependencies = [];

    // Clipping
    this.clipId = '';
    this.pendingClip = false;

    this.maskId = '';
  }

  SVGExtraState.prototype = {
    clone: function SVGExtraState_clone() {
      return Object.create(this);
    },
    setCurrentPoint: function SVGExtraState_setCurrentPoint(x, y) {
      this.x = x;
      this.y = y;
    }
  };
  return SVGExtraState;
})();

var SVGGraphics = (function SVGGraphicsClosure() {
  function createScratchSVG(width, height) {
    var NS = 'http://www.w3.org/2000/svg';
    var svg = document.createElementNS(NS, 'svg:svg');
    svg.setAttributeNS(null, 'version', '1.1');
    svg.setAttributeNS(null, 'width', width + 'px');
    svg.setAttributeNS(null, 'height', height + 'px');
    svg.setAttributeNS(null, 'viewBox', '0 0 ' + width + ' ' + height);
    return svg;
  }

  function opListToTree(opList) {
    var opTree = [];
    var tmp = [];
    var opListLen = opList.length;

    for (var x = 0; x < opListLen; x++) {
      if (opList[x].fn === 'save') {
        opTree.push({'fnId': 92, 'fn': 'group', 'items': []});
        tmp.push(opTree);
        opTree = opTree[opTree.length - 1].items;
        continue;
      }

      if(opList[x].fn === 'restore') {
        opTree = tmp.pop();
      } else {
        opTree.push(opList[x]);
      }
    }
    return opTree;
  }

  /**
   * Formats float number.
   * @param value {number} number to format.
   * @returns {string}
   */
  function pf(value) {
    if (value === (value | 0)) { // integer number
      return value.toString();
    }
    var s = value.toFixed(10);
    var i = s.length - 1;
    if (s[i] !== '0') {
      return s;
    }
    // removing trailing zeros
    do {
      i--;
    } while (s[i] === '0');
    return s.substr(0, s[i] === '.' ? i : i + 1);
  }

  /**
   * Formats transform matrix. The standard rotation, scale and translate
   * matrices are replaced by their shorter forms, and for identity matrix
   * returns empty string to save the memory.
   * @param m {Array} matrix to format.
   * @returns {string}
   */
  function pm(m) {
    if (m[4] === 0 && m[5] === 0) {
      if (m[1] === 0 && m[2] === 0) {
        if (m[0] === 1 && m[3] === 1) {
          return '';
        }
        return 'scale(' + pf(m[0]) + ' ' + pf(m[3]) + ')';
      }
      if (m[0] === m[3] && m[1] === -m[2]) {
        var a = Math.acos(m[0]) * 180 / Math.PI;
        return 'rotate(' + pf(a) + ')';
      }
    } else {
      if (m[0] === 1 && m[1] === 0 && m[2] === 0 && m[3] === 1) {
        return 'translate(' + pf(m[4]) + ' ' + pf(m[5]) + ')';
      }
    }
    return 'matrix(' + pf(m[0]) + ' ' + pf(m[1]) + ' ' + pf(m[2]) + ' ' +
      pf(m[3]) + ' ' + pf(m[4]) + ' ' + pf(m[5]) + ')';
  }

  function SVGGraphics(commonObjs, objs) {
    this.current = new SVGExtraState();
    this.transformMatrix = IDENTITY_MATRIX; // Graphics state matrix
    this.transformStack = [];
    this.extraStack = [];
    this.commonObjs = commonObjs;
    this.objs = objs;
    this.pendingEOFill = false;

    this.embedFonts = false;
    this.embeddedFonts = {};
    this.cssStyle = null;
  }

  var NS = 'http://www.w3.org/2000/svg';
  var XML_NS = 'http://www.w3.org/XML/1998/namespace';
  var XLINK_NS = 'http://www.w3.org/1999/xlink';
  var LINE_CAP_STYLES = ['butt', 'round', 'square'];
  var LINE_JOIN_STYLES = ['miter', 'round', 'bevel'];
  var clipCount = 0;
  var maskCount = 0;

  SVGGraphics.prototype = {
    save: function SVGGraphics_save() {
      this.transformStack.push(this.transformMatrix);
      var old = this.current;
      this.extraStack.push(old);
      this.current = old.clone();
    },

    restore: function SVGGraphics_restore() {
      this.transformMatrix = this.transformStack.pop();
      this.current = this.extraStack.pop();

      this.tgrp = document.createElementNS(NS, 'svg:g');
      this.tgrp.setAttributeNS(null, 'transform', pm(this.transformMatrix));
      this.pgrp.appendChild(this.tgrp);
    },

    group: function SVGGraphics_group(items) {
      this.save();
      this.executeOpTree(items);
      this.restore();
    },

    loadDependencies: function SVGGraphics_loadDependencies(operatorList) {
      var fnArray = operatorList.fnArray;
      var fnArrayLen = fnArray.length;
      var argsArray = operatorList.argsArray;

      var self = this;
      for (var i = 0; i < fnArrayLen; i++) {
        if (OPS.dependency === fnArray[i]) {
          var deps = argsArray[i];
          for (var n = 0, nn = deps.length; n < nn; n++) {
            var obj = deps[n];
            var common = obj.substring(0, 2) === 'g_';
            var promise;
            if (common) {
              promise = new Promise(function(resolve) {
                self.commonObjs.get(obj, resolve);
              });
            } else {
              promise = new Promise(function(resolve) {
                self.objs.get(obj, resolve);
              });
            }
            this.current.dependencies.push(promise);
          }
        }
      }
      return Promise.all(this.current.dependencies);
    },

    transform: function SVGGraphics_transform(a, b, c, d, e, f) {
      var transformMatrix = [a, b, c, d, e, f];
      this.transformMatrix = PDFJS.Util.transform(this.transformMatrix,
                                                  transformMatrix);

      this.tgrp = document.createElementNS(NS, 'svg:g');
      this.tgrp.setAttributeNS(null, 'transform', pm(this.transformMatrix));
    },

    getSVG: function SVGGraphics_getSVG(operatorList, viewport) {
      this.svg = createScratchSVG(viewport.width, viewport.height);
      this.viewport = viewport;

      return this.loadDependencies(operatorList).then(function () {
        this.transformMatrix = IDENTITY_MATRIX;
        this.pgrp = document.createElementNS(NS, 'svg:g'); // Parent group
        this.pgrp.setAttributeNS(null, 'transform', pm(viewport.transform));
        this.tgrp = document.createElementNS(NS, 'svg:g'); // Transform group
        this.tgrp.setAttributeNS(null, 'transform', pm(this.transformMatrix));
        this.defs = document.createElementNS(NS, 'svg:defs');
        this.pgrp.appendChild(this.defs);
        this.pgrp.appendChild(this.tgrp);
        this.svg.appendChild(this.pgrp);
        var opTree = this.convertOpList(operatorList);
        this.executeOpTree(opTree);
        return this.svg;
      }.bind(this));
    },

    convertOpList: function SVGGraphics_convertOpList(operatorList) {
      var argsArray = operatorList.argsArray;
      var fnArray = operatorList.fnArray;
      var fnArrayLen  = fnArray.length;
      var REVOPS = [];
      var opList = [];

      for (var op in OPS) {
        REVOPS[OPS[op]] = op;
      }

      for (var x = 0; x < fnArrayLen; x++) {
        var fnId = fnArray[x];
        opList.push({'fnId' : fnId, 'fn': REVOPS[fnId], 'args': argsArray[x]});
      }
      return opListToTree(opList);
    },

    executeOpTree: function SVGGraphics_executeOpTree(opTree) {
      var opTreeLen = opTree.length;
      for(var x = 0; x < opTreeLen; x++) {
        var fn = opTree[x].fn;
        var fnId = opTree[x].fnId;
        var args = opTree[x].args;

        switch (fnId | 0) {
          case OPS.beginText:
            this.beginText();
            break;
          case OPS.setLeading:
            this.setLeading(args);
            break;
          case OPS.setLeadingMoveText:
            this.setLeadingMoveText(args[0], args[1]);
            break;
          case OPS.setFont:
            this.setFont(args);
            break;
          case OPS.showText:
            this.showText(args[0]);
            break;
          case OPS.showSpacedText:
            this.showText(args[0]);
            break;
          case OPS.endText:
            this.endText();
            break;
          case OPS.moveText:
            this.moveText(args[0], args[1]);
            break;
          case OPS.setCharSpacing:
            this.setCharSpacing(args[0]);
            break;
          case OPS.setWordSpacing:
            this.setWordSpacing(args[0]);
            break;
          case OPS.setHScale:
            this.setHScale(args[0]);
            break;
          case OPS.setTextMatrix:
            this.setTextMatrix(args[0], args[1], args[2],
                               args[3], args[4], args[5]);
            break;
          case OPS.setLineWidth:
            this.setLineWidth(args[0]);
            break;
          case OPS.setLineJoin:
            this.setLineJoin(args[0]);
            break;
          case OPS.setLineCap:
            this.setLineCap(args[0]);
            break;
          case OPS.setMiterLimit:
            this.setMiterLimit(args[0]);
            break;
          case OPS.setFillRGBColor:
            this.setFillRGBColor(args[0], args[1], args[2]);
            break;
          case OPS.setStrokeRGBColor:
            this.setStrokeRGBColor(args[0], args[1], args[2]);
            break;
          case OPS.setDash:
            this.setDash(args[0], args[1]);
            break;
          case OPS.setGState:
            this.setGState(args[0]);
            break;
          case OPS.fill:
            this.fill();
            break;
          case OPS.eoFill:
            this.eoFill();
            break;
          case OPS.stroke:
            this.stroke();
            break;
          case OPS.fillStroke:
            this.fillStroke();
            break;
          case OPS.eoFillStroke:
            this.eoFillStroke();
            break;
          case OPS.clip:
            this.clip('nonzero');
            break;
          case OPS.eoClip:
            this.clip('evenodd');
            break;
          case OPS.paintSolidColorImageMask:
            this.paintSolidColorImageMask();
            break;
          case OPS.paintJpegXObject:
            this.paintJpegXObject(args[0], args[1], args[2]);
            break;
          case OPS.paintImageXObject:
            this.paintImageXObject(args[0]);
            break;
          case OPS.paintInlineImageXObject:
            this.paintInlineImageXObject(args[0]);
            break;
          case OPS.paintImageMaskXObject:
            this.paintImageMaskXObject(args[0]);
            break;
          case OPS.paintFormXObjectBegin:
            this.paintFormXObjectBegin(args[0], args[1]);
            break;
          case OPS.paintFormXObjectEnd:
            this.paintFormXObjectEnd();
            break;
          case OPS.closePath:
            this.closePath();
            break;
          case OPS.closeStroke:
            this.closeStroke();
            break;
          case OPS.closeFillStroke:
            this.closeFillStroke();
            break;
          case OPS.nextLine:
            this.nextLine();
            break;
          case OPS.transform:
            this.transform(args[0], args[1], args[2], args[3],
                           args[4], args[5]);
            break;
          case OPS.constructPath:
            this.constructPath(args[0], args[1]);
            break;
          case OPS.endPath:
            this.endPath();
            break;
          case 92:
            this.group(opTree[x].items);
            break;
          default:
            warn('Unimplemented method '+ fn);
            break;
        }
      }
    },

    setWordSpacing: function SVGGraphics_setWordSpacing(wordSpacing) {
      this.current.wordSpacing = wordSpacing;
    },

    setCharSpacing: function SVGGraphics_setCharSpacing(charSpacing) {
      this.current.charSpacing = charSpacing;
    },

    nextLine: function SVGGraphics_nextLine() {
      this.moveText(0, this.current.leading);
    },

    setTextMatrix: function SVGGraphics_setTextMatrix(a, b, c, d, e, f) {
      var current = this.current;
      this.current.textMatrix = this.current.lineMatrix = [a, b, c, d, e, f];

      this.current.x = this.current.lineX = 0;
      this.current.y = this.current.lineY = 0;

      current.xcoords = [];
      current.tspan = document.createElementNS(NS, 'svg:tspan');
      current.tspan.setAttributeNS(null, 'font-family', current.fontFamily);
      current.tspan.setAttributeNS(null, 'font-size',
                                   pf(current.fontSize) + 'px');
      current.tspan.setAttributeNS(null, 'y', pf(-current.y));

      current.txtElement = document.createElementNS(NS, 'svg:text');
      current.txtElement.appendChild(current.tspan);
    },

    beginText: function SVGGraphics_beginText() {
      this.current.x = this.current.lineX = 0;
      this.current.y = this.current.lineY = 0;
      this.current.textMatrix = IDENTITY_MATRIX;
      this.current.lineMatrix = IDENTITY_MATRIX;
      this.current.tspan = document.createElementNS(NS, 'svg:tspan');
      this.current.txtElement = document.createElementNS(NS, 'svg:text');
      this.current.txtgrp = document.createElementNS(NS, 'svg:g');
      this.current.xcoords = [];
    },

    moveText: function SVGGraphics_moveText(x, y) {
      var current = this.current;
      this.current.x = this.current.lineX += x;
      this.current.y = this.current.lineY += y;

      current.xcoords = [];
      current.tspan = document.createElementNS(NS, 'svg:tspan');
      current.tspan.setAttributeNS(null, 'font-family', current.fontFamily);
      current.tspan.setAttributeNS(null, 'font-size',
                                   pf(current.fontSize) + 'px');
      current.tspan.setAttributeNS(null, 'y', pf(-current.y));
    },

    showText: function SVGGraphics_showText(glyphs) {
      var current = this.current;
      var font = current.font;
      var fontSize = current.fontSize;

      if (fontSize === 0) {
        return;
      }

      var charSpacing = current.charSpacing;
      var wordSpacing = current.wordSpacing;
      var fontDirection = current.fontDirection;
      var textHScale = current.textHScale * fontDirection;
      var glyphsLength = glyphs.length;
      var vertical = font.vertical;
      var widthAdvanceScale = fontSize * current.fontMatrix[0];

      var x = 0, i;
      for (i = 0; i < glyphsLength; ++i) {
        var glyph = glyphs[i];
        if (glyph === null) {
          // word break
          x += fontDirection * wordSpacing;
          continue;
        } else if (isNum(glyph)) {
          x += -glyph * fontSize * 0.001;
          continue;
        }
        current.xcoords.push(current.x + x * textHScale);

        var width = glyph.width;
        var character = glyph.fontChar;
        var charWidth = width * widthAdvanceScale + charSpacing * fontDirection;
        x += charWidth;

        current.tspan.textContent += character;
      }
      if (vertical) {
        current.y -= x * textHScale;
      } else {
        current.x += x * textHScale;
      }

      current.tspan.setAttributeNS(null, 'x',
                                   current.xcoords.map(pf).join(' '));
      current.tspan.setAttributeNS(null, 'y', pf(-current.y));
      current.tspan.setAttributeNS(null, 'font-family', current.fontFamily);
      current.tspan.setAttributeNS(null, 'font-size',
                                   pf(current.fontSize) + 'px');
      if (current.fontStyle !== SVG_DEFAULTS.fontStyle) {
        current.tspan.setAttributeNS(null, 'font-style', current.fontStyle);
      }
      if (current.fontWeight !== SVG_DEFAULTS.fontWeight) {
        current.tspan.setAttributeNS(null, 'font-weight', current.fontWeight);
      }
      if (current.fillColor !== SVG_DEFAULTS.fillColor) {
        current.tspan.setAttributeNS(null, 'fill', current.fillColor);
      }

      current.txtElement.setAttributeNS(null, 'transform',
                                        pm(current.textMatrix) +
                                        ' scale(1, -1)' );
      current.txtElement.setAttributeNS(XML_NS, 'xml:space', 'preserve');
      current.txtElement.appendChild(current.tspan);
      current.txtgrp.appendChild(current.txtElement);

      this.tgrp.appendChild(current.txtElement);

    },

    setLeadingMoveText: function SVGGraphics_setLeadingMoveText(x, y) {
      this.setLeading(-y);
      this.moveText(x, y);
    },

    addFontStyle: function SVGGraphics_addFontStyle(fontObj) {
      if (!this.cssStyle) {
        this.cssStyle = document.createElementNS(NS, 'svg:style');
        this.cssStyle.setAttributeNS(null, 'type', 'text/css');
        this.defs.appendChild(this.cssStyle);
      }

      var url = PDFJS.createObjectURL(fontObj.data, fontObj.mimetype);
      this.cssStyle.textContent +=
        '@font-face { font-family: "' + fontObj.loadedName + '";' +
        ' src: url(' + url + '); }\n';
    },

    setFont: function SVGGraphics_setFont(details) {
      var current = this.current;
      var fontObj = this.commonObjs.get(details[0]);
      var size = details[1];
      this.current.font = fontObj;

      if (this.embedFonts && fontObj.data &&
          !this.embeddedFonts[fontObj.loadedName]) {
        this.addFontStyle(fontObj);
        this.embeddedFonts[fontObj.loadedName] = fontObj;
      }

      current.fontMatrix = (fontObj.fontMatrix ?
                            fontObj.fontMatrix : FONT_IDENTITY_MATRIX);

      var bold = fontObj.black ? (fontObj.bold ? 'bolder' : 'bold') :
                                 (fontObj.bold ? 'bold' : 'normal');
      var italic = fontObj.italic ? 'italic' : 'normal';

      if (size < 0) {
        size = -size;
        current.fontDirection = -1;
      } else {
        current.fontDirection = 1;
      }
      current.fontSize = size;
      current.fontFamily = fontObj.loadedName;
      current.fontWeight = bold;
      current.fontStyle = italic;

      current.tspan = document.createElementNS(NS, 'svg:tspan');
      current.tspan.setAttributeNS(null, 'y', pf(-current.y));
      current.xcoords = [];
    },

    endText: function SVGGraphics_endText() {
      if (this.current.pendingClip) {
        this.cgrp.appendChild(this.tgrp);
        this.pgrp.appendChild(this.cgrp);
      } else {
        this.pgrp.appendChild(this.tgrp);
      }
      this.tgrp = document.createElementNS(NS, 'svg:g');
      this.tgrp.setAttributeNS(null, 'transform', pm(this.transformMatrix));
    },

    // Path properties
    setLineWidth: function SVGGraphics_setLineWidth(width) {
      this.current.lineWidth = width;
    },
    setLineCap: function SVGGraphics_setLineCap(style) {
      this.current.lineCap = LINE_CAP_STYLES[style];
    },
    setLineJoin: function SVGGraphics_setLineJoin(style) {
      this.current.lineJoin = LINE_JOIN_STYLES[style];
    },
    setMiterLimit: function SVGGraphics_setMiterLimit(limit) {
      this.current.miterLimit = limit;
    },
    setStrokeRGBColor: function SVGGraphics_setStrokeRGBColor(r, g, b) {
      var color = Util.makeCssRgb(r, g, b);
      this.current.strokeColor = color;
    },
    setFillRGBColor: function SVGGraphics_setFillRGBColor(r, g, b) {
      var color = Util.makeCssRgb(r, g, b);
      this.current.fillColor = color;
      this.current.tspan = document.createElementNS(NS, 'svg:tspan');
      this.current.xcoords = [];
    },
    setDash: function SVGGraphics_setDash(dashArray, dashPhase) {
      this.current.dashArray = dashArray;
      this.current.dashPhase = dashPhase;
    },

    constructPath: function SVGGraphics_constructPath(ops, args) {
      var current = this.current;
      var x = current.x, y = current.y;
      current.path = document.createElementNS(NS, 'svg:path');
      var d = [];
      var opLength = ops.length;

      for (var i = 0, j = 0; i < opLength; i++) {
        switch (ops[i] | 0) {
          case OPS.rectangle:
            x = args[j++];
            y = args[j++];
            var width = args[j++];
            var height = args[j++];
            var xw = x + width;
            var yh = y + height;
            d.push('M', pf(x), pf(y), 'L', pf(xw) , pf(y), 'L', pf(xw), pf(yh),
                   'L', pf(x), pf(yh), 'Z');
            break;
          case OPS.moveTo:
            x = args[j++];
            y = args[j++];
            d.push('M', pf(x), pf(y));
            break;
          case OPS.lineTo:
            x = args[j++];
            y = args[j++];
            d.push('L', pf(x) , pf(y));
            break;
          case OPS.curveTo:
            x = args[j + 4];
            y = args[j + 5];
            d.push('C', pf(args[j]), pf(args[j + 1]), pf(args[j + 2]),
                   pf(args[j + 3]), pf(x), pf(y));
            j += 6;
            break;
          case OPS.curveTo2:
            x = args[j + 2];
            y = args[j + 3];
            d.push('C', pf(x), pf(y), pf(args[j]), pf(args[j + 1]),
                   pf(args[j + 2]), pf(args[j + 3]));
            j += 4;
            break;
          case OPS.curveTo3:
            x = args[j + 2];
            y = args[j + 3];
            d.push('C', pf(args[j]), pf(args[j + 1]), pf(x), pf(y),
                   pf(x), pf(y));
            j += 4;
            break;
          case OPS.closePath:
            d.push('Z');
            break;
        }
      }
      current.path.setAttributeNS(null, 'd', d.join(' '));
      current.path.setAttributeNS(null, 'stroke-miterlimit',
                                  pf(current.miterLimit));
      current.path.setAttributeNS(null, 'stroke-linecap', current.lineCap);
      current.path.setAttributeNS(null, 'stroke-linejoin', current.lineJoin);
      current.path.setAttributeNS(null, 'stroke-width',
                                  pf(current.lineWidth) + 'px');
      current.path.setAttributeNS(null, 'stroke-dasharray',
                                  current.dashArray.map(pf).join(' '));
      current.path.setAttributeNS(null, 'stroke-dashoffset',
                                  pf(current.dashPhase) + 'px');
      current.path.setAttributeNS(null, 'fill', 'none');

      this.tgrp.appendChild(current.path);
      if (current.pendingClip) {
        this.cgrp.appendChild(this.tgrp);
        this.pgrp.appendChild(this.cgrp);
      } else {
        this.pgrp.appendChild(this.tgrp);
      }
      // Saving a reference in current.element so that it can be addressed
      // in 'fill' and 'stroke'
      current.element = current.path;
      current.setCurrentPoint(x, y);
    },

    endPath: function SVGGraphics_endPath() {
      var current = this.current;
      if (current.pendingClip) {
        this.cgrp.appendChild(this.tgrp);
        this.pgrp.appendChild(this.cgrp);
      } else {
        this.pgrp.appendChild(this.tgrp);
      }
      this.tgrp = document.createElementNS(NS, 'svg:g');
      this.tgrp.setAttributeNS(null, 'transform', pm(this.transformMatrix));
    },

    clip: function SVGGraphics_clip(type) {
      var current = this.current;
      // Add current path to clipping path
      current.clipId = 'clippath' + clipCount;
      clipCount++;
      this.clippath = document.createElementNS(NS, 'svg:clipPath');
      this.clippath.setAttributeNS(null, 'id', current.clipId);
      var clipElement = current.element.cloneNode();
      if (type === 'evenodd') {
        clipElement.setAttributeNS(null, 'clip-rule', 'evenodd');
      } else {
        clipElement.setAttributeNS(null, 'clip-rule', 'nonzero');
      }
      this.clippath.setAttributeNS(null, 'transform', pm(this.transformMatrix));
      this.clippath.appendChild(clipElement);
      this.defs.appendChild(this.clippath);

      // Create a new group with that attribute
      current.pendingClip = true;
      this.cgrp = document.createElementNS(NS, 'svg:g');
      this.cgrp.setAttributeNS(null, 'clip-path',
                               'url(#' + current.clipId + ')');
      this.pgrp.appendChild(this.cgrp);
    },

    closePath: function SVGGraphics_closePath() {
      var current = this.current;
      var d = current.path.getAttributeNS(null, 'd');
      d += 'Z';
      current.path.setAttributeNS(null, 'd', d);
    },

    setLeading: function SVGGraphics_setLeading(leading) {
      this.current.leading = -leading;
    },

    setTextRise: function SVGGraphics_setTextRise(textRise) {
      this.current.textRise = textRise;
    },

    setHScale: function SVGGraphics_setHScale(scale) {
      this.current.textHScale = scale / 100;
    },

    setGState: function SVGGraphics_setGState(states) {
      for (var i = 0, ii = states.length; i < ii; i++) {
        var state = states[i];
        var key = state[0];
        var value = state[1];

        switch (key) {
          case 'LW':
            this.setLineWidth(value);
            break;
          case 'LC':
            this.setLineCap(value);
            break;
          case 'LJ':
            this.setLineJoin(value);
            break;
          case 'ML':
            this.setMiterLimit(value);
            break;
          case 'D':
            this.setDash(value[0], value[1]);
            break;
          case 'RI':
            break;
          case 'FL':
            break;
          case 'Font':
            this.setFont(value);
            break;
          case 'CA':
            break;
          case 'ca':
            break;
          case 'BM':
            break;
          case 'SMask':
            break;
        }
      }
    },

    fill: function SVGGraphics_fill() {
      var current = this.current;
      current.element.setAttributeNS(null, 'fill', current.fillColor);
    },

    stroke: function SVGGraphics_stroke() {
      var current = this.current;
      current.element.setAttributeNS(null, 'stroke', current.strokeColor);
      current.element.setAttributeNS(null, 'fill', 'none');
    },

    eoFill: function SVGGraphics_eoFill() {
      var current = this.current;
      current.element.setAttributeNS(null, 'fill', current.fillColor);
      current.element.setAttributeNS(null, 'fill-rule', 'evenodd');
    },

    fillStroke: function SVGGraphics_fillStroke() {
      // Order is important since stroke wants fill to be none.
      // First stroke, then if fill needed, it will be overwritten.
      this.stroke();
      this.fill();
    },

    eoFillStroke: function SVGGraphics_eoFillStroke() {
      this.current.element.setAttributeNS(null, 'fill-rule', 'evenodd');
      this.fillStroke();
    },

    closeStroke: function SVGGraphics_closeStroke() {
      this.closePath();
      this.stroke();
    },

    closeFillStroke: function SVGGraphics_closeFillStroke() {
      this.closePath();
      this.fillStroke();
    },

    paintSolidColorImageMask:
        function SVGGraphics_paintSolidColorImageMask() {
      var current = this.current;
      var rect = document.createElementNS(NS, 'svg:rect');
      rect.setAttributeNS(null, 'x', '0');
      rect.setAttributeNS(null, 'y', '0');
      rect.setAttributeNS(null, 'width', '1px');
      rect.setAttributeNS(null, 'height', '1px');
      rect.setAttributeNS(null, 'fill', current.fillColor);
      this.tgrp.appendChild(rect);
    },

    paintJpegXObject: function SVGGraphics_paintJpegXObject(objId, w, h) {
      var current = this.current;
      var imgObj = this.objs.get(objId);
      var imgEl = document.createElementNS(NS, 'svg:image');
      imgEl.setAttributeNS(XLINK_NS, 'xlink:href', imgObj.src);
      imgEl.setAttributeNS(null, 'width', imgObj.width + 'px');
      imgEl.setAttributeNS(null, 'height', imgObj.height + 'px');
      imgEl.setAttributeNS(null, 'x', '0');
      imgEl.setAttributeNS(null, 'y', pf(-h));
      imgEl.setAttributeNS(null, 'transform',
                           'scale(' + pf(1 / w) + ' ' + pf(-1 / h) + ')');

      this.tgrp.appendChild(imgEl);
      if (current.pendingClip) {
        this.cgrp.appendChild(this.tgrp);
        this.pgrp.appendChild(this.cgrp);
      } else {
        this.pgrp.appendChild(this.tgrp);
      }
    },

    paintImageXObject: function SVGGraphics_paintImageXObject(objId) {
      var imgData = this.objs.get(objId);
      if (!imgData) {
        warn('Dependent image isn\'t ready yet');
        return;
      }
      this.paintInlineImageXObject(imgData);
    },

    paintInlineImageXObject:
        function SVGGraphics_paintInlineImageXObject(imgData, mask) {
      var current = this.current;
      var width = imgData.width;
      var height = imgData.height;

      var imgSrc = convertImgDataToPng(imgData);
      var cliprect = document.createElementNS(NS, 'svg:rect');
      cliprect.setAttributeNS(null, 'x', '0');
      cliprect.setAttributeNS(null, 'y', '0');
      cliprect.setAttributeNS(null, 'width', pf(width));
      cliprect.setAttributeNS(null, 'height', pf(height));
      current.element = cliprect;
      this.clip('nonzero');
      var imgEl = document.createElementNS(NS, 'svg:image');
      imgEl.setAttributeNS(XLINK_NS, 'xlink:href', imgSrc);
      imgEl.setAttributeNS(null, 'x', '0');
      imgEl.setAttributeNS(null, 'y', pf(-height));
      imgEl.setAttributeNS(null, 'width', pf(width) + 'px');
      imgEl.setAttributeNS(null, 'height', pf(height) + 'px');
      imgEl.setAttributeNS(null, 'transform',
                           'scale(' + pf(1 / width) + ' ' +
                           pf(-1 / height) + ')');
      if (mask) {
        mask.appendChild(imgEl);
      } else {
        this.tgrp.appendChild(imgEl);
      }
      if (current.pendingClip) {
        this.cgrp.appendChild(this.tgrp);
        this.pgrp.appendChild(this.cgrp);
      } else {
        this.pgrp.appendChild(this.tgrp);
      }
    },

    paintImageMaskXObject:
        function SVGGraphics_paintImageMaskXObject(imgData) {
      var current = this.current;
      var width = imgData.width;
      var height = imgData.height;
      var fillColor = current.fillColor;

      current.maskId = 'mask' + maskCount++;
      var mask = document.createElementNS(NS, 'svg:mask');
      mask.setAttributeNS(null, 'id', current.maskId);

      var rect = document.createElementNS(NS, 'svg:rect');
      rect.setAttributeNS(null, 'x', '0');
      rect.setAttributeNS(null, 'y', '0');
      rect.setAttributeNS(null, 'width', pf(width));
      rect.setAttributeNS(null, 'height', pf(height));
      rect.setAttributeNS(null, 'fill', fillColor);
      rect.setAttributeNS(null, 'mask', 'url(#' + current.maskId +')');
      this.defs.appendChild(mask);
      this.tgrp.appendChild(rect);

      this.paintInlineImageXObject(imgData, mask);
    },

    paintFormXObjectBegin:
        function SVGGraphics_paintFormXObjectBegin(matrix, bbox) {
      this.save();

      if (isArray(matrix) && matrix.length === 6) {
        this.transform(matrix[0], matrix[1], matrix[2],
                       matrix[3], matrix[4], matrix[5]);
      }

      if (isArray(bbox) && bbox.length === 4) {
        var width = bbox[2] - bbox[0];
        var height = bbox[3] - bbox[1];

        var cliprect = document.createElementNS(NS, 'svg:rect');
        cliprect.setAttributeNS(null, 'x', bbox[0]);
        cliprect.setAttributeNS(null, 'y', bbox[1]);
        cliprect.setAttributeNS(null, 'width', pf(width));
        cliprect.setAttributeNS(null, 'height', pf(height));
        this.current.element = cliprect;
        this.clip('nonzero');
        this.endPath();
      }
    },

    paintFormXObjectEnd:
        function SVGGraphics_paintFormXObjectEnd() {
      this.restore();
    }
  };
  return SVGGraphics;
})();

PDFJS.SVGGraphics = SVGGraphics;


}).call((typeof window === 'undefined') ? this : window);

if (!PDFJS.workerSrc && typeof document !== 'undefined') {
  // workerSrc is not set -- using last script url to define default location
  PDFJS.workerSrc = (function () {
    'use strict';
    var scriptTagContainer = document.body ||
                             document.getElementsByTagName('head')[0];
    var pdfjsSrc = scriptTagContainer.lastChild.src;
    return pdfjsSrc && pdfjsSrc.replace(/\.js$/i, '.worker.js');
  })();
}



/**
 * React v0.12.2
 *
 * Copyright 2013-2014, Facebook, Inc.
 * All rights reserved.
 *
 * This source code is licensed under the BSD-style license found in the
 * LICENSE file in the root directory of this source tree. An additional grant
 * of patent rights can be found in the PATENTS file in the same directory.
 *
 */
!function(e){if("object"==typeof exports&&"undefined"!=typeof module)module.exports=e();else if("function"==typeof define&&define.amd)define([],e);else{var t;"undefined"!=typeof window?t=window:"undefined"!=typeof global?t=global:"undefined"!=typeof self&&(t=self),t.React=e()}}(function(){return function e(t,n,r){function o(i,s){if(!n[i]){if(!t[i]){var u="function"==typeof require&&require;if(!s&&u)return u(i,!0);if(a)return a(i,!0);var c=new Error("Cannot find module '"+i+"'");throw c.code="MODULE_NOT_FOUND",c}var l=n[i]={exports:{}};t[i][0].call(l.exports,function(e){var n=t[i][1][e];return o(n?n:e)},l,l.exports,e,t,n,r)}return n[i].exports}for(var a="function"==typeof require&&require,i=0;i<r.length;i++)o(r[i]);return o}({1:[function(e,t){"use strict";var n=e("./DOMPropertyOperations"),r=e("./EventPluginUtils"),o=e("./ReactChildren"),a=e("./ReactComponent"),i=e("./ReactCompositeComponent"),s=e("./ReactContext"),u=e("./ReactCurrentOwner"),c=e("./ReactElement"),l=(e("./ReactElementValidator"),e("./ReactDOM")),p=e("./ReactDOMComponent"),d=e("./ReactDefaultInjection"),f=e("./ReactInstanceHandles"),h=e("./ReactLegacyElement"),m=e("./ReactMount"),v=e("./ReactMultiChild"),g=e("./ReactPerf"),y=e("./ReactPropTypes"),E=e("./ReactServerRendering"),C=e("./ReactTextComponent"),R=e("./Object.assign"),M=e("./deprecated"),b=e("./onlyChild");d.inject();var O=c.createElement,D=c.createFactory;O=h.wrapCreateElement(O),D=h.wrapCreateFactory(D);var x=g.measure("React","render",m.render),P={Children:{map:o.map,forEach:o.forEach,count:o.count,only:b},DOM:l,PropTypes:y,initializeTouchEvents:function(e){r.useTouchEvents=e},createClass:i.createClass,createElement:O,createFactory:D,constructAndRenderComponent:m.constructAndRenderComponent,constructAndRenderComponentByID:m.constructAndRenderComponentByID,render:x,renderToString:E.renderToString,renderToStaticMarkup:E.renderToStaticMarkup,unmountComponentAtNode:m.unmountComponentAtNode,isValidClass:h.isValidClass,isValidElement:c.isValidElement,withContext:s.withContext,__spread:R,renderComponent:M("React","renderComponent","render",this,x),renderComponentToString:M("React","renderComponentToString","renderToString",this,E.renderToString),renderComponentToStaticMarkup:M("React","renderComponentToStaticMarkup","renderToStaticMarkup",this,E.renderToStaticMarkup),isValidComponent:M("React","isValidComponent","isValidElement",this,c.isValidElement)};"undefined"!=typeof __REACT_DEVTOOLS_GLOBAL_HOOK__&&"function"==typeof __REACT_DEVTOOLS_GLOBAL_HOOK__.inject&&__REACT_DEVTOOLS_GLOBAL_HOOK__.inject({Component:a,CurrentOwner:u,DOMComponent:p,DOMPropertyOperations:n,InstanceHandles:f,Mount:m,MultiChild:v,TextComponent:C});P.version="0.12.2",t.exports=P},{"./DOMPropertyOperations":12,"./EventPluginUtils":20,"./Object.assign":27,"./ReactChildren":31,"./ReactComponent":32,"./ReactCompositeComponent":34,"./ReactContext":35,"./ReactCurrentOwner":36,"./ReactDOM":37,"./ReactDOMComponent":39,"./ReactDefaultInjection":49,"./ReactElement":50,"./ReactElementValidator":51,"./ReactInstanceHandles":58,"./ReactLegacyElement":59,"./ReactMount":61,"./ReactMultiChild":62,"./ReactPerf":66,"./ReactPropTypes":70,"./ReactServerRendering":74,"./ReactTextComponent":76,"./deprecated":104,"./onlyChild":135}],2:[function(e,t){"use strict";var n=e("./focusNode"),r={componentDidMount:function(){this.props.autoFocus&&n(this.getDOMNode())}};t.exports=r},{"./focusNode":109}],3:[function(e,t){"use strict";function n(){var e=window.opera;return"object"==typeof e&&"function"==typeof e.version&&parseInt(e.version(),10)<=12}function r(e){return(e.ctrlKey||e.altKey||e.metaKey)&&!(e.ctrlKey&&e.altKey)}var o=e("./EventConstants"),a=e("./EventPropagators"),i=e("./ExecutionEnvironment"),s=e("./SyntheticInputEvent"),u=e("./keyOf"),c=i.canUseDOM&&"TextEvent"in window&&!("documentMode"in document||n()),l=32,p=String.fromCharCode(l),d=o.topLevelTypes,f={beforeInput:{phasedRegistrationNames:{bubbled:u({onBeforeInput:null}),captured:u({onBeforeInputCapture:null})},dependencies:[d.topCompositionEnd,d.topKeyPress,d.topTextInput,d.topPaste]}},h=null,m=!1,v={eventTypes:f,extractEvents:function(e,t,n,o){var i;if(c)switch(e){case d.topKeyPress:var u=o.which;if(u!==l)return;m=!0,i=p;break;case d.topTextInput:if(i=o.data,i===p&&m)return;break;default:return}else{switch(e){case d.topPaste:h=null;break;case d.topKeyPress:o.which&&!r(o)&&(h=String.fromCharCode(o.which));break;case d.topCompositionEnd:h=o.data}if(null===h)return;i=h}if(i){var v=s.getPooled(f.beforeInput,n,o);return v.data=i,h=null,a.accumulateTwoPhaseDispatches(v),v}}};t.exports=v},{"./EventConstants":16,"./EventPropagators":21,"./ExecutionEnvironment":22,"./SyntheticInputEvent":87,"./keyOf":131}],4:[function(e,t){"use strict";function n(e,t){return e+t.charAt(0).toUpperCase()+t.substring(1)}var r={columnCount:!0,flex:!0,flexGrow:!0,flexShrink:!0,fontWeight:!0,lineClamp:!0,lineHeight:!0,opacity:!0,order:!0,orphans:!0,widows:!0,zIndex:!0,zoom:!0,fillOpacity:!0,strokeOpacity:!0},o=["Webkit","ms","Moz","O"];Object.keys(r).forEach(function(e){o.forEach(function(t){r[n(t,e)]=r[e]})});var a={background:{backgroundImage:!0,backgroundPosition:!0,backgroundRepeat:!0,backgroundColor:!0},border:{borderWidth:!0,borderStyle:!0,borderColor:!0},borderBottom:{borderBottomWidth:!0,borderBottomStyle:!0,borderBottomColor:!0},borderLeft:{borderLeftWidth:!0,borderLeftStyle:!0,borderLeftColor:!0},borderRight:{borderRightWidth:!0,borderRightStyle:!0,borderRightColor:!0},borderTop:{borderTopWidth:!0,borderTopStyle:!0,borderTopColor:!0},font:{fontStyle:!0,fontVariant:!0,fontWeight:!0,fontSize:!0,lineHeight:!0,fontFamily:!0}},i={isUnitlessNumber:r,shorthandPropertyExpansions:a};t.exports=i},{}],5:[function(e,t){"use strict";var n=e("./CSSProperty"),r=e("./ExecutionEnvironment"),o=(e("./camelizeStyleName"),e("./dangerousStyleValue")),a=e("./hyphenateStyleName"),i=e("./memoizeStringOnly"),s=(e("./warning"),i(function(e){return a(e)})),u="cssFloat";r.canUseDOM&&void 0===document.documentElement.style.cssFloat&&(u="styleFloat");var c={createMarkupForStyles:function(e){var t="";for(var n in e)if(e.hasOwnProperty(n)){var r=e[n];null!=r&&(t+=s(n)+":",t+=o(n,r)+";")}return t||null},setValueForStyles:function(e,t){var r=e.style;for(var a in t)if(t.hasOwnProperty(a)){var i=o(a,t[a]);if("float"===a&&(a=u),i)r[a]=i;else{var s=n.shorthandPropertyExpansions[a];if(s)for(var c in s)r[c]="";else r[a]=""}}}};t.exports=c},{"./CSSProperty":4,"./ExecutionEnvironment":22,"./camelizeStyleName":98,"./dangerousStyleValue":103,"./hyphenateStyleName":122,"./memoizeStringOnly":133,"./warning":141}],6:[function(e,t){"use strict";function n(){this._callbacks=null,this._contexts=null}var r=e("./PooledClass"),o=e("./Object.assign"),a=e("./invariant");o(n.prototype,{enqueue:function(e,t){this._callbacks=this._callbacks||[],this._contexts=this._contexts||[],this._callbacks.push(e),this._contexts.push(t)},notifyAll:function(){var e=this._callbacks,t=this._contexts;if(e){a(e.length===t.length),this._callbacks=null,this._contexts=null;for(var n=0,r=e.length;r>n;n++)e[n].call(t[n]);e.length=0,t.length=0}},reset:function(){this._callbacks=null,this._contexts=null},destructor:function(){this.reset()}}),r.addPoolingTo(n),t.exports=n},{"./Object.assign":27,"./PooledClass":28,"./invariant":124}],7:[function(e,t){"use strict";function n(e){return"SELECT"===e.nodeName||"INPUT"===e.nodeName&&"file"===e.type}function r(e){var t=M.getPooled(P.change,w,e);E.accumulateTwoPhaseDispatches(t),R.batchedUpdates(o,t)}function o(e){y.enqueueEvents(e),y.processEventQueue()}function a(e,t){_=e,w=t,_.attachEvent("onchange",r)}function i(){_&&(_.detachEvent("onchange",r),_=null,w=null)}function s(e,t,n){return e===x.topChange?n:void 0}function u(e,t,n){e===x.topFocus?(i(),a(t,n)):e===x.topBlur&&i()}function c(e,t){_=e,w=t,T=e.value,N=Object.getOwnPropertyDescriptor(e.constructor.prototype,"value"),Object.defineProperty(_,"value",k),_.attachEvent("onpropertychange",p)}function l(){_&&(delete _.value,_.detachEvent("onpropertychange",p),_=null,w=null,T=null,N=null)}function p(e){if("value"===e.propertyName){var t=e.srcElement.value;t!==T&&(T=t,r(e))}}function d(e,t,n){return e===x.topInput?n:void 0}function f(e,t,n){e===x.topFocus?(l(),c(t,n)):e===x.topBlur&&l()}function h(e){return e!==x.topSelectionChange&&e!==x.topKeyUp&&e!==x.topKeyDown||!_||_.value===T?void 0:(T=_.value,w)}function m(e){return"INPUT"===e.nodeName&&("checkbox"===e.type||"radio"===e.type)}function v(e,t,n){return e===x.topClick?n:void 0}var g=e("./EventConstants"),y=e("./EventPluginHub"),E=e("./EventPropagators"),C=e("./ExecutionEnvironment"),R=e("./ReactUpdates"),M=e("./SyntheticEvent"),b=e("./isEventSupported"),O=e("./isTextInputElement"),D=e("./keyOf"),x=g.topLevelTypes,P={change:{phasedRegistrationNames:{bubbled:D({onChange:null}),captured:D({onChangeCapture:null})},dependencies:[x.topBlur,x.topChange,x.topClick,x.topFocus,x.topInput,x.topKeyDown,x.topKeyUp,x.topSelectionChange]}},_=null,w=null,T=null,N=null,I=!1;C.canUseDOM&&(I=b("change")&&(!("documentMode"in document)||document.documentMode>8));var S=!1;C.canUseDOM&&(S=b("input")&&(!("documentMode"in document)||document.documentMode>9));var k={get:function(){return N.get.call(this)},set:function(e){T=""+e,N.set.call(this,e)}},A={eventTypes:P,extractEvents:function(e,t,r,o){var a,i;if(n(t)?I?a=s:i=u:O(t)?S?a=d:(a=h,i=f):m(t)&&(a=v),a){var c=a(e,t,r);if(c){var l=M.getPooled(P.change,c,o);return E.accumulateTwoPhaseDispatches(l),l}}i&&i(e,t,r)}};t.exports=A},{"./EventConstants":16,"./EventPluginHub":18,"./EventPropagators":21,"./ExecutionEnvironment":22,"./ReactUpdates":77,"./SyntheticEvent":85,"./isEventSupported":125,"./isTextInputElement":127,"./keyOf":131}],8:[function(e,t){"use strict";var n=0,r={createReactRootIndex:function(){return n++}};t.exports=r},{}],9:[function(e,t){"use strict";function n(e){switch(e){case g.topCompositionStart:return E.compositionStart;case g.topCompositionEnd:return E.compositionEnd;case g.topCompositionUpdate:return E.compositionUpdate}}function r(e,t){return e===g.topKeyDown&&t.keyCode===h}function o(e,t){switch(e){case g.topKeyUp:return-1!==f.indexOf(t.keyCode);case g.topKeyDown:return t.keyCode!==h;case g.topKeyPress:case g.topMouseDown:case g.topBlur:return!0;default:return!1}}function a(e){this.root=e,this.startSelection=c.getSelection(e),this.startValue=this.getText()}var i=e("./EventConstants"),s=e("./EventPropagators"),u=e("./ExecutionEnvironment"),c=e("./ReactInputSelection"),l=e("./SyntheticCompositionEvent"),p=e("./getTextContentAccessor"),d=e("./keyOf"),f=[9,13,27,32],h=229,m=u.canUseDOM&&"CompositionEvent"in window,v=!m||"documentMode"in document&&document.documentMode>8&&document.documentMode<=11,g=i.topLevelTypes,y=null,E={compositionEnd:{phasedRegistrationNames:{bubbled:d({onCompositionEnd:null}),captured:d({onCompositionEndCapture:null})},dependencies:[g.topBlur,g.topCompositionEnd,g.topKeyDown,g.topKeyPress,g.topKeyUp,g.topMouseDown]},compositionStart:{phasedRegistrationNames:{bubbled:d({onCompositionStart:null}),captured:d({onCompositionStartCapture:null})},dependencies:[g.topBlur,g.topCompositionStart,g.topKeyDown,g.topKeyPress,g.topKeyUp,g.topMouseDown]},compositionUpdate:{phasedRegistrationNames:{bubbled:d({onCompositionUpdate:null}),captured:d({onCompositionUpdateCapture:null})},dependencies:[g.topBlur,g.topCompositionUpdate,g.topKeyDown,g.topKeyPress,g.topKeyUp,g.topMouseDown]}};a.prototype.getText=function(){return this.root.value||this.root[p()]},a.prototype.getData=function(){var e=this.getText(),t=this.startSelection.start,n=this.startValue.length-this.startSelection.end;return e.substr(t,e.length-n-t)};var C={eventTypes:E,extractEvents:function(e,t,i,u){var c,p;if(m?c=n(e):y?o(e,u)&&(c=E.compositionEnd):r(e,u)&&(c=E.compositionStart),v&&(y||c!==E.compositionStart?c===E.compositionEnd&&y&&(p=y.getData(),y=null):y=new a(t)),c){var d=l.getPooled(c,i,u);return p&&(d.data=p),s.accumulateTwoPhaseDispatches(d),d}}};t.exports=C},{"./EventConstants":16,"./EventPropagators":21,"./ExecutionEnvironment":22,"./ReactInputSelection":57,"./SyntheticCompositionEvent":83,"./getTextContentAccessor":119,"./keyOf":131}],10:[function(e,t){"use strict";function n(e,t,n){e.insertBefore(t,e.childNodes[n]||null)}var r,o=e("./Danger"),a=e("./ReactMultiChildUpdateTypes"),i=e("./getTextContentAccessor"),s=e("./invariant"),u=i();r="textContent"===u?function(e,t){e.textContent=t}:function(e,t){for(;e.firstChild;)e.removeChild(e.firstChild);if(t){var n=e.ownerDocument||document;e.appendChild(n.createTextNode(t))}};var c={dangerouslyReplaceNodeWithMarkup:o.dangerouslyReplaceNodeWithMarkup,updateTextContent:r,processUpdates:function(e,t){for(var i,u=null,c=null,l=0;i=e[l];l++)if(i.type===a.MOVE_EXISTING||i.type===a.REMOVE_NODE){var p=i.fromIndex,d=i.parentNode.childNodes[p],f=i.parentID;s(d),u=u||{},u[f]=u[f]||[],u[f][p]=d,c=c||[],c.push(d)}var h=o.dangerouslyRenderMarkup(t);if(c)for(var m=0;m<c.length;m++)c[m].parentNode.removeChild(c[m]);for(var v=0;i=e[v];v++)switch(i.type){case a.INSERT_MARKUP:n(i.parentNode,h[i.markupIndex],i.toIndex);break;case a.MOVE_EXISTING:n(i.parentNode,u[i.parentID][i.fromIndex],i.toIndex);break;case a.TEXT_CONTENT:r(i.parentNode,i.textContent);break;case a.REMOVE_NODE:}}};t.exports=c},{"./Danger":13,"./ReactMultiChildUpdateTypes":63,"./getTextContentAccessor":119,"./invariant":124}],11:[function(e,t){"use strict";function n(e,t){return(e&t)===t}var r=e("./invariant"),o={MUST_USE_ATTRIBUTE:1,MUST_USE_PROPERTY:2,HAS_SIDE_EFFECTS:4,HAS_BOOLEAN_VALUE:8,HAS_NUMERIC_VALUE:16,HAS_POSITIVE_NUMERIC_VALUE:48,HAS_OVERLOADED_BOOLEAN_VALUE:64,injectDOMPropertyConfig:function(e){var t=e.Properties||{},a=e.DOMAttributeNames||{},s=e.DOMPropertyNames||{},u=e.DOMMutationMethods||{};e.isCustomAttribute&&i._isCustomAttributeFunctions.push(e.isCustomAttribute);for(var c in t){r(!i.isStandardName.hasOwnProperty(c)),i.isStandardName[c]=!0;var l=c.toLowerCase();if(i.getPossibleStandardName[l]=c,a.hasOwnProperty(c)){var p=a[c];i.getPossibleStandardName[p]=c,i.getAttributeName[c]=p}else i.getAttributeName[c]=l;i.getPropertyName[c]=s.hasOwnProperty(c)?s[c]:c,i.getMutationMethod[c]=u.hasOwnProperty(c)?u[c]:null;var d=t[c];i.mustUseAttribute[c]=n(d,o.MUST_USE_ATTRIBUTE),i.mustUseProperty[c]=n(d,o.MUST_USE_PROPERTY),i.hasSideEffects[c]=n(d,o.HAS_SIDE_EFFECTS),i.hasBooleanValue[c]=n(d,o.HAS_BOOLEAN_VALUE),i.hasNumericValue[c]=n(d,o.HAS_NUMERIC_VALUE),i.hasPositiveNumericValue[c]=n(d,o.HAS_POSITIVE_NUMERIC_VALUE),i.hasOverloadedBooleanValue[c]=n(d,o.HAS_OVERLOADED_BOOLEAN_VALUE),r(!i.mustUseAttribute[c]||!i.mustUseProperty[c]),r(i.mustUseProperty[c]||!i.hasSideEffects[c]),r(!!i.hasBooleanValue[c]+!!i.hasNumericValue[c]+!!i.hasOverloadedBooleanValue[c]<=1)}}},a={},i={ID_ATTRIBUTE_NAME:"data-reactid",isStandardName:{},getPossibleStandardName:{},getAttributeName:{},getPropertyName:{},getMutationMethod:{},mustUseAttribute:{},mustUseProperty:{},hasSideEffects:{},hasBooleanValue:{},hasNumericValue:{},hasPositiveNumericValue:{},hasOverloadedBooleanValue:{},_isCustomAttributeFunctions:[],isCustomAttribute:function(e){for(var t=0;t<i._isCustomAttributeFunctions.length;t++){var n=i._isCustomAttributeFunctions[t];if(n(e))return!0}return!1},getDefaultValueForProperty:function(e,t){var n,r=a[e];return r||(a[e]=r={}),t in r||(n=document.createElement(e),r[t]=n[t]),r[t]},injection:o};t.exports=i},{"./invariant":124}],12:[function(e,t){"use strict";function n(e,t){return null==t||r.hasBooleanValue[e]&&!t||r.hasNumericValue[e]&&isNaN(t)||r.hasPositiveNumericValue[e]&&1>t||r.hasOverloadedBooleanValue[e]&&t===!1}var r=e("./DOMProperty"),o=e("./escapeTextForBrowser"),a=e("./memoizeStringOnly"),i=(e("./warning"),a(function(e){return o(e)+'="'})),s={createMarkupForID:function(e){return i(r.ID_ATTRIBUTE_NAME)+o(e)+'"'},createMarkupForProperty:function(e,t){if(r.isStandardName.hasOwnProperty(e)&&r.isStandardName[e]){if(n(e,t))return"";var a=r.getAttributeName[e];return r.hasBooleanValue[e]||r.hasOverloadedBooleanValue[e]&&t===!0?o(a):i(a)+o(t)+'"'}return r.isCustomAttribute(e)?null==t?"":i(e)+o(t)+'"':null},setValueForProperty:function(e,t,o){if(r.isStandardName.hasOwnProperty(t)&&r.isStandardName[t]){var a=r.getMutationMethod[t];if(a)a(e,o);else if(n(t,o))this.deleteValueForProperty(e,t);else if(r.mustUseAttribute[t])e.setAttribute(r.getAttributeName[t],""+o);else{var i=r.getPropertyName[t];r.hasSideEffects[t]&&""+e[i]==""+o||(e[i]=o)}}else r.isCustomAttribute(t)&&(null==o?e.removeAttribute(t):e.setAttribute(t,""+o))},deleteValueForProperty:function(e,t){if(r.isStandardName.hasOwnProperty(t)&&r.isStandardName[t]){var n=r.getMutationMethod[t];if(n)n(e,void 0);else if(r.mustUseAttribute[t])e.removeAttribute(r.getAttributeName[t]);else{var o=r.getPropertyName[t],a=r.getDefaultValueForProperty(e.nodeName,o);r.hasSideEffects[t]&&""+e[o]===a||(e[o]=a)}}else r.isCustomAttribute(t)&&e.removeAttribute(t)}};t.exports=s},{"./DOMProperty":11,"./escapeTextForBrowser":107,"./memoizeStringOnly":133,"./warning":141}],13:[function(e,t){"use strict";function n(e){return e.substring(1,e.indexOf(" "))}var r=e("./ExecutionEnvironment"),o=e("./createNodesFromMarkup"),a=e("./emptyFunction"),i=e("./getMarkupWrap"),s=e("./invariant"),u=/^(<[^ \/>]+)/,c="data-danger-index",l={dangerouslyRenderMarkup:function(e){s(r.canUseDOM);for(var t,l={},p=0;p<e.length;p++)s(e[p]),t=n(e[p]),t=i(t)?t:"*",l[t]=l[t]||[],l[t][p]=e[p];var d=[],f=0;for(t in l)if(l.hasOwnProperty(t)){var h=l[t];for(var m in h)if(h.hasOwnProperty(m)){var v=h[m];h[m]=v.replace(u,"$1 "+c+'="'+m+'" ')}var g=o(h.join(""),a);for(p=0;p<g.length;++p){var y=g[p];y.hasAttribute&&y.hasAttribute(c)&&(m=+y.getAttribute(c),y.removeAttribute(c),s(!d.hasOwnProperty(m)),d[m]=y,f+=1)}}return s(f===d.length),s(d.length===e.length),d},dangerouslyReplaceNodeWithMarkup:function(e,t){s(r.canUseDOM),s(t),s("html"!==e.tagName.toLowerCase());var n=o(t,a)[0];e.parentNode.replaceChild(n,e)}};t.exports=l},{"./ExecutionEnvironment":22,"./createNodesFromMarkup":102,"./emptyFunction":105,"./getMarkupWrap":116,"./invariant":124}],14:[function(e,t){"use strict";var n=e("./keyOf"),r=[n({ResponderEventPlugin:null}),n({SimpleEventPlugin:null}),n({TapEventPlugin:null}),n({EnterLeaveEventPlugin:null}),n({ChangeEventPlugin:null}),n({SelectEventPlugin:null}),n({CompositionEventPlugin:null}),n({BeforeInputEventPlugin:null}),n({AnalyticsEventPlugin:null}),n({MobileSafariClickEventPlugin:null})];t.exports=r},{"./keyOf":131}],15:[function(e,t){"use strict";var n=e("./EventConstants"),r=e("./EventPropagators"),o=e("./SyntheticMouseEvent"),a=e("./ReactMount"),i=e("./keyOf"),s=n.topLevelTypes,u=a.getFirstReactDOM,c={mouseEnter:{registrationName:i({onMouseEnter:null}),dependencies:[s.topMouseOut,s.topMouseOver]},mouseLeave:{registrationName:i({onMouseLeave:null}),dependencies:[s.topMouseOut,s.topMouseOver]}},l=[null,null],p={eventTypes:c,extractEvents:function(e,t,n,i){if(e===s.topMouseOver&&(i.relatedTarget||i.fromElement))return null;if(e!==s.topMouseOut&&e!==s.topMouseOver)return null;var p;if(t.window===t)p=t;else{var d=t.ownerDocument;p=d?d.defaultView||d.parentWindow:window}var f,h;if(e===s.topMouseOut?(f=t,h=u(i.relatedTarget||i.toElement)||p):(f=p,h=t),f===h)return null;var m=f?a.getID(f):"",v=h?a.getID(h):"",g=o.getPooled(c.mouseLeave,m,i);g.type="mouseleave",g.target=f,g.relatedTarget=h;var y=o.getPooled(c.mouseEnter,v,i);return y.type="mouseenter",y.target=h,y.relatedTarget=f,r.accumulateEnterLeaveDispatches(g,y,m,v),l[0]=g,l[1]=y,l}};t.exports=p},{"./EventConstants":16,"./EventPropagators":21,"./ReactMount":61,"./SyntheticMouseEvent":89,"./keyOf":131}],16:[function(e,t){"use strict";var n=e("./keyMirror"),r=n({bubbled:null,captured:null}),o=n({topBlur:null,topChange:null,topClick:null,topCompositionEnd:null,topCompositionStart:null,topCompositionUpdate:null,topContextMenu:null,topCopy:null,topCut:null,topDoubleClick:null,topDrag:null,topDragEnd:null,topDragEnter:null,topDragExit:null,topDragLeave:null,topDragOver:null,topDragStart:null,topDrop:null,topError:null,topFocus:null,topInput:null,topKeyDown:null,topKeyPress:null,topKeyUp:null,topLoad:null,topMouseDown:null,topMouseMove:null,topMouseOut:null,topMouseOver:null,topMouseUp:null,topPaste:null,topReset:null,topScroll:null,topSelectionChange:null,topSubmit:null,topTextInput:null,topTouchCancel:null,topTouchEnd:null,topTouchMove:null,topTouchStart:null,topWheel:null}),a={topLevelTypes:o,PropagationPhases:r};t.exports=a},{"./keyMirror":130}],17:[function(e,t){var n=e("./emptyFunction"),r={listen:function(e,t,n){return e.addEventListener?(e.addEventListener(t,n,!1),{remove:function(){e.removeEventListener(t,n,!1)}}):e.attachEvent?(e.attachEvent("on"+t,n),{remove:function(){e.detachEvent("on"+t,n)}}):void 0},capture:function(e,t,r){return e.addEventListener?(e.addEventListener(t,r,!0),{remove:function(){e.removeEventListener(t,r,!0)}}):{remove:n}},registerDefault:function(){}};t.exports=r},{"./emptyFunction":105}],18:[function(e,t){"use strict";var n=e("./EventPluginRegistry"),r=e("./EventPluginUtils"),o=e("./accumulateInto"),a=e("./forEachAccumulated"),i=e("./invariant"),s={},u=null,c=function(e){if(e){var t=r.executeDispatch,o=n.getPluginModuleForEvent(e);o&&o.executeDispatch&&(t=o.executeDispatch),r.executeDispatchesInOrder(e,t),e.isPersistent()||e.constructor.release(e)}},l=null,p={injection:{injectMount:r.injection.injectMount,injectInstanceHandle:function(e){l=e},getInstanceHandle:function(){return l},injectEventPluginOrder:n.injectEventPluginOrder,injectEventPluginsByName:n.injectEventPluginsByName},eventNameDispatchConfigs:n.eventNameDispatchConfigs,registrationNameModules:n.registrationNameModules,putListener:function(e,t,n){i(!n||"function"==typeof n);var r=s[t]||(s[t]={});r[e]=n},getListener:function(e,t){var n=s[t];return n&&n[e]},deleteListener:function(e,t){var n=s[t];n&&delete n[e]},deleteAllListeners:function(e){for(var t in s)delete s[t][e]},extractEvents:function(e,t,r,a){for(var i,s=n.plugins,u=0,c=s.length;c>u;u++){var l=s[u];if(l){var p=l.extractEvents(e,t,r,a);p&&(i=o(i,p))}}return i},enqueueEvents:function(e){e&&(u=o(u,e))},processEventQueue:function(){var e=u;u=null,a(e,c),i(!u)},__purge:function(){s={}},__getListenerBank:function(){return s}};t.exports=p},{"./EventPluginRegistry":19,"./EventPluginUtils":20,"./accumulateInto":95,"./forEachAccumulated":110,"./invariant":124}],19:[function(e,t){"use strict";function n(){if(i)for(var e in s){var t=s[e],n=i.indexOf(e);if(a(n>-1),!u.plugins[n]){a(t.extractEvents),u.plugins[n]=t;var o=t.eventTypes;for(var c in o)a(r(o[c],t,c))}}}function r(e,t,n){a(!u.eventNameDispatchConfigs.hasOwnProperty(n)),u.eventNameDispatchConfigs[n]=e;var r=e.phasedRegistrationNames;if(r){for(var i in r)if(r.hasOwnProperty(i)){var s=r[i];o(s,t,n)}return!0}return e.registrationName?(o(e.registrationName,t,n),!0):!1}function o(e,t,n){a(!u.registrationNameModules[e]),u.registrationNameModules[e]=t,u.registrationNameDependencies[e]=t.eventTypes[n].dependencies}var a=e("./invariant"),i=null,s={},u={plugins:[],eventNameDispatchConfigs:{},registrationNameModules:{},registrationNameDependencies:{},injectEventPluginOrder:function(e){a(!i),i=Array.prototype.slice.call(e),n()},injectEventPluginsByName:function(e){var t=!1;for(var r in e)if(e.hasOwnProperty(r)){var o=e[r];s.hasOwnProperty(r)&&s[r]===o||(a(!s[r]),s[r]=o,t=!0)}t&&n()},getPluginModuleForEvent:function(e){var t=e.dispatchConfig;if(t.registrationName)return u.registrationNameModules[t.registrationName]||null;for(var n in t.phasedRegistrationNames)if(t.phasedRegistrationNames.hasOwnProperty(n)){var r=u.registrationNameModules[t.phasedRegistrationNames[n]];if(r)return r}return null},_resetEventPlugins:function(){i=null;for(var e in s)s.hasOwnProperty(e)&&delete s[e];u.plugins.length=0;var t=u.eventNameDispatchConfigs;for(var n in t)t.hasOwnProperty(n)&&delete t[n];var r=u.registrationNameModules;for(var o in r)r.hasOwnProperty(o)&&delete r[o]}};t.exports=u},{"./invariant":124}],20:[function(e,t){"use strict";function n(e){return e===m.topMouseUp||e===m.topTouchEnd||e===m.topTouchCancel}function r(e){return e===m.topMouseMove||e===m.topTouchMove}function o(e){return e===m.topMouseDown||e===m.topTouchStart}function a(e,t){var n=e._dispatchListeners,r=e._dispatchIDs;if(Array.isArray(n))for(var o=0;o<n.length&&!e.isPropagationStopped();o++)t(e,n[o],r[o]);else n&&t(e,n,r)}function i(e,t,n){e.currentTarget=h.Mount.getNode(n);var r=t(e,n);return e.currentTarget=null,r}function s(e,t){a(e,t),e._dispatchListeners=null,e._dispatchIDs=null}function u(e){var t=e._dispatchListeners,n=e._dispatchIDs;if(Array.isArray(t)){for(var r=0;r<t.length&&!e.isPropagationStopped();r++)if(t[r](e,n[r]))return n[r]}else if(t&&t(e,n))return n;return null}function c(e){var t=u(e);return e._dispatchIDs=null,e._dispatchListeners=null,t}function l(e){var t=e._dispatchListeners,n=e._dispatchIDs;f(!Array.isArray(t));var r=t?t(e,n):null;return e._dispatchListeners=null,e._dispatchIDs=null,r}function p(e){return!!e._dispatchListeners}var d=e("./EventConstants"),f=e("./invariant"),h={Mount:null,injectMount:function(e){h.Mount=e}},m=d.topLevelTypes,v={isEndish:n,isMoveish:r,isStartish:o,executeDirectDispatch:l,executeDispatch:i,executeDispatchesInOrder:s,executeDispatchesInOrderStopAtTrue:c,hasDispatches:p,injection:h,useTouchEvents:!1};t.exports=v},{"./EventConstants":16,"./invariant":124}],21:[function(e,t){"use strict";function n(e,t,n){var r=t.dispatchConfig.phasedRegistrationNames[n];return m(e,r)}function r(e,t,r){var o=t?h.bubbled:h.captured,a=n(e,r,o);a&&(r._dispatchListeners=d(r._dispatchListeners,a),r._dispatchIDs=d(r._dispatchIDs,e))}function o(e){e&&e.dispatchConfig.phasedRegistrationNames&&p.injection.getInstanceHandle().traverseTwoPhase(e.dispatchMarker,r,e)}function a(e,t,n){if(n&&n.dispatchConfig.registrationName){var r=n.dispatchConfig.registrationName,o=m(e,r);o&&(n._dispatchListeners=d(n._dispatchListeners,o),n._dispatchIDs=d(n._dispatchIDs,e))}}function i(e){e&&e.dispatchConfig.registrationName&&a(e.dispatchMarker,null,e)}function s(e){f(e,o)}function u(e,t,n,r){p.injection.getInstanceHandle().traverseEnterLeave(n,r,a,e,t)}function c(e){f(e,i)}var l=e("./EventConstants"),p=e("./EventPluginHub"),d=e("./accumulateInto"),f=e("./forEachAccumulated"),h=l.PropagationPhases,m=p.getListener,v={accumulateTwoPhaseDispatches:s,accumulateDirectDispatches:c,accumulateEnterLeaveDispatches:u};t.exports=v},{"./EventConstants":16,"./EventPluginHub":18,"./accumulateInto":95,"./forEachAccumulated":110}],22:[function(e,t){"use strict";var n=!("undefined"==typeof window||!window.document||!window.document.createElement),r={canUseDOM:n,canUseWorkers:"undefined"!=typeof Worker,canUseEventListeners:n&&!(!window.addEventListener&&!window.attachEvent),canUseViewport:n&&!!window.screen,isInWorker:!n};t.exports=r},{}],23:[function(e,t){"use strict";var n,r=e("./DOMProperty"),o=e("./ExecutionEnvironment"),a=r.injection.MUST_USE_ATTRIBUTE,i=r.injection.MUST_USE_PROPERTY,s=r.injection.HAS_BOOLEAN_VALUE,u=r.injection.HAS_SIDE_EFFECTS,c=r.injection.HAS_NUMERIC_VALUE,l=r.injection.HAS_POSITIVE_NUMERIC_VALUE,p=r.injection.HAS_OVERLOADED_BOOLEAN_VALUE;if(o.canUseDOM){var d=document.implementation;n=d&&d.hasFeature&&d.hasFeature("http://www.w3.org/TR/SVG11/feature#BasicStructure","1.1")}var f={isCustomAttribute:RegExp.prototype.test.bind(/^(data|aria)-[a-z_][a-z\d_.\-]*$/),Properties:{accept:null,acceptCharset:null,accessKey:null,action:null,allowFullScreen:a|s,allowTransparency:a,alt:null,async:s,autoComplete:null,autoPlay:s,cellPadding:null,cellSpacing:null,charSet:a,checked:i|s,classID:a,className:n?a:i,cols:a|l,colSpan:null,content:null,contentEditable:null,contextMenu:a,controls:i|s,coords:null,crossOrigin:null,data:null,dateTime:a,defer:s,dir:null,disabled:a|s,download:p,draggable:null,encType:null,form:a,formAction:a,formEncType:a,formMethod:a,formNoValidate:s,formTarget:a,frameBorder:a,height:a,hidden:a|s,href:null,hrefLang:null,htmlFor:null,httpEquiv:null,icon:null,id:i,label:null,lang:null,list:a,loop:i|s,manifest:a,marginHeight:null,marginWidth:null,max:null,maxLength:a,media:a,mediaGroup:null,method:null,min:null,multiple:i|s,muted:i|s,name:null,noValidate:s,open:null,pattern:null,placeholder:null,poster:null,preload:null,radioGroup:null,readOnly:i|s,rel:null,required:s,role:a,rows:a|l,rowSpan:null,sandbox:null,scope:null,scrolling:null,seamless:a|s,selected:i|s,shape:null,size:a|l,sizes:a,span:l,spellCheck:null,src:null,srcDoc:i,srcSet:a,start:c,step:null,style:null,tabIndex:null,target:null,title:null,type:null,useMap:null,value:i|u,width:a,wmode:a,autoCapitalize:null,autoCorrect:null,itemProp:a,itemScope:a|s,itemType:a,property:null},DOMAttributeNames:{acceptCharset:"accept-charset",className:"class",htmlFor:"for",httpEquiv:"http-equiv"},DOMPropertyNames:{autoCapitalize:"autocapitalize",autoComplete:"autocomplete",autoCorrect:"autocorrect",autoFocus:"autofocus",autoPlay:"autoplay",encType:"enctype",hrefLang:"hreflang",radioGroup:"radiogroup",spellCheck:"spellcheck",srcDoc:"srcdoc",srcSet:"srcset"}};t.exports=f},{"./DOMProperty":11,"./ExecutionEnvironment":22}],24:[function(e,t){"use strict";function n(e){u(null==e.props.checkedLink||null==e.props.valueLink)}function r(e){n(e),u(null==e.props.value&&null==e.props.onChange)}function o(e){n(e),u(null==e.props.checked&&null==e.props.onChange)}function a(e){this.props.valueLink.requestChange(e.target.value)}function i(e){this.props.checkedLink.requestChange(e.target.checked)}var s=e("./ReactPropTypes"),u=e("./invariant"),c={button:!0,checkbox:!0,image:!0,hidden:!0,radio:!0,reset:!0,submit:!0},l={Mixin:{propTypes:{value:function(e,t){return!e[t]||c[e.type]||e.onChange||e.readOnly||e.disabled?void 0:new Error("You provided a `value` prop to a form field without an `onChange` handler. This will render a read-only field. If the field should be mutable use `defaultValue`. Otherwise, set either `onChange` or `readOnly`.")},checked:function(e,t){return!e[t]||e.onChange||e.readOnly||e.disabled?void 0:new Error("You provided a `checked` prop to a form field without an `onChange` handler. This will render a read-only field. If the field should be mutable use `defaultChecked`. Otherwise, set either `onChange` or `readOnly`.")},onChange:s.func}},getValue:function(e){return e.props.valueLink?(r(e),e.props.valueLink.value):e.props.value},getChecked:function(e){return e.props.checkedLink?(o(e),e.props.checkedLink.value):e.props.checked},getOnChange:function(e){return e.props.valueLink?(r(e),a):e.props.checkedLink?(o(e),i):e.props.onChange}};t.exports=l},{"./ReactPropTypes":70,"./invariant":124}],25:[function(e,t){"use strict";function n(e){e.remove()}var r=e("./ReactBrowserEventEmitter"),o=e("./accumulateInto"),a=e("./forEachAccumulated"),i=e("./invariant"),s={trapBubbledEvent:function(e,t){i(this.isMounted());var n=r.trapBubbledEvent(e,t,this.getDOMNode());this._localEventListeners=o(this._localEventListeners,n)},componentWillUnmount:function(){this._localEventListeners&&a(this._localEventListeners,n)}};t.exports=s},{"./ReactBrowserEventEmitter":30,"./accumulateInto":95,"./forEachAccumulated":110,"./invariant":124}],26:[function(e,t){"use strict";var n=e("./EventConstants"),r=e("./emptyFunction"),o=n.topLevelTypes,a={eventTypes:null,extractEvents:function(e,t,n,a){if(e===o.topTouchStart){var i=a.target;i&&!i.onclick&&(i.onclick=r)}}};t.exports=a},{"./EventConstants":16,"./emptyFunction":105}],27:[function(e,t){function n(e){if(null==e)throw new TypeError("Object.assign target cannot be null or undefined");for(var t=Object(e),n=Object.prototype.hasOwnProperty,r=1;r<arguments.length;r++){var o=arguments[r];if(null!=o){var a=Object(o);for(var i in a)n.call(a,i)&&(t[i]=a[i])}}return t}t.exports=n},{}],28:[function(e,t){"use strict";var n=e("./invariant"),r=function(e){var t=this;if(t.instancePool.length){var n=t.instancePool.pop();return t.call(n,e),n}return new t(e)},o=function(e,t){var n=this;if(n.instancePool.length){var r=n.instancePool.pop();return n.call(r,e,t),r}return new n(e,t)},a=function(e,t,n){var r=this;
if(r.instancePool.length){var o=r.instancePool.pop();return r.call(o,e,t,n),o}return new r(e,t,n)},i=function(e,t,n,r,o){var a=this;if(a.instancePool.length){var i=a.instancePool.pop();return a.call(i,e,t,n,r,o),i}return new a(e,t,n,r,o)},s=function(e){var t=this;n(e instanceof t),e.destructor&&e.destructor(),t.instancePool.length<t.poolSize&&t.instancePool.push(e)},u=10,c=r,l=function(e,t){var n=e;return n.instancePool=[],n.getPooled=t||c,n.poolSize||(n.poolSize=u),n.release=s,n},p={addPoolingTo:l,oneArgumentPooler:r,twoArgumentPooler:o,threeArgumentPooler:a,fiveArgumentPooler:i};t.exports=p},{"./invariant":124}],29:[function(e,t){"use strict";var n=e("./ReactEmptyComponent"),r=e("./ReactMount"),o=e("./invariant"),a={getDOMNode:function(){return o(this.isMounted()),n.isNullComponentID(this._rootNodeID)?null:r.getNode(this._rootNodeID)}};t.exports=a},{"./ReactEmptyComponent":52,"./ReactMount":61,"./invariant":124}],30:[function(e,t){"use strict";function n(e){return Object.prototype.hasOwnProperty.call(e,h)||(e[h]=d++,l[e[h]]={}),l[e[h]]}var r=e("./EventConstants"),o=e("./EventPluginHub"),a=e("./EventPluginRegistry"),i=e("./ReactEventEmitterMixin"),s=e("./ViewportMetrics"),u=e("./Object.assign"),c=e("./isEventSupported"),l={},p=!1,d=0,f={topBlur:"blur",topChange:"change",topClick:"click",topCompositionEnd:"compositionend",topCompositionStart:"compositionstart",topCompositionUpdate:"compositionupdate",topContextMenu:"contextmenu",topCopy:"copy",topCut:"cut",topDoubleClick:"dblclick",topDrag:"drag",topDragEnd:"dragend",topDragEnter:"dragenter",topDragExit:"dragexit",topDragLeave:"dragleave",topDragOver:"dragover",topDragStart:"dragstart",topDrop:"drop",topFocus:"focus",topInput:"input",topKeyDown:"keydown",topKeyPress:"keypress",topKeyUp:"keyup",topMouseDown:"mousedown",topMouseMove:"mousemove",topMouseOut:"mouseout",topMouseOver:"mouseover",topMouseUp:"mouseup",topPaste:"paste",topScroll:"scroll",topSelectionChange:"selectionchange",topTextInput:"textInput",topTouchCancel:"touchcancel",topTouchEnd:"touchend",topTouchMove:"touchmove",topTouchStart:"touchstart",topWheel:"wheel"},h="_reactListenersID"+String(Math.random()).slice(2),m=u({},i,{ReactEventListener:null,injection:{injectReactEventListener:function(e){e.setHandleTopLevel(m.handleTopLevel),m.ReactEventListener=e}},setEnabled:function(e){m.ReactEventListener&&m.ReactEventListener.setEnabled(e)},isEnabled:function(){return!(!m.ReactEventListener||!m.ReactEventListener.isEnabled())},listenTo:function(e,t){for(var o=t,i=n(o),s=a.registrationNameDependencies[e],u=r.topLevelTypes,l=0,p=s.length;p>l;l++){var d=s[l];i.hasOwnProperty(d)&&i[d]||(d===u.topWheel?c("wheel")?m.ReactEventListener.trapBubbledEvent(u.topWheel,"wheel",o):c("mousewheel")?m.ReactEventListener.trapBubbledEvent(u.topWheel,"mousewheel",o):m.ReactEventListener.trapBubbledEvent(u.topWheel,"DOMMouseScroll",o):d===u.topScroll?c("scroll",!0)?m.ReactEventListener.trapCapturedEvent(u.topScroll,"scroll",o):m.ReactEventListener.trapBubbledEvent(u.topScroll,"scroll",m.ReactEventListener.WINDOW_HANDLE):d===u.topFocus||d===u.topBlur?(c("focus",!0)?(m.ReactEventListener.trapCapturedEvent(u.topFocus,"focus",o),m.ReactEventListener.trapCapturedEvent(u.topBlur,"blur",o)):c("focusin")&&(m.ReactEventListener.trapBubbledEvent(u.topFocus,"focusin",o),m.ReactEventListener.trapBubbledEvent(u.topBlur,"focusout",o)),i[u.topBlur]=!0,i[u.topFocus]=!0):f.hasOwnProperty(d)&&m.ReactEventListener.trapBubbledEvent(d,f[d],o),i[d]=!0)}},trapBubbledEvent:function(e,t,n){return m.ReactEventListener.trapBubbledEvent(e,t,n)},trapCapturedEvent:function(e,t,n){return m.ReactEventListener.trapCapturedEvent(e,t,n)},ensureScrollValueMonitoring:function(){if(!p){var e=s.refreshScrollValues;m.ReactEventListener.monitorScrollValue(e),p=!0}},eventNameDispatchConfigs:o.eventNameDispatchConfigs,registrationNameModules:o.registrationNameModules,putListener:o.putListener,getListener:o.getListener,deleteListener:o.deleteListener,deleteAllListeners:o.deleteAllListeners});t.exports=m},{"./EventConstants":16,"./EventPluginHub":18,"./EventPluginRegistry":19,"./Object.assign":27,"./ReactEventEmitterMixin":54,"./ViewportMetrics":94,"./isEventSupported":125}],31:[function(e,t){"use strict";function n(e,t){this.forEachFunction=e,this.forEachContext=t}function r(e,t,n,r){var o=e;o.forEachFunction.call(o.forEachContext,t,r)}function o(e,t,o){if(null==e)return e;var a=n.getPooled(t,o);p(e,r,a),n.release(a)}function a(e,t,n){this.mapResult=e,this.mapFunction=t,this.mapContext=n}function i(e,t,n,r){var o=e,a=o.mapResult,i=!a.hasOwnProperty(n);if(i){var s=o.mapFunction.call(o.mapContext,t,r);a[n]=s}}function s(e,t,n){if(null==e)return e;var r={},o=a.getPooled(r,t,n);return p(e,i,o),a.release(o),r}function u(){return null}function c(e){return p(e,u,null)}var l=e("./PooledClass"),p=e("./traverseAllChildren"),d=(e("./warning"),l.twoArgumentPooler),f=l.threeArgumentPooler;l.addPoolingTo(n,d),l.addPoolingTo(a,f);var h={forEach:o,map:s,count:c};t.exports=h},{"./PooledClass":28,"./traverseAllChildren":140,"./warning":141}],32:[function(e,t){"use strict";var n=e("./ReactElement"),r=e("./ReactOwner"),o=e("./ReactUpdates"),a=e("./Object.assign"),i=e("./invariant"),s=e("./keyMirror"),u=s({MOUNTED:null,UNMOUNTED:null}),c=!1,l=null,p=null,d={injection:{injectEnvironment:function(e){i(!c),p=e.mountImageIntoNode,l=e.unmountIDFromEnvironment,d.BackendIDOperations=e.BackendIDOperations,c=!0}},LifeCycle:u,BackendIDOperations:null,Mixin:{isMounted:function(){return this._lifeCycleState===u.MOUNTED},setProps:function(e,t){var n=this._pendingElement||this._currentElement;this.replaceProps(a({},n.props,e),t)},replaceProps:function(e,t){i(this.isMounted()),i(0===this._mountDepth),this._pendingElement=n.cloneAndReplaceProps(this._pendingElement||this._currentElement,e),o.enqueueUpdate(this,t)},_setPropsInternal:function(e,t){var r=this._pendingElement||this._currentElement;this._pendingElement=n.cloneAndReplaceProps(r,a({},r.props,e)),o.enqueueUpdate(this,t)},construct:function(e){this.props=e.props,this._owner=e._owner,this._lifeCycleState=u.UNMOUNTED,this._pendingCallbacks=null,this._currentElement=e,this._pendingElement=null},mountComponent:function(e,t,n){i(!this.isMounted());var o=this._currentElement.ref;if(null!=o){var a=this._currentElement._owner;r.addComponentAsRefTo(this,o,a)}this._rootNodeID=e,this._lifeCycleState=u.MOUNTED,this._mountDepth=n},unmountComponent:function(){i(this.isMounted());var e=this._currentElement.ref;null!=e&&r.removeComponentAsRefFrom(this,e,this._owner),l(this._rootNodeID),this._rootNodeID=null,this._lifeCycleState=u.UNMOUNTED},receiveComponent:function(e,t){i(this.isMounted()),this._pendingElement=e,this.performUpdateIfNecessary(t)},performUpdateIfNecessary:function(e){if(null!=this._pendingElement){var t=this._currentElement,n=this._pendingElement;this._currentElement=n,this.props=n.props,this._owner=n._owner,this._pendingElement=null,this.updateComponent(e,t)}},updateComponent:function(e,t){var n=this._currentElement;(n._owner!==t._owner||n.ref!==t.ref)&&(null!=t.ref&&r.removeComponentAsRefFrom(this,t.ref,t._owner),null!=n.ref&&r.addComponentAsRefTo(this,n.ref,n._owner))},mountComponentIntoNode:function(e,t,n){var r=o.ReactReconcileTransaction.getPooled();r.perform(this._mountComponentIntoNode,this,e,t,r,n),o.ReactReconcileTransaction.release(r)},_mountComponentIntoNode:function(e,t,n,r){var o=this.mountComponent(e,n,0);p(o,t,r)},isOwnedBy:function(e){return this._owner===e},getSiblingByRef:function(e){var t=this._owner;return t&&t.refs?t.refs[e]:null}}};t.exports=d},{"./Object.assign":27,"./ReactElement":50,"./ReactOwner":65,"./ReactUpdates":77,"./invariant":124,"./keyMirror":130}],33:[function(e,t){"use strict";var n=e("./ReactDOMIDOperations"),r=e("./ReactMarkupChecksum"),o=e("./ReactMount"),a=e("./ReactPerf"),i=e("./ReactReconcileTransaction"),s=e("./getReactRootElementInContainer"),u=e("./invariant"),c=e("./setInnerHTML"),l=1,p=9,d={ReactReconcileTransaction:i,BackendIDOperations:n,unmountIDFromEnvironment:function(e){o.purgeID(e)},mountImageIntoNode:a.measure("ReactComponentBrowserEnvironment","mountImageIntoNode",function(e,t,n){if(u(t&&(t.nodeType===l||t.nodeType===p)),n){if(r.canReuseMarkup(e,s(t)))return;u(t.nodeType!==p)}u(t.nodeType!==p),c(t,e)})};t.exports=d},{"./ReactDOMIDOperations":41,"./ReactMarkupChecksum":60,"./ReactMount":61,"./ReactPerf":66,"./ReactReconcileTransaction":72,"./getReactRootElementInContainer":118,"./invariant":124,"./setInnerHTML":136}],34:[function(e,t){"use strict";function n(e){var t=e._owner||null;return t&&t.constructor&&t.constructor.displayName?" Check the render method of `"+t.constructor.displayName+"`.":""}function r(e,t){for(var n in t)t.hasOwnProperty(n)&&D("function"==typeof t[n])}function o(e,t){var n=S.hasOwnProperty(t)?S[t]:null;L.hasOwnProperty(t)&&D(n===N.OVERRIDE_BASE),e.hasOwnProperty(t)&&D(n===N.DEFINE_MANY||n===N.DEFINE_MANY_MERGED)}function a(e){var t=e._compositeLifeCycleState;D(e.isMounted()||t===A.MOUNTING),D(null==f.current),D(t!==A.UNMOUNTING)}function i(e,t){if(t){D(!g.isValidFactory(t)),D(!h.isValidElement(t));var n=e.prototype;t.hasOwnProperty(T)&&k.mixins(e,t.mixins);for(var r in t)if(t.hasOwnProperty(r)&&r!==T){var a=t[r];if(o(n,r),k.hasOwnProperty(r))k[r](e,a);else{var i=S.hasOwnProperty(r),s=n.hasOwnProperty(r),u=a&&a.__reactDontBind,p="function"==typeof a,d=p&&!i&&!s&&!u;if(d)n.__reactAutoBindMap||(n.__reactAutoBindMap={}),n.__reactAutoBindMap[r]=a,n[r]=a;else if(s){var f=S[r];D(i&&(f===N.DEFINE_MANY_MERGED||f===N.DEFINE_MANY)),f===N.DEFINE_MANY_MERGED?n[r]=c(n[r],a):f===N.DEFINE_MANY&&(n[r]=l(n[r],a))}else n[r]=a}}}}function s(e,t){if(t)for(var n in t){var r=t[n];if(t.hasOwnProperty(n)){var o=n in k;D(!o);var a=n in e;D(!a),e[n]=r}}}function u(e,t){return D(e&&t&&"object"==typeof e&&"object"==typeof t),_(t,function(t,n){D(void 0===e[n]),e[n]=t}),e}function c(e,t){return function(){var n=e.apply(this,arguments),r=t.apply(this,arguments);return null==n?r:null==r?n:u(n,r)}}function l(e,t){return function(){e.apply(this,arguments),t.apply(this,arguments)}}var p=e("./ReactComponent"),d=e("./ReactContext"),f=e("./ReactCurrentOwner"),h=e("./ReactElement"),m=(e("./ReactElementValidator"),e("./ReactEmptyComponent")),v=e("./ReactErrorUtils"),g=e("./ReactLegacyElement"),y=e("./ReactOwner"),E=e("./ReactPerf"),C=e("./ReactPropTransferer"),R=e("./ReactPropTypeLocations"),M=(e("./ReactPropTypeLocationNames"),e("./ReactUpdates")),b=e("./Object.assign"),O=e("./instantiateReactComponent"),D=e("./invariant"),x=e("./keyMirror"),P=e("./keyOf"),_=(e("./monitorCodeUse"),e("./mapObject")),w=e("./shouldUpdateReactComponent"),T=(e("./warning"),P({mixins:null})),N=x({DEFINE_ONCE:null,DEFINE_MANY:null,OVERRIDE_BASE:null,DEFINE_MANY_MERGED:null}),I=[],S={mixins:N.DEFINE_MANY,statics:N.DEFINE_MANY,propTypes:N.DEFINE_MANY,contextTypes:N.DEFINE_MANY,childContextTypes:N.DEFINE_MANY,getDefaultProps:N.DEFINE_MANY_MERGED,getInitialState:N.DEFINE_MANY_MERGED,getChildContext:N.DEFINE_MANY_MERGED,render:N.DEFINE_ONCE,componentWillMount:N.DEFINE_MANY,componentDidMount:N.DEFINE_MANY,componentWillReceiveProps:N.DEFINE_MANY,shouldComponentUpdate:N.DEFINE_ONCE,componentWillUpdate:N.DEFINE_MANY,componentDidUpdate:N.DEFINE_MANY,componentWillUnmount:N.DEFINE_MANY,updateComponent:N.OVERRIDE_BASE},k={displayName:function(e,t){e.displayName=t},mixins:function(e,t){if(t)for(var n=0;n<t.length;n++)i(e,t[n])},childContextTypes:function(e,t){r(e,t,R.childContext),e.childContextTypes=b({},e.childContextTypes,t)},contextTypes:function(e,t){r(e,t,R.context),e.contextTypes=b({},e.contextTypes,t)},getDefaultProps:function(e,t){e.getDefaultProps=e.getDefaultProps?c(e.getDefaultProps,t):t},propTypes:function(e,t){r(e,t,R.prop),e.propTypes=b({},e.propTypes,t)},statics:function(e,t){s(e,t)}},A=x({MOUNTING:null,UNMOUNTING:null,RECEIVING_PROPS:null}),L={construct:function(){p.Mixin.construct.apply(this,arguments),y.Mixin.construct.apply(this,arguments),this.state=null,this._pendingState=null,this.context=null,this._compositeLifeCycleState=null},isMounted:function(){return p.Mixin.isMounted.call(this)&&this._compositeLifeCycleState!==A.MOUNTING},mountComponent:E.measure("ReactCompositeComponent","mountComponent",function(e,t,n){p.Mixin.mountComponent.call(this,e,t,n),this._compositeLifeCycleState=A.MOUNTING,this.__reactAutoBindMap&&this._bindAutoBindMethods(),this.context=this._processContext(this._currentElement._context),this.props=this._processProps(this.props),this.state=this.getInitialState?this.getInitialState():null,D("object"==typeof this.state&&!Array.isArray(this.state)),this._pendingState=null,this._pendingForceUpdate=!1,this.componentWillMount&&(this.componentWillMount(),this._pendingState&&(this.state=this._pendingState,this._pendingState=null)),this._renderedComponent=O(this._renderValidatedComponent(),this._currentElement.type),this._compositeLifeCycleState=null;var r=this._renderedComponent.mountComponent(e,t,n+1);return this.componentDidMount&&t.getReactMountReady().enqueue(this.componentDidMount,this),r}),unmountComponent:function(){this._compositeLifeCycleState=A.UNMOUNTING,this.componentWillUnmount&&this.componentWillUnmount(),this._compositeLifeCycleState=null,this._renderedComponent.unmountComponent(),this._renderedComponent=null,p.Mixin.unmountComponent.call(this)},setState:function(e,t){D("object"==typeof e||null==e),this.replaceState(b({},this._pendingState||this.state,e),t)},replaceState:function(e,t){a(this),this._pendingState=e,this._compositeLifeCycleState!==A.MOUNTING&&M.enqueueUpdate(this,t)},_processContext:function(e){var t=null,n=this.constructor.contextTypes;if(n){t={};for(var r in n)t[r]=e[r]}return t},_processChildContext:function(e){var t=this.getChildContext&&this.getChildContext();if(this.constructor.displayName||"ReactCompositeComponent",t){D("object"==typeof this.constructor.childContextTypes);for(var n in t)D(n in this.constructor.childContextTypes);return b({},e,t)}return e},_processProps:function(e){return e},_checkPropTypes:function(e,t,r){var o=this.constructor.displayName;for(var a in e)if(e.hasOwnProperty(a)){var i=e[a](t,a,o,r);i instanceof Error&&n(this)}},performUpdateIfNecessary:function(e){var t=this._compositeLifeCycleState;if(t!==A.MOUNTING&&t!==A.RECEIVING_PROPS&&(null!=this._pendingElement||null!=this._pendingState||this._pendingForceUpdate)){var n=this.context,r=this.props,o=this._currentElement;null!=this._pendingElement&&(o=this._pendingElement,n=this._processContext(o._context),r=this._processProps(o.props),this._pendingElement=null,this._compositeLifeCycleState=A.RECEIVING_PROPS,this.componentWillReceiveProps&&this.componentWillReceiveProps(r,n)),this._compositeLifeCycleState=null;var a=this._pendingState||this.state;this._pendingState=null;var i=this._pendingForceUpdate||!this.shouldComponentUpdate||this.shouldComponentUpdate(r,a,n);i?(this._pendingForceUpdate=!1,this._performComponentUpdate(o,r,a,n,e)):(this._currentElement=o,this.props=r,this.state=a,this.context=n,this._owner=o._owner)}},_performComponentUpdate:function(e,t,n,r,o){var a=this._currentElement,i=this.props,s=this.state,u=this.context;this.componentWillUpdate&&this.componentWillUpdate(t,n,r),this._currentElement=e,this.props=t,this.state=n,this.context=r,this._owner=e._owner,this.updateComponent(o,a),this.componentDidUpdate&&o.getReactMountReady().enqueue(this.componentDidUpdate.bind(this,i,s,u),this)},receiveComponent:function(e,t){(e!==this._currentElement||null==e._owner)&&p.Mixin.receiveComponent.call(this,e,t)},updateComponent:E.measure("ReactCompositeComponent","updateComponent",function(e,t){p.Mixin.updateComponent.call(this,e,t);var n=this._renderedComponent,r=n._currentElement,o=this._renderValidatedComponent();if(w(r,o))n.receiveComponent(o,e);else{var a=this._rootNodeID,i=n._rootNodeID;n.unmountComponent(),this._renderedComponent=O(o,this._currentElement.type);var s=this._renderedComponent.mountComponent(a,e,this._mountDepth+1);p.BackendIDOperations.dangerouslyReplaceNodeWithMarkupByID(i,s)}}),forceUpdate:function(e){var t=this._compositeLifeCycleState;D(this.isMounted()||t===A.MOUNTING),D(t!==A.UNMOUNTING&&null==f.current),this._pendingForceUpdate=!0,M.enqueueUpdate(this,e)},_renderValidatedComponent:E.measure("ReactCompositeComponent","_renderValidatedComponent",function(){var e,t=d.current;d.current=this._processChildContext(this._currentElement._context),f.current=this;try{e=this.render(),null===e||e===!1?(e=m.getEmptyComponent(),m.registerNullComponentID(this._rootNodeID)):m.deregisterNullComponentID(this._rootNodeID)}finally{d.current=t,f.current=null}return D(h.isValidElement(e)),e}),_bindAutoBindMethods:function(){for(var e in this.__reactAutoBindMap)if(this.__reactAutoBindMap.hasOwnProperty(e)){var t=this.__reactAutoBindMap[e];this[e]=this._bindAutoBindMethod(v.guard(t,this.constructor.displayName+"."+e))}},_bindAutoBindMethod:function(e){var t=this,n=e.bind(t);return n}},U=function(){};b(U.prototype,p.Mixin,y.Mixin,C.Mixin,L);var F={LifeCycle:A,Base:U,createClass:function(e){var t=function(){};t.prototype=new U,t.prototype.constructor=t,I.forEach(i.bind(null,t)),i(t,e),t.getDefaultProps&&(t.defaultProps=t.getDefaultProps()),D(t.prototype.render);for(var n in S)t.prototype[n]||(t.prototype[n]=null);return g.wrapFactory(h.createFactory(t))},injection:{injectMixin:function(e){I.push(e)}}};t.exports=F},{"./Object.assign":27,"./ReactComponent":32,"./ReactContext":35,"./ReactCurrentOwner":36,"./ReactElement":50,"./ReactElementValidator":51,"./ReactEmptyComponent":52,"./ReactErrorUtils":53,"./ReactLegacyElement":59,"./ReactOwner":65,"./ReactPerf":66,"./ReactPropTransferer":67,"./ReactPropTypeLocationNames":68,"./ReactPropTypeLocations":69,"./ReactUpdates":77,"./instantiateReactComponent":123,"./invariant":124,"./keyMirror":130,"./keyOf":131,"./mapObject":132,"./monitorCodeUse":134,"./shouldUpdateReactComponent":138,"./warning":141}],35:[function(e,t){"use strict";var n=e("./Object.assign"),r={current:{},withContext:function(e,t){var o,a=r.current;r.current=n({},a,e);try{o=t()}finally{r.current=a}return o}};t.exports=r},{"./Object.assign":27}],36:[function(e,t){"use strict";var n={current:null};t.exports=n},{}],37:[function(e,t){"use strict";function n(e){return o.markNonLegacyFactory(r.createFactory(e))}var r=e("./ReactElement"),o=(e("./ReactElementValidator"),e("./ReactLegacyElement")),a=e("./mapObject"),i=a({a:"a",abbr:"abbr",address:"address",area:"area",article:"article",aside:"aside",audio:"audio",b:"b",base:"base",bdi:"bdi",bdo:"bdo",big:"big",blockquote:"blockquote",body:"body",br:"br",button:"button",canvas:"canvas",caption:"caption",cite:"cite",code:"code",col:"col",colgroup:"colgroup",data:"data",datalist:"datalist",dd:"dd",del:"del",details:"details",dfn:"dfn",dialog:"dialog",div:"div",dl:"dl",dt:"dt",em:"em",embed:"embed",fieldset:"fieldset",figcaption:"figcaption",figure:"figure",footer:"footer",form:"form",h1:"h1",h2:"h2",h3:"h3",h4:"h4",h5:"h5",h6:"h6",head:"head",header:"header",hr:"hr",html:"html",i:"i",iframe:"iframe",img:"img",input:"input",ins:"ins",kbd:"kbd",keygen:"keygen",label:"label",legend:"legend",li:"li",link:"link",main:"main",map:"map",mark:"mark",menu:"menu",menuitem:"menuitem",meta:"meta",meter:"meter",nav:"nav",noscript:"noscript",object:"object",ol:"ol",optgroup:"optgroup",option:"option",output:"output",p:"p",param:"param",picture:"picture",pre:"pre",progress:"progress",q:"q",rp:"rp",rt:"rt",ruby:"ruby",s:"s",samp:"samp",script:"script",section:"section",select:"select",small:"small",source:"source",span:"span",strong:"strong",style:"style",sub:"sub",summary:"summary",sup:"sup",table:"table",tbody:"tbody",td:"td",textarea:"textarea",tfoot:"tfoot",th:"th",thead:"thead",time:"time",title:"title",tr:"tr",track:"track",u:"u",ul:"ul","var":"var",video:"video",wbr:"wbr",circle:"circle",defs:"defs",ellipse:"ellipse",g:"g",line:"line",linearGradient:"linearGradient",mask:"mask",path:"path",pattern:"pattern",polygon:"polygon",polyline:"polyline",radialGradient:"radialGradient",rect:"rect",stop:"stop",svg:"svg",text:"text",tspan:"tspan"},n);t.exports=i},{"./ReactElement":50,"./ReactElementValidator":51,"./ReactLegacyElement":59,"./mapObject":132}],38:[function(e,t){"use strict";var n=e("./AutoFocusMixin"),r=e("./ReactBrowserComponentMixin"),o=e("./ReactCompositeComponent"),a=e("./ReactElement"),i=e("./ReactDOM"),s=e("./keyMirror"),u=a.createFactory(i.button.type),c=s({onClick:!0,onDoubleClick:!0,onMouseDown:!0,onMouseMove:!0,onMouseUp:!0,onClickCapture:!0,onDoubleClickCapture:!0,onMouseDownCapture:!0,onMouseMoveCapture:!0,onMouseUpCapture:!0}),l=o.createClass({displayName:"ReactDOMButton",mixins:[n,r],render:function(){var e={};for(var t in this.props)!this.props.hasOwnProperty(t)||this.props.disabled&&c[t]||(e[t]=this.props[t]);return u(e,this.props.children)}});t.exports=l},{"./AutoFocusMixin":2,"./ReactBrowserComponentMixin":29,"./ReactCompositeComponent":34,"./ReactDOM":37,"./ReactElement":50,"./keyMirror":130}],39:[function(e,t){"use strict";function n(e){e&&(g(null==e.children||null==e.dangerouslySetInnerHTML),g(null==e.style||"object"==typeof e.style))}function r(e,t,n,r){var o=d.findReactContainerForID(e);if(o){var a=o.nodeType===O?o.ownerDocument:o;C(t,a)}r.getPutListenerQueue().enqueuePutListener(e,t,n)}function o(e){_.call(P,e)||(g(x.test(e)),P[e]=!0)}function a(e){o(e),this._tag=e,this.tagName=e.toUpperCase()}var i=e("./CSSPropertyOperations"),s=e("./DOMProperty"),u=e("./DOMPropertyOperations"),c=e("./ReactBrowserComponentMixin"),l=e("./ReactComponent"),p=e("./ReactBrowserEventEmitter"),d=e("./ReactMount"),f=e("./ReactMultiChild"),h=e("./ReactPerf"),m=e("./Object.assign"),v=e("./escapeTextForBrowser"),g=e("./invariant"),y=(e("./isEventSupported"),e("./keyOf")),E=(e("./monitorCodeUse"),p.deleteListener),C=p.listenTo,R=p.registrationNameModules,M={string:!0,number:!0},b=y({style:null}),O=1,D={area:!0,base:!0,br:!0,col:!0,embed:!0,hr:!0,img:!0,input:!0,keygen:!0,link:!0,meta:!0,param:!0,source:!0,track:!0,wbr:!0},x=/^[a-zA-Z][a-zA-Z:_\.\-\d]*$/,P={},_={}.hasOwnProperty;a.displayName="ReactDOMComponent",a.Mixin={mountComponent:h.measure("ReactDOMComponent","mountComponent",function(e,t,r){l.Mixin.mountComponent.call(this,e,t,r),n(this.props);var o=D[this._tag]?"":"</"+this._tag+">";return this._createOpenTagMarkupAndPutListeners(t)+this._createContentMarkup(t)+o}),_createOpenTagMarkupAndPutListeners:function(e){var t=this.props,n="<"+this._tag;for(var o in t)if(t.hasOwnProperty(o)){var a=t[o];if(null!=a)if(R.hasOwnProperty(o))r(this._rootNodeID,o,a,e);else{o===b&&(a&&(a=t.style=m({},t.style)),a=i.createMarkupForStyles(a));var s=u.createMarkupForProperty(o,a);s&&(n+=" "+s)}}if(e.renderToStaticMarkup)return n+">";var c=u.createMarkupForID(this._rootNodeID);return n+" "+c+">"},_createContentMarkup:function(e){var t=this.props.dangerouslySetInnerHTML;if(null!=t){if(null!=t.__html)return t.__html}else{var n=M[typeof this.props.children]?this.props.children:null,r=null!=n?null:this.props.children;if(null!=n)return v(n);if(null!=r){var o=this.mountChildren(r,e);return o.join("")}}return""},receiveComponent:function(e,t){(e!==this._currentElement||null==e._owner)&&l.Mixin.receiveComponent.call(this,e,t)},updateComponent:h.measure("ReactDOMComponent","updateComponent",function(e,t){n(this._currentElement.props),l.Mixin.updateComponent.call(this,e,t),this._updateDOMProperties(t.props,e),this._updateDOMChildren(t.props,e)}),_updateDOMProperties:function(e,t){var n,o,a,i=this.props;for(n in e)if(!i.hasOwnProperty(n)&&e.hasOwnProperty(n))if(n===b){var u=e[n];for(o in u)u.hasOwnProperty(o)&&(a=a||{},a[o]="")}else R.hasOwnProperty(n)?E(this._rootNodeID,n):(s.isStandardName[n]||s.isCustomAttribute(n))&&l.BackendIDOperations.deletePropertyByID(this._rootNodeID,n);for(n in i){var c=i[n],p=e[n];if(i.hasOwnProperty(n)&&c!==p)if(n===b)if(c&&(c=i.style=m({},c)),p){for(o in p)!p.hasOwnProperty(o)||c&&c.hasOwnProperty(o)||(a=a||{},a[o]="");for(o in c)c.hasOwnProperty(o)&&p[o]!==c[o]&&(a=a||{},a[o]=c[o])}else a=c;else R.hasOwnProperty(n)?r(this._rootNodeID,n,c,t):(s.isStandardName[n]||s.isCustomAttribute(n))&&l.BackendIDOperations.updatePropertyByID(this._rootNodeID,n,c)}a&&l.BackendIDOperations.updateStylesByID(this._rootNodeID,a)},_updateDOMChildren:function(e,t){var n=this.props,r=M[typeof e.children]?e.children:null,o=M[typeof n.children]?n.children:null,a=e.dangerouslySetInnerHTML&&e.dangerouslySetInnerHTML.__html,i=n.dangerouslySetInnerHTML&&n.dangerouslySetInnerHTML.__html,s=null!=r?null:e.children,u=null!=o?null:n.children,c=null!=r||null!=a,p=null!=o||null!=i;null!=s&&null==u?this.updateChildren(null,t):c&&!p&&this.updateTextContent(""),null!=o?r!==o&&this.updateTextContent(""+o):null!=i?a!==i&&l.BackendIDOperations.updateInnerHTMLByID(this._rootNodeID,i):null!=u&&this.updateChildren(u,t)},unmountComponent:function(){this.unmountChildren(),p.deleteAllListeners(this._rootNodeID),l.Mixin.unmountComponent.call(this)}},m(a.prototype,l.Mixin,a.Mixin,f.Mixin,c),t.exports=a},{"./CSSPropertyOperations":5,"./DOMProperty":11,"./DOMPropertyOperations":12,"./Object.assign":27,"./ReactBrowserComponentMixin":29,"./ReactBrowserEventEmitter":30,"./ReactComponent":32,"./ReactMount":61,"./ReactMultiChild":62,"./ReactPerf":66,"./escapeTextForBrowser":107,"./invariant":124,"./isEventSupported":125,"./keyOf":131,"./monitorCodeUse":134}],40:[function(e,t){"use strict";var n=e("./EventConstants"),r=e("./LocalEventTrapMixin"),o=e("./ReactBrowserComponentMixin"),a=e("./ReactCompositeComponent"),i=e("./ReactElement"),s=e("./ReactDOM"),u=i.createFactory(s.form.type),c=a.createClass({displayName:"ReactDOMForm",mixins:[o,r],render:function(){return u(this.props)},componentDidMount:function(){this.trapBubbledEvent(n.topLevelTypes.topReset,"reset"),this.trapBubbledEvent(n.topLevelTypes.topSubmit,"submit")}});t.exports=c},{"./EventConstants":16,"./LocalEventTrapMixin":25,"./ReactBrowserComponentMixin":29,"./ReactCompositeComponent":34,"./ReactDOM":37,"./ReactElement":50}],41:[function(e,t){"use strict";var n=e("./CSSPropertyOperations"),r=e("./DOMChildrenOperations"),o=e("./DOMPropertyOperations"),a=e("./ReactMount"),i=e("./ReactPerf"),s=e("./invariant"),u=e("./setInnerHTML"),c={dangerouslySetInnerHTML:"`dangerouslySetInnerHTML` must be set using `updateInnerHTMLByID()`.",style:"`style` must be set using `updateStylesByID()`."},l={updatePropertyByID:i.measure("ReactDOMIDOperations","updatePropertyByID",function(e,t,n){var r=a.getNode(e);s(!c.hasOwnProperty(t)),null!=n?o.setValueForProperty(r,t,n):o.deleteValueForProperty(r,t)}),deletePropertyByID:i.measure("ReactDOMIDOperations","deletePropertyByID",function(e,t,n){var r=a.getNode(e);s(!c.hasOwnProperty(t)),o.deleteValueForProperty(r,t,n)}),updateStylesByID:i.measure("ReactDOMIDOperations","updateStylesByID",function(e,t){var r=a.getNode(e);n.setValueForStyles(r,t)}),updateInnerHTMLByID:i.measure("ReactDOMIDOperations","updateInnerHTMLByID",function(e,t){var n=a.getNode(e);u(n,t)}),updateTextContentByID:i.measure("ReactDOMIDOperations","updateTextContentByID",function(e,t){var n=a.getNode(e);r.updateTextContent(n,t)}),dangerouslyReplaceNodeWithMarkupByID:i.measure("ReactDOMIDOperations","dangerouslyReplaceNodeWithMarkupByID",function(e,t){var n=a.getNode(e);r.dangerouslyReplaceNodeWithMarkup(n,t)}),dangerouslyProcessChildrenUpdates:i.measure("ReactDOMIDOperations","dangerouslyProcessChildrenUpdates",function(e,t){for(var n=0;n<e.length;n++)e[n].parentNode=a.getNode(e[n].parentID);r.processUpdates(e,t)})};t.exports=l},{"./CSSPropertyOperations":5,"./DOMChildrenOperations":10,"./DOMPropertyOperations":12,"./ReactMount":61,"./ReactPerf":66,"./invariant":124,"./setInnerHTML":136}],42:[function(e,t){"use strict";var n=e("./EventConstants"),r=e("./LocalEventTrapMixin"),o=e("./ReactBrowserComponentMixin"),a=e("./ReactCompositeComponent"),i=e("./ReactElement"),s=e("./ReactDOM"),u=i.createFactory(s.img.type),c=a.createClass({displayName:"ReactDOMImg",tagName:"IMG",mixins:[o,r],render:function(){return u(this.props)},componentDidMount:function(){this.trapBubbledEvent(n.topLevelTypes.topLoad,"load"),this.trapBubbledEvent(n.topLevelTypes.topError,"error")}});t.exports=c},{"./EventConstants":16,"./LocalEventTrapMixin":25,"./ReactBrowserComponentMixin":29,"./ReactCompositeComponent":34,"./ReactDOM":37,"./ReactElement":50}],43:[function(e,t){"use strict";function n(){this.isMounted()&&this.forceUpdate()}var r=e("./AutoFocusMixin"),o=e("./DOMPropertyOperations"),a=e("./LinkedValueUtils"),i=e("./ReactBrowserComponentMixin"),s=e("./ReactCompositeComponent"),u=e("./ReactElement"),c=e("./ReactDOM"),l=e("./ReactMount"),p=e("./ReactUpdates"),d=e("./Object.assign"),f=e("./invariant"),h=u.createFactory(c.input.type),m={},v=s.createClass({displayName:"ReactDOMInput",mixins:[r,a.Mixin,i],getInitialState:function(){var e=this.props.defaultValue;return{initialChecked:this.props.defaultChecked||!1,initialValue:null!=e?e:null}},render:function(){var e=d({},this.props);e.defaultChecked=null,e.defaultValue=null;var t=a.getValue(this);e.value=null!=t?t:this.state.initialValue;var n=a.getChecked(this);return e.checked=null!=n?n:this.state.initialChecked,e.onChange=this._handleChange,h(e,this.props.children)},componentDidMount:function(){var e=l.getID(this.getDOMNode());m[e]=this},componentWillUnmount:function(){var e=this.getDOMNode(),t=l.getID(e);delete m[t]},componentDidUpdate:function(){var e=this.getDOMNode();null!=this.props.checked&&o.setValueForProperty(e,"checked",this.props.checked||!1);var t=a.getValue(this);null!=t&&o.setValueForProperty(e,"value",""+t)},_handleChange:function(e){var t,r=a.getOnChange(this);r&&(t=r.call(this,e)),p.asap(n,this);var o=this.props.name;if("radio"===this.props.type&&null!=o){for(var i=this.getDOMNode(),s=i;s.parentNode;)s=s.parentNode;for(var u=s.querySelectorAll("input[name="+JSON.stringify(""+o)+'][type="radio"]'),c=0,d=u.length;d>c;c++){var h=u[c];if(h!==i&&h.form===i.form){var v=l.getID(h);f(v);var g=m[v];f(g),p.asap(n,g)}}}return t}});t.exports=v},{"./AutoFocusMixin":2,"./DOMPropertyOperations":12,"./LinkedValueUtils":24,"./Object.assign":27,"./ReactBrowserComponentMixin":29,"./ReactCompositeComponent":34,"./ReactDOM":37,"./ReactElement":50,"./ReactMount":61,"./ReactUpdates":77,"./invariant":124}],44:[function(e,t){"use strict";var n=e("./ReactBrowserComponentMixin"),r=e("./ReactCompositeComponent"),o=e("./ReactElement"),a=e("./ReactDOM"),i=(e("./warning"),o.createFactory(a.option.type)),s=r.createClass({displayName:"ReactDOMOption",mixins:[n],componentWillMount:function(){},render:function(){return i(this.props,this.props.children)}});t.exports=s},{"./ReactBrowserComponentMixin":29,"./ReactCompositeComponent":34,"./ReactDOM":37,"./ReactElement":50,"./warning":141}],45:[function(e,t){"use strict";function n(){this.isMounted()&&(this.setState({value:this._pendingValue}),this._pendingValue=0)}function r(e,t){if(null!=e[t])if(e.multiple){if(!Array.isArray(e[t]))return new Error("The `"+t+"` prop supplied to <select> must be an array if `multiple` is true.")}else if(Array.isArray(e[t]))return new Error("The `"+t+"` prop supplied to <select> must be a scalar value if `multiple` is false.")}function o(e,t){var n,r,o,a=e.props.multiple,i=null!=t?t:e.state.value,s=e.getDOMNode().options;if(a)for(n={},r=0,o=i.length;o>r;++r)n[""+i[r]]=!0;else n=""+i;for(r=0,o=s.length;o>r;r++){var u=a?n.hasOwnProperty(s[r].value):s[r].value===n;u!==s[r].selected&&(s[r].selected=u)}}var a=e("./AutoFocusMixin"),i=e("./LinkedValueUtils"),s=e("./ReactBrowserComponentMixin"),u=e("./ReactCompositeComponent"),c=e("./ReactElement"),l=e("./ReactDOM"),p=e("./ReactUpdates"),d=e("./Object.assign"),f=c.createFactory(l.select.type),h=u.createClass({displayName:"ReactDOMSelect",mixins:[a,i.Mixin,s],propTypes:{defaultValue:r,value:r},getInitialState:function(){return{value:this.props.defaultValue||(this.props.multiple?[]:"")}},componentWillMount:function(){this._pendingValue=null},componentWillReceiveProps:function(e){!this.props.multiple&&e.multiple?this.setState({value:[this.state.value]}):this.props.multiple&&!e.multiple&&this.setState({value:this.state.value[0]})
},render:function(){var e=d({},this.props);return e.onChange=this._handleChange,e.value=null,f(e,this.props.children)},componentDidMount:function(){o(this,i.getValue(this))},componentDidUpdate:function(e){var t=i.getValue(this),n=!!e.multiple,r=!!this.props.multiple;(null!=t||n!==r)&&o(this,t)},_handleChange:function(e){var t,r=i.getOnChange(this);r&&(t=r.call(this,e));var o;if(this.props.multiple){o=[];for(var a=e.target.options,s=0,u=a.length;u>s;s++)a[s].selected&&o.push(a[s].value)}else o=e.target.value;return this._pendingValue=o,p.asap(n,this),t}});t.exports=h},{"./AutoFocusMixin":2,"./LinkedValueUtils":24,"./Object.assign":27,"./ReactBrowserComponentMixin":29,"./ReactCompositeComponent":34,"./ReactDOM":37,"./ReactElement":50,"./ReactUpdates":77}],46:[function(e,t){"use strict";function n(e,t,n,r){return e===n&&t===r}function r(e){var t=document.selection,n=t.createRange(),r=n.text.length,o=n.duplicate();o.moveToElementText(e),o.setEndPoint("EndToStart",n);var a=o.text.length,i=a+r;return{start:a,end:i}}function o(e){var t=window.getSelection&&window.getSelection();if(!t||0===t.rangeCount)return null;var r=t.anchorNode,o=t.anchorOffset,a=t.focusNode,i=t.focusOffset,s=t.getRangeAt(0),u=n(t.anchorNode,t.anchorOffset,t.focusNode,t.focusOffset),c=u?0:s.toString().length,l=s.cloneRange();l.selectNodeContents(e),l.setEnd(s.startContainer,s.startOffset);var p=n(l.startContainer,l.startOffset,l.endContainer,l.endOffset),d=p?0:l.toString().length,f=d+c,h=document.createRange();h.setStart(r,o),h.setEnd(a,i);var m=h.collapsed;return{start:m?f:d,end:m?d:f}}function a(e,t){var n,r,o=document.selection.createRange().duplicate();"undefined"==typeof t.end?(n=t.start,r=n):t.start>t.end?(n=t.end,r=t.start):(n=t.start,r=t.end),o.moveToElementText(e),o.moveStart("character",n),o.setEndPoint("EndToStart",o),o.moveEnd("character",r-n),o.select()}function i(e,t){if(window.getSelection){var n=window.getSelection(),r=e[c()].length,o=Math.min(t.start,r),a="undefined"==typeof t.end?o:Math.min(t.end,r);if(!n.extend&&o>a){var i=a;a=o,o=i}var s=u(e,o),l=u(e,a);if(s&&l){var p=document.createRange();p.setStart(s.node,s.offset),n.removeAllRanges(),o>a?(n.addRange(p),n.extend(l.node,l.offset)):(p.setEnd(l.node,l.offset),n.addRange(p))}}}var s=e("./ExecutionEnvironment"),u=e("./getNodeForCharacterOffset"),c=e("./getTextContentAccessor"),l=s.canUseDOM&&document.selection,p={getOffsets:l?r:o,setOffsets:l?a:i};t.exports=p},{"./ExecutionEnvironment":22,"./getNodeForCharacterOffset":117,"./getTextContentAccessor":119}],47:[function(e,t){"use strict";function n(){this.isMounted()&&this.forceUpdate()}var r=e("./AutoFocusMixin"),o=e("./DOMPropertyOperations"),a=e("./LinkedValueUtils"),i=e("./ReactBrowserComponentMixin"),s=e("./ReactCompositeComponent"),u=e("./ReactElement"),c=e("./ReactDOM"),l=e("./ReactUpdates"),p=e("./Object.assign"),d=e("./invariant"),f=(e("./warning"),u.createFactory(c.textarea.type)),h=s.createClass({displayName:"ReactDOMTextarea",mixins:[r,a.Mixin,i],getInitialState:function(){var e=this.props.defaultValue,t=this.props.children;null!=t&&(d(null==e),Array.isArray(t)&&(d(t.length<=1),t=t[0]),e=""+t),null==e&&(e="");var n=a.getValue(this);return{initialValue:""+(null!=n?n:e)}},render:function(){var e=p({},this.props);return d(null==e.dangerouslySetInnerHTML),e.defaultValue=null,e.value=null,e.onChange=this._handleChange,f(e,this.state.initialValue)},componentDidUpdate:function(){var e=a.getValue(this);if(null!=e){var t=this.getDOMNode();o.setValueForProperty(t,"value",""+e)}},_handleChange:function(e){var t,r=a.getOnChange(this);return r&&(t=r.call(this,e)),l.asap(n,this),t}});t.exports=h},{"./AutoFocusMixin":2,"./DOMPropertyOperations":12,"./LinkedValueUtils":24,"./Object.assign":27,"./ReactBrowserComponentMixin":29,"./ReactCompositeComponent":34,"./ReactDOM":37,"./ReactElement":50,"./ReactUpdates":77,"./invariant":124,"./warning":141}],48:[function(e,t){"use strict";function n(){this.reinitializeTransaction()}var r=e("./ReactUpdates"),o=e("./Transaction"),a=e("./Object.assign"),i=e("./emptyFunction"),s={initialize:i,close:function(){p.isBatchingUpdates=!1}},u={initialize:i,close:r.flushBatchedUpdates.bind(r)},c=[u,s];a(n.prototype,o.Mixin,{getTransactionWrappers:function(){return c}});var l=new n,p={isBatchingUpdates:!1,batchedUpdates:function(e,t,n){var r=p.isBatchingUpdates;p.isBatchingUpdates=!0,r?e(t,n):l.perform(e,null,t,n)}};t.exports=p},{"./Object.assign":27,"./ReactUpdates":77,"./Transaction":93,"./emptyFunction":105}],49:[function(e,t){"use strict";function n(){O.EventEmitter.injectReactEventListener(b),O.EventPluginHub.injectEventPluginOrder(s),O.EventPluginHub.injectInstanceHandle(D),O.EventPluginHub.injectMount(x),O.EventPluginHub.injectEventPluginsByName({SimpleEventPlugin:w,EnterLeaveEventPlugin:u,ChangeEventPlugin:o,CompositionEventPlugin:i,MobileSafariClickEventPlugin:p,SelectEventPlugin:P,BeforeInputEventPlugin:r}),O.NativeComponent.injectGenericComponentClass(m),O.NativeComponent.injectComponentClasses({button:v,form:g,img:y,input:E,option:C,select:R,textarea:M,html:N("html"),head:N("head"),body:N("body")}),O.CompositeComponent.injectMixin(d),O.DOMProperty.injectDOMPropertyConfig(l),O.DOMProperty.injectDOMPropertyConfig(T),O.EmptyComponent.injectEmptyComponent("noscript"),O.Updates.injectReconcileTransaction(f.ReactReconcileTransaction),O.Updates.injectBatchingStrategy(h),O.RootIndex.injectCreateReactRootIndex(c.canUseDOM?a.createReactRootIndex:_.createReactRootIndex),O.Component.injectEnvironment(f)}var r=e("./BeforeInputEventPlugin"),o=e("./ChangeEventPlugin"),a=e("./ClientReactRootIndex"),i=e("./CompositionEventPlugin"),s=e("./DefaultEventPluginOrder"),u=e("./EnterLeaveEventPlugin"),c=e("./ExecutionEnvironment"),l=e("./HTMLDOMPropertyConfig"),p=e("./MobileSafariClickEventPlugin"),d=e("./ReactBrowserComponentMixin"),f=e("./ReactComponentBrowserEnvironment"),h=e("./ReactDefaultBatchingStrategy"),m=e("./ReactDOMComponent"),v=e("./ReactDOMButton"),g=e("./ReactDOMForm"),y=e("./ReactDOMImg"),E=e("./ReactDOMInput"),C=e("./ReactDOMOption"),R=e("./ReactDOMSelect"),M=e("./ReactDOMTextarea"),b=e("./ReactEventListener"),O=e("./ReactInjection"),D=e("./ReactInstanceHandles"),x=e("./ReactMount"),P=e("./SelectEventPlugin"),_=e("./ServerReactRootIndex"),w=e("./SimpleEventPlugin"),T=e("./SVGDOMPropertyConfig"),N=e("./createFullPageComponent");t.exports={inject:n}},{"./BeforeInputEventPlugin":3,"./ChangeEventPlugin":7,"./ClientReactRootIndex":8,"./CompositionEventPlugin":9,"./DefaultEventPluginOrder":14,"./EnterLeaveEventPlugin":15,"./ExecutionEnvironment":22,"./HTMLDOMPropertyConfig":23,"./MobileSafariClickEventPlugin":26,"./ReactBrowserComponentMixin":29,"./ReactComponentBrowserEnvironment":33,"./ReactDOMButton":38,"./ReactDOMComponent":39,"./ReactDOMForm":40,"./ReactDOMImg":42,"./ReactDOMInput":43,"./ReactDOMOption":44,"./ReactDOMSelect":45,"./ReactDOMTextarea":47,"./ReactDefaultBatchingStrategy":48,"./ReactEventListener":55,"./ReactInjection":56,"./ReactInstanceHandles":58,"./ReactMount":61,"./SVGDOMPropertyConfig":78,"./SelectEventPlugin":79,"./ServerReactRootIndex":80,"./SimpleEventPlugin":81,"./createFullPageComponent":101}],50:[function(e,t){"use strict";var n=e("./ReactContext"),r=e("./ReactCurrentOwner"),o=(e("./warning"),{key:!0,ref:!0}),a=function(e,t,n,r,o,a){this.type=e,this.key=t,this.ref=n,this._owner=r,this._context=o,this.props=a};a.prototype={_isReactElement:!0},a.createElement=function(e,t,i){var s,u={},c=null,l=null;if(null!=t){l=void 0===t.ref?null:t.ref,c=null==t.key?null:""+t.key;for(s in t)t.hasOwnProperty(s)&&!o.hasOwnProperty(s)&&(u[s]=t[s])}var p=arguments.length-2;if(1===p)u.children=i;else if(p>1){for(var d=Array(p),f=0;p>f;f++)d[f]=arguments[f+2];u.children=d}if(e&&e.defaultProps){var h=e.defaultProps;for(s in h)"undefined"==typeof u[s]&&(u[s]=h[s])}return new a(e,c,l,r.current,n.current,u)},a.createFactory=function(e){var t=a.createElement.bind(null,e);return t.type=e,t},a.cloneAndReplaceProps=function(e,t){var n=new a(e.type,e.key,e.ref,e._owner,e._context,t);return n},a.isValidElement=function(e){var t=!(!e||!e._isReactElement);return t},t.exports=a},{"./ReactContext":35,"./ReactCurrentOwner":36,"./warning":141}],51:[function(e,t){"use strict";function n(){var e=p.current;return e&&e.constructor.displayName||void 0}function r(e,t){e._store.validated||null!=e.key||(e._store.validated=!0,a("react_key_warning",'Each child in an array should have a unique "key" prop.',e,t))}function o(e,t,n){v.test(e)&&a("react_numeric_key_warning","Child objects should have non-numeric keys so ordering is preserved.",t,n)}function a(e,t,r,o){var a=n(),i=o.displayName,s=a||i,u=f[e];if(!u.hasOwnProperty(s)){u[s]=!0,t+=a?" Check the render method of "+a+".":" Check the renderComponent call using <"+i+">.";var c=null;r._owner&&r._owner!==p.current&&(c=r._owner.constructor.displayName,t+=" It was passed a child from "+c+"."),t+=" See http://fb.me/react-warning-keys for more information.",d(e,{component:s,componentOwner:c}),console.warn(t)}}function i(){var e=n()||"";h.hasOwnProperty(e)||(h[e]=!0,d("react_object_map_children"))}function s(e,t){if(Array.isArray(e))for(var n=0;n<e.length;n++){var a=e[n];c.isValidElement(a)&&r(a,t)}else if(c.isValidElement(e))e._store.validated=!0;else if(e&&"object"==typeof e){i();for(var s in e)o(s,e[s],t)}}function u(e,t,n,r){for(var o in t)if(t.hasOwnProperty(o)){var a;try{a=t[o](n,o,e,r)}catch(i){a=i}a instanceof Error&&!(a.message in m)&&(m[a.message]=!0,d("react_failed_descriptor_type_check",{message:a.message}))}}var c=e("./ReactElement"),l=e("./ReactPropTypeLocations"),p=e("./ReactCurrentOwner"),d=e("./monitorCodeUse"),f=(e("./warning"),{react_key_warning:{},react_numeric_key_warning:{}}),h={},m={},v=/^\d+$/,g={createElement:function(e){var t=c.createElement.apply(this,arguments);if(null==t)return t;for(var n=2;n<arguments.length;n++)s(arguments[n],e);if(e){var r=e.displayName;e.propTypes&&u(r,e.propTypes,t.props,l.prop),e.contextTypes&&u(r,e.contextTypes,t._context,l.context)}return t},createFactory:function(e){var t=g.createElement.bind(null,e);return t.type=e,t}};t.exports=g},{"./ReactCurrentOwner":36,"./ReactElement":50,"./ReactPropTypeLocations":69,"./monitorCodeUse":134,"./warning":141}],52:[function(e,t){"use strict";function n(){return u(i),i()}function r(e){c[e]=!0}function o(e){delete c[e]}function a(e){return c[e]}var i,s=e("./ReactElement"),u=e("./invariant"),c={},l={injectEmptyComponent:function(e){i=s.createFactory(e)}},p={deregisterNullComponentID:o,getEmptyComponent:n,injection:l,isNullComponentID:a,registerNullComponentID:r};t.exports=p},{"./ReactElement":50,"./invariant":124}],53:[function(e,t){"use strict";var n={guard:function(e){return e}};t.exports=n},{}],54:[function(e,t){"use strict";function n(e){r.enqueueEvents(e),r.processEventQueue()}var r=e("./EventPluginHub"),o={handleTopLevel:function(e,t,o,a){var i=r.extractEvents(e,t,o,a);n(i)}};t.exports=o},{"./EventPluginHub":18}],55:[function(e,t){"use strict";function n(e){var t=l.getID(e),n=c.getReactRootIDFromNodeID(t),r=l.findReactContainerForID(n),o=l.getFirstReactDOM(r);return o}function r(e,t){this.topLevelType=e,this.nativeEvent=t,this.ancestors=[]}function o(e){for(var t=l.getFirstReactDOM(f(e.nativeEvent))||window,r=t;r;)e.ancestors.push(r),r=n(r);for(var o=0,a=e.ancestors.length;a>o;o++){t=e.ancestors[o];var i=l.getID(t)||"";m._handleTopLevel(e.topLevelType,t,i,e.nativeEvent)}}function a(e){var t=h(window);e(t)}var i=e("./EventListener"),s=e("./ExecutionEnvironment"),u=e("./PooledClass"),c=e("./ReactInstanceHandles"),l=e("./ReactMount"),p=e("./ReactUpdates"),d=e("./Object.assign"),f=e("./getEventTarget"),h=e("./getUnboundedScrollPosition");d(r.prototype,{destructor:function(){this.topLevelType=null,this.nativeEvent=null,this.ancestors.length=0}}),u.addPoolingTo(r,u.twoArgumentPooler);var m={_enabled:!0,_handleTopLevel:null,WINDOW_HANDLE:s.canUseDOM?window:null,setHandleTopLevel:function(e){m._handleTopLevel=e},setEnabled:function(e){m._enabled=!!e},isEnabled:function(){return m._enabled},trapBubbledEvent:function(e,t,n){var r=n;return r?i.listen(r,t,m.dispatchEvent.bind(null,e)):void 0},trapCapturedEvent:function(e,t,n){var r=n;return r?i.capture(r,t,m.dispatchEvent.bind(null,e)):void 0},monitorScrollValue:function(e){var t=a.bind(null,e);i.listen(window,"scroll",t),i.listen(window,"resize",t)},dispatchEvent:function(e,t){if(m._enabled){var n=r.getPooled(e,t);try{p.batchedUpdates(o,n)}finally{r.release(n)}}}};t.exports=m},{"./EventListener":17,"./ExecutionEnvironment":22,"./Object.assign":27,"./PooledClass":28,"./ReactInstanceHandles":58,"./ReactMount":61,"./ReactUpdates":77,"./getEventTarget":115,"./getUnboundedScrollPosition":120}],56:[function(e,t){"use strict";var n=e("./DOMProperty"),r=e("./EventPluginHub"),o=e("./ReactComponent"),a=e("./ReactCompositeComponent"),i=e("./ReactEmptyComponent"),s=e("./ReactBrowserEventEmitter"),u=e("./ReactNativeComponent"),c=e("./ReactPerf"),l=e("./ReactRootIndex"),p=e("./ReactUpdates"),d={Component:o.injection,CompositeComponent:a.injection,DOMProperty:n.injection,EmptyComponent:i.injection,EventPluginHub:r.injection,EventEmitter:s.injection,NativeComponent:u.injection,Perf:c.injection,RootIndex:l.injection,Updates:p.injection};t.exports=d},{"./DOMProperty":11,"./EventPluginHub":18,"./ReactBrowserEventEmitter":30,"./ReactComponent":32,"./ReactCompositeComponent":34,"./ReactEmptyComponent":52,"./ReactNativeComponent":64,"./ReactPerf":66,"./ReactRootIndex":73,"./ReactUpdates":77}],57:[function(e,t){"use strict";function n(e){return o(document.documentElement,e)}var r=e("./ReactDOMSelection"),o=e("./containsNode"),a=e("./focusNode"),i=e("./getActiveElement"),s={hasSelectionCapabilities:function(e){return e&&("INPUT"===e.nodeName&&"text"===e.type||"TEXTAREA"===e.nodeName||"true"===e.contentEditable)},getSelectionInformation:function(){var e=i();return{focusedElem:e,selectionRange:s.hasSelectionCapabilities(e)?s.getSelection(e):null}},restoreSelection:function(e){var t=i(),r=e.focusedElem,o=e.selectionRange;t!==r&&n(r)&&(s.hasSelectionCapabilities(r)&&s.setSelection(r,o),a(r))},getSelection:function(e){var t;if("selectionStart"in e)t={start:e.selectionStart,end:e.selectionEnd};else if(document.selection&&"INPUT"===e.nodeName){var n=document.selection.createRange();n.parentElement()===e&&(t={start:-n.moveStart("character",-e.value.length),end:-n.moveEnd("character",-e.value.length)})}else t=r.getOffsets(e);return t||{start:0,end:0}},setSelection:function(e,t){var n=t.start,o=t.end;if("undefined"==typeof o&&(o=n),"selectionStart"in e)e.selectionStart=n,e.selectionEnd=Math.min(o,e.value.length);else if(document.selection&&"INPUT"===e.nodeName){var a=e.createTextRange();a.collapse(!0),a.moveStart("character",n),a.moveEnd("character",o-n),a.select()}else r.setOffsets(e,t)}};t.exports=s},{"./ReactDOMSelection":46,"./containsNode":99,"./focusNode":109,"./getActiveElement":111}],58:[function(e,t){"use strict";function n(e){return d+e.toString(36)}function r(e,t){return e.charAt(t)===d||t===e.length}function o(e){return""===e||e.charAt(0)===d&&e.charAt(e.length-1)!==d}function a(e,t){return 0===t.indexOf(e)&&r(t,e.length)}function i(e){return e?e.substr(0,e.lastIndexOf(d)):""}function s(e,t){if(p(o(e)&&o(t)),p(a(e,t)),e===t)return e;for(var n=e.length+f,i=n;i<t.length&&!r(t,i);i++);return t.substr(0,i)}function u(e,t){var n=Math.min(e.length,t.length);if(0===n)return"";for(var a=0,i=0;n>=i;i++)if(r(e,i)&&r(t,i))a=i;else if(e.charAt(i)!==t.charAt(i))break;var s=e.substr(0,a);return p(o(s)),s}function c(e,t,n,r,o,u){e=e||"",t=t||"",p(e!==t);var c=a(t,e);p(c||a(e,t));for(var l=0,d=c?i:s,f=e;;f=d(f,t)){var m;if(o&&f===e||u&&f===t||(m=n(f,c,r)),m===!1||f===t)break;p(l++<h)}}var l=e("./ReactRootIndex"),p=e("./invariant"),d=".",f=d.length,h=100,m={createReactRootID:function(){return n(l.createReactRootIndex())},createReactID:function(e,t){return e+t},getReactRootIDFromNodeID:function(e){if(e&&e.charAt(0)===d&&e.length>1){var t=e.indexOf(d,1);return t>-1?e.substr(0,t):e}return null},traverseEnterLeave:function(e,t,n,r,o){var a=u(e,t);a!==e&&c(e,a,n,r,!1,!0),a!==t&&c(a,t,n,o,!0,!1)},traverseTwoPhase:function(e,t,n){e&&(c("",e,t,n,!0,!1),c(e,"",t,n,!1,!0))},traverseAncestors:function(e,t,n){c("",e,t,n,!0,!1)},_getFirstCommonAncestorID:u,_getNextDescendantID:s,isAncestorIDOf:a,SEPARATOR:d};t.exports=m},{"./ReactRootIndex":73,"./invariant":124}],59:[function(e,t){"use strict";function n(e,t){if("function"==typeof t)for(var n in t)if(t.hasOwnProperty(n)){var r=t[n];if("function"==typeof r){var o=r.bind(t);for(var a in r)r.hasOwnProperty(a)&&(o[a]=r[a]);e[n]=o}else e[n]=r}}var r=(e("./ReactCurrentOwner"),e("./invariant")),o=(e("./monitorCodeUse"),e("./warning"),{}),a={},i={};i.wrapCreateFactory=function(e){var t=function(t){return"function"!=typeof t?e(t):t.isReactNonLegacyFactory?e(t.type):t.isReactLegacyFactory?e(t.type):t};return t},i.wrapCreateElement=function(e){var t=function(t){if("function"!=typeof t)return e.apply(this,arguments);var n;return t.isReactNonLegacyFactory?(n=Array.prototype.slice.call(arguments,0),n[0]=t.type,e.apply(this,n)):t.isReactLegacyFactory?(t._isMockFunction&&(t.type._mockedReactClassConstructor=t),n=Array.prototype.slice.call(arguments,0),n[0]=t.type,e.apply(this,n)):t.apply(null,Array.prototype.slice.call(arguments,1))};return t},i.wrapFactory=function(e){r("function"==typeof e);var t=function(){return e.apply(this,arguments)};return n(t,e.type),t.isReactLegacyFactory=o,t.type=e.type,t},i.markNonLegacyFactory=function(e){return e.isReactNonLegacyFactory=a,e},i.isValidFactory=function(e){return"function"==typeof e&&e.isReactLegacyFactory===o},i.isValidClass=function(e){return i.isValidFactory(e)},i._isLegacyCallWarningEnabled=!0,t.exports=i},{"./ReactCurrentOwner":36,"./invariant":124,"./monitorCodeUse":134,"./warning":141}],60:[function(e,t){"use strict";var n=e("./adler32"),r={CHECKSUM_ATTR_NAME:"data-react-checksum",addChecksumToMarkup:function(e){var t=n(e);return e.replace(">"," "+r.CHECKSUM_ATTR_NAME+'="'+t+'">')},canReuseMarkup:function(e,t){var o=t.getAttribute(r.CHECKSUM_ATTR_NAME);o=o&&parseInt(o,10);var a=n(e);return a===o}};t.exports=r},{"./adler32":96}],61:[function(e,t){"use strict";function n(e){var t=E(e);return t&&S.getID(t)}function r(e){var t=o(e);if(t)if(x.hasOwnProperty(t)){var n=x[t];n!==e&&(R(!s(n,t)),x[t]=e)}else x[t]=e;return t}function o(e){return e&&e.getAttribute&&e.getAttribute(D)||""}function a(e,t){var n=o(e);n!==t&&delete x[n],e.setAttribute(D,t),x[t]=e}function i(e){return x.hasOwnProperty(e)&&s(x[e],e)||(x[e]=S.findReactNodeByID(e)),x[e]}function s(e,t){if(e){R(o(e)===t);var n=S.findReactContainerForID(t);if(n&&g(n,e))return!0}return!1}function u(e){delete x[e]}function c(e){var t=x[e];return t&&s(t,e)?void(I=t):!1}function l(e){I=null,m.traverseAncestors(e,c);var t=I;return I=null,t}var p=e("./DOMProperty"),d=e("./ReactBrowserEventEmitter"),f=(e("./ReactCurrentOwner"),e("./ReactElement")),h=e("./ReactLegacyElement"),m=e("./ReactInstanceHandles"),v=e("./ReactPerf"),g=e("./containsNode"),y=e("./deprecated"),E=e("./getReactRootElementInContainer"),C=e("./instantiateReactComponent"),R=e("./invariant"),M=e("./shouldUpdateReactComponent"),b=(e("./warning"),h.wrapCreateElement(f.createElement)),O=m.SEPARATOR,D=p.ID_ATTRIBUTE_NAME,x={},P=1,_=9,w={},T={},N=[],I=null,S={_instancesByReactRootID:w,scrollMonitor:function(e,t){t()},_updateRootComponent:function(e,t,n,r){var o=t.props;return S.scrollMonitor(n,function(){e.replaceProps(o,r)}),e},_registerComponent:function(e,t){R(t&&(t.nodeType===P||t.nodeType===_)),d.ensureScrollValueMonitoring();var n=S.registerContainer(t);return w[n]=e,n},_renderNewRootComponent:v.measure("ReactMount","_renderNewRootComponent",function(e,t,n){var r=C(e,null),o=S._registerComponent(r,t);return r.mountComponentIntoNode(o,t,n),r}),render:function(e,t,r){R(f.isValidElement(e));var o=w[n(t)];if(o){var a=o._currentElement;if(M(a,e))return S._updateRootComponent(o,e,t,r);S.unmountComponentAtNode(t)}var i=E(t),s=i&&S.isRenderedByReact(i),u=s&&!o,c=S._renderNewRootComponent(e,t,u);return r&&r.call(c),c},constructAndRenderComponent:function(e,t,n){var r=b(e,t);return S.render(r,n)},constructAndRenderComponentByID:function(e,t,n){var r=document.getElementById(n);return R(r),S.constructAndRenderComponent(e,t,r)},registerContainer:function(e){var t=n(e);return t&&(t=m.getReactRootIDFromNodeID(t)),t||(t=m.createReactRootID()),T[t]=e,t},unmountComponentAtNode:function(e){var t=n(e),r=w[t];return r?(S.unmountComponentFromNode(r,e),delete w[t],delete T[t],!0):!1},unmountComponentFromNode:function(e,t){for(e.unmountComponent(),t.nodeType===_&&(t=t.documentElement);t.lastChild;)t.removeChild(t.lastChild)},findReactContainerForID:function(e){var t=m.getReactRootIDFromNodeID(e),n=T[t];return n},findReactNodeByID:function(e){var t=S.findReactContainerForID(e);return S.findComponentRoot(t,e)},isRenderedByReact:function(e){if(1!==e.nodeType)return!1;var t=S.getID(e);return t?t.charAt(0)===O:!1},getFirstReactDOM:function(e){for(var t=e;t&&t.parentNode!==t;){if(S.isRenderedByReact(t))return t;t=t.parentNode}return null},findComponentRoot:function(e,t){var n=N,r=0,o=l(t)||e;for(n[0]=o.firstChild,n.length=1;r<n.length;){for(var a,i=n[r++];i;){var s=S.getID(i);s?t===s?a=i:m.isAncestorIDOf(s,t)&&(n.length=r=0,n.push(i.firstChild)):n.push(i.firstChild),i=i.nextSibling}if(a)return n.length=0,a}n.length=0,R(!1)},getReactRootID:n,getID:r,setID:a,getNode:i,purgeID:u};S.renderComponent=y("ReactMount","renderComponent","render",this,S.render),t.exports=S},{"./DOMProperty":11,"./ReactBrowserEventEmitter":30,"./ReactCurrentOwner":36,"./ReactElement":50,"./ReactInstanceHandles":58,"./ReactLegacyElement":59,"./ReactPerf":66,"./containsNode":99,"./deprecated":104,"./getReactRootElementInContainer":118,"./instantiateReactComponent":123,"./invariant":124,"./shouldUpdateReactComponent":138,"./warning":141}],62:[function(e,t){"use strict";function n(e,t,n){h.push({parentID:e,parentNode:null,type:c.INSERT_MARKUP,markupIndex:m.push(t)-1,textContent:null,fromIndex:null,toIndex:n})}function r(e,t,n){h.push({parentID:e,parentNode:null,type:c.MOVE_EXISTING,markupIndex:null,textContent:null,fromIndex:t,toIndex:n})}function o(e,t){h.push({parentID:e,parentNode:null,type:c.REMOVE_NODE,markupIndex:null,textContent:null,fromIndex:t,toIndex:null})}function a(e,t){h.push({parentID:e,parentNode:null,type:c.TEXT_CONTENT,markupIndex:null,textContent:t,fromIndex:null,toIndex:null})}function i(){h.length&&(u.BackendIDOperations.dangerouslyProcessChildrenUpdates(h,m),s())}function s(){h.length=0,m.length=0}var u=e("./ReactComponent"),c=e("./ReactMultiChildUpdateTypes"),l=e("./flattenChildren"),p=e("./instantiateReactComponent"),d=e("./shouldUpdateReactComponent"),f=0,h=[],m=[],v={Mixin:{mountChildren:function(e,t){var n=l(e),r=[],o=0;this._renderedChildren=n;for(var a in n){var i=n[a];if(n.hasOwnProperty(a)){var s=p(i,null);n[a]=s;var u=this._rootNodeID+a,c=s.mountComponent(u,t,this._mountDepth+1);s._mountIndex=o,r.push(c),o++}}return r},updateTextContent:function(e){f++;var t=!0;try{var n=this._renderedChildren;for(var r in n)n.hasOwnProperty(r)&&this._unmountChildByName(n[r],r);this.setTextContent(e),t=!1}finally{f--,f||(t?s():i())}},updateChildren:function(e,t){f++;var n=!0;try{this._updateChildren(e,t),n=!1}finally{f--,f||(n?s():i())}},_updateChildren:function(e,t){var n=l(e),r=this._renderedChildren;if(n||r){var o,a=0,i=0;for(o in n)if(n.hasOwnProperty(o)){var s=r&&r[o],u=s&&s._currentElement,c=n[o];if(d(u,c))this.moveChild(s,i,a),a=Math.max(s._mountIndex,a),s.receiveComponent(c,t),s._mountIndex=i;else{s&&(a=Math.max(s._mountIndex,a),this._unmountChildByName(s,o));var f=p(c,null);this._mountChildByNameAtIndex(f,o,i,t)}i++}for(o in r)!r.hasOwnProperty(o)||n&&n[o]||this._unmountChildByName(r[o],o)}},unmountChildren:function(){var e=this._renderedChildren;for(var t in e){var n=e[t];n.unmountComponent&&n.unmountComponent()}this._renderedChildren=null},moveChild:function(e,t,n){e._mountIndex<n&&r(this._rootNodeID,e._mountIndex,t)},createChild:function(e,t){n(this._rootNodeID,t,e._mountIndex)},removeChild:function(e){o(this._rootNodeID,e._mountIndex)},setTextContent:function(e){a(this._rootNodeID,e)},_mountChildByNameAtIndex:function(e,t,n,r){var o=this._rootNodeID+t,a=e.mountComponent(o,r,this._mountDepth+1);e._mountIndex=n,this.createChild(e,a),this._renderedChildren=this._renderedChildren||{},this._renderedChildren[t]=e},_unmountChildByName:function(e,t){this.removeChild(e),e._mountIndex=null,e.unmountComponent(),delete this._renderedChildren[t]}}};t.exports=v},{"./ReactComponent":32,"./ReactMultiChildUpdateTypes":63,"./flattenChildren":108,"./instantiateReactComponent":123,"./shouldUpdateReactComponent":138}],63:[function(e,t){"use strict";var n=e("./keyMirror"),r=n({INSERT_MARKUP:null,MOVE_EXISTING:null,REMOVE_NODE:null,TEXT_CONTENT:null});t.exports=r},{"./keyMirror":130}],64:[function(e,t){"use strict";function n(e,t,n){var r=i[e];return null==r?(o(a),new a(e,t)):n===e?(o(a),new a(e,t)):new r.type(t)}var r=e("./Object.assign"),o=e("./invariant"),a=null,i={},s={injectGenericComponentClass:function(e){a=e},injectComponentClasses:function(e){r(i,e)}},u={createInstanceForTag:n,injection:s};t.exports=u},{"./Object.assign":27,"./invariant":124}],65:[function(e,t){"use strict";var n=e("./emptyObject"),r=e("./invariant"),o={isValidOwner:function(e){return!(!e||"function"!=typeof e.attachRef||"function"!=typeof e.detachRef)},addComponentAsRefTo:function(e,t,n){r(o.isValidOwner(n)),n.attachRef(t,e)},removeComponentAsRefFrom:function(e,t,n){r(o.isValidOwner(n)),n.refs[t]===e&&n.detachRef(t)},Mixin:{construct:function(){this.refs=n},attachRef:function(e,t){r(t.isOwnedBy(this));var o=this.refs===n?this.refs={}:this.refs;o[e]=t},detachRef:function(e){delete this.refs[e]}}};t.exports=o},{"./emptyObject":106,"./invariant":124}],66:[function(e,t){"use strict";function n(e,t,n){return n}var r={enableMeasure:!1,storedMeasure:n,measure:function(e,t,n){return n},injection:{injectMeasure:function(e){r.storedMeasure=e}}};t.exports=r},{}],67:[function(e,t){"use strict";function n(e){return function(t,n,r){t[n]=t.hasOwnProperty(n)?e(t[n],r):r}}function r(e,t){for(var n in t)if(t.hasOwnProperty(n)){var r=c[n];r&&c.hasOwnProperty(n)?r(e,n,t[n]):e.hasOwnProperty(n)||(e[n]=t[n])}return e}var o=e("./Object.assign"),a=e("./emptyFunction"),i=e("./invariant"),s=e("./joinClasses"),u=(e("./warning"),n(function(e,t){return o({},t,e)})),c={children:a,className:n(s),style:u},l={TransferStrategies:c,mergeProps:function(e,t){return r(o({},e),t)},Mixin:{transferPropsTo:function(e){return i(e._owner===this),r(e.props,this.props),e}}};t.exports=l},{"./Object.assign":27,"./emptyFunction":105,"./invariant":124,"./joinClasses":129,"./warning":141}],68:[function(e,t){"use strict";var n={};t.exports=n},{}],69:[function(e,t){"use strict";var n=e("./keyMirror"),r=n({prop:null,context:null,childContext:null});t.exports=r},{"./keyMirror":130}],70:[function(e,t){"use strict";function n(e){function t(t,n,r,o,a){if(o=o||C,null!=n[r])return e(n,r,o,a);var i=g[a];return t?new Error("Required "+i+" `"+r+"` was not specified in "+("`"+o+"`.")):void 0}var n=t.bind(null,!1);return n.isRequired=t.bind(null,!0),n}function r(e){function t(t,n,r,o){var a=t[n],i=h(a);if(i!==e){var s=g[o],u=m(a);return new Error("Invalid "+s+" `"+n+"` of type `"+u+"` "+("supplied to `"+r+"`, expected `"+e+"`."))}}return n(t)}function o(){return n(E.thatReturns())}function a(e){function t(t,n,r,o){var a=t[n];if(!Array.isArray(a)){var i=g[o],s=h(a);return new Error("Invalid "+i+" `"+n+"` of type "+("`"+s+"` supplied to `"+r+"`, expected an array."))}for(var u=0;u<a.length;u++){var c=e(a,u,r,o);if(c instanceof Error)return c}}return n(t)}function i(){function e(e,t,n,r){if(!v.isValidElement(e[t])){var o=g[r];return new Error("Invalid "+o+" `"+t+"` supplied to "+("`"+n+"`, expected a ReactElement."))}}return n(e)}function s(e){function t(t,n,r,o){if(!(t[n]instanceof e)){var a=g[o],i=e.name||C;return new Error("Invalid "+a+" `"+n+"` supplied to "+("`"+r+"`, expected instance of `"+i+"`."))}}return n(t)}function u(e){function t(t,n,r,o){for(var a=t[n],i=0;i<e.length;i++)if(a===e[i])return;var s=g[o],u=JSON.stringify(e);return new Error("Invalid "+s+" `"+n+"` of value `"+a+"` "+("supplied to `"+r+"`, expected one of "+u+"."))}return n(t)}function c(e){function t(t,n,r,o){var a=t[n],i=h(a);if("object"!==i){var s=g[o];return new Error("Invalid "+s+" `"+n+"` of type "+("`"+i+"` supplied to `"+r+"`, expected an object."))}for(var u in a)if(a.hasOwnProperty(u)){var c=e(a,u,r,o);if(c instanceof Error)return c}}return n(t)}function l(e){function t(t,n,r,o){for(var a=0;a<e.length;a++){var i=e[a];if(null==i(t,n,r,o))return}var s=g[o];return new Error("Invalid "+s+" `"+n+"` supplied to "+("`"+r+"`."))}return n(t)}function p(){function e(e,t,n,r){if(!f(e[t])){var o=g[r];return new Error("Invalid "+o+" `"+t+"` supplied to "+("`"+n+"`, expected a ReactNode."))}}return n(e)}function d(e){function t(t,n,r,o){var a=t[n],i=h(a);if("object"!==i){var s=g[o];return new Error("Invalid "+s+" `"+n+"` of type `"+i+"` "+("supplied to `"+r+"`, expected `object`."))}for(var u in e){var c=e[u];if(c){var l=c(a,u,r,o);if(l)return l}}}return n(t,"expected `object`")}function f(e){switch(typeof e){case"number":case"string":return!0;case"boolean":return!e;case"object":if(Array.isArray(e))return e.every(f);if(v.isValidElement(e))return!0;for(var t in e)if(!f(e[t]))return!1;return!0;default:return!1}}function h(e){var t=typeof e;return Array.isArray(e)?"array":e instanceof RegExp?"object":t}function m(e){var t=h(e);if("object"===t){if(e instanceof Date)return"date";if(e instanceof RegExp)return"regexp"}return t}var v=e("./ReactElement"),g=e("./ReactPropTypeLocationNames"),y=e("./deprecated"),E=e("./emptyFunction"),C="<<anonymous>>",R=i(),M=p(),b={array:r("array"),bool:r("boolean"),func:r("function"),number:r("number"),object:r("object"),string:r("string"),any:o(),arrayOf:a,element:R,instanceOf:s,node:M,objectOf:c,oneOf:u,oneOfType:l,shape:d,component:y("React.PropTypes","component","element",this,R),renderable:y("React.PropTypes","renderable","node",this,M)};t.exports=b},{"./ReactElement":50,"./ReactPropTypeLocationNames":68,"./deprecated":104,"./emptyFunction":105}],71:[function(e,t){"use strict";function n(){this.listenersToPut=[]}var r=e("./PooledClass"),o=e("./ReactBrowserEventEmitter"),a=e("./Object.assign");a(n.prototype,{enqueuePutListener:function(e,t,n){this.listenersToPut.push({rootNodeID:e,propKey:t,propValue:n})},putListeners:function(){for(var e=0;e<this.listenersToPut.length;e++){var t=this.listenersToPut[e];o.putListener(t.rootNodeID,t.propKey,t.propValue)}},reset:function(){this.listenersToPut.length=0},destructor:function(){this.reset()}}),r.addPoolingTo(n),t.exports=n},{"./Object.assign":27,"./PooledClass":28,"./ReactBrowserEventEmitter":30}],72:[function(e,t){"use strict";function n(){this.reinitializeTransaction(),this.renderToStaticMarkup=!1,this.reactMountReady=r.getPooled(null),this.putListenerQueue=s.getPooled()}var r=e("./CallbackQueue"),o=e("./PooledClass"),a=e("./ReactBrowserEventEmitter"),i=e("./ReactInputSelection"),s=e("./ReactPutListenerQueue"),u=e("./Transaction"),c=e("./Object.assign"),l={initialize:i.getSelectionInformation,close:i.restoreSelection},p={initialize:function(){var e=a.isEnabled();return a.setEnabled(!1),e},close:function(e){a.setEnabled(e)}},d={initialize:function(){this.reactMountReady.reset()},close:function(){this.reactMountReady.notifyAll()}},f={initialize:function(){this.putListenerQueue.reset()},close:function(){this.putListenerQueue.putListeners()}},h=[f,l,p,d],m={getTransactionWrappers:function(){return h},getReactMountReady:function(){return this.reactMountReady},getPutListenerQueue:function(){return this.putListenerQueue},destructor:function(){r.release(this.reactMountReady),this.reactMountReady=null,s.release(this.putListenerQueue),this.putListenerQueue=null}};c(n.prototype,u.Mixin,m),o.addPoolingTo(n),t.exports=n
},{"./CallbackQueue":6,"./Object.assign":27,"./PooledClass":28,"./ReactBrowserEventEmitter":30,"./ReactInputSelection":57,"./ReactPutListenerQueue":71,"./Transaction":93}],73:[function(e,t){"use strict";var n={injectCreateReactRootIndex:function(e){r.createReactRootIndex=e}},r={createReactRootIndex:null,injection:n};t.exports=r},{}],74:[function(e,t){"use strict";function n(e){c(o.isValidElement(e));var t;try{var n=a.createReactRootID();return t=s.getPooled(!1),t.perform(function(){var r=u(e,null),o=r.mountComponent(n,t,0);return i.addChecksumToMarkup(o)},null)}finally{s.release(t)}}function r(e){c(o.isValidElement(e));var t;try{var n=a.createReactRootID();return t=s.getPooled(!0),t.perform(function(){var r=u(e,null);return r.mountComponent(n,t,0)},null)}finally{s.release(t)}}var o=e("./ReactElement"),a=e("./ReactInstanceHandles"),i=e("./ReactMarkupChecksum"),s=e("./ReactServerRenderingTransaction"),u=e("./instantiateReactComponent"),c=e("./invariant");t.exports={renderToString:n,renderToStaticMarkup:r}},{"./ReactElement":50,"./ReactInstanceHandles":58,"./ReactMarkupChecksum":60,"./ReactServerRenderingTransaction":75,"./instantiateReactComponent":123,"./invariant":124}],75:[function(e,t){"use strict";function n(e){this.reinitializeTransaction(),this.renderToStaticMarkup=e,this.reactMountReady=o.getPooled(null),this.putListenerQueue=a.getPooled()}var r=e("./PooledClass"),o=e("./CallbackQueue"),a=e("./ReactPutListenerQueue"),i=e("./Transaction"),s=e("./Object.assign"),u=e("./emptyFunction"),c={initialize:function(){this.reactMountReady.reset()},close:u},l={initialize:function(){this.putListenerQueue.reset()},close:u},p=[l,c],d={getTransactionWrappers:function(){return p},getReactMountReady:function(){return this.reactMountReady},getPutListenerQueue:function(){return this.putListenerQueue},destructor:function(){o.release(this.reactMountReady),this.reactMountReady=null,a.release(this.putListenerQueue),this.putListenerQueue=null}};s(n.prototype,i.Mixin,d),r.addPoolingTo(n),t.exports=n},{"./CallbackQueue":6,"./Object.assign":27,"./PooledClass":28,"./ReactPutListenerQueue":71,"./Transaction":93,"./emptyFunction":105}],76:[function(e,t){"use strict";var n=e("./DOMPropertyOperations"),r=e("./ReactComponent"),o=e("./ReactElement"),a=e("./Object.assign"),i=e("./escapeTextForBrowser"),s=function(){};a(s.prototype,r.Mixin,{mountComponent:function(e,t,o){r.Mixin.mountComponent.call(this,e,t,o);var a=i(this.props);return t.renderToStaticMarkup?a:"<span "+n.createMarkupForID(e)+">"+a+"</span>"},receiveComponent:function(e){var t=e.props;t!==this.props&&(this.props=t,r.BackendIDOperations.updateTextContentByID(this._rootNodeID,t))}});var u=function(e){return new o(s,null,null,null,null,e)};u.type=s,t.exports=u},{"./DOMPropertyOperations":12,"./Object.assign":27,"./ReactComponent":32,"./ReactElement":50,"./escapeTextForBrowser":107}],77:[function(e,t){"use strict";function n(){h(O.ReactReconcileTransaction&&y)}function r(){this.reinitializeTransaction(),this.dirtyComponentsLength=null,this.callbackQueue=c.getPooled(),this.reconcileTransaction=O.ReactReconcileTransaction.getPooled()}function o(e,t,r){n(),y.batchedUpdates(e,t,r)}function a(e,t){return e._mountDepth-t._mountDepth}function i(e){var t=e.dirtyComponentsLength;h(t===m.length),m.sort(a);for(var n=0;t>n;n++){var r=m[n];if(r.isMounted()){var o=r._pendingCallbacks;if(r._pendingCallbacks=null,r.performUpdateIfNecessary(e.reconcileTransaction),o)for(var i=0;i<o.length;i++)e.callbackQueue.enqueue(o[i],r)}}}function s(e,t){return h(!t||"function"==typeof t),n(),y.isBatchingUpdates?(m.push(e),void(t&&(e._pendingCallbacks?e._pendingCallbacks.push(t):e._pendingCallbacks=[t]))):void y.batchedUpdates(s,e,t)}function u(e,t){h(y.isBatchingUpdates),v.enqueue(e,t),g=!0}var c=e("./CallbackQueue"),l=e("./PooledClass"),p=(e("./ReactCurrentOwner"),e("./ReactPerf")),d=e("./Transaction"),f=e("./Object.assign"),h=e("./invariant"),m=(e("./warning"),[]),v=c.getPooled(),g=!1,y=null,E={initialize:function(){this.dirtyComponentsLength=m.length},close:function(){this.dirtyComponentsLength!==m.length?(m.splice(0,this.dirtyComponentsLength),M()):m.length=0}},C={initialize:function(){this.callbackQueue.reset()},close:function(){this.callbackQueue.notifyAll()}},R=[E,C];f(r.prototype,d.Mixin,{getTransactionWrappers:function(){return R},destructor:function(){this.dirtyComponentsLength=null,c.release(this.callbackQueue),this.callbackQueue=null,O.ReactReconcileTransaction.release(this.reconcileTransaction),this.reconcileTransaction=null},perform:function(e,t,n){return d.Mixin.perform.call(this,this.reconcileTransaction.perform,this.reconcileTransaction,e,t,n)}}),l.addPoolingTo(r);var M=p.measure("ReactUpdates","flushBatchedUpdates",function(){for(;m.length||g;){if(m.length){var e=r.getPooled();e.perform(i,null,e),r.release(e)}if(g){g=!1;var t=v;v=c.getPooled(),t.notifyAll(),c.release(t)}}}),b={injectReconcileTransaction:function(e){h(e),O.ReactReconcileTransaction=e},injectBatchingStrategy:function(e){h(e),h("function"==typeof e.batchedUpdates),h("boolean"==typeof e.isBatchingUpdates),y=e}},O={ReactReconcileTransaction:null,batchedUpdates:o,enqueueUpdate:s,flushBatchedUpdates:M,injection:b,asap:u};t.exports=O},{"./CallbackQueue":6,"./Object.assign":27,"./PooledClass":28,"./ReactCurrentOwner":36,"./ReactPerf":66,"./Transaction":93,"./invariant":124,"./warning":141}],78:[function(e,t){"use strict";var n=e("./DOMProperty"),r=n.injection.MUST_USE_ATTRIBUTE,o={Properties:{cx:r,cy:r,d:r,dx:r,dy:r,fill:r,fillOpacity:r,fontFamily:r,fontSize:r,fx:r,fy:r,gradientTransform:r,gradientUnits:r,markerEnd:r,markerMid:r,markerStart:r,offset:r,opacity:r,patternContentUnits:r,patternUnits:r,points:r,preserveAspectRatio:r,r:r,rx:r,ry:r,spreadMethod:r,stopColor:r,stopOpacity:r,stroke:r,strokeDasharray:r,strokeLinecap:r,strokeOpacity:r,strokeWidth:r,textAnchor:r,transform:r,version:r,viewBox:r,x1:r,x2:r,x:r,y1:r,y2:r,y:r},DOMAttributeNames:{fillOpacity:"fill-opacity",fontFamily:"font-family",fontSize:"font-size",gradientTransform:"gradientTransform",gradientUnits:"gradientUnits",markerEnd:"marker-end",markerMid:"marker-mid",markerStart:"marker-start",patternContentUnits:"patternContentUnits",patternUnits:"patternUnits",preserveAspectRatio:"preserveAspectRatio",spreadMethod:"spreadMethod",stopColor:"stop-color",stopOpacity:"stop-opacity",strokeDasharray:"stroke-dasharray",strokeLinecap:"stroke-linecap",strokeOpacity:"stroke-opacity",strokeWidth:"stroke-width",textAnchor:"text-anchor",viewBox:"viewBox"}};t.exports=o},{"./DOMProperty":11}],79:[function(e,t){"use strict";function n(e){if("selectionStart"in e&&i.hasSelectionCapabilities(e))return{start:e.selectionStart,end:e.selectionEnd};if(window.getSelection){var t=window.getSelection();return{anchorNode:t.anchorNode,anchorOffset:t.anchorOffset,focusNode:t.focusNode,focusOffset:t.focusOffset}}if(document.selection){var n=document.selection.createRange();return{parentElement:n.parentElement(),text:n.text,top:n.boundingTop,left:n.boundingLeft}}}function r(e){if(!g&&null!=h&&h==u()){var t=n(h);if(!v||!p(v,t)){v=t;var r=s.getPooled(f.select,m,e);return r.type="select",r.target=h,a.accumulateTwoPhaseDispatches(r),r}}}var o=e("./EventConstants"),a=e("./EventPropagators"),i=e("./ReactInputSelection"),s=e("./SyntheticEvent"),u=e("./getActiveElement"),c=e("./isTextInputElement"),l=e("./keyOf"),p=e("./shallowEqual"),d=o.topLevelTypes,f={select:{phasedRegistrationNames:{bubbled:l({onSelect:null}),captured:l({onSelectCapture:null})},dependencies:[d.topBlur,d.topContextMenu,d.topFocus,d.topKeyDown,d.topMouseDown,d.topMouseUp,d.topSelectionChange]}},h=null,m=null,v=null,g=!1,y={eventTypes:f,extractEvents:function(e,t,n,o){switch(e){case d.topFocus:(c(t)||"true"===t.contentEditable)&&(h=t,m=n,v=null);break;case d.topBlur:h=null,m=null,v=null;break;case d.topMouseDown:g=!0;break;case d.topContextMenu:case d.topMouseUp:return g=!1,r(o);case d.topSelectionChange:case d.topKeyDown:case d.topKeyUp:return r(o)}}};t.exports=y},{"./EventConstants":16,"./EventPropagators":21,"./ReactInputSelection":57,"./SyntheticEvent":85,"./getActiveElement":111,"./isTextInputElement":127,"./keyOf":131,"./shallowEqual":137}],80:[function(e,t){"use strict";var n=Math.pow(2,53),r={createReactRootIndex:function(){return Math.ceil(Math.random()*n)}};t.exports=r},{}],81:[function(e,t){"use strict";var n=e("./EventConstants"),r=e("./EventPluginUtils"),o=e("./EventPropagators"),a=e("./SyntheticClipboardEvent"),i=e("./SyntheticEvent"),s=e("./SyntheticFocusEvent"),u=e("./SyntheticKeyboardEvent"),c=e("./SyntheticMouseEvent"),l=e("./SyntheticDragEvent"),p=e("./SyntheticTouchEvent"),d=e("./SyntheticUIEvent"),f=e("./SyntheticWheelEvent"),h=e("./getEventCharCode"),m=e("./invariant"),v=e("./keyOf"),g=(e("./warning"),n.topLevelTypes),y={blur:{phasedRegistrationNames:{bubbled:v({onBlur:!0}),captured:v({onBlurCapture:!0})}},click:{phasedRegistrationNames:{bubbled:v({onClick:!0}),captured:v({onClickCapture:!0})}},contextMenu:{phasedRegistrationNames:{bubbled:v({onContextMenu:!0}),captured:v({onContextMenuCapture:!0})}},copy:{phasedRegistrationNames:{bubbled:v({onCopy:!0}),captured:v({onCopyCapture:!0})}},cut:{phasedRegistrationNames:{bubbled:v({onCut:!0}),captured:v({onCutCapture:!0})}},doubleClick:{phasedRegistrationNames:{bubbled:v({onDoubleClick:!0}),captured:v({onDoubleClickCapture:!0})}},drag:{phasedRegistrationNames:{bubbled:v({onDrag:!0}),captured:v({onDragCapture:!0})}},dragEnd:{phasedRegistrationNames:{bubbled:v({onDragEnd:!0}),captured:v({onDragEndCapture:!0})}},dragEnter:{phasedRegistrationNames:{bubbled:v({onDragEnter:!0}),captured:v({onDragEnterCapture:!0})}},dragExit:{phasedRegistrationNames:{bubbled:v({onDragExit:!0}),captured:v({onDragExitCapture:!0})}},dragLeave:{phasedRegistrationNames:{bubbled:v({onDragLeave:!0}),captured:v({onDragLeaveCapture:!0})}},dragOver:{phasedRegistrationNames:{bubbled:v({onDragOver:!0}),captured:v({onDragOverCapture:!0})}},dragStart:{phasedRegistrationNames:{bubbled:v({onDragStart:!0}),captured:v({onDragStartCapture:!0})}},drop:{phasedRegistrationNames:{bubbled:v({onDrop:!0}),captured:v({onDropCapture:!0})}},focus:{phasedRegistrationNames:{bubbled:v({onFocus:!0}),captured:v({onFocusCapture:!0})}},input:{phasedRegistrationNames:{bubbled:v({onInput:!0}),captured:v({onInputCapture:!0})}},keyDown:{phasedRegistrationNames:{bubbled:v({onKeyDown:!0}),captured:v({onKeyDownCapture:!0})}},keyPress:{phasedRegistrationNames:{bubbled:v({onKeyPress:!0}),captured:v({onKeyPressCapture:!0})}},keyUp:{phasedRegistrationNames:{bubbled:v({onKeyUp:!0}),captured:v({onKeyUpCapture:!0})}},load:{phasedRegistrationNames:{bubbled:v({onLoad:!0}),captured:v({onLoadCapture:!0})}},error:{phasedRegistrationNames:{bubbled:v({onError:!0}),captured:v({onErrorCapture:!0})}},mouseDown:{phasedRegistrationNames:{bubbled:v({onMouseDown:!0}),captured:v({onMouseDownCapture:!0})}},mouseMove:{phasedRegistrationNames:{bubbled:v({onMouseMove:!0}),captured:v({onMouseMoveCapture:!0})}},mouseOut:{phasedRegistrationNames:{bubbled:v({onMouseOut:!0}),captured:v({onMouseOutCapture:!0})}},mouseOver:{phasedRegistrationNames:{bubbled:v({onMouseOver:!0}),captured:v({onMouseOverCapture:!0})}},mouseUp:{phasedRegistrationNames:{bubbled:v({onMouseUp:!0}),captured:v({onMouseUpCapture:!0})}},paste:{phasedRegistrationNames:{bubbled:v({onPaste:!0}),captured:v({onPasteCapture:!0})}},reset:{phasedRegistrationNames:{bubbled:v({onReset:!0}),captured:v({onResetCapture:!0})}},scroll:{phasedRegistrationNames:{bubbled:v({onScroll:!0}),captured:v({onScrollCapture:!0})}},submit:{phasedRegistrationNames:{bubbled:v({onSubmit:!0}),captured:v({onSubmitCapture:!0})}},touchCancel:{phasedRegistrationNames:{bubbled:v({onTouchCancel:!0}),captured:v({onTouchCancelCapture:!0})}},touchEnd:{phasedRegistrationNames:{bubbled:v({onTouchEnd:!0}),captured:v({onTouchEndCapture:!0})}},touchMove:{phasedRegistrationNames:{bubbled:v({onTouchMove:!0}),captured:v({onTouchMoveCapture:!0})}},touchStart:{phasedRegistrationNames:{bubbled:v({onTouchStart:!0}),captured:v({onTouchStartCapture:!0})}},wheel:{phasedRegistrationNames:{bubbled:v({onWheel:!0}),captured:v({onWheelCapture:!0})}}},E={topBlur:y.blur,topClick:y.click,topContextMenu:y.contextMenu,topCopy:y.copy,topCut:y.cut,topDoubleClick:y.doubleClick,topDrag:y.drag,topDragEnd:y.dragEnd,topDragEnter:y.dragEnter,topDragExit:y.dragExit,topDragLeave:y.dragLeave,topDragOver:y.dragOver,topDragStart:y.dragStart,topDrop:y.drop,topError:y.error,topFocus:y.focus,topInput:y.input,topKeyDown:y.keyDown,topKeyPress:y.keyPress,topKeyUp:y.keyUp,topLoad:y.load,topMouseDown:y.mouseDown,topMouseMove:y.mouseMove,topMouseOut:y.mouseOut,topMouseOver:y.mouseOver,topMouseUp:y.mouseUp,topPaste:y.paste,topReset:y.reset,topScroll:y.scroll,topSubmit:y.submit,topTouchCancel:y.touchCancel,topTouchEnd:y.touchEnd,topTouchMove:y.touchMove,topTouchStart:y.touchStart,topWheel:y.wheel};for(var C in E)E[C].dependencies=[C];var R={eventTypes:y,executeDispatch:function(e,t,n){var o=r.executeDispatch(e,t,n);o===!1&&(e.stopPropagation(),e.preventDefault())},extractEvents:function(e,t,n,r){var v=E[e];if(!v)return null;var y;switch(e){case g.topInput:case g.topLoad:case g.topError:case g.topReset:case g.topSubmit:y=i;break;case g.topKeyPress:if(0===h(r))return null;case g.topKeyDown:case g.topKeyUp:y=u;break;case g.topBlur:case g.topFocus:y=s;break;case g.topClick:if(2===r.button)return null;case g.topContextMenu:case g.topDoubleClick:case g.topMouseDown:case g.topMouseMove:case g.topMouseOut:case g.topMouseOver:case g.topMouseUp:y=c;break;case g.topDrag:case g.topDragEnd:case g.topDragEnter:case g.topDragExit:case g.topDragLeave:case g.topDragOver:case g.topDragStart:case g.topDrop:y=l;break;case g.topTouchCancel:case g.topTouchEnd:case g.topTouchMove:case g.topTouchStart:y=p;break;case g.topScroll:y=d;break;case g.topWheel:y=f;break;case g.topCopy:case g.topCut:case g.topPaste:y=a}m(y);var C=y.getPooled(v,n,r);return o.accumulateTwoPhaseDispatches(C),C}};t.exports=R},{"./EventConstants":16,"./EventPluginUtils":20,"./EventPropagators":21,"./SyntheticClipboardEvent":82,"./SyntheticDragEvent":84,"./SyntheticEvent":85,"./SyntheticFocusEvent":86,"./SyntheticKeyboardEvent":88,"./SyntheticMouseEvent":89,"./SyntheticTouchEvent":90,"./SyntheticUIEvent":91,"./SyntheticWheelEvent":92,"./getEventCharCode":112,"./invariant":124,"./keyOf":131,"./warning":141}],82:[function(e,t){"use strict";function n(e,t,n){r.call(this,e,t,n)}var r=e("./SyntheticEvent"),o={clipboardData:function(e){return"clipboardData"in e?e.clipboardData:window.clipboardData}};r.augmentClass(n,o),t.exports=n},{"./SyntheticEvent":85}],83:[function(e,t){"use strict";function n(e,t,n){r.call(this,e,t,n)}var r=e("./SyntheticEvent"),o={data:null};r.augmentClass(n,o),t.exports=n},{"./SyntheticEvent":85}],84:[function(e,t){"use strict";function n(e,t,n){r.call(this,e,t,n)}var r=e("./SyntheticMouseEvent"),o={dataTransfer:null};r.augmentClass(n,o),t.exports=n},{"./SyntheticMouseEvent":89}],85:[function(e,t){"use strict";function n(e,t,n){this.dispatchConfig=e,this.dispatchMarker=t,this.nativeEvent=n;var r=this.constructor.Interface;for(var o in r)if(r.hasOwnProperty(o)){var i=r[o];this[o]=i?i(n):n[o]}var s=null!=n.defaultPrevented?n.defaultPrevented:n.returnValue===!1;this.isDefaultPrevented=s?a.thatReturnsTrue:a.thatReturnsFalse,this.isPropagationStopped=a.thatReturnsFalse}var r=e("./PooledClass"),o=e("./Object.assign"),a=e("./emptyFunction"),i=e("./getEventTarget"),s={type:null,target:i,currentTarget:a.thatReturnsNull,eventPhase:null,bubbles:null,cancelable:null,timeStamp:function(e){return e.timeStamp||Date.now()},defaultPrevented:null,isTrusted:null};o(n.prototype,{preventDefault:function(){this.defaultPrevented=!0;var e=this.nativeEvent;e.preventDefault?e.preventDefault():e.returnValue=!1,this.isDefaultPrevented=a.thatReturnsTrue},stopPropagation:function(){var e=this.nativeEvent;e.stopPropagation?e.stopPropagation():e.cancelBubble=!0,this.isPropagationStopped=a.thatReturnsTrue},persist:function(){this.isPersistent=a.thatReturnsTrue},isPersistent:a.thatReturnsFalse,destructor:function(){var e=this.constructor.Interface;for(var t in e)this[t]=null;this.dispatchConfig=null,this.dispatchMarker=null,this.nativeEvent=null}}),n.Interface=s,n.augmentClass=function(e,t){var n=this,a=Object.create(n.prototype);o(a,e.prototype),e.prototype=a,e.prototype.constructor=e,e.Interface=o({},n.Interface,t),e.augmentClass=n.augmentClass,r.addPoolingTo(e,r.threeArgumentPooler)},r.addPoolingTo(n,r.threeArgumentPooler),t.exports=n},{"./Object.assign":27,"./PooledClass":28,"./emptyFunction":105,"./getEventTarget":115}],86:[function(e,t){"use strict";function n(e,t,n){r.call(this,e,t,n)}var r=e("./SyntheticUIEvent"),o={relatedTarget:null};r.augmentClass(n,o),t.exports=n},{"./SyntheticUIEvent":91}],87:[function(e,t){"use strict";function n(e,t,n){r.call(this,e,t,n)}var r=e("./SyntheticEvent"),o={data:null};r.augmentClass(n,o),t.exports=n},{"./SyntheticEvent":85}],88:[function(e,t){"use strict";function n(e,t,n){r.call(this,e,t,n)}var r=e("./SyntheticUIEvent"),o=e("./getEventCharCode"),a=e("./getEventKey"),i=e("./getEventModifierState"),s={key:a,location:null,ctrlKey:null,shiftKey:null,altKey:null,metaKey:null,repeat:null,locale:null,getModifierState:i,charCode:function(e){return"keypress"===e.type?o(e):0},keyCode:function(e){return"keydown"===e.type||"keyup"===e.type?e.keyCode:0},which:function(e){return"keypress"===e.type?o(e):"keydown"===e.type||"keyup"===e.type?e.keyCode:0}};r.augmentClass(n,s),t.exports=n},{"./SyntheticUIEvent":91,"./getEventCharCode":112,"./getEventKey":113,"./getEventModifierState":114}],89:[function(e,t){"use strict";function n(e,t,n){r.call(this,e,t,n)}var r=e("./SyntheticUIEvent"),o=e("./ViewportMetrics"),a=e("./getEventModifierState"),i={screenX:null,screenY:null,clientX:null,clientY:null,ctrlKey:null,shiftKey:null,altKey:null,metaKey:null,getModifierState:a,button:function(e){var t=e.button;return"which"in e?t:2===t?2:4===t?1:0},buttons:null,relatedTarget:function(e){return e.relatedTarget||(e.fromElement===e.srcElement?e.toElement:e.fromElement)},pageX:function(e){return"pageX"in e?e.pageX:e.clientX+o.currentScrollLeft},pageY:function(e){return"pageY"in e?e.pageY:e.clientY+o.currentScrollTop}};r.augmentClass(n,i),t.exports=n},{"./SyntheticUIEvent":91,"./ViewportMetrics":94,"./getEventModifierState":114}],90:[function(e,t){"use strict";function n(e,t,n){r.call(this,e,t,n)}var r=e("./SyntheticUIEvent"),o=e("./getEventModifierState"),a={touches:null,targetTouches:null,changedTouches:null,altKey:null,metaKey:null,ctrlKey:null,shiftKey:null,getModifierState:o};r.augmentClass(n,a),t.exports=n},{"./SyntheticUIEvent":91,"./getEventModifierState":114}],91:[function(e,t){"use strict";function n(e,t,n){r.call(this,e,t,n)}var r=e("./SyntheticEvent"),o=e("./getEventTarget"),a={view:function(e){if(e.view)return e.view;var t=o(e);if(null!=t&&t.window===t)return t;var n=t.ownerDocument;return n?n.defaultView||n.parentWindow:window},detail:function(e){return e.detail||0}};r.augmentClass(n,a),t.exports=n},{"./SyntheticEvent":85,"./getEventTarget":115}],92:[function(e,t){"use strict";function n(e,t,n){r.call(this,e,t,n)}var r=e("./SyntheticMouseEvent"),o={deltaX:function(e){return"deltaX"in e?e.deltaX:"wheelDeltaX"in e?-e.wheelDeltaX:0},deltaY:function(e){return"deltaY"in e?e.deltaY:"wheelDeltaY"in e?-e.wheelDeltaY:"wheelDelta"in e?-e.wheelDelta:0},deltaZ:null,deltaMode:null};r.augmentClass(n,o),t.exports=n},{"./SyntheticMouseEvent":89}],93:[function(e,t){"use strict";var n=e("./invariant"),r={reinitializeTransaction:function(){this.transactionWrappers=this.getTransactionWrappers(),this.wrapperInitData?this.wrapperInitData.length=0:this.wrapperInitData=[],this._isInTransaction=!1},_isInTransaction:!1,getTransactionWrappers:null,isInTransaction:function(){return!!this._isInTransaction},perform:function(e,t,r,o,a,i,s,u){n(!this.isInTransaction());var c,l;try{this._isInTransaction=!0,c=!0,this.initializeAll(0),l=e.call(t,r,o,a,i,s,u),c=!1}finally{try{if(c)try{this.closeAll(0)}catch(p){}else this.closeAll(0)}finally{this._isInTransaction=!1}}return l},initializeAll:function(e){for(var t=this.transactionWrappers,n=e;n<t.length;n++){var r=t[n];try{this.wrapperInitData[n]=o.OBSERVED_ERROR,this.wrapperInitData[n]=r.initialize?r.initialize.call(this):null}finally{if(this.wrapperInitData[n]===o.OBSERVED_ERROR)try{this.initializeAll(n+1)}catch(a){}}}},closeAll:function(e){n(this.isInTransaction());for(var t=this.transactionWrappers,r=e;r<t.length;r++){var a,i=t[r],s=this.wrapperInitData[r];try{a=!0,s!==o.OBSERVED_ERROR&&i.close&&i.close.call(this,s),a=!1}finally{if(a)try{this.closeAll(r+1)}catch(u){}}}this.wrapperInitData.length=0}},o={Mixin:r,OBSERVED_ERROR:{}};t.exports=o},{"./invariant":124}],94:[function(e,t){"use strict";var n=e("./getUnboundedScrollPosition"),r={currentScrollLeft:0,currentScrollTop:0,refreshScrollValues:function(){var e=n(window);r.currentScrollLeft=e.x,r.currentScrollTop=e.y}};t.exports=r},{"./getUnboundedScrollPosition":120}],95:[function(e,t){"use strict";function n(e,t){if(r(null!=t),null==e)return t;var n=Array.isArray(e),o=Array.isArray(t);return n&&o?(e.push.apply(e,t),e):n?(e.push(t),e):o?[e].concat(t):[e,t]}var r=e("./invariant");t.exports=n},{"./invariant":124}],96:[function(e,t){"use strict";function n(e){for(var t=1,n=0,o=0;o<e.length;o++)t=(t+e.charCodeAt(o))%r,n=(n+t)%r;return t|n<<16}var r=65521;t.exports=n},{}],97:[function(e,t){function n(e){return e.replace(r,function(e,t){return t.toUpperCase()})}var r=/-(.)/g;t.exports=n},{}],98:[function(e,t){"use strict";function n(e){return r(e.replace(o,"ms-"))}var r=e("./camelize"),o=/^-ms-/;t.exports=n},{"./camelize":97}],99:[function(e,t){function n(e,t){return e&&t?e===t?!0:r(e)?!1:r(t)?n(e,t.parentNode):e.contains?e.contains(t):e.compareDocumentPosition?!!(16&e.compareDocumentPosition(t)):!1:!1}var r=e("./isTextNode");t.exports=n},{"./isTextNode":128}],100:[function(e,t){function n(e){return!!e&&("object"==typeof e||"function"==typeof e)&&"length"in e&&!("setInterval"in e)&&"number"!=typeof e.nodeType&&(Array.isArray(e)||"callee"in e||"item"in e)}function r(e){return n(e)?Array.isArray(e)?e.slice():o(e):[e]}var o=e("./toArray");t.exports=r},{"./toArray":139}],101:[function(e,t){"use strict";function n(e){var t=o.createFactory(e),n=r.createClass({displayName:"ReactFullPageComponent"+e,componentWillUnmount:function(){a(!1)},render:function(){return t(this.props)}});return n}var r=e("./ReactCompositeComponent"),o=e("./ReactElement"),a=e("./invariant");t.exports=n},{"./ReactCompositeComponent":34,"./ReactElement":50,"./invariant":124}],102:[function(e,t){function n(e){var t=e.match(c);return t&&t[1].toLowerCase()}function r(e,t){var r=u;s(!!u);var o=n(e),c=o&&i(o);if(c){r.innerHTML=c[1]+e+c[2];for(var l=c[0];l--;)r=r.lastChild}else r.innerHTML=e;var p=r.getElementsByTagName("script");p.length&&(s(t),a(p).forEach(t));for(var d=a(r.childNodes);r.lastChild;)r.removeChild(r.lastChild);return d}var o=e("./ExecutionEnvironment"),a=e("./createArrayFrom"),i=e("./getMarkupWrap"),s=e("./invariant"),u=o.canUseDOM?document.createElement("div"):null,c=/^\s*<(\w+)/;t.exports=r},{"./ExecutionEnvironment":22,"./createArrayFrom":100,"./getMarkupWrap":116,"./invariant":124}],103:[function(e,t){"use strict";function n(e,t){var n=null==t||"boolean"==typeof t||""===t;if(n)return"";var r=isNaN(t);return r||0===t||o.hasOwnProperty(e)&&o[e]?""+t:("string"==typeof t&&(t=t.trim()),t+"px")}var r=e("./CSSProperty"),o=r.isUnitlessNumber;t.exports=n},{"./CSSProperty":4}],104:[function(e,t){function n(e,t,n,r,o){return o}e("./Object.assign"),e("./warning");t.exports=n},{"./Object.assign":27,"./warning":141}],105:[function(e,t){function n(e){return function(){return e}}function r(){}r.thatReturns=n,r.thatReturnsFalse=n(!1),r.thatReturnsTrue=n(!0),r.thatReturnsNull=n(null),r.thatReturnsThis=function(){return this},r.thatReturnsArgument=function(e){return e},t.exports=r},{}],106:[function(e,t){"use strict";var n={};t.exports=n},{}],107:[function(e,t){"use strict";function n(e){return o[e]}function r(e){return(""+e).replace(a,n)}var o={"&":"&amp;",">":"&gt;","<":"&lt;",'"':"&quot;","'":"&#x27;"},a=/[&><"']/g;t.exports=r},{}],108:[function(e,t){"use strict";function n(e,t,n){var r=e,a=!r.hasOwnProperty(n);if(a&&null!=t){var i,s=typeof t;i="string"===s?o(t):"number"===s?o(""+t):t,r[n]=i}}function r(e){if(null==e)return e;var t={};return a(e,n,t),t}{var o=e("./ReactTextComponent"),a=e("./traverseAllChildren");e("./warning")}t.exports=r},{"./ReactTextComponent":76,"./traverseAllChildren":140,"./warning":141}],109:[function(e,t){"use strict";function n(e){try{e.focus()}catch(t){}}t.exports=n},{}],110:[function(e,t){"use strict";var n=function(e,t,n){Array.isArray(e)?e.forEach(t,n):e&&t.call(n,e)};t.exports=n},{}],111:[function(e,t){function n(){try{return document.activeElement||document.body}catch(e){return document.body}}t.exports=n},{}],112:[function(e,t){"use strict";function n(e){var t,n=e.keyCode;return"charCode"in e?(t=e.charCode,0===t&&13===n&&(t=13)):t=n,t>=32||13===t?t:0}t.exports=n},{}],113:[function(e,t){"use strict";function n(e){if(e.key){var t=o[e.key]||e.key;if("Unidentified"!==t)return t}if("keypress"===e.type){var n=r(e);return 13===n?"Enter":String.fromCharCode(n)}return"keydown"===e.type||"keyup"===e.type?a[e.keyCode]||"Unidentified":""}var r=e("./getEventCharCode"),o={Esc:"Escape",Spacebar:" ",Left:"ArrowLeft",Up:"ArrowUp",Right:"ArrowRight",Down:"ArrowDown",Del:"Delete",Win:"OS",Menu:"ContextMenu",Apps:"ContextMenu",Scroll:"ScrollLock",MozPrintableKey:"Unidentified"},a={8:"Backspace",9:"Tab",12:"Clear",13:"Enter",16:"Shift",17:"Control",18:"Alt",19:"Pause",20:"CapsLock",27:"Escape",32:" ",33:"PageUp",34:"PageDown",35:"End",36:"Home",37:"ArrowLeft",38:"ArrowUp",39:"ArrowRight",40:"ArrowDown",45:"Insert",46:"Delete",112:"F1",113:"F2",114:"F3",115:"F4",116:"F5",117:"F6",118:"F7",119:"F8",120:"F9",121:"F10",122:"F11",123:"F12",144:"NumLock",145:"ScrollLock",224:"Meta"};t.exports=n},{"./getEventCharCode":112}],114:[function(e,t){"use strict";function n(e){var t=this,n=t.nativeEvent;if(n.getModifierState)return n.getModifierState(e);var r=o[e];return r?!!n[r]:!1}function r(){return n}var o={Alt:"altKey",Control:"ctrlKey",Meta:"metaKey",Shift:"shiftKey"};t.exports=r},{}],115:[function(e,t){"use strict";function n(e){var t=e.target||e.srcElement||window;return 3===t.nodeType?t.parentNode:t}t.exports=n},{}],116:[function(e,t){function n(e){return o(!!a),p.hasOwnProperty(e)||(e="*"),i.hasOwnProperty(e)||(a.innerHTML="*"===e?"<link />":"<"+e+"></"+e+">",i[e]=!a.firstChild),i[e]?p[e]:null}var r=e("./ExecutionEnvironment"),o=e("./invariant"),a=r.canUseDOM?document.createElement("div"):null,i={circle:!0,defs:!0,ellipse:!0,g:!0,line:!0,linearGradient:!0,path:!0,polygon:!0,polyline:!0,radialGradient:!0,rect:!0,stop:!0,text:!0},s=[1,'<select multiple="true">',"</select>"],u=[1,"<table>","</table>"],c=[3,"<table><tbody><tr>","</tr></tbody></table>"],l=[1,"<svg>","</svg>"],p={"*":[1,"?<div>","</div>"],area:[1,"<map>","</map>"],col:[2,"<table><tbody></tbody><colgroup>","</colgroup></table>"],legend:[1,"<fieldset>","</fieldset>"],param:[1,"<object>","</object>"],tr:[2,"<table><tbody>","</tbody></table>"],optgroup:s,option:s,caption:u,colgroup:u,tbody:u,tfoot:u,thead:u,td:c,th:c,circle:l,defs:l,ellipse:l,g:l,line:l,linearGradient:l,path:l,polygon:l,polyline:l,radialGradient:l,rect:l,stop:l,text:l};t.exports=n},{"./ExecutionEnvironment":22,"./invariant":124}],117:[function(e,t){"use strict";function n(e){for(;e&&e.firstChild;)e=e.firstChild;return e}function r(e){for(;e;){if(e.nextSibling)return e.nextSibling;e=e.parentNode}}function o(e,t){for(var o=n(e),a=0,i=0;o;){if(3==o.nodeType){if(i=a+o.textContent.length,t>=a&&i>=t)return{node:o,offset:t-a};a=i}o=n(r(o))}}t.exports=o},{}],118:[function(e,t){"use strict";function n(e){return e?e.nodeType===r?e.documentElement:e.firstChild:null}var r=9;t.exports=n},{}],119:[function(e,t){"use strict";function n(){return!o&&r.canUseDOM&&(o="textContent"in document.documentElement?"textContent":"innerText"),o}var r=e("./ExecutionEnvironment"),o=null;t.exports=n},{"./ExecutionEnvironment":22}],120:[function(e,t){"use strict";function n(e){return e===window?{x:window.pageXOffset||document.documentElement.scrollLeft,y:window.pageYOffset||document.documentElement.scrollTop}:{x:e.scrollLeft,y:e.scrollTop}}t.exports=n},{}],121:[function(e,t){function n(e){return e.replace(r,"-$1").toLowerCase()}var r=/([A-Z])/g;t.exports=n},{}],122:[function(e,t){"use strict";function n(e){return r(e).replace(o,"-ms-")}var r=e("./hyphenate"),o=/^ms-/;t.exports=n},{"./hyphenate":121}],123:[function(e,t){"use strict";function n(e,t){var n;return n="string"==typeof e.type?r.createInstanceForTag(e.type,e.props,t):new e.type(e.props),n.construct(e),n}{var r=(e("./warning"),e("./ReactElement"),e("./ReactLegacyElement"),e("./ReactNativeComponent"));e("./ReactEmptyComponent")}t.exports=n},{"./ReactElement":50,"./ReactEmptyComponent":52,"./ReactLegacyElement":59,"./ReactNativeComponent":64,"./warning":141}],124:[function(e,t){"use strict";var n=function(e,t,n,r,o,a,i,s){if(!e){var u;if(void 0===t)u=new Error("Minified exception occurred; use the non-minified dev environment for the full error message and additional helpful warnings.");else{var c=[n,r,o,a,i,s],l=0;u=new Error("Invariant Violation: "+t.replace(/%s/g,function(){return c[l++]}))}throw u.framesToPop=1,u}};t.exports=n},{}],125:[function(e,t){"use strict";function n(e,t){if(!o.canUseDOM||t&&!("addEventListener"in document))return!1;var n="on"+e,a=n in document;if(!a){var i=document.createElement("div");i.setAttribute(n,"return;"),a="function"==typeof i[n]}return!a&&r&&"wheel"===e&&(a=document.implementation.hasFeature("Events.wheel","3.0")),a}var r,o=e("./ExecutionEnvironment");o.canUseDOM&&(r=document.implementation&&document.implementation.hasFeature&&document.implementation.hasFeature("","")!==!0),t.exports=n},{"./ExecutionEnvironment":22}],126:[function(e,t){function n(e){return!(!e||!("function"==typeof Node?e instanceof Node:"object"==typeof e&&"number"==typeof e.nodeType&&"string"==typeof e.nodeName))}t.exports=n},{}],127:[function(e,t){"use strict";function n(e){return e&&("INPUT"===e.nodeName&&r[e.type]||"TEXTAREA"===e.nodeName)}var r={color:!0,date:!0,datetime:!0,"datetime-local":!0,email:!0,month:!0,number:!0,password:!0,range:!0,search:!0,tel:!0,text:!0,time:!0,url:!0,week:!0};t.exports=n},{}],128:[function(e,t){function n(e){return r(e)&&3==e.nodeType}var r=e("./isNode");t.exports=n},{"./isNode":126}],129:[function(e,t){"use strict";function n(e){e||(e="");var t,n=arguments.length;if(n>1)for(var r=1;n>r;r++)t=arguments[r],t&&(e=(e?e+" ":"")+t);return e}t.exports=n},{}],130:[function(e,t){"use strict";var n=e("./invariant"),r=function(e){var t,r={};n(e instanceof Object&&!Array.isArray(e));for(t in e)e.hasOwnProperty(t)&&(r[t]=t);return r};t.exports=r},{"./invariant":124}],131:[function(e,t){var n=function(e){var t;for(t in e)if(e.hasOwnProperty(t))return t;return null};t.exports=n},{}],132:[function(e,t){"use strict";function n(e,t,n){if(!e)return null;var o={};for(var a in e)r.call(e,a)&&(o[a]=t.call(n,e[a],a,e));return o}var r=Object.prototype.hasOwnProperty;t.exports=n},{}],133:[function(e,t){"use strict";function n(e){var t={};return function(n){return t.hasOwnProperty(n)?t[n]:t[n]=e.call(this,n)}}t.exports=n},{}],134:[function(e,t){"use strict";function n(e){r(e&&!/[^a-z0-9_]/.test(e))}var r=e("./invariant");t.exports=n},{"./invariant":124}],135:[function(e,t){"use strict";function n(e){return o(r.isValidElement(e)),e}var r=e("./ReactElement"),o=e("./invariant");t.exports=n},{"./ReactElement":50,"./invariant":124}],136:[function(e,t){"use strict";var n=e("./ExecutionEnvironment"),r=/^[ \r\n\t\f]/,o=/<(!--|link|noscript|meta|script|style)[ \r\n\t\f\/>]/,a=function(e,t){e.innerHTML=t};if(n.canUseDOM){var i=document.createElement("div");i.innerHTML=" ",""===i.innerHTML&&(a=function(e,t){if(e.parentNode&&e.parentNode.replaceChild(e,e),r.test(t)||"<"===t[0]&&o.test(t)){e.innerHTML=""+t;
var n=e.firstChild;1===n.data.length?e.removeChild(n):n.deleteData(0,1)}else e.innerHTML=t})}t.exports=a},{"./ExecutionEnvironment":22}],137:[function(e,t){"use strict";function n(e,t){if(e===t)return!0;var n;for(n in e)if(e.hasOwnProperty(n)&&(!t.hasOwnProperty(n)||e[n]!==t[n]))return!1;for(n in t)if(t.hasOwnProperty(n)&&!e.hasOwnProperty(n))return!1;return!0}t.exports=n},{}],138:[function(e,t){"use strict";function n(e,t){return e&&t&&e.type===t.type&&e.key===t.key&&e._owner===t._owner?!0:!1}t.exports=n},{}],139:[function(e,t){function n(e){var t=e.length;if(r(!Array.isArray(e)&&("object"==typeof e||"function"==typeof e)),r("number"==typeof t),r(0===t||t-1 in e),e.hasOwnProperty)try{return Array.prototype.slice.call(e)}catch(n){}for(var o=Array(t),a=0;t>a;a++)o[a]=e[a];return o}var r=e("./invariant");t.exports=n},{"./invariant":124}],140:[function(e,t){"use strict";function n(e){return d[e]}function r(e,t){return e&&null!=e.key?a(e.key):t.toString(36)}function o(e){return(""+e).replace(f,n)}function a(e){return"$"+o(e)}function i(e,t,n){return null==e?0:h(e,"",0,t,n)}var s=e("./ReactElement"),u=e("./ReactInstanceHandles"),c=e("./invariant"),l=u.SEPARATOR,p=":",d={"=":"=0",".":"=1",":":"=2"},f=/[=.:]/g,h=function(e,t,n,o,i){var u,d,f=0;if(Array.isArray(e))for(var m=0;m<e.length;m++){var v=e[m];u=t+(t?p:l)+r(v,m),d=n+f,f+=h(v,u,d,o,i)}else{var g=typeof e,y=""===t,E=y?l+r(e,0):t;if(null==e||"boolean"===g)o(i,null,E,n),f=1;else if("string"===g||"number"===g||s.isValidElement(e))o(i,e,E,n),f=1;else if("object"===g){c(!e||1!==e.nodeType);for(var C in e)e.hasOwnProperty(C)&&(u=t+(t?p:l)+a(C)+p+r(e[C],0),d=n+f,f+=h(e[C],u,d,o,i))}}return f};t.exports=i},{"./ReactElement":50,"./ReactInstanceHandles":58,"./invariant":124}],141:[function(e,t){"use strict";var n=e("./emptyFunction"),r=n;t.exports=r},{"./emptyFunction":105}]},{},[1])(1)});
/*! (C) WebReflection Mit Style License */
(function(e,t,n,r){"use strict";function rt(e,t){for(var n=0,r=e.length;n<r;n++)dt(e[n],t)}function it(e){for(var t=0,n=e.length,r;t<n;t++)r=e[t],nt(r,b[ot(r)])}function st(e){return function(t){j(t)&&(dt(t,e),rt(t.querySelectorAll(w),e))}}function ot(e){var t=e.getAttribute("is"),n=e.nodeName.toUpperCase(),r=S.call(y,t?v+t.toUpperCase():d+n);return t&&-1<r&&!ut(n,t)?-1:r}function ut(e,t){return-1<w.indexOf(e+'[is="'+t+'"]')}function at(e){var t=e.currentTarget,n=e.attrChange,r=e.prevValue,i=e.newValue;Q&&t.attributeChangedCallback&&e.attrName!=="style"&&t.attributeChangedCallback(e.attrName,n===e[a]?null:r,n===e[l]?null:i)}function ft(e){var t=st(e);return function(e){X.push(t,e.target)}}function lt(e){K&&(K=!1,e.currentTarget.removeEventListener(h,lt)),rt((e.target||t).querySelectorAll(w),e.detail===o?o:s),B&&pt()}function ct(e,t){var n=this;q.call(n,e,t),G.call(n,{target:n})}function ht(e,t){D(e,t),et?et.observe(e,z):(J&&(e.setAttribute=ct,e[i]=Z(e),e.addEventListener(p,G)),e.addEventListener(c,at)),e.createdCallback&&Q&&(e.created=!0,e.createdCallback(),e.created=!1)}function pt(){for(var e,t=0,n=F.length;t<n;t++)e=F[t],E.contains(e)||(F.splice(t,1),dt(e,o))}function dt(e,t){var n,r=ot(e);-1<r&&(tt(e,b[r]),r=0,t===s&&!e[s]?(e[o]=!1,e[s]=!0,r=1,B&&S.call(F,e)<0&&F.push(e)):t===o&&!e[o]&&(e[s]=!1,e[o]=!0,r=1),r&&(n=e[t+"Callback"])&&n.call(e))}if(r in t)return;var i="__"+r+(Math.random()*1e5>>0),s="attached",o="detached",u="extends",a="ADDITION",f="MODIFICATION",l="REMOVAL",c="DOMAttrModified",h="DOMContentLoaded",p="DOMSubtreeModified",d="<",v="=",m=/^[A-Z][A-Z0-9]*(?:-[A-Z0-9]+)+$/,g=["ANNOTATION-XML","COLOR-PROFILE","FONT-FACE","FONT-FACE-SRC","FONT-FACE-URI","FONT-FACE-FORMAT","FONT-FACE-NAME","MISSING-GLYPH"],y=[],b=[],w="",E=t.documentElement,S=y.indexOf||function(e){for(var t=this.length;t--&&this[t]!==e;);return t},x=n.prototype,T=x.hasOwnProperty,N=x.isPrototypeOf,C=n.defineProperty,k=n.getOwnPropertyDescriptor,L=n.getOwnPropertyNames,A=n.getPrototypeOf,O=n.setPrototypeOf,M=!!n.__proto__,_=n.create||function vt(e){return e?(vt.prototype=e,new vt):this},D=O||(M?function(e,t){return e.__proto__=t,e}:L&&k?function(){function e(e,t){for(var n,r=L(t),i=0,s=r.length;i<s;i++)n=r[i],T.call(e,n)||C(e,n,k(t,n))}return function(t,n){do e(t,n);while((n=A(n))&&!N.call(n,t));return t}}():function(e,t){for(var n in t)e[n]=t[n];return e}),P=e.MutationObserver||e.WebKitMutationObserver,H=(e.HTMLElement||e.Element||e.Node).prototype,B=!N.call(H,E),j=B?function(e){return e.nodeType===1}:function(e){return N.call(H,e)},F=B&&[],I=H.cloneNode,q=H.setAttribute,R=H.removeAttribute,U=t.createElement,z=P&&{attributes:!0,characterData:!0,attributeOldValue:!0},W=P||function(e){J=!1,E.removeEventListener(c,W)},X,V=e.requestAnimationFrame||e.webkitRequestAnimationFrame||e.mozRequestAnimationFrame||e.msRequestAnimationFrame||function(e){setTimeout(e,10)},$=!1,J=!0,K=!0,Q=!0,G,Y,Z,et,tt,nt;O||M?(tt=function(e,t){N.call(t,e)||ht(e,t)},nt=ht):(tt=function(e,t){e[i]||(e[i]=n(!0),ht(e,t))},nt=tt),B?(J=!1,function(){var e=k(H,"addEventListener"),t=e.value,n=function(e){var t=new CustomEvent(c,{bubbles:!0});t.attrName=e,t.prevValue=this.getAttribute(e),t.newValue=null,t[l]=t.attrChange=2,R.call(this,e),this.dispatchEvent(t)},r=function(e,t){var n=this.hasAttribute(e),r=n&&this.getAttribute(e),i=new CustomEvent(c,{bubbles:!0});q.call(this,e,t),i.attrName=e,i.prevValue=n?r:null,i.newValue=t,n?i[f]=i.attrChange=1:i[a]=i.attrChange=0,this.dispatchEvent(i)},s=function(e){var t=e.currentTarget,n=t[i],r=e.propertyName,s;n.hasOwnProperty(r)&&(n=n[r],s=new CustomEvent(c,{bubbles:!0}),s.attrName=n.name,s.prevValue=n.value||null,s.newValue=n.value=t[r]||null,s.prevValue==null?s[a]=s.attrChange=0:s[f]=s.attrChange=1,t.dispatchEvent(s))};e.value=function(e,o,u){e===c&&this.attributeChangedCallback&&this.setAttribute!==r&&(this[i]={className:{name:"class",value:this.className}},this.setAttribute=r,this.removeAttribute=n,t.call(this,"propertychange",s)),t.call(this,e,o,u)},C(H,"addEventListener",e)}()):P||(E.addEventListener(c,W),E.setAttribute(i,1),E.removeAttribute(i),J&&(G=function(e){var t=this,n,r,s;if(t===e.target){n=t[i],t[i]=r=Z(t);for(s in r){if(!(s in n))return Y(0,t,s,n[s],r[s],a);if(r[s]!==n[s])return Y(1,t,s,n[s],r[s],f)}for(s in n)if(!(s in r))return Y(2,t,s,n[s],r[s],l)}},Y=function(e,t,n,r,i,s){var o={attrChange:e,currentTarget:t,attrName:n,prevValue:r,newValue:i};o[s]=e,at(o)},Z=function(e){for(var t,n,r={},i=e.attributes,s=0,o=i.length;s<o;s++)t=i[s],n=t.name,n!=="setAttribute"&&(r[n]=t.value);return r})),t[r]=function(n,r){p=n.toUpperCase(),$||($=!0,P?(et=function(e,t){function n(e,t){for(var n=0,r=e.length;n<r;t(e[n++]));}return new P(function(r){for(var i,s,o=0,u=r.length;o<u;o++)i=r[o],i.type==="childList"?(n(i.addedNodes,e),n(i.removedNodes,t)):(s=i.target,Q&&s.attributeChangedCallback&&i.attributeName!=="style"&&s.attributeChangedCallback(i.attributeName,i.oldValue,s.getAttribute(i.attributeName)))})}(st(s),st(o)),et.observe(t,{childList:!0,subtree:!0})):(X=[],V(function E(){while(X.length)X.shift().call(null,X.shift());V(E)}),t.addEventListener("DOMNodeInserted",ft(s)),t.addEventListener("DOMNodeRemoved",ft(o))),t.addEventListener(h,lt),t.addEventListener("readystatechange",lt),t.createElement=function(e,n){var r=U.apply(t,arguments),i=""+e,s=S.call(y,(n?v:d)+(n||i).toUpperCase()),o=-1<s;return n&&(r.setAttribute("is",n=n.toLowerCase()),o&&(o=ut(i.toUpperCase(),n))),Q=!t.createElement.innerHTMLHelper,o&&nt(r,b[s]),r},H.cloneNode=function(e){var t=I.call(this,!!e),n=ot(t);return-1<n&&nt(t,b[n]),e&&it(t.querySelectorAll(w)),t});if(-2<S.call(y,v+p)+S.call(y,d+p))throw new Error("A "+n+" type is already registered");if(!m.test(p)||-1<S.call(g,p))throw new Error("The type "+n+" is invalid");var i=function(){return f?t.createElement(l,p):t.createElement(l)},a=r||x,f=T.call(a,u),l=f?r[u].toUpperCase():p,c=y.push((f?v:d)+p)-1,p;return w=w.concat(w.length?",":"",f?l+'[is="'+n.toLowerCase()+'"]':l),i.prototype=b[c]=T.call(a,"prototype")?a.prototype:_(H),rt(t.querySelectorAll(w),s),i}})(window,document,Object,"registerElement");
var g,aa=this;
function q(a){var b=typeof a;if("object"==b)if(a){if(a instanceof Array)return"array";if(a instanceof Object)return b;var c=Object.prototype.toString.call(a);if("[object Window]"==c)return"object";if("[object Array]"==c||"number"==typeof a.length&&"undefined"!=typeof a.splice&&"undefined"!=typeof a.propertyIsEnumerable&&!a.propertyIsEnumerable("splice"))return"array";if("[object Function]"==c||"undefined"!=typeof a.call&&"undefined"!=typeof a.propertyIsEnumerable&&!a.propertyIsEnumerable("call"))return"function"}else return"null";else if("function"==
b&&"undefined"==typeof a.call)return"object";return b}var ba="closure_uid_"+(1E9*Math.random()>>>0),ca=0;function ea(a){return Array.prototype.join.call(arguments,"")}function fa(a,b){return a<b?-1:a>b?1:0};function ha(a,b){for(var c in a)b.call(void 0,a[c],c,a)}var ia="constructor hasOwnProperty isPrototypeOf propertyIsEnumerable toLocaleString toString valueOf".split(" ");function ja(a,b){for(var c,d,e=1;e<arguments.length;e++){d=arguments[e];for(c in d)a[c]=d[c];for(var f=0;f<ia.length;f++)c=ia[f],Object.prototype.hasOwnProperty.call(d,c)&&(a[c]=d[c])}};function ka(a,b){null!=a&&this.append.apply(this,arguments)}g=ka.prototype;g.Ia="";g.set=function(a){this.Ia=""+a};g.append=function(a,b,c){this.Ia+=a;if(null!=b)for(var d=1;d<arguments.length;d++)this.Ia+=arguments[d];return this};g.clear=function(){this.Ia=""};g.toString=function(){return this.Ia};if("undefined"===typeof la)var la=function(){throw Error("No *print-fn* fn set for evaluation environment");};var ma=!0,oa=null;if("undefined"===typeof pa)var pa=null;function qa(){return new ra(null,5,[sa,!0,ua,!0,va,!1,wa,!1,xa,null],null)}function r(a){return null!=a&&!1!==a}function ya(a){return null==a}function za(a){return a instanceof Array}function Ba(a){return r(a)?!1:!0}function t(a,b){return a[q(null==b?null:b)]?!0:a._?!0:!1}
function v(a,b){var c=null==b?null:b.constructor,c=r(r(c)?c.La:c)?c.Ka:q(b);return Error(["No protocol method ",a," defined for type ",c,": ",b].join(""))}function Ca(a){var b=a.Ka;return r(b)?b:""+w(a)}var Da="undefined"!==typeof Symbol&&"function"===q(Symbol)?Symbol.iterator:"@@iterator";function Fa(a){for(var b=a.length,c=Array(b),d=0;;)if(d<b)c[d]=a[d],d+=1;else break;return c}
function Ga(){switch(arguments.length){case 1:return Ha(arguments[0]);case 2:return Ha(arguments[1]);default:throw Error([w("Invalid arity: "),w(arguments.length)].join(""));}}function Ia(a){return Ha(a)}function Ha(a){function b(a,b){a.push(b);return a}var c=[];return Ka?Ka(b,c,a):La.call(null,b,c,a)}
var Ma={},Oa={},Pa={},Ra=function Ra(b){if(b?b.ba:b)return b.ba(b);var c;c=Ra[q(null==b?null:b)];if(!c&&(c=Ra._,!c))throw v("ICloneable.-clone",b);return c.call(null,b)},Sa={},Ua=function Ua(b){if(b?b.N:b)return b.N(b);var c;c=Ua[q(null==b?null:b)];if(!c&&(c=Ua._,!c))throw v("ICounted.-count",b);return c.call(null,b)},Va=function Va(b){if(b?b.O:b)return b.O(b);var c;c=Va[q(null==b?null:b)];if(!c&&(c=Va._,!c))throw v("IEmptyableCollection.-empty",b);return c.call(null,b)},Wa={},Ya=function Ya(b,c){if(b?
b.L:b)return b.L(b,c);var d;d=Ya[q(null==b?null:b)];if(!d&&(d=Ya._,!d))throw v("ICollection.-conj",b);return d.call(null,b,c)},Za={},y=function y(){switch(arguments.length){case 2:return y.d(arguments[0],arguments[1]);case 3:return y.h(arguments[0],arguments[1],arguments[2]);default:throw Error([w("Invalid arity: "),w(arguments.length)].join(""));}};y.d=function(a,b){if(a?a.w:a)return a.w(a,b);var c;c=y[q(null==a?null:a)];if(!c&&(c=y._,!c))throw v("IIndexed.-nth",a);return c.call(null,a,b)};
y.h=function(a,b,c){if(a?a.$:a)return a.$(a,b,c);var d;d=y[q(null==a?null:a)];if(!d&&(d=y._,!d))throw v("IIndexed.-nth",a);return d.call(null,a,b,c)};y.G=3;
var $a={},ab=function ab(b){if(b?b.U:b)return b.U(b);var c;c=ab[q(null==b?null:b)];if(!c&&(c=ab._,!c))throw v("ISeq.-first",b);return c.call(null,b)},bb=function bb(b){if(b?b.aa:b)return b.aa(b);var c;c=bb[q(null==b?null:b)];if(!c&&(c=bb._,!c))throw v("ISeq.-rest",b);return c.call(null,b)},cb={},db={},z=function z(){switch(arguments.length){case 2:return z.d(arguments[0],arguments[1]);case 3:return z.h(arguments[0],arguments[1],arguments[2]);default:throw Error([w("Invalid arity: "),w(arguments.length)].join(""));
}};z.d=function(a,b){if(a?a.v:a)return a.v(a,b);var c;c=z[q(null==a?null:a)];if(!c&&(c=z._,!c))throw v("ILookup.-lookup",a);return c.call(null,a,b)};z.h=function(a,b,c){if(a?a.t:a)return a.t(a,b,c);var d;d=z[q(null==a?null:a)];if(!d&&(d=z._,!d))throw v("ILookup.-lookup",a);return d.call(null,a,b,c)};z.G=3;
var eb=function eb(b,c){if(b?b.Va:b)return b.Va(b,c);var d;d=eb[q(null==b?null:b)];if(!d&&(d=eb._,!d))throw v("IAssociative.-contains-key?",b);return d.call(null,b,c)},fb=function fb(b,c,d){if(b?b.Ja:b)return b.Ja(b,c,d);var e;e=fb[q(null==b?null:b)];if(!e&&(e=fb._,!e))throw v("IAssociative.-assoc",b);return e.call(null,b,c,d)},jb={},kb=function kb(b,c){if(b?b.gb:b)return b.gb(b,c);var d;d=kb[q(null==b?null:b)];if(!d&&(d=kb._,!d))throw v("IMap.-dissoc",b);return d.call(null,b,c)},lb={},mb=function mb(b){if(b?
b.rb:b)return b.rb();var c;c=mb[q(null==b?null:b)];if(!c&&(c=mb._,!c))throw v("IMapEntry.-key",b);return c.call(null,b)},nb=function nb(b){if(b?b.sb:b)return b.sb();var c;c=nb[q(null==b?null:b)];if(!c&&(c=nb._,!c))throw v("IMapEntry.-val",b);return c.call(null,b)},ob={},pb=function pb(b,c){if(b?b.yb:b)return b.yb(0,c);var d;d=pb[q(null==b?null:b)];if(!d&&(d=pb._,!d))throw v("ISet.-disjoin",b);return d.call(null,b,c)},qb={},rb=function rb(b,c,d){if(b?b.tb:b)return b.tb(b,c,d);var e;e=rb[q(null==b?
null:b)];if(!e&&(e=rb._,!e))throw v("IVector.-assoc-n",b);return e.call(null,b,c,d)},sb=function sb(b){if(b?b.Wa:b)return b.Wa(b);var c;c=sb[q(null==b?null:b)];if(!c&&(c=sb._,!c))throw v("IDeref.-deref",b);return c.call(null,b)},tb={},ub=function ub(b){if(b?b.C:b)return b.C(b);var c;c=ub[q(null==b?null:b)];if(!c&&(c=ub._,!c))throw v("IMeta.-meta",b);return c.call(null,b)},wb={},xb=function xb(b,c){if(b?b.F:b)return b.F(b,c);var d;d=xb[q(null==b?null:b)];if(!d&&(d=xb._,!d))throw v("IWithMeta.-with-meta",
b);return d.call(null,b,c)},yb={},zb=function zb(){switch(arguments.length){case 2:return zb.d(arguments[0],arguments[1]);case 3:return zb.h(arguments[0],arguments[1],arguments[2]);default:throw Error([w("Invalid arity: "),w(arguments.length)].join(""));}};zb.d=function(a,b){if(a?a.S:a)return a.S(a,b);var c;c=zb[q(null==a?null:a)];if(!c&&(c=zb._,!c))throw v("IReduce.-reduce",a);return c.call(null,a,b)};
zb.h=function(a,b,c){if(a?a.T:a)return a.T(a,b,c);var d;d=zb[q(null==a?null:a)];if(!d&&(d=zb._,!d))throw v("IReduce.-reduce",a);return d.call(null,a,b,c)};zb.G=3;
var Ab=function Ab(b,c){if(b?b.n:b)return b.n(b,c);var d;d=Ab[q(null==b?null:b)];if(!d&&(d=Ab._,!d))throw v("IEquiv.-equiv",b);return d.call(null,b,c)},Bb=function Bb(b){if(b?b.K:b)return b.K(b);var c;c=Bb[q(null==b?null:b)];if(!c&&(c=Bb._,!c))throw v("IHash.-hash",b);return c.call(null,b)},Cb={},Db=function Db(b){if(b?b.M:b)return b.M(b);var c;c=Db[q(null==b?null:b)];if(!c&&(c=Db._,!c))throw v("ISeqable.-seq",b);return c.call(null,b)},Eb={},C=function C(b,c){if(b?b.Db:b)return b.Db(0,c);var d;d=
C[q(null==b?null:b)];if(!d&&(d=C._,!d))throw v("IWriter.-write",b);return d.call(null,b,c)},Fb={},Gb=function Gb(b,c,d){if(b?b.I:b)return b.I(b,c,d);var e;e=Gb[q(null==b?null:b)];if(!e&&(e=Gb._,!e))throw v("IPrintWithWriter.-pr-writer",b);return e.call(null,b,c,d)},Hb=function Hb(b,c,d){if(b?b.Bb:b)return b.Bb(0,c,d);var e;e=Hb[q(null==b?null:b)];if(!e&&(e=Hb._,!e))throw v("IWatchable.-notify-watches",b);return e.call(null,b,c,d)},Ib=function Ib(b,c,d){if(b?b.Ab:b)return b.Ab(0,c,d);var e;e=Ib[q(null==
b?null:b)];if(!e&&(e=Ib._,!e))throw v("IWatchable.-add-watch",b);return e.call(null,b,c,d)},Jb=function Jb(b,c){if(b?b.Cb:b)return b.Cb(0,c);var d;d=Jb[q(null==b?null:b)];if(!d&&(d=Jb._,!d))throw v("IWatchable.-remove-watch",b);return d.call(null,b,c)},Kb=function Kb(b){if(b?b.Xa:b)return b.Xa(b);var c;c=Kb[q(null==b?null:b)];if(!c&&(c=Kb._,!c))throw v("IEditableCollection.-as-transient",b);return c.call(null,b)},Lb=function Lb(b,c){if(b?b.$a:b)return b.$a(b,c);var d;d=Lb[q(null==b?null:b)];if(!d&&
(d=Lb._,!d))throw v("ITransientCollection.-conj!",b);return d.call(null,b,c)},Mb=function Mb(b){if(b?b.ab:b)return b.ab(b);var c;c=Mb[q(null==b?null:b)];if(!c&&(c=Mb._,!c))throw v("ITransientCollection.-persistent!",b);return c.call(null,b)},Nb=function Nb(b,c,d){if(b?b.Za:b)return b.Za(b,c,d);var e;e=Nb[q(null==b?null:b)];if(!e&&(e=Nb._,!e))throw v("ITransientAssociative.-assoc!",b);return e.call(null,b,c,d)},Ob=function Ob(b,c,d){if(b?b.zb:b)return b.zb(0,c,d);var e;e=Ob[q(null==b?null:b)];if(!e&&
(e=Ob._,!e))throw v("ITransientVector.-assoc-n!",b);return e.call(null,b,c,d)},Pb=function Pb(b){if(b?b.wb:b)return b.wb();var c;c=Pb[q(null==b?null:b)];if(!c&&(c=Pb._,!c))throw v("IChunk.-drop-first",b);return c.call(null,b)},Qb=function Qb(b){if(b?b.pb:b)return b.pb(b);var c;c=Qb[q(null==b?null:b)];if(!c&&(c=Qb._,!c))throw v("IChunkedSeq.-chunked-first",b);return c.call(null,b)},Rb=function Rb(b){if(b?b.qb:b)return b.qb(b);var c;c=Rb[q(null==b?null:b)];if(!c&&(c=Rb._,!c))throw v("IChunkedSeq.-chunked-rest",
b);return c.call(null,b)},Sb=function Sb(b){if(b?b.ob:b)return b.ob(b);var c;c=Sb[q(null==b?null:b)];if(!c&&(c=Sb._,!c))throw v("IChunkedNext.-chunked-next",b);return c.call(null,b)},Tb={},Ub=function Ub(b,c){if(b?b.jc:b)return b.jc(b,c);var d;d=Ub[q(null==b?null:b)];if(!d&&(d=Ub._,!d))throw v("IReset.-reset!",b);return d.call(null,b,c)},Vb=function Vb(){switch(arguments.length){case 2:return Vb.d(arguments[0],arguments[1]);case 3:return Vb.h(arguments[0],arguments[1],arguments[2]);case 4:return Vb.r(arguments[0],
arguments[1],arguments[2],arguments[3]);case 5:return Vb.P(arguments[0],arguments[1],arguments[2],arguments[3],arguments[4]);default:throw Error([w("Invalid arity: "),w(arguments.length)].join(""));}};Vb.d=function(a,b){if(a?a.kc:a)return a.kc(a,b);var c;c=Vb[q(null==a?null:a)];if(!c&&(c=Vb._,!c))throw v("ISwap.-swap!",a);return c.call(null,a,b)};Vb.h=function(a,b,c){if(a?a.lc:a)return a.lc(a,b,c);var d;d=Vb[q(null==a?null:a)];if(!d&&(d=Vb._,!d))throw v("ISwap.-swap!",a);return d.call(null,a,b,c)};
Vb.r=function(a,b,c,d){if(a?a.mc:a)return a.mc(a,b,c,d);var e;e=Vb[q(null==a?null:a)];if(!e&&(e=Vb._,!e))throw v("ISwap.-swap!",a);return e.call(null,a,b,c,d)};Vb.P=function(a,b,c,d,e){if(a?a.nc:a)return a.nc(a,b,c,d,e);var f;f=Vb[q(null==a?null:a)];if(!f&&(f=Vb._,!f))throw v("ISwap.-swap!",a);return f.call(null,a,b,c,d,e)};Vb.G=5;var Wb=function Wb(b){if(b?b.Ya:b)return b.Ya(b);var c;c=Wb[q(null==b?null:b)];if(!c&&(c=Wb._,!c))throw v("IIterable.-iterator",b);return c.call(null,b)};
function Xb(a){this.ad=a;this.o=0;this.j=1073741824}Xb.prototype.Db=function(a,b){return this.ad.append(b)};function Yb(a){var b=new ka;a.I(null,new Xb(b),qa());return""+w(b)}var Zb="undefined"!==typeof Math.imul&&0!==(Math.imul.d?Math.imul.d(4294967295,5):Math.imul.call(null,4294967295,5))?function(a,b){return Math.imul.d?Math.imul.d(a,b):Math.imul.call(null,a,b)}:function(a,b){var c=a&65535,d=b&65535;return c*d+((a>>>16&65535)*d+c*(b>>>16&65535)<<16>>>0)|0};
function $b(a){a=Zb(a|0,-862048943);return Zb(a<<15|a>>>-15,461845907)}function ac(a,b){var c=(a|0)^(b|0);return Zb(c<<13|c>>>-13,5)+-430675100|0}function bc(a,b){var c=(a|0)^b,c=Zb(c^c>>>16,-2048144789),c=Zb(c^c>>>13,-1028477387);return c^c>>>16}function cc(a){var b;a:{b=1;for(var c=0;;)if(b<a.length){var d=b+2,c=ac(c,$b(a.charCodeAt(b-1)|a.charCodeAt(b)<<16));b=d}else{b=c;break a}}b=1===(a.length&1)?b^$b(a.charCodeAt(a.length-1)):b;return bc(b,Zb(2,a.length))}var dc={},ec=0;
function fc(a){255<ec&&(dc={},ec=0);var b=dc[a];if("number"!==typeof b){a:if(null!=a)if(b=a.length,0<b)for(var c=0,d=0;;)if(c<b)var e=c+1,d=Zb(31,d)+a.charCodeAt(c),c=e;else{b=d;break a}else b=0;else b=0;dc[a]=b;ec+=1}return a=b}
function gc(a){a&&(a.j&4194304||a.kd)?a=a.K(null):"number"===typeof a?a=(Math.floor.c?Math.floor.c(a):Math.floor.call(null,a))%2147483647:!0===a?a=1:!1===a?a=0:"string"===typeof a?(a=fc(a),0!==a&&(a=$b(a),a=ac(0,a),a=bc(a,4))):a=a instanceof Date?a.valueOf():null==a?0:Bb(a);return a}function hc(a,b){return a^b+2654435769+(a<<6)+(a>>2)}function D(a,b,c,d,e){this.eb=a;this.name=b;this.Ha=c;this.Na=d;this.Y=e;this.j=2154168321;this.o=4096}g=D.prototype;g.I=function(a,b){return C(b,this.Ha)};
g.K=function(){var a=this.Na;return null!=a?a:this.Na=a=hc(cc(this.name),fc(this.eb))};g.F=function(a,b){return new D(this.eb,this.name,this.Ha,this.Na,b)};g.C=function(){return this.Y};g.call=function(){var a=null,a=function(a,c,d){switch(arguments.length){case 2:return z.h(c,this,null);case 3:return z.h(c,this,d)}throw Error("Invalid arity: "+arguments.length);};a.d=function(a,c){return z.h(c,this,null)};a.h=function(a,c,d){return z.h(c,this,d)};return a}();
g.apply=function(a,b){return this.call.apply(this,[this].concat(Fa(b)))};g.c=function(a){return z.h(a,this,null)};g.d=function(a,b){return z.h(a,this,b)};g.n=function(a,b){return b instanceof D?this.Ha===b.Ha:!1};g.toString=function(){return this.Ha};g.equiv=function(a){return this.n(null,a)};function ic(){var a=[w("G__"),w(E.d(jc,kc))].join("");return a instanceof D?a:new D(null,a,a,null,null)}
function J(a){if(null==a)return null;if(a&&(a.j&8388608||a.ld))return a.M(null);if(za(a)||"string"===typeof a)return 0===a.length?null:new K(a,0);if(t(Cb,a))return Db(a);throw Error([w(a),w(" is not ISeqable")].join(""));}function L(a){if(null==a)return null;if(a&&(a.j&64||a.ib))return a.U(null);a=J(a);return null==a?null:ab(a)}function lc(a){return null!=a?a&&(a.j&64||a.ib)?a.aa(null):(a=J(a))?bb(a):nc:nc}function M(a){return null==a?null:a&&(a.j&128||a.hb)?a.Z(null):J(lc(a))}
var oc=function oc(){switch(arguments.length){case 1:return oc.c(arguments[0]);case 2:return oc.d(arguments[0],arguments[1]);default:return oc.m(arguments[0],arguments[1],new K(Array.prototype.slice.call(arguments,2),0))}};oc.c=function(){return!0};oc.d=function(a,b){return null==a?null==b:a===b||Ab(a,b)};oc.m=function(a,b,c){for(;;)if(oc.d(a,b))if(M(c))a=b,b=L(c),c=M(c);else return oc.d(b,L(c));else return!1};oc.J=function(a){var b=L(a),c=M(a);a=L(c);c=M(c);return oc.m(b,a,c)};oc.G=2;
function pc(a){this.s=a}pc.prototype.next=function(){if(null!=this.s){var a=L(this.s);this.s=M(this.s);return{done:!1,value:a}}return{done:!0,value:null}};function qc(a){return new pc(J(a))}function rc(a,b){var c=$b(a),c=ac(0,c);return bc(c,b)}function sc(a){var b=0,c=1;for(a=J(a);;)if(null!=a)b+=1,c=Zb(31,c)+gc(L(a))|0,a=M(a);else return rc(c,b)}var tc=rc(1,0);function uc(a){var b=0,c=0;for(a=J(a);;)if(null!=a)b+=1,c=c+gc(L(a))|0,a=M(a);else return rc(c,b)}var vc=rc(0,0);Sa["null"]=!0;
Ua["null"]=function(){return 0};Date.prototype.bc=!0;Date.prototype.n=function(a,b){return b instanceof Date&&this.valueOf()===b.valueOf()};Ab.number=function(a,b){return a===b};tb["function"]=!0;ub["function"]=function(){return null};Ma["function"]=!0;Bb._=function(a){return a[ba]||(a[ba]=++ca)};function kc(a){return a+1}function O(a){return sb(a)}
function wc(a,b){var c=Ua(a);if(0===c)return b.B?b.B():b.call(null);for(var d=y.d(a,0),e=1;;)if(e<c)var f=y.d(a,e),d=b.d?b.d(d,f):b.call(null,d,f),e=e+1;else return d}function xc(a,b,c){var d=Ua(a),e=c;for(c=0;;)if(c<d){var f=y.d(a,c),e=b.d?b.d(e,f):b.call(null,e,f);c+=1}else return e}function zc(a,b){var c=a.length;if(0===a.length)return b.B?b.B():b.call(null);for(var d=a[0],e=1;;)if(e<c)var f=a[e],d=b.d?b.d(d,f):b.call(null,d,f),e=e+1;else return d}
function Ac(a,b,c){var d=a.length,e=c;for(c=0;;)if(c<d){var f=a[c],e=b.d?b.d(e,f):b.call(null,e,f);c+=1}else return e}function Bc(a,b,c,d){for(var e=a.length;;)if(d<e){var f=a[d];c=b.d?b.d(c,f):b.call(null,c,f);d+=1}else return c}function Cc(a){return a?a.j&2||a.Zb?!0:a.j?!1:t(Sa,a):t(Sa,a)}function Dc(a){return a?a.j&16||a.dc?!0:a.j?!1:t(Za,a):t(Za,a)}function Ec(a,b){this.e=a;this.i=b}Ec.prototype.jb=function(){return this.i<this.e.length};
Ec.prototype.next=function(){var a=this.e[this.i];this.i+=1;return a};function K(a,b){this.e=a;this.i=b;this.j=166199550;this.o=8192}g=K.prototype;g.toString=function(){return Yb(this)};g.equiv=function(a){return this.n(null,a)};g.w=function(a,b){var c=b+this.i;return c<this.e.length?this.e[c]:null};g.$=function(a,b,c){a=b+this.i;return a<this.e.length?this.e[a]:c};g.Ya=function(){return new Ec(this.e,this.i)};g.ba=function(){return new K(this.e,this.i)};
g.Z=function(){return this.i+1<this.e.length?new K(this.e,this.i+1):null};g.N=function(){return this.e.length-this.i};g.K=function(){return sc(this)};g.n=function(a,b){return Gc.d?Gc.d(this,b):Gc.call(null,this,b)};g.O=function(){return nc};g.S=function(a,b){return Bc(this.e,b,this.e[this.i],this.i+1)};g.T=function(a,b,c){return Bc(this.e,b,c,this.i)};g.U=function(){return this.e[this.i]};g.aa=function(){return this.i+1<this.e.length?new K(this.e,this.i+1):nc};g.M=function(){return this};
g.L=function(a,b){return P.d?P.d(b,this):P.call(null,b,this)};K.prototype[Da]=function(){return qc(this)};function Hc(a,b){return b<a.length?new K(a,b):null}function Q(){switch(arguments.length){case 1:return Hc(arguments[0],0);case 2:return Hc(arguments[0],arguments[1]);default:throw Error([w("Invalid arity: "),w(arguments.length)].join(""));}}Ab._=function(a,b){return a===b};
var Ic=function Ic(){switch(arguments.length){case 0:return Ic.B();case 1:return Ic.c(arguments[0]);case 2:return Ic.d(arguments[0],arguments[1]);default:return Ic.m(arguments[0],arguments[1],new K(Array.prototype.slice.call(arguments,2),0))}};Ic.B=function(){return Jc};Ic.c=function(a){return a};Ic.d=function(a,b){return null!=a?Ya(a,b):Ya(nc,b)};Ic.m=function(a,b,c){for(;;)if(r(c))a=Ic.d(a,b),b=L(c),c=M(c);else return Ic.d(a,b)};Ic.J=function(a){var b=L(a),c=M(a);a=L(c);c=M(c);return Ic.m(b,a,c)};
Ic.G=2;function Kc(a){return null==a?null:Va(a)}function R(a){if(null!=a)if(a&&(a.j&2||a.Zb))a=a.N(null);else if(za(a))a=a.length;else if("string"===typeof a)a=a.length;else if(t(Sa,a))a=Ua(a);else a:{a=J(a);for(var b=0;;){if(Cc(a)){a=b+Ua(a);break a}a=M(a);b+=1}}else a=0;return a}function Lc(a,b){for(var c=null;;){if(null==a)return c;if(0===b)return J(a)?L(a):c;if(Dc(a))return y.h(a,b,c);if(J(a)){var d=M(a),e=b-1;a=d;b=e}else return c}}
function S(a,b){if("number"!==typeof b)throw Error("index argument to nth must be a number.");if(null==a)return null;if(a&&(a.j&16||a.dc))return a.$(null,b,null);if(za(a)||"string"===typeof a)return b<a.length?a[b]:null;if(t(Za,a))return y.d(a,b);if(a?a.j&64||a.ib||(a.j?0:t($a,a)):t($a,a))return Lc(a,b);throw Error([w("nth not supported on this type "),w(Ca(null==a?null:a.constructor))].join(""));}
function T(a,b){return null==a?null:a&&(a.j&256||a.xb)?a.v(null,b):za(a)?b<a.length?a[b]:null:"string"===typeof a?b<a.length?a[b]:null:t(db,a)?z.d(a,b):null}function Mc(a,b,c){return null!=a?a&&(a.j&256||a.xb)?a.t(null,b,c):za(a)?b<a.length?a[b]:c:"string"===typeof a?b<a.length?a[b]:c:t(db,a)?z.h(a,b,c):c:c}
var U=function U(){switch(arguments.length){case 3:return U.h(arguments[0],arguments[1],arguments[2]);default:return U.m(arguments[0],arguments[1],arguments[2],new K(Array.prototype.slice.call(arguments,3),0))}};U.h=function(a,b,c){return null!=a?fb(a,b,c):Nc([b],[c])};U.m=function(a,b,c,d){for(;;)if(a=U.h(a,b,c),r(d))b=L(d),c=L(M(d)),d=M(M(d));else return a};U.J=function(a){var b=L(a),c=M(a);a=L(c);var d=M(c),c=L(d),d=M(d);return U.m(b,a,c,d)};U.G=3;
var Oc=function Oc(){switch(arguments.length){case 1:return Oc.c(arguments[0]);case 2:return Oc.d(arguments[0],arguments[1]);default:return Oc.m(arguments[0],arguments[1],new K(Array.prototype.slice.call(arguments,2),0))}};Oc.c=function(a){return a};Oc.d=function(a,b){return null==a?null:kb(a,b)};Oc.m=function(a,b,c){for(;;){if(null==a)return null;a=Oc.d(a,b);if(r(c))b=L(c),c=M(c);else return a}};Oc.J=function(a){var b=L(a),c=M(a);a=L(c);c=M(c);return Oc.m(b,a,c)};Oc.G=2;
function Pc(a){var b="function"==q(a);return r(b)?b:a?r(r(null)?null:a.Xb)?!0:a.D?!1:t(Ma,a):t(Ma,a)}function Qc(a,b){this.f=a;this.meta=b;this.o=0;this.j=393217}g=Qc.prototype;
g.call=function(){function a(a,b,c,d,e,f,h,k,l,m,n,p,u,x,A,B,I,F,V,G,H,Aa){a=this.f;return Rc.fb?Rc.fb(a,b,c,d,e,f,h,k,l,m,n,p,u,x,A,B,I,F,V,G,H,Aa):Rc.call(null,a,b,c,d,e,f,h,k,l,m,n,p,u,x,A,B,I,F,V,G,H,Aa)}function b(a,b,c,d,e,f,h,k,l,m,n,p,u,x,A,B,I,F,V,G,H){a=this;return a.f.wa?a.f.wa(b,c,d,e,f,h,k,l,m,n,p,u,x,A,B,I,F,V,G,H):a.f.call(null,b,c,d,e,f,h,k,l,m,n,p,u,x,A,B,I,F,V,G,H)}function c(a,b,c,d,e,f,h,k,l,m,n,p,u,x,A,B,I,F,V,G){a=this;return a.f.va?a.f.va(b,c,d,e,f,h,k,l,m,n,p,u,x,A,B,I,F,V,
G):a.f.call(null,b,c,d,e,f,h,k,l,m,n,p,u,x,A,B,I,F,V,G)}function d(a,b,c,d,e,f,h,k,l,m,n,p,u,x,A,B,I,F,V){a=this;return a.f.ua?a.f.ua(b,c,d,e,f,h,k,l,m,n,p,u,x,A,B,I,F,V):a.f.call(null,b,c,d,e,f,h,k,l,m,n,p,u,x,A,B,I,F,V)}function e(a,b,c,d,e,f,h,k,l,m,n,p,u,x,A,B,I,F){a=this;return a.f.ta?a.f.ta(b,c,d,e,f,h,k,l,m,n,p,u,x,A,B,I,F):a.f.call(null,b,c,d,e,f,h,k,l,m,n,p,u,x,A,B,I,F)}function f(a,b,c,d,e,f,h,k,l,m,n,p,u,x,A,B,I){a=this;return a.f.sa?a.f.sa(b,c,d,e,f,h,k,l,m,n,p,u,x,A,B,I):a.f.call(null,
b,c,d,e,f,h,k,l,m,n,p,u,x,A,B,I)}function h(a,b,c,d,e,f,h,k,l,m,n,p,u,x,A,B){a=this;return a.f.ra?a.f.ra(b,c,d,e,f,h,k,l,m,n,p,u,x,A,B):a.f.call(null,b,c,d,e,f,h,k,l,m,n,p,u,x,A,B)}function k(a,b,c,d,e,f,h,k,l,m,n,p,u,x,A){a=this;return a.f.qa?a.f.qa(b,c,d,e,f,h,k,l,m,n,p,u,x,A):a.f.call(null,b,c,d,e,f,h,k,l,m,n,p,u,x,A)}function l(a,b,c,d,e,f,h,k,l,m,n,p,u,x){a=this;return a.f.pa?a.f.pa(b,c,d,e,f,h,k,l,m,n,p,u,x):a.f.call(null,b,c,d,e,f,h,k,l,m,n,p,u,x)}function m(a,b,c,d,e,f,h,k,l,m,n,p,u){a=this;
return a.f.oa?a.f.oa(b,c,d,e,f,h,k,l,m,n,p,u):a.f.call(null,b,c,d,e,f,h,k,l,m,n,p,u)}function n(a,b,c,d,e,f,h,k,l,m,n,p){a=this;return a.f.na?a.f.na(b,c,d,e,f,h,k,l,m,n,p):a.f.call(null,b,c,d,e,f,h,k,l,m,n,p)}function p(a,b,c,d,e,f,h,k,l,m,n){a=this;return a.f.ma?a.f.ma(b,c,d,e,f,h,k,l,m,n):a.f.call(null,b,c,d,e,f,h,k,l,m,n)}function u(a,b,c,d,e,f,h,k,l,m){a=this;return a.f.za?a.f.za(b,c,d,e,f,h,k,l,m):a.f.call(null,b,c,d,e,f,h,k,l,m)}function x(a,b,c,d,e,f,h,k,l){a=this;return a.f.ya?a.f.ya(b,c,
d,e,f,h,k,l):a.f.call(null,b,c,d,e,f,h,k,l)}function B(a,b,c,d,e,f,h,k){a=this;return a.f.xa?a.f.xa(b,c,d,e,f,h,k):a.f.call(null,b,c,d,e,f,h,k)}function A(a,b,c,d,e,f,h){a=this;return a.f.ea?a.f.ea(b,c,d,e,f,h):a.f.call(null,b,c,d,e,f,h)}function F(a,b,c,d,e,f){a=this;return a.f.P?a.f.P(b,c,d,e,f):a.f.call(null,b,c,d,e,f)}function I(a,b,c,d,e){a=this;return a.f.r?a.f.r(b,c,d,e):a.f.call(null,b,c,d,e)}function H(a,b,c,d){a=this;return a.f.h?a.f.h(b,c,d):a.f.call(null,b,c,d)}function V(a,b,c){a=this;
return a.f.d?a.f.d(b,c):a.f.call(null,b,c)}function Aa(a,b){a=this;return a.f.c?a.f.c(b):a.f.call(null,b)}function ib(a){a=this;return a.f.B?a.f.B():a.f.call(null)}var G=null,G=function(G,na,N,ga,da,Ea,Ja,Na,ta,Ta,Xa,Qa,gb,hb,vb,mc,Fc,md,ke,zf,Ug,Fi){switch(arguments.length){case 1:return ib.call(this,G);case 2:return Aa.call(this,G,na);case 3:return V.call(this,G,na,N);case 4:return H.call(this,G,na,N,ga);case 5:return I.call(this,G,na,N,ga,da);case 6:return F.call(this,G,na,N,ga,da,Ea);case 7:return A.call(this,
G,na,N,ga,da,Ea,Ja);case 8:return B.call(this,G,na,N,ga,da,Ea,Ja,Na);case 9:return x.call(this,G,na,N,ga,da,Ea,Ja,Na,ta);case 10:return u.call(this,G,na,N,ga,da,Ea,Ja,Na,ta,Ta);case 11:return p.call(this,G,na,N,ga,da,Ea,Ja,Na,ta,Ta,Xa);case 12:return n.call(this,G,na,N,ga,da,Ea,Ja,Na,ta,Ta,Xa,Qa);case 13:return m.call(this,G,na,N,ga,da,Ea,Ja,Na,ta,Ta,Xa,Qa,gb);case 14:return l.call(this,G,na,N,ga,da,Ea,Ja,Na,ta,Ta,Xa,Qa,gb,hb);case 15:return k.call(this,G,na,N,ga,da,Ea,Ja,Na,ta,Ta,Xa,Qa,gb,hb,vb);
case 16:return h.call(this,G,na,N,ga,da,Ea,Ja,Na,ta,Ta,Xa,Qa,gb,hb,vb,mc);case 17:return f.call(this,G,na,N,ga,da,Ea,Ja,Na,ta,Ta,Xa,Qa,gb,hb,vb,mc,Fc);case 18:return e.call(this,G,na,N,ga,da,Ea,Ja,Na,ta,Ta,Xa,Qa,gb,hb,vb,mc,Fc,md);case 19:return d.call(this,G,na,N,ga,da,Ea,Ja,Na,ta,Ta,Xa,Qa,gb,hb,vb,mc,Fc,md,ke);case 20:return c.call(this,G,na,N,ga,da,Ea,Ja,Na,ta,Ta,Xa,Qa,gb,hb,vb,mc,Fc,md,ke,zf);case 21:return b.call(this,G,na,N,ga,da,Ea,Ja,Na,ta,Ta,Xa,Qa,gb,hb,vb,mc,Fc,md,ke,zf,Ug);case 22:return a.call(this,
G,na,N,ga,da,Ea,Ja,Na,ta,Ta,Xa,Qa,gb,hb,vb,mc,Fc,md,ke,zf,Ug,Fi)}throw Error("Invalid arity: "+arguments.length);};G.c=ib;G.d=Aa;G.h=V;G.r=H;G.P=I;G.ea=F;G.xa=A;G.ya=B;G.za=x;G.ma=u;G.na=p;G.oa=n;G.pa=m;G.qa=l;G.ra=k;G.sa=h;G.ta=f;G.ua=e;G.va=d;G.wa=c;G.cc=b;G.fb=a;return G}();g.apply=function(a,b){return this.call.apply(this,[this].concat(Fa(b)))};g.B=function(){return this.f.B?this.f.B():this.f.call(null)};g.c=function(a){return this.f.c?this.f.c(a):this.f.call(null,a)};
g.d=function(a,b){return this.f.d?this.f.d(a,b):this.f.call(null,a,b)};g.h=function(a,b,c){return this.f.h?this.f.h(a,b,c):this.f.call(null,a,b,c)};g.r=function(a,b,c,d){return this.f.r?this.f.r(a,b,c,d):this.f.call(null,a,b,c,d)};g.P=function(a,b,c,d,e){return this.f.P?this.f.P(a,b,c,d,e):this.f.call(null,a,b,c,d,e)};g.ea=function(a,b,c,d,e,f){return this.f.ea?this.f.ea(a,b,c,d,e,f):this.f.call(null,a,b,c,d,e,f)};
g.xa=function(a,b,c,d,e,f,h){return this.f.xa?this.f.xa(a,b,c,d,e,f,h):this.f.call(null,a,b,c,d,e,f,h)};g.ya=function(a,b,c,d,e,f,h,k){return this.f.ya?this.f.ya(a,b,c,d,e,f,h,k):this.f.call(null,a,b,c,d,e,f,h,k)};g.za=function(a,b,c,d,e,f,h,k,l){return this.f.za?this.f.za(a,b,c,d,e,f,h,k,l):this.f.call(null,a,b,c,d,e,f,h,k,l)};g.ma=function(a,b,c,d,e,f,h,k,l,m){return this.f.ma?this.f.ma(a,b,c,d,e,f,h,k,l,m):this.f.call(null,a,b,c,d,e,f,h,k,l,m)};
g.na=function(a,b,c,d,e,f,h,k,l,m,n){return this.f.na?this.f.na(a,b,c,d,e,f,h,k,l,m,n):this.f.call(null,a,b,c,d,e,f,h,k,l,m,n)};g.oa=function(a,b,c,d,e,f,h,k,l,m,n,p){return this.f.oa?this.f.oa(a,b,c,d,e,f,h,k,l,m,n,p):this.f.call(null,a,b,c,d,e,f,h,k,l,m,n,p)};g.pa=function(a,b,c,d,e,f,h,k,l,m,n,p,u){return this.f.pa?this.f.pa(a,b,c,d,e,f,h,k,l,m,n,p,u):this.f.call(null,a,b,c,d,e,f,h,k,l,m,n,p,u)};
g.qa=function(a,b,c,d,e,f,h,k,l,m,n,p,u,x){return this.f.qa?this.f.qa(a,b,c,d,e,f,h,k,l,m,n,p,u,x):this.f.call(null,a,b,c,d,e,f,h,k,l,m,n,p,u,x)};g.ra=function(a,b,c,d,e,f,h,k,l,m,n,p,u,x,B){return this.f.ra?this.f.ra(a,b,c,d,e,f,h,k,l,m,n,p,u,x,B):this.f.call(null,a,b,c,d,e,f,h,k,l,m,n,p,u,x,B)};g.sa=function(a,b,c,d,e,f,h,k,l,m,n,p,u,x,B,A){return this.f.sa?this.f.sa(a,b,c,d,e,f,h,k,l,m,n,p,u,x,B,A):this.f.call(null,a,b,c,d,e,f,h,k,l,m,n,p,u,x,B,A)};
g.ta=function(a,b,c,d,e,f,h,k,l,m,n,p,u,x,B,A,F){return this.f.ta?this.f.ta(a,b,c,d,e,f,h,k,l,m,n,p,u,x,B,A,F):this.f.call(null,a,b,c,d,e,f,h,k,l,m,n,p,u,x,B,A,F)};g.ua=function(a,b,c,d,e,f,h,k,l,m,n,p,u,x,B,A,F,I){return this.f.ua?this.f.ua(a,b,c,d,e,f,h,k,l,m,n,p,u,x,B,A,F,I):this.f.call(null,a,b,c,d,e,f,h,k,l,m,n,p,u,x,B,A,F,I)};
g.va=function(a,b,c,d,e,f,h,k,l,m,n,p,u,x,B,A,F,I,H){return this.f.va?this.f.va(a,b,c,d,e,f,h,k,l,m,n,p,u,x,B,A,F,I,H):this.f.call(null,a,b,c,d,e,f,h,k,l,m,n,p,u,x,B,A,F,I,H)};g.wa=function(a,b,c,d,e,f,h,k,l,m,n,p,u,x,B,A,F,I,H,V){return this.f.wa?this.f.wa(a,b,c,d,e,f,h,k,l,m,n,p,u,x,B,A,F,I,H,V):this.f.call(null,a,b,c,d,e,f,h,k,l,m,n,p,u,x,B,A,F,I,H,V)};
g.cc=function(a,b,c,d,e,f,h,k,l,m,n,p,u,x,B,A,F,I,H,V,Aa){var ib=this.f;return Rc.fb?Rc.fb(ib,a,b,c,d,e,f,h,k,l,m,n,p,u,x,B,A,F,I,H,V,Aa):Rc.call(null,ib,a,b,c,d,e,f,h,k,l,m,n,p,u,x,B,A,F,I,H,V,Aa)};g.Xb=!0;g.F=function(a,b){return new Qc(this.f,b)};g.C=function(){return this.meta};function Sc(a,b){return Pc(a)&&!(a?a.j&262144||a.pd||(a.j?0:t(wb,a)):t(wb,a))?new Qc(a,b):null==a?null:xb(a,b)}function Tc(a){var b=null!=a;return(b?a?a.j&131072||a.gc||(a.j?0:t(tb,a)):t(tb,a):b)?ub(a):null}
var Uc=function Uc(){switch(arguments.length){case 1:return Uc.c(arguments[0]);case 2:return Uc.d(arguments[0],arguments[1]);default:return Uc.m(arguments[0],arguments[1],new K(Array.prototype.slice.call(arguments,2),0))}};Uc.c=function(a){return a};Uc.d=function(a,b){return null==a?null:pb(a,b)};Uc.m=function(a,b,c){for(;;){if(null==a)return null;a=Uc.d(a,b);if(r(c))b=L(c),c=M(c);else return a}};Uc.J=function(a){var b=L(a),c=M(a);a=L(c);c=M(c);return Uc.m(b,a,c)};Uc.G=2;
function Vc(a){return null==a||Ba(J(a))}function Wc(a){return null==a?!1:a?a.j&4096||a.nd?!0:a.j?!1:t(ob,a):t(ob,a)}function Xc(a){return a?a.j&16777216||a.md?!0:a.j?!1:t(Eb,a):t(Eb,a)}function Yc(a){return null==a?!1:a?a.j&1024||a.ec?!0:a.j?!1:t(jb,a):t(jb,a)}function Zc(a){return a?a.j&16384||a.od?!0:a.j?!1:t(qb,a):t(qb,a)}function $c(a){return a?a.o&512||a.ed?!0:!1:!1}function ad(a){var b=[];ha(a,function(a,b){return function(a,c){return b.push(c)}}(a,b));return b}
function bd(a,b,c,d,e){for(;0!==e;)c[d]=a[b],d+=1,--e,b+=1}var cd={};function dd(a){return null==a?!1:a?a.j&64||a.ib?!0:a.j?!1:t($a,a):t($a,a)}function ed(a){return r(a)?!0:!1}function fd(a){var b=Pc(a);return b?b:a?a.j&1||a.jd?!0:a.j?!1:t(Oa,a):t(Oa,a)}function gd(a,b){return Mc(a,b,cd)===cd?!1:!0}function hd(a,b){var c=J(b);if(c){var d=L(c),c=M(c);return Ka?Ka(a,d,c):La.call(null,a,d,c)}return a.B?a.B():a.call(null)}
function id(a,b,c){for(c=J(c);;)if(c){var d=L(c);b=a.d?a.d(b,d):a.call(null,b,d);c=M(c)}else return b}function La(){switch(arguments.length){case 2:return jd(arguments[0],arguments[1]);case 3:return Ka(arguments[0],arguments[1],arguments[2]);default:throw Error([w("Invalid arity: "),w(arguments.length)].join(""));}}function jd(a,b){return b&&(b.j&524288||b.ic)?b.S(null,a):za(b)?zc(b,a):"string"===typeof b?zc(b,a):t(yb,b)?zb.d(b,a):hd(a,b)}
function Ka(a,b,c){return c&&(c.j&524288||c.ic)?c.T(null,a,b):za(c)?Ac(c,a,b):"string"===typeof c?Ac(c,a,b):t(yb,c)?zb.h(c,a,b):id(a,b,c)}function kd(a){return a}function ld(a){return a-1}function nd(a){a=(a-a%2)/2;return 0<=a?Math.floor.c?Math.floor.c(a):Math.floor.call(null,a):Math.ceil.c?Math.ceil.c(a):Math.ceil.call(null,a)}function od(a){a-=a>>1&1431655765;a=(a&858993459)+(a>>2&858993459);return 16843009*(a+(a>>4)&252645135)>>24}
function pd(a){var b=1;for(a=J(a);;)if(a&&0<b)--b,a=M(a);else return a}var w=function w(){switch(arguments.length){case 0:return w.B();case 1:return w.c(arguments[0]);default:return w.m(arguments[0],new K(Array.prototype.slice.call(arguments,1),0))}};w.B=function(){return""};w.c=function(a){return null==a?"":ea(a)};w.m=function(a,b){for(var c=new ka(""+w(a)),d=b;;)if(r(d))c=c.append(""+w(L(d))),d=M(d);else return c.toString()};w.J=function(a){var b=L(a);a=M(a);return w.m(b,a)};w.G=1;
function Gc(a,b){var c;if(Xc(b))if(Cc(a)&&Cc(b)&&R(a)!==R(b))c=!1;else a:{c=J(a);for(var d=J(b);;){if(null==c){c=null==d;break a}if(null!=d&&oc.d(L(c),L(d)))c=M(c),d=M(d);else{c=!1;break a}}}else c=null;return ed(c)}function qd(a,b,c,d,e){this.meta=a;this.first=b;this.ha=c;this.count=d;this.l=e;this.j=65937646;this.o=8192}g=qd.prototype;g.toString=function(){return Yb(this)};g.equiv=function(a){return this.n(null,a)};g.C=function(){return this.meta};
g.ba=function(){return new qd(this.meta,this.first,this.ha,this.count,this.l)};g.Z=function(){return 1===this.count?null:this.ha};g.N=function(){return this.count};g.K=function(){var a=this.l;return null!=a?a:this.l=a=sc(this)};g.n=function(a,b){return Gc(this,b)};g.O=function(){return xb(nc,this.meta)};g.S=function(a,b){return hd(b,this)};g.T=function(a,b,c){return id(b,c,this)};g.U=function(){return this.first};g.aa=function(){return 1===this.count?nc:this.ha};g.M=function(){return this};
g.F=function(a,b){return new qd(b,this.first,this.ha,this.count,this.l)};g.L=function(a,b){return new qd(this.meta,b,this,this.count+1,null)};qd.prototype[Da]=function(){return qc(this)};function rd(a){this.meta=a;this.j=65937614;this.o=8192}g=rd.prototype;g.toString=function(){return Yb(this)};g.equiv=function(a){return this.n(null,a)};g.C=function(){return this.meta};g.ba=function(){return new rd(this.meta)};g.Z=function(){return null};g.N=function(){return 0};g.K=function(){return tc};
g.n=function(a,b){return Gc(this,b)};g.O=function(){return this};g.S=function(a,b){return hd(b,this)};g.T=function(a,b,c){return id(b,c,this)};g.U=function(){return null};g.aa=function(){return nc};g.M=function(){return null};g.F=function(a,b){return new rd(b)};g.L=function(a,b){return new qd(this.meta,b,null,1,null)};var nc=new rd(null);rd.prototype[Da]=function(){return qc(this)};
function sd(){a:{var a=0<arguments.length?new K(Array.prototype.slice.call(arguments,0),0):null,b;if(a instanceof K&&0===a.i)b=a.e;else b:for(b=[];;)if(null!=a)b.push(a.U(null)),a=a.Z(null);else break b;for(var a=b.length,c=nc;;)if(0<a)var d=a-1,c=c.L(null,b[a-1]),a=d;else break a}return c}function td(a,b,c,d){this.meta=a;this.first=b;this.ha=c;this.l=d;this.j=65929452;this.o=8192}g=td.prototype;g.toString=function(){return Yb(this)};g.equiv=function(a){return this.n(null,a)};g.C=function(){return this.meta};
g.ba=function(){return new td(this.meta,this.first,this.ha,this.l)};g.Z=function(){return null==this.ha?null:J(this.ha)};g.K=function(){var a=this.l;return null!=a?a:this.l=a=sc(this)};g.n=function(a,b){return Gc(this,b)};g.O=function(){return Sc(nc,this.meta)};g.S=function(a,b){return hd(b,this)};g.T=function(a,b,c){return id(b,c,this)};g.U=function(){return this.first};g.aa=function(){return null==this.ha?nc:this.ha};g.M=function(){return this};
g.F=function(a,b){return new td(b,this.first,this.ha,this.l)};g.L=function(a,b){return new td(null,b,this,this.l)};td.prototype[Da]=function(){return qc(this)};function P(a,b){var c=null==b;return(c?c:b&&(b.j&64||b.ib))?new td(null,a,b,null):new td(null,a,J(b),null)}function W(a,b,c,d){this.eb=a;this.name=b;this.Da=c;this.Na=d;this.j=2153775105;this.o=4096}g=W.prototype;g.I=function(a,b){return C(b,[w(":"),w(this.Da)].join(""))};
g.K=function(){var a=this.Na;return null!=a?a:this.Na=a=hc(cc(this.name),fc(this.eb))+2654435769|0};g.call=function(){var a=null,a=function(a,c,d){switch(arguments.length){case 2:return T(c,this);case 3:return Mc(c,this,d)}throw Error("Invalid arity: "+arguments.length);};a.d=function(a,c){return T(c,this)};a.h=function(a,c,d){return Mc(c,this,d)};return a}();g.apply=function(a,b){return this.call.apply(this,[this].concat(Fa(b)))};g.c=function(a){return T(a,this)};
g.d=function(a,b){return Mc(a,this,b)};g.n=function(a,b){return b instanceof W?this.Da===b.Da:!1};g.toString=function(){return[w(":"),w(this.Da)].join("")};g.equiv=function(a){return this.n(null,a)};var ud=function ud(){switch(arguments.length){case 1:return ud.c(arguments[0]);case 2:return ud.d(arguments[0],arguments[1]);default:throw Error([w("Invalid arity: "),w(arguments.length)].join(""));}};
ud.c=function(a){if(a instanceof W)return a;if(a instanceof D){var b;if(a&&(a.o&4096||a.hc))b=a.eb;else throw Error([w("Doesn't support namespace: "),w(a)].join(""));return new W(b,vd.c?vd.c(a):vd.call(null,a),a.Ha,null)}return"string"===typeof a?(b=a.split("/"),2===b.length?new W(b[0],b[1],a,null):new W(null,b[0],a,null)):null};ud.d=function(a,b){return new W(a,b,[w(r(a)?[w(a),w("/")].join(""):null),w(b)].join(""),null)};ud.G=2;
function wd(a,b,c,d){this.meta=a;this.Qa=b;this.s=c;this.l=d;this.o=0;this.j=32374988}g=wd.prototype;g.toString=function(){return Yb(this)};g.equiv=function(a){return this.n(null,a)};function xd(a){null!=a.Qa&&(a.s=a.Qa.B?a.Qa.B():a.Qa.call(null),a.Qa=null);return a.s}g.C=function(){return this.meta};g.Z=function(){Db(this);return null==this.s?null:M(this.s)};g.K=function(){var a=this.l;return null!=a?a:this.l=a=sc(this)};g.n=function(a,b){return Gc(this,b)};g.O=function(){return Sc(nc,this.meta)};
g.S=function(a,b){return hd(b,this)};g.T=function(a,b,c){return id(b,c,this)};g.U=function(){Db(this);return null==this.s?null:L(this.s)};g.aa=function(){Db(this);return null!=this.s?lc(this.s):nc};g.M=function(){xd(this);if(null==this.s)return null;for(var a=this.s;;)if(a instanceof wd)a=xd(a);else return this.s=a,J(this.s)};g.F=function(a,b){return new wd(b,this.Qa,this.s,this.l)};g.L=function(a,b){return P(b,this)};wd.prototype[Da]=function(){return qc(this)};
function yd(a,b){this.nb=a;this.end=b;this.o=0;this.j=2}yd.prototype.N=function(){return this.end};yd.prototype.add=function(a){this.nb[this.end]=a;return this.end+=1};yd.prototype.ia=function(){var a=new zd(this.nb,0,this.end);this.nb=null;return a};function zd(a,b,c){this.e=a;this.R=b;this.end=c;this.o=0;this.j=524306}g=zd.prototype;g.S=function(a,b){return Bc(this.e,b,this.e[this.R],this.R+1)};g.T=function(a,b,c){return Bc(this.e,b,c,this.R)};
g.wb=function(){if(this.R===this.end)throw Error("-drop-first of empty chunk");return new zd(this.e,this.R+1,this.end)};g.w=function(a,b){return this.e[this.R+b]};g.$=function(a,b,c){return 0<=b&&b<this.end-this.R?this.e[this.R+b]:c};g.N=function(){return this.end-this.R};function Ad(a,b,c,d){this.ia=a;this.ja=b;this.meta=c;this.l=d;this.j=31850732;this.o=1536}g=Ad.prototype;g.toString=function(){return Yb(this)};g.equiv=function(a){return this.n(null,a)};g.C=function(){return this.meta};
g.Z=function(){if(1<Ua(this.ia))return new Ad(Pb(this.ia),this.ja,this.meta,null);var a=Db(this.ja);return null==a?null:a};g.K=function(){var a=this.l;return null!=a?a:this.l=a=sc(this)};g.n=function(a,b){return Gc(this,b)};g.O=function(){return Sc(nc,this.meta)};g.U=function(){return y.d(this.ia,0)};g.aa=function(){return 1<Ua(this.ia)?new Ad(Pb(this.ia),this.ja,this.meta,null):null==this.ja?nc:this.ja};g.M=function(){return this};g.pb=function(){return this.ia};
g.qb=function(){return null==this.ja?nc:this.ja};g.F=function(a,b){return new Ad(this.ia,this.ja,b,this.l)};g.L=function(a,b){return P(b,this)};g.ob=function(){return null==this.ja?null:this.ja};Ad.prototype[Da]=function(){return qc(this)};function Bd(a,b){return 0===Ua(a)?b:new Ad(a,b,null,null)}function Cd(a,b){a.add(b)}function Dd(a){for(var b=[];;)if(J(a))b.push(L(a)),a=M(a);else return b}function Ed(a,b){if(Cc(a))return R(a);for(var c=a,d=b,e=0;;)if(0<d&&J(c))c=M(c),--d,e+=1;else return e}
var Fd=function Fd(b){return null==b?null:null==M(b)?J(L(b)):P(L(b),Fd(M(b)))},Gd=function Gd(){switch(arguments.length){case 0:return Gd.B();case 1:return Gd.c(arguments[0]);case 2:return Gd.d(arguments[0],arguments[1]);default:return Gd.m(arguments[0],arguments[1],new K(Array.prototype.slice.call(arguments,2),0))}};Gd.B=function(){return new wd(null,function(){return null},null,null)};Gd.c=function(a){return new wd(null,function(){return a},null,null)};
Gd.d=function(a,b){return new wd(null,function(){var c=J(a);return c?$c(c)?Bd(Qb(c),Gd.d(Rb(c),b)):P(L(c),Gd.d(lc(c),b)):b},null,null)};Gd.m=function(a,b,c){return function e(a,b){return new wd(null,function(){var c=J(a);return c?$c(c)?Bd(Qb(c),e(Rb(c),b)):P(L(c),e(lc(c),b)):r(b)?e(L(b),M(b)):null},null,null)}(Gd.d(a,b),c)};Gd.J=function(a){var b=L(a),c=M(a);a=L(c);c=M(c);return Gd.m(b,a,c)};Gd.G=2;
function Hd(a,b,c){var d=J(c);if(0===b)return a.B?a.B():a.call(null);c=ab(d);var e=bb(d);if(1===b)return a.c?a.c(c):a.c?a.c(c):a.call(null,c);var d=ab(e),f=bb(e);if(2===b)return a.d?a.d(c,d):a.d?a.d(c,d):a.call(null,c,d);var e=ab(f),h=bb(f);if(3===b)return a.h?a.h(c,d,e):a.h?a.h(c,d,e):a.call(null,c,d,e);var f=ab(h),k=bb(h);if(4===b)return a.r?a.r(c,d,e,f):a.r?a.r(c,d,e,f):a.call(null,c,d,e,f);var h=ab(k),l=bb(k);if(5===b)return a.P?a.P(c,d,e,f,h):a.P?a.P(c,d,e,f,h):a.call(null,c,d,e,f,h);var k=ab(l),
m=bb(l);if(6===b)return a.ea?a.ea(c,d,e,f,h,k):a.ea?a.ea(c,d,e,f,h,k):a.call(null,c,d,e,f,h,k);var l=ab(m),n=bb(m);if(7===b)return a.xa?a.xa(c,d,e,f,h,k,l):a.xa?a.xa(c,d,e,f,h,k,l):a.call(null,c,d,e,f,h,k,l);var m=ab(n),p=bb(n);if(8===b)return a.ya?a.ya(c,d,e,f,h,k,l,m):a.ya?a.ya(c,d,e,f,h,k,l,m):a.call(null,c,d,e,f,h,k,l,m);var n=ab(p),u=bb(p);if(9===b)return a.za?a.za(c,d,e,f,h,k,l,m,n):a.za?a.za(c,d,e,f,h,k,l,m,n):a.call(null,c,d,e,f,h,k,l,m,n);var p=ab(u),x=bb(u);if(10===b)return a.ma?a.ma(c,
d,e,f,h,k,l,m,n,p):a.ma?a.ma(c,d,e,f,h,k,l,m,n,p):a.call(null,c,d,e,f,h,k,l,m,n,p);var u=ab(x),B=bb(x);if(11===b)return a.na?a.na(c,d,e,f,h,k,l,m,n,p,u):a.na?a.na(c,d,e,f,h,k,l,m,n,p,u):a.call(null,c,d,e,f,h,k,l,m,n,p,u);var x=ab(B),A=bb(B);if(12===b)return a.oa?a.oa(c,d,e,f,h,k,l,m,n,p,u,x):a.oa?a.oa(c,d,e,f,h,k,l,m,n,p,u,x):a.call(null,c,d,e,f,h,k,l,m,n,p,u,x);var B=ab(A),F=bb(A);if(13===b)return a.pa?a.pa(c,d,e,f,h,k,l,m,n,p,u,x,B):a.pa?a.pa(c,d,e,f,h,k,l,m,n,p,u,x,B):a.call(null,c,d,e,f,h,k,l,
m,n,p,u,x,B);var A=ab(F),I=bb(F);if(14===b)return a.qa?a.qa(c,d,e,f,h,k,l,m,n,p,u,x,B,A):a.qa?a.qa(c,d,e,f,h,k,l,m,n,p,u,x,B,A):a.call(null,c,d,e,f,h,k,l,m,n,p,u,x,B,A);var F=ab(I),H=bb(I);if(15===b)return a.ra?a.ra(c,d,e,f,h,k,l,m,n,p,u,x,B,A,F):a.ra?a.ra(c,d,e,f,h,k,l,m,n,p,u,x,B,A,F):a.call(null,c,d,e,f,h,k,l,m,n,p,u,x,B,A,F);var I=ab(H),V=bb(H);if(16===b)return a.sa?a.sa(c,d,e,f,h,k,l,m,n,p,u,x,B,A,F,I):a.sa?a.sa(c,d,e,f,h,k,l,m,n,p,u,x,B,A,F,I):a.call(null,c,d,e,f,h,k,l,m,n,p,u,x,B,A,F,I);var H=
ab(V),Aa=bb(V);if(17===b)return a.ta?a.ta(c,d,e,f,h,k,l,m,n,p,u,x,B,A,F,I,H):a.ta?a.ta(c,d,e,f,h,k,l,m,n,p,u,x,B,A,F,I,H):a.call(null,c,d,e,f,h,k,l,m,n,p,u,x,B,A,F,I,H);var V=ab(Aa),ib=bb(Aa);if(18===b)return a.ua?a.ua(c,d,e,f,h,k,l,m,n,p,u,x,B,A,F,I,H,V):a.ua?a.ua(c,d,e,f,h,k,l,m,n,p,u,x,B,A,F,I,H,V):a.call(null,c,d,e,f,h,k,l,m,n,p,u,x,B,A,F,I,H,V);Aa=ab(ib);ib=bb(ib);if(19===b)return a.va?a.va(c,d,e,f,h,k,l,m,n,p,u,x,B,A,F,I,H,V,Aa):a.va?a.va(c,d,e,f,h,k,l,m,n,p,u,x,B,A,F,I,H,V,Aa):a.call(null,
c,d,e,f,h,k,l,m,n,p,u,x,B,A,F,I,H,V,Aa);var G=ab(ib);bb(ib);if(20===b)return a.wa?a.wa(c,d,e,f,h,k,l,m,n,p,u,x,B,A,F,I,H,V,Aa,G):a.wa?a.wa(c,d,e,f,h,k,l,m,n,p,u,x,B,A,F,I,H,V,Aa,G):a.call(null,c,d,e,f,h,k,l,m,n,p,u,x,B,A,F,I,H,V,Aa,G);throw Error("Only up to 20 arguments supported on functions");}
function Rc(){switch(arguments.length){case 2:return Id(arguments[0],arguments[1]);case 3:return Jd(arguments[0],arguments[1],arguments[2]);case 4:return Kd(arguments[0],arguments[1],arguments[2],arguments[3]);case 5:return Ld(arguments[0],arguments[1],arguments[2],arguments[3],arguments[4]);default:return Md(arguments[0],arguments[1],arguments[2],arguments[3],arguments[4],new K(Array.prototype.slice.call(arguments,5),0))}}
function Id(a,b){var c=a.G;if(a.J){var d=Ed(b,c+1);return d<=c?Hd(a,d,b):a.J(b)}return a.apply(a,Dd(b))}function Jd(a,b,c){b=P(b,c);c=a.G;if(a.J){var d=Ed(b,c+1);return d<=c?Hd(a,d,b):a.J(b)}return a.apply(a,Dd(b))}function Kd(a,b,c,d){b=P(b,P(c,d));c=a.G;return a.J?(d=Ed(b,c+1),d<=c?Hd(a,d,b):a.J(b)):a.apply(a,Dd(b))}function Ld(a,b,c,d,e){b=P(b,P(c,P(d,e)));c=a.G;return a.J?(d=Ed(b,c+1),d<=c?Hd(a,d,b):a.J(b)):a.apply(a,Dd(b))}
function Md(a,b,c,d,e,f){b=P(b,P(c,P(d,P(e,Fd(f)))));c=a.G;return a.J?(d=Ed(b,c+1),d<=c?Hd(a,d,b):a.J(b)):a.apply(a,Dd(b))}function Nd(a,b){return!oc.d(a,b)}function Od(a,b){for(;;){if(null==J(b))return!0;var c;c=L(b);c=a.c?a.c(c):a.call(null,c);if(r(c)){c=a;var d=M(b);a=c;b=d}else return!1}}function Pd(a,b){for(;;)if(J(b)){var c;c=L(b);c=a.c?a.c(c):a.call(null,c);if(r(c))return c;c=a;var d=M(b);a=c;b=d}else return null}
function Qd(a,b,c,d){this.state=a;this.meta=b;this.bd=c;this.Ua=d;this.j=6455296;this.o=16386}g=Qd.prototype;g.K=function(){return this[ba]||(this[ba]=++ca)};g.Bb=function(a,b,c){for(var d=J(this.Ua),e=null,f=0,h=0;;)if(h<f){a=e.w(null,h);var k=S(a,0);a=S(a,1);var l=b,m=c;a.r?a.r(k,this,l,m):a.call(null,k,this,l,m);h+=1}else if(a=J(d))d=a,$c(d)?(e=Qb(d),d=Rb(d),a=e,f=R(e),e=a):(a=L(d),k=S(a,0),a=S(a,1),e=k,f=b,h=c,a.r?a.r(e,this,f,h):a.call(null,e,this,f,h),d=M(d),e=null,f=0),h=0;else return null};
g.Ab=function(a,b,c){this.Ua=U.h(this.Ua,b,c);return this};g.Cb=function(a,b){return this.Ua=Oc.d(this.Ua,b)};g.C=function(){return this.meta};g.Wa=function(){return this.state};g.n=function(a,b){return this===b};g.equiv=function(a){return this.n(null,a)};function Rd(){switch(arguments.length){case 1:return Sd(arguments[0]);default:var a=arguments[0],b=new K(Array.prototype.slice.call(arguments,1),0),c=dd(b)?Id(Td,b):b,b=T(c,Ud),c=T(c,va);return new Qd(a,c,b,null)}}
function Sd(a){return new Qd(a,null,null,null)}function Vd(a,b){if(a instanceof Qd){var c=a.bd;if(null!=c&&!r(c.c?c.c(b):c.call(null,b)))throw Error([w("Assert failed: "),w("Validator rejected reference state"),w("\n"),w(function(){var a=sd(new D(null,"validate","validate",1439230700,null),new D(null,"new-value","new-value",-1567397401,null));return Wd.c?Wd.c(a):Wd.call(null,a)}())].join(""));c=a.state;a.state=b;null!=a.Ua&&Hb(a,c,b);return b}return Ub(a,b)}
var E=function E(){switch(arguments.length){case 2:return E.d(arguments[0],arguments[1]);case 3:return E.h(arguments[0],arguments[1],arguments[2]);case 4:return E.r(arguments[0],arguments[1],arguments[2],arguments[3]);default:return E.m(arguments[0],arguments[1],arguments[2],arguments[3],new K(Array.prototype.slice.call(arguments,4),0))}};E.d=function(a,b){var c;a instanceof Qd?(c=a.state,c=b.c?b.c(c):b.call(null,c),c=Vd(a,c)):c=Vb.d(a,b);return c};
E.h=function(a,b,c){if(a instanceof Qd){var d=a.state;b=b.d?b.d(d,c):b.call(null,d,c);a=Vd(a,b)}else a=Vb.h(a,b,c);return a};E.r=function(a,b,c,d){if(a instanceof Qd){var e=a.state;b=b.h?b.h(e,c,d):b.call(null,e,c,d);a=Vd(a,b)}else a=Vb.r(a,b,c,d);return a};E.m=function(a,b,c,d,e){return a instanceof Qd?Vd(a,Ld(b,a.state,c,d,e)):Vb.P(a,b,c,d,e)};E.J=function(a){var b=L(a),c=M(a);a=L(c);var d=M(c),c=L(d),e=M(d),d=L(e),e=M(e);return E.m(b,a,c,d,e)};E.G=4;
var X=function X(){switch(arguments.length){case 1:return X.c(arguments[0]);case 2:return X.d(arguments[0],arguments[1]);case 3:return X.h(arguments[0],arguments[1],arguments[2]);case 4:return X.r(arguments[0],arguments[1],arguments[2],arguments[3]);default:return X.m(arguments[0],arguments[1],arguments[2],arguments[3],new K(Array.prototype.slice.call(arguments,4),0))}};
X.c=function(a){return function(b){return function(){function c(c,d){var e=a.c?a.c(d):a.call(null,d);return b.d?b.d(c,e):b.call(null,c,e)}function d(a){return b.c?b.c(a):b.call(null,a)}function e(){return b.B?b.B():b.call(null)}var f=null,h=function(){function c(a,b,e){var f=null;if(2<arguments.length){for(var f=0,h=Array(arguments.length-2);f<h.length;)h[f]=arguments[f+2],++f;f=new K(h,0)}return d.call(this,a,b,f)}function d(c,e,f){e=Jd(a,e,f);return b.d?b.d(c,e):b.call(null,c,e)}c.G=2;c.J=function(a){var b=
L(a);a=M(a);var c=L(a);a=lc(a);return d(b,c,a)};c.m=d;return c}(),f=function(a,b,f){switch(arguments.length){case 0:return e.call(this);case 1:return d.call(this,a);case 2:return c.call(this,a,b);default:var n=null;if(2<arguments.length){for(var n=0,p=Array(arguments.length-2);n<p.length;)p[n]=arguments[n+2],++n;n=new K(p,0)}return h.m(a,b,n)}throw Error("Invalid arity: "+arguments.length);};f.G=2;f.J=h.J;f.B=e;f.c=d;f.d=c;f.m=h.m;return f}()}};
X.d=function(a,b){return new wd(null,function(){var c=J(b);if(c){if($c(c)){for(var d=Qb(c),e=R(d),f=new yd(Array(e),0),h=0;;)if(h<e)Cd(f,function(){var b=y.d(d,h);return a.c?a.c(b):a.call(null,b)}()),h+=1;else break;return Bd(f.ia(),X.d(a,Rb(c)))}return P(function(){var b=L(c);return a.c?a.c(b):a.call(null,b)}(),X.d(a,lc(c)))}return null},null,null)};
X.h=function(a,b,c){return new wd(null,function(){var d=J(b),e=J(c);if(d&&e){var f=P,h;h=L(d);var k=L(e);h=a.d?a.d(h,k):a.call(null,h,k);d=f(h,X.h(a,lc(d),lc(e)))}else d=null;return d},null,null)};X.r=function(a,b,c,d){return new wd(null,function(){var e=J(b),f=J(c),h=J(d);if(e&&f&&h){var k=P,l;l=L(e);var m=L(f),n=L(h);l=a.h?a.h(l,m,n):a.call(null,l,m,n);e=k(l,X.r(a,lc(e),lc(f),lc(h)))}else e=null;return e},null,null)};
X.m=function(a,b,c,d,e){var f=function k(a){return new wd(null,function(){var b=X.d(J,a);return Od(kd,b)?P(X.d(L,b),k(X.d(lc,b))):null},null,null)};return X.d(function(){return function(b){return Id(a,b)}}(f),f(Ic.m(e,d,Q([c,b],0))))};X.J=function(a){var b=L(a),c=M(a);a=L(c);var d=M(c),c=L(d),e=M(d),d=L(e),e=M(e);return X.m(b,a,c,d,e)};X.G=4;
function Xd(a){return new wd(null,function(b){return function(){return b(1,a)}}(function(a,c){for(;;){var d=J(c);if(0<a&&d){var e=a-1,d=lc(d);a=e;c=d}else return d}}),null,null)}function Yd(a){return new wd(null,function(){return P(a,Yd(a))},null,null)}var Zd=function Zd(){switch(arguments.length){case 2:return Zd.d(arguments[0],arguments[1]);default:return Zd.m(arguments[0],arguments[1],new K(Array.prototype.slice.call(arguments,2),0))}};
Zd.d=function(a,b){return new wd(null,function(){var c=J(a),d=J(b);return c&&d?P(L(c),P(L(d),Zd.d(lc(c),lc(d)))):null},null,null)};Zd.m=function(a,b,c){return new wd(null,function(){var d=X.d(J,Ic.m(c,b,Q([a],0)));return Od(kd,d)?Gd.d(X.d(L,d),Id(Zd,X.d(lc,d))):null},null,null)};Zd.J=function(a){var b=L(a),c=M(a);a=L(c);c=M(c);return Zd.m(b,a,c)};Zd.G=2;function $d(a){return Xd(Zd.d(Yd(", "),a))}
function ae(a,b){return new wd(null,function(){var c=J(b);if(c){if($c(c)){for(var d=Qb(c),e=R(d),f=new yd(Array(e),0),h=0;;)if(h<e){var k;k=y.d(d,h);k=a.c?a.c(k):a.call(null,k);r(k)&&(k=y.d(d,h),f.add(k));h+=1}else break;return Bd(f.ia(),ae(a,Rb(c)))}d=L(c);c=lc(c);return r(a.c?a.c(d):a.call(null,d))?P(d,ae(a,c)):ae(a,c)}return null},null,null)}function be(a,b){var c;null!=a?a&&(a.o&4||a.hd)?(c=Ka(Lb,Kb(a),b),c=Mb(c),c=Sc(c,Tc(a))):c=Ka(Ya,a,b):c=Ka(Ic,nc,b);return c}
function ce(a,b){return de(a,b,null)}function de(a,b,c){var d=cd;for(b=J(b);;)if(b){var e=a;if(e?e.j&256||e.xb||(e.j?0:t(db,e)):t(db,e)){a=Mc(a,L(b),d);if(d===a)return c;b=M(b)}else return c}else return a}
var ee=function ee(b,c,d){var e=S(c,0);c=pd(c);return r(c)?U.h(b,e,ee(T(b,e),c,d)):U.h(b,e,d)},fe=function fe(){switch(arguments.length){case 3:return fe.h(arguments[0],arguments[1],arguments[2]);case 4:return fe.r(arguments[0],arguments[1],arguments[2],arguments[3]);case 5:return fe.P(arguments[0],arguments[1],arguments[2],arguments[3],arguments[4]);case 6:return fe.ea(arguments[0],arguments[1],arguments[2],arguments[3],arguments[4],arguments[5]);default:return fe.m(arguments[0],arguments[1],arguments[2],
arguments[3],arguments[4],arguments[5],new K(Array.prototype.slice.call(arguments,6),0))}};fe.h=function(a,b,c){var d=S(b,0);b=pd(b);return r(b)?U.h(a,d,fe.h(T(a,d),b,c)):U.h(a,d,function(){var b=T(a,d);return c.c?c.c(b):c.call(null,b)}())};fe.r=function(a,b,c,d){var e=S(b,0);b=pd(b);return r(b)?U.h(a,e,fe.r(T(a,e),b,c,d)):U.h(a,e,function(){var b=T(a,e);return c.d?c.d(b,d):c.call(null,b,d)}())};
fe.P=function(a,b,c,d,e){var f=S(b,0);b=pd(b);return r(b)?U.h(a,f,fe.P(T(a,f),b,c,d,e)):U.h(a,f,function(){var b=T(a,f);return c.h?c.h(b,d,e):c.call(null,b,d,e)}())};fe.ea=function(a,b,c,d,e,f){var h=S(b,0);b=pd(b);return r(b)?U.h(a,h,fe.ea(T(a,h),b,c,d,e,f)):U.h(a,h,function(){var b=T(a,h);return c.r?c.r(b,d,e,f):c.call(null,b,d,e,f)}())};fe.m=function(a,b,c,d,e,f,h){var k=S(b,0);b=pd(b);return r(b)?U.h(a,k,Md(fe,T(a,k),b,c,d,Q([e,f,h],0))):U.h(a,k,Md(c,T(a,k),d,e,f,Q([h],0)))};
fe.J=function(a){var b=L(a),c=M(a);a=L(c);var d=M(c),c=L(d),e=M(d),d=L(e),f=M(e),e=L(f),h=M(f),f=L(h),h=M(h);return fe.m(b,a,c,d,e,f,h)};fe.G=6;function ge(a,b){this.A=a;this.e=b}function he(a){return new ge(a,[null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null])}function ie(a){a=a.k;return 32>a?0:a-1>>>5<<5}function je(a,b,c){for(;;){if(0===b)return c;var d=he(a);d.e[0]=c;c=d;b-=5}}
var le=function le(b,c,d,e){var f=new ge(d.A,Fa(d.e)),h=b.k-1>>>c&31;5===c?f.e[h]=e:(d=d.e[h],b=null!=d?le(b,c-5,d,e):je(null,c-5,e),f.e[h]=b);return f};function me(a,b){throw Error([w("No item "),w(a),w(" in vector of length "),w(b)].join(""));}function ne(a,b){if(b>=ie(a))return a.X;for(var c=a.root,d=a.shift;;)if(0<d)var e=d-5,c=c.e[b>>>d&31],d=e;else return c.e}function oe(a,b){return 0<=b&&b<a.k?ne(a,b):me(b,a.k)}
var pe=function pe(b,c,d,e,f){var h=new ge(d.A,Fa(d.e));if(0===c)h.e[e&31]=f;else{var k=e>>>c&31;b=pe(b,c-5,d.e[k],e,f);h.e[k]=b}return h};function qe(a,b,c,d,e,f){this.i=a;this.base=b;this.e=c;this.ka=d;this.start=e;this.end=f}qe.prototype.jb=function(){return this.i<this.end};qe.prototype.next=function(){32===this.i-this.base&&(this.e=ne(this.ka,this.i),this.base+=32);var a=this.e[this.i&31];this.i+=1;return a};
function Y(a,b,c,d,e,f){this.meta=a;this.k=b;this.shift=c;this.root=d;this.X=e;this.l=f;this.j=167668511;this.o=8196}g=Y.prototype;g.toString=function(){return Yb(this)};g.equiv=function(a){return this.n(null,a)};g.v=function(a,b){return z.h(this,b,null)};g.t=function(a,b,c){return"number"===typeof b?y.h(this,b,c):c};g.w=function(a,b){return oe(this,b)[b&31]};g.$=function(a,b,c){return 0<=b&&b<this.k?ne(this,b)[b&31]:c};
g.tb=function(a,b,c){if(0<=b&&b<this.k)return ie(this)<=b?(a=Fa(this.X),a[b&31]=c,new Y(this.meta,this.k,this.shift,this.root,a,null)):new Y(this.meta,this.k,this.shift,pe(this,this.shift,this.root,b,c),this.X,null);if(b===this.k)return Ya(this,c);throw Error([w("Index "),w(b),w(" out of bounds  [0,"),w(this.k),w("]")].join(""));};g.Ya=function(){var a=this.k;return new qe(0,0,0<R(this)?ne(this,0):null,this,0,a)};g.C=function(){return this.meta};
g.ba=function(){return new Y(this.meta,this.k,this.shift,this.root,this.X,this.l)};g.N=function(){return this.k};g.rb=function(){return y.d(this,0)};g.sb=function(){return y.d(this,1)};g.K=function(){var a=this.l;return null!=a?a:this.l=a=sc(this)};g.n=function(a,b){if(b instanceof Y)if(this.k===R(b))for(var c=Wb(this),d=Wb(b);;)if(r(c.jb())){var e=c.next(),f=d.next();if(!oc.d(e,f))return!1}else return!0;else return!1;else return Gc(this,b)};
g.Xa=function(){var a=this;return new re(a.k,a.shift,function(){var b=a.root;return se.c?se.c(b):se.call(null,b)}(),function(){var b=a.X;return te.c?te.c(b):te.call(null,b)}())};g.O=function(){return Sc(Jc,this.meta)};g.S=function(a,b){return wc(this,b)};g.T=function(a,b,c){a=0;for(var d=c;;)if(a<this.k){var e=ne(this,a);c=e.length;a:for(var f=0;;)if(f<c)var h=e[f],d=b.d?b.d(d,h):b.call(null,d,h),f=f+1;else{e=d;break a}a+=c;d=e}else return d};
g.Ja=function(a,b,c){if("number"===typeof b)return rb(this,b,c);throw Error("Vector's key for assoc must be a number.");};g.M=function(){if(0===this.k)return null;if(32>=this.k)return new K(this.X,0);var a;a:{a=this.root;for(var b=this.shift;;)if(0<b)b-=5,a=a.e[0];else{a=a.e;break a}}return ue?ue(this,a,0,0):ve.call(null,this,a,0,0)};g.F=function(a,b){return new Y(b,this.k,this.shift,this.root,this.X,this.l)};
g.L=function(a,b){if(32>this.k-ie(this)){for(var c=this.X.length,d=Array(c+1),e=0;;)if(e<c)d[e]=this.X[e],e+=1;else break;d[c]=b;return new Y(this.meta,this.k+1,this.shift,this.root,d,null)}c=(d=this.k>>>5>1<<this.shift)?this.shift+5:this.shift;d?(d=he(null),d.e[0]=this.root,e=je(null,this.shift,new ge(null,this.X)),d.e[1]=e):d=le(this,this.shift,this.root,new ge(null,this.X));return new Y(this.meta,this.k+1,c,d,[b],null)};
g.call=function(){var a=null,a=function(a,c,d){switch(arguments.length){case 2:return this.w(null,c);case 3:return this.$(null,c,d)}throw Error("Invalid arity: "+arguments.length);};a.d=function(a,c){return this.w(null,c)};a.h=function(a,c,d){return this.$(null,c,d)};return a}();g.apply=function(a,b){return this.call.apply(this,[this].concat(Fa(b)))};g.c=function(a){return this.w(null,a)};g.d=function(a,b){return this.$(null,a,b)};
var we=new ge(null,[null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null]),Jc=new Y(null,0,5,we,[],tc);Y.prototype[Da]=function(){return qc(this)};function xe(a,b,c,d,e,f){this.da=a;this.node=b;this.i=c;this.R=d;this.meta=e;this.l=f;this.j=32375020;this.o=1536}g=xe.prototype;g.toString=function(){return Yb(this)};g.equiv=function(a){return this.n(null,a)};g.C=function(){return this.meta};
g.Z=function(){if(this.R+1<this.node.length){var a;a=this.da;var b=this.node,c=this.i,d=this.R+1;a=ue?ue(a,b,c,d):ve.call(null,a,b,c,d);return null==a?null:a}return Sb(this)};g.K=function(){var a=this.l;return null!=a?a:this.l=a=sc(this)};g.n=function(a,b){return Gc(this,b)};g.O=function(){return Sc(Jc,this.meta)};g.S=function(a,b){var c;c=this.da;var d=this.i+this.R,e=R(this.da);c=ye?ye(c,d,e):ze.call(null,c,d,e);return wc(c,b)};
g.T=function(a,b,c){a=this.da;var d=this.i+this.R,e=R(this.da);a=ye?ye(a,d,e):ze.call(null,a,d,e);return xc(a,b,c)};g.U=function(){return this.node[this.R]};g.aa=function(){if(this.R+1<this.node.length){var a;a=this.da;var b=this.node,c=this.i,d=this.R+1;a=ue?ue(a,b,c,d):ve.call(null,a,b,c,d);return null==a?nc:a}return Rb(this)};g.M=function(){return this};g.pb=function(){var a=this.node;return new zd(a,this.R,a.length)};
g.qb=function(){var a=this.i+this.node.length;if(a<Ua(this.da)){var b=this.da,c=ne(this.da,a);return ue?ue(b,c,a,0):ve.call(null,b,c,a,0)}return nc};g.F=function(a,b){var c=this.da,d=this.node,e=this.i,f=this.R;return Ae?Ae(c,d,e,f,b):ve.call(null,c,d,e,f,b)};g.L=function(a,b){return P(b,this)};g.ob=function(){var a=this.i+this.node.length;if(a<Ua(this.da)){var b=this.da,c=ne(this.da,a);return ue?ue(b,c,a,0):ve.call(null,b,c,a,0)}return null};xe.prototype[Da]=function(){return qc(this)};
function ve(){switch(arguments.length){case 3:var a=arguments[0],b=arguments[1],c=arguments[2];return new xe(a,oe(a,b),b,c,null,null);case 4:return ue(arguments[0],arguments[1],arguments[2],arguments[3]);case 5:return Ae(arguments[0],arguments[1],arguments[2],arguments[3],arguments[4]);default:throw Error([w("Invalid arity: "),w(arguments.length)].join(""));}}function ue(a,b,c,d){return new xe(a,b,c,d,null,null)}function Ae(a,b,c,d,e){return new xe(a,b,c,d,e,null)}
function Be(a,b,c,d,e){this.meta=a;this.ka=b;this.start=c;this.end=d;this.l=e;this.j=167666463;this.o=8192}g=Be.prototype;g.toString=function(){return Yb(this)};g.equiv=function(a){return this.n(null,a)};g.v=function(a,b){return z.h(this,b,null)};g.t=function(a,b,c){return"number"===typeof b?y.h(this,b,c):c};g.w=function(a,b){return 0>b||this.end<=this.start+b?me(b,this.end-this.start):y.d(this.ka,this.start+b)};g.$=function(a,b,c){return 0>b||this.end<=this.start+b?c:y.h(this.ka,this.start+b,c)};
g.tb=function(a,b,c){var d=this.start+b;a=this.meta;c=U.h(this.ka,d,c);b=this.start;var e=this.end,d=d+1,d=e>d?e:d;return Ce.P?Ce.P(a,c,b,d,null):Ce.call(null,a,c,b,d,null)};g.C=function(){return this.meta};g.ba=function(){return new Be(this.meta,this.ka,this.start,this.end,this.l)};g.N=function(){return this.end-this.start};g.K=function(){var a=this.l;return null!=a?a:this.l=a=sc(this)};g.n=function(a,b){return Gc(this,b)};g.O=function(){return Sc(Jc,this.meta)};
g.S=function(a,b){return wc(this,b)};g.T=function(a,b,c){return xc(this,b,c)};g.Ja=function(a,b,c){if("number"===typeof b)return rb(this,b,c);throw Error("Subvec's key for assoc must be a number.");};g.M=function(){var a=this;return function(b){return function d(e){return e===a.end?null:P(y.d(a.ka,e),new wd(null,function(){return function(){return d(e+1)}}(b),null,null))}}(this)(a.start)};
g.F=function(a,b){var c=this.ka,d=this.start,e=this.end,f=this.l;return Ce.P?Ce.P(b,c,d,e,f):Ce.call(null,b,c,d,e,f)};g.L=function(a,b){var c=this.meta,d=rb(this.ka,this.end,b),e=this.start,f=this.end+1;return Ce.P?Ce.P(c,d,e,f,null):Ce.call(null,c,d,e,f,null)};
g.call=function(){var a=null,a=function(a,c,d){switch(arguments.length){case 2:return this.w(null,c);case 3:return this.$(null,c,d)}throw Error("Invalid arity: "+arguments.length);};a.d=function(a,c){return this.w(null,c)};a.h=function(a,c,d){return this.$(null,c,d)};return a}();g.apply=function(a,b){return this.call.apply(this,[this].concat(Fa(b)))};g.c=function(a){return this.w(null,a)};g.d=function(a,b){return this.$(null,a,b)};Be.prototype[Da]=function(){return qc(this)};
function Ce(a,b,c,d,e){for(;;)if(b instanceof Be)c=b.start+c,d=b.start+d,b=b.ka;else{var f=R(b);if(0>c||0>d||c>f||d>f)throw Error("Index out of bounds");return new Be(a,b,c,d,e)}}function ze(){switch(arguments.length){case 2:var a=arguments[0];return ye(a,arguments[1],R(a));case 3:return ye(arguments[0],arguments[1],arguments[2]);default:throw Error([w("Invalid arity: "),w(arguments.length)].join(""));}}function ye(a,b,c){return Ce(null,a,b,c,null)}
function De(a,b){return a===b.A?b:new ge(a,Fa(b.e))}function se(a){return new ge({},Fa(a.e))}function te(a){var b=[null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null];bd(a,0,b,0,a.length);return b}var Ee=function Ee(b,c,d,e){d=De(b.root.A,d);var f=b.k-1>>>c&31;if(5===c)b=e;else{var h=d.e[f];b=null!=h?Ee(b,c-5,h,e):je(b.root.A,c-5,e)}d.e[f]=b;return d};
function re(a,b,c,d){this.k=a;this.shift=b;this.root=c;this.X=d;this.j=275;this.o=88}g=re.prototype;g.call=function(){var a=null,a=function(a,c,d){switch(arguments.length){case 2:return this.v(null,c);case 3:return this.t(null,c,d)}throw Error("Invalid arity: "+arguments.length);};a.d=function(a,c){return this.v(null,c)};a.h=function(a,c,d){return this.t(null,c,d)};return a}();g.apply=function(a,b){return this.call.apply(this,[this].concat(Fa(b)))};g.c=function(a){return this.v(null,a)};
g.d=function(a,b){return this.t(null,a,b)};g.v=function(a,b){return z.h(this,b,null)};g.t=function(a,b,c){return"number"===typeof b?y.h(this,b,c):c};g.w=function(a,b){if(this.root.A)return oe(this,b)[b&31];throw Error("nth after persistent!");};g.$=function(a,b,c){return 0<=b&&b<this.k?y.d(this,b):c};g.N=function(){if(this.root.A)return this.k;throw Error("count after persistent!");};
g.zb=function(a,b,c){var d=this;if(d.root.A){if(0<=b&&b<d.k)return ie(this)<=b?d.X[b&31]=c:(a=function(){return function f(a,k){var l=De(d.root.A,k);if(0===a)l.e[b&31]=c;else{var m=b>>>a&31,n=f(a-5,l.e[m]);l.e[m]=n}return l}}(this).call(null,d.shift,d.root),d.root=a),this;if(b===d.k)return Lb(this,c);throw Error([w("Index "),w(b),w(" out of bounds for TransientVector of length"),w(d.k)].join(""));}throw Error("assoc! after persistent!");};
g.Za=function(a,b,c){if("number"===typeof b)return Ob(this,b,c);throw Error("TransientVector's key for assoc! must be a number.");};
g.$a=function(a,b){if(this.root.A){if(32>this.k-ie(this))this.X[this.k&31]=b;else{var c=new ge(this.root.A,this.X),d=[null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null];d[0]=b;this.X=d;if(this.k>>>5>1<<this.shift){var d=[null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null],e=this.shift+
5;d[0]=this.root;d[1]=je(this.root.A,this.shift,c);this.root=new ge(this.root.A,d);this.shift=e}else this.root=Ee(this,this.shift,this.root,c)}this.k+=1;return this}throw Error("conj! after persistent!");};g.ab=function(){if(this.root.A){this.root.A=null;var a=this.k-ie(this),b=Array(a);bd(this.X,0,b,0,a);return new Y(null,this.k,this.shift,this.root,b,null)}throw Error("persistent! called twice");};function Fe(){this.o=0;this.j=2097152}Fe.prototype.n=function(){return!1};
Fe.prototype.equiv=function(a){return this.n(null,a)};var Ge=new Fe;function He(a,b){return ed(Yc(b)?R(a)===R(b)?Od(kd,X.d(function(a){return oc.d(Mc(b,L(a),Ge),L(M(a)))},a)):null:null)}function Ie(a){this.s=a}Ie.prototype.next=function(){if(null!=this.s){var a=L(this.s),b=S(a,0),a=S(a,1);this.s=M(this.s);return{done:!1,value:[b,a]}}return{done:!0,value:null}};function Je(a){return new Ie(J(a))}function Ke(a){this.s=a}
Ke.prototype.next=function(){if(null!=this.s){var a=L(this.s);this.s=M(this.s);return{done:!1,value:[a,a]}}return{done:!0,value:null}};
function Le(a,b){var c;if(b instanceof W)a:{c=a.length;for(var d=b.Da,e=0;;){if(c<=e){c=-1;break a}var f=a[e];if(f instanceof W&&d===f.Da){c=e;break a}e+=2}}else if(c="string"==typeof b,r(r(c)?c:"number"===typeof b))a:for(c=a.length,d=0;;){if(c<=d){c=-1;break a}if(b===a[d]){c=d;break a}d+=2}else if(b instanceof D)a:for(c=a.length,d=b.Ha,e=0;;){if(c<=e){c=-1;break a}f=a[e];if(f instanceof D&&d===f.Ha){c=e;break a}e+=2}else if(null==b)a:for(c=a.length,d=0;;){if(c<=d){c=-1;break a}if(null==a[d]){c=d;
break a}d+=2}else a:for(c=a.length,d=0;;){if(c<=d){c=-1;break a}if(oc.d(b,a[d])){c=d;break a}d+=2}return c}function Me(a,b,c){this.e=a;this.i=b;this.Y=c;this.o=0;this.j=32374990}g=Me.prototype;g.toString=function(){return Yb(this)};g.equiv=function(a){return this.n(null,a)};g.C=function(){return this.Y};g.Z=function(){return this.i<this.e.length-2?new Me(this.e,this.i+2,this.Y):null};g.N=function(){return(this.e.length-this.i)/2};g.K=function(){return sc(this)};g.n=function(a,b){return Gc(this,b)};
g.O=function(){return Sc(nc,this.Y)};g.S=function(a,b){return hd(b,this)};g.T=function(a,b,c){return id(b,c,this)};g.U=function(){return new Y(null,2,5,we,[this.e[this.i],this.e[this.i+1]],null)};g.aa=function(){return this.i<this.e.length-2?new Me(this.e,this.i+2,this.Y):nc};g.M=function(){return this};g.F=function(a,b){return new Me(this.e,this.i,b)};g.L=function(a,b){return P(b,this)};Me.prototype[Da]=function(){return qc(this)};function Ne(a,b,c){this.e=a;this.i=b;this.k=c}
Ne.prototype.jb=function(){return this.i<this.k};Ne.prototype.next=function(){var a=new Y(null,2,5,we,[this.e[this.i],this.e[this.i+1]],null);this.i+=2;return a};function ra(a,b,c,d){this.meta=a;this.k=b;this.e=c;this.l=d;this.j=16647951;this.o=8196}g=ra.prototype;g.toString=function(){return Yb(this)};g.equiv=function(a){return this.n(null,a)};g.keys=function(){return qc(Oe.c?Oe.c(this):Oe.call(null,this))};g.entries=function(){return Je(J(this))};
g.values=function(){return qc(Pe.c?Pe.c(this):Pe.call(null,this))};g.has=function(a){return gd(this,a)};g.get=function(a,b){return this.t(null,a,b)};g.forEach=function(a){for(var b=J(this),c=null,d=0,e=0;;)if(e<d){var f=c.w(null,e),h=S(f,0),f=S(f,1);a.d?a.d(f,h):a.call(null,f,h);e+=1}else if(b=J(b))$c(b)?(c=Qb(b),b=Rb(b),h=c,d=R(c),c=h):(c=L(b),h=S(c,0),c=f=S(c,1),a.d?a.d(c,h):a.call(null,c,h),b=M(b),c=null,d=0),e=0;else return null};g.v=function(a,b){return z.h(this,b,null)};
g.t=function(a,b,c){a=Le(this.e,b);return-1===a?c:this.e[a+1]};g.Ya=function(){return new Ne(this.e,0,2*this.k)};g.C=function(){return this.meta};g.ba=function(){return new ra(this.meta,this.k,this.e,this.l)};g.N=function(){return this.k};g.K=function(){var a=this.l;return null!=a?a:this.l=a=uc(this)};
g.n=function(a,b){if(b&&(b.j&1024||b.ec)){var c=this.e.length;if(this.k===b.N(null))for(var d=0;;)if(d<c){var e=b.t(null,this.e[d],cd);if(e!==cd)if(oc.d(this.e[d+1],e))d+=2;else return!1;else return!1}else return!0;else return!1}else return He(this,b)};g.Xa=function(){return new Qe({},this.e.length,Fa(this.e))};g.O=function(){return xb(Re,this.meta)};g.S=function(a,b){return hd(b,this)};g.T=function(a,b,c){return id(b,c,this)};
g.gb=function(a,b){if(0<=Le(this.e,b)){var c=this.e.length,d=c-2;if(0===d)return Va(this);for(var d=Array(d),e=0,f=0;;){if(e>=c)return new ra(this.meta,this.k-1,d,null);oc.d(b,this.e[e])||(d[f]=this.e[e],d[f+1]=this.e[e+1],f+=2);e+=2}}else return this};
g.Ja=function(a,b,c){a=Le(this.e,b);if(-1===a){if(this.k<Se){a=this.e;for(var d=a.length,e=Array(d+2),f=0;;)if(f<d)e[f]=a[f],f+=1;else break;e[d]=b;e[d+1]=c;return new ra(this.meta,this.k+1,e,null)}return xb(fb(be(Te,this),b,c),this.meta)}if(c===this.e[a+1])return this;b=Fa(this.e);b[a+1]=c;return new ra(this.meta,this.k,b,null)};g.Va=function(a,b){return-1!==Le(this.e,b)};g.M=function(){var a=this.e;return 0<=a.length-2?new Me(a,0,null):null};g.F=function(a,b){return new ra(b,this.k,this.e,this.l)};
g.L=function(a,b){if(Zc(b))return fb(this,y.d(b,0),y.d(b,1));for(var c=this,d=J(b);;){if(null==d)return c;var e=L(d);if(Zc(e))c=fb(c,y.d(e,0),y.d(e,1)),d=M(d);else throw Error("conj on a map takes map entries or seqables of map entries");}};
g.call=function(){var a=null,a=function(a,c,d){switch(arguments.length){case 2:return this.v(null,c);case 3:return this.t(null,c,d)}throw Error("Invalid arity: "+arguments.length);};a.d=function(a,c){return this.v(null,c)};a.h=function(a,c,d){return this.t(null,c,d)};return a}();g.apply=function(a,b){return this.call.apply(this,[this].concat(Fa(b)))};g.c=function(a){return this.v(null,a)};g.d=function(a,b){return this.t(null,a,b)};var Re=new ra(null,0,[],vc),Se=8;ra.prototype[Da]=function(){return qc(this)};
function Qe(a,b,c){this.Pa=a;this.Ra=b;this.e=c;this.o=56;this.j=258}g=Qe.prototype;g.Za=function(a,b,c){if(r(this.Pa)){a=Le(this.e,b);if(-1===a){if(this.Ra+2<=2*Se)return this.Ra+=2,this.e.push(b),this.e.push(c),this;a=this.Ra;var d=this.e;a=Ue.d?Ue.d(a,d):Ue.call(null,a,d);return Nb(a,b,c)}c!==this.e[a+1]&&(this.e[a+1]=c);return this}throw Error("assoc! after persistent!");};
g.$a=function(a,b){if(r(this.Pa)){if(b?b.j&2048||b.fc||(b.j?0:t(lb,b)):t(lb,b))return Nb(this,Ve.c?Ve.c(b):Ve.call(null,b),We.c?We.c(b):We.call(null,b));for(var c=J(b),d=this;;){var e=L(c);if(r(e))var f=e,c=M(c),d=Nb(d,function(){var a=f;return Ve.c?Ve.c(a):Ve.call(null,a)}(),function(){var a=f;return We.c?We.c(a):We.call(null,a)}());else return d}}else throw Error("conj! after persistent!");};
g.ab=function(){if(r(this.Pa))return this.Pa=!1,new ra(null,nd(this.Ra),this.e,null);throw Error("persistent! called twice");};g.v=function(a,b){return z.h(this,b,null)};g.t=function(a,b,c){if(r(this.Pa))return a=Le(this.e,b),-1===a?c:this.e[a+1];throw Error("lookup after persistent!");};g.N=function(){if(r(this.Pa))return nd(this.Ra);throw Error("count after persistent!");};function Ue(a,b){for(var c=Kb(Te),d=0;;)if(d<a)c=Nb(c,b[d],b[d+1]),d+=2;else return c}function Xe(){this.la=!1}
function Ye(a,b){return a===b?!0:a===b||a instanceof W&&b instanceof W&&a.Da===b.Da?!0:oc.d(a,b)}function Ze(a,b,c){a=Fa(a);a[b]=c;return a}function $e(a,b){var c=Array(a.length-2);bd(a,0,c,0,2*b);bd(a,2*(b+1),c,2*b,c.length-2*b);return c}function af(a,b,c,d){a=a.Ma(b);a.e[c]=d;return a}function bf(a,b,c){this.A=a;this.H=b;this.e=c}g=bf.prototype;g.Ma=function(a){if(a===this.A)return this;var b=od(this.H),c=Array(0>b?4:2*(b+1));bd(this.e,0,c,0,2*b);return new bf(a,this.H,c)};
g.bb=function(){var a=this.e;return cf?cf(a):df.call(null,a)};g.Fa=function(a,b,c,d){var e=1<<(b>>>a&31);if(0===(this.H&e))return d;var f=od(this.H&e-1),e=this.e[2*f],f=this.e[2*f+1];return null==e?f.Fa(a+5,b,c,d):Ye(c,e)?f:d};
g.ga=function(a,b,c,d,e,f){var h=1<<(c>>>b&31),k=od(this.H&h-1);if(0===(this.H&h)){var l=od(this.H);if(2*l<this.e.length){a=this.Ma(a);b=a.e;f.la=!0;a:for(c=2*(l-k),f=2*k+(c-1),l=2*(k+1)+(c-1);;){if(0===c)break a;b[l]=b[f];--l;--c;--f}b[2*k]=d;b[2*k+1]=e;a.H|=h;return a}if(16<=l){k=[null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null];k[c>>>b&31]=ef.ga(a,b+5,c,d,e,f);for(e=d=0;;)if(32>d)0!==
(this.H>>>d&1)&&(k[d]=null!=this.e[e]?ef.ga(a,b+5,gc(this.e[e]),this.e[e],this.e[e+1],f):this.e[e+1],e+=2),d+=1;else break;return new ff(a,l+1,k)}b=Array(2*(l+4));bd(this.e,0,b,0,2*k);b[2*k]=d;b[2*k+1]=e;bd(this.e,2*k,b,2*(k+1),2*(l-k));f.la=!0;a=this.Ma(a);a.e=b;a.H|=h;return a}l=this.e[2*k];h=this.e[2*k+1];if(null==l)return l=h.ga(a,b+5,c,d,e,f),l===h?this:af(this,a,2*k+1,l);if(Ye(d,l))return e===h?this:af(this,a,2*k+1,e);f.la=!0;f=b+5;d=gf?gf(a,f,l,h,c,d,e):hf.call(null,a,f,l,h,c,d,e);e=2*k;k=
2*k+1;a=this.Ma(a);a.e[e]=null;a.e[k]=d;return a};
g.fa=function(a,b,c,d,e){var f=1<<(b>>>a&31),h=od(this.H&f-1);if(0===(this.H&f)){var k=od(this.H);if(16<=k){h=[null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null];h[b>>>a&31]=ef.fa(a+5,b,c,d,e);for(d=c=0;;)if(32>c)0!==(this.H>>>c&1)&&(h[c]=null!=this.e[d]?ef.fa(a+5,gc(this.e[d]),this.e[d],this.e[d+1],e):this.e[d+1],d+=2),c+=1;else break;return new ff(null,k+1,h)}a=Array(2*(k+1));bd(this.e,
0,a,0,2*h);a[2*h]=c;a[2*h+1]=d;bd(this.e,2*h,a,2*(h+1),2*(k-h));e.la=!0;return new bf(null,this.H|f,a)}var l=this.e[2*h],f=this.e[2*h+1];if(null==l)return k=f.fa(a+5,b,c,d,e),k===f?this:new bf(null,this.H,Ze(this.e,2*h+1,k));if(Ye(c,l))return d===f?this:new bf(null,this.H,Ze(this.e,2*h+1,d));e.la=!0;e=this.H;k=this.e;a+=5;a=jf?jf(a,l,f,b,c,d):hf.call(null,a,l,f,b,c,d);c=2*h;h=2*h+1;d=Fa(k);d[c]=null;d[h]=a;return new bf(null,e,d)};
g.cb=function(a,b,c){var d=1<<(b>>>a&31);if(0===(this.H&d))return this;var e=od(this.H&d-1),f=this.e[2*e],h=this.e[2*e+1];return null==f?(a=h.cb(a+5,b,c),a===h?this:null!=a?new bf(null,this.H,Ze(this.e,2*e+1,a)):this.H===d?null:new bf(null,this.H^d,$e(this.e,e))):Ye(c,f)?new bf(null,this.H^d,$e(this.e,e)):this};var ef=new bf(null,0,[]);function ff(a,b,c){this.A=a;this.k=b;this.e=c}g=ff.prototype;g.Ma=function(a){return a===this.A?this:new ff(a,this.k,Fa(this.e))};
g.bb=function(){var a=this.e;return kf?kf(a):lf.call(null,a)};g.Fa=function(a,b,c,d){var e=this.e[b>>>a&31];return null!=e?e.Fa(a+5,b,c,d):d};g.ga=function(a,b,c,d,e,f){var h=c>>>b&31,k=this.e[h];if(null==k)return a=af(this,a,h,ef.ga(a,b+5,c,d,e,f)),a.k+=1,a;b=k.ga(a,b+5,c,d,e,f);return b===k?this:af(this,a,h,b)};
g.fa=function(a,b,c,d,e){var f=b>>>a&31,h=this.e[f];if(null==h)return new ff(null,this.k+1,Ze(this.e,f,ef.fa(a+5,b,c,d,e)));a=h.fa(a+5,b,c,d,e);return a===h?this:new ff(null,this.k,Ze(this.e,f,a))};
g.cb=function(a,b,c){var d=b>>>a&31,e=this.e[d];if(null!=e){a=e.cb(a+5,b,c);if(a===e)d=this;else if(null==a)if(8>=this.k)a:{e=this.e;a=e.length;b=Array(2*(this.k-1));c=0;for(var f=1,h=0;;)if(c<a)c!==d&&null!=e[c]&&(b[f]=e[c],f+=2,h|=1<<c),c+=1;else{d=new bf(null,h,b);break a}}else d=new ff(null,this.k-1,Ze(this.e,d,a));else d=new ff(null,this.k,Ze(this.e,d,a));return d}return this};function mf(a,b,c){b*=2;for(var d=0;;)if(d<b){if(Ye(c,a[d]))return d;d+=2}else return-1}
function nf(a,b,c,d){this.A=a;this.Aa=b;this.k=c;this.e=d}g=nf.prototype;g.Ma=function(a){if(a===this.A)return this;var b=Array(2*(this.k+1));bd(this.e,0,b,0,2*this.k);return new nf(a,this.Aa,this.k,b)};g.bb=function(){var a=this.e;return cf?cf(a):df.call(null,a)};g.Fa=function(a,b,c,d){a=mf(this.e,this.k,c);return 0>a?d:Ye(c,this.e[a])?this.e[a+1]:d};
g.ga=function(a,b,c,d,e,f){if(c===this.Aa){b=mf(this.e,this.k,d);if(-1===b){if(this.e.length>2*this.k)return b=2*this.k,c=2*this.k+1,a=this.Ma(a),a.e[b]=d,a.e[c]=e,f.la=!0,a.k+=1,a;c=this.e.length;b=Array(c+2);bd(this.e,0,b,0,c);b[c]=d;b[c+1]=e;f.la=!0;d=this.k+1;a===this.A?(this.e=b,this.k=d,a=this):a=new nf(this.A,this.Aa,d,b);return a}return this.e[b+1]===e?this:af(this,a,b+1,e)}return(new bf(a,1<<(this.Aa>>>b&31),[null,this,null,null])).ga(a,b,c,d,e,f)};
g.fa=function(a,b,c,d,e){return b===this.Aa?(a=mf(this.e,this.k,c),-1===a?(a=2*this.k,b=Array(a+2),bd(this.e,0,b,0,a),b[a]=c,b[a+1]=d,e.la=!0,new nf(null,this.Aa,this.k+1,b)):oc.d(this.e[a],d)?this:new nf(null,this.Aa,this.k,Ze(this.e,a+1,d))):(new bf(null,1<<(this.Aa>>>a&31),[null,this])).fa(a,b,c,d,e)};g.cb=function(a,b,c){a=mf(this.e,this.k,c);return-1===a?this:1===this.k?null:new nf(null,this.Aa,this.k-1,$e(this.e,nd(a)))};
function hf(){switch(arguments.length){case 6:return jf(arguments[0],arguments[1],arguments[2],arguments[3],arguments[4],arguments[5]);case 7:return gf(arguments[0],arguments[1],arguments[2],arguments[3],arguments[4],arguments[5],arguments[6]);default:throw Error([w("Invalid arity: "),w(arguments.length)].join(""));}}function jf(a,b,c,d,e,f){var h=gc(b);if(h===d)return new nf(null,h,2,[b,c,e,f]);var k=new Xe;return ef.fa(a,h,b,c,k).fa(a,d,e,f,k)}
function gf(a,b,c,d,e,f,h){var k=gc(c);if(k===e)return new nf(null,k,2,[c,d,f,h]);var l=new Xe;return ef.ga(a,b,k,c,d,l).ga(a,b,e,f,h,l)}function of(a,b,c,d,e){this.meta=a;this.Ga=b;this.i=c;this.s=d;this.l=e;this.o=0;this.j=32374860}g=of.prototype;g.toString=function(){return Yb(this)};g.equiv=function(a){return this.n(null,a)};g.C=function(){return this.meta};g.K=function(){var a=this.l;return null!=a?a:this.l=a=sc(this)};g.n=function(a,b){return Gc(this,b)};g.O=function(){return Sc(nc,this.meta)};
g.S=function(a,b){return hd(b,this)};g.T=function(a,b,c){return id(b,c,this)};g.U=function(){return null==this.s?new Y(null,2,5,we,[this.Ga[this.i],this.Ga[this.i+1]],null):L(this.s)};g.aa=function(){if(null==this.s){var a=this.Ga,b=this.i+2;return pf?pf(a,b,null):df.call(null,a,b,null)}var a=this.Ga,b=this.i,c=M(this.s);return pf?pf(a,b,c):df.call(null,a,b,c)};g.M=function(){return this};g.F=function(a,b){return new of(b,this.Ga,this.i,this.s,this.l)};g.L=function(a,b){return P(b,this)};
of.prototype[Da]=function(){return qc(this)};function df(){switch(arguments.length){case 1:return cf(arguments[0]);case 3:return pf(arguments[0],arguments[1],arguments[2]);default:throw Error([w("Invalid arity: "),w(arguments.length)].join(""));}}function cf(a){return pf(a,0,null)}
function pf(a,b,c){if(null==c)for(c=a.length;;)if(b<c){if(null!=a[b])return new of(null,a,b,null,null);var d=a[b+1];if(r(d)&&(d=d.bb(),r(d)))return new of(null,a,b+2,d,null);b+=2}else return null;else return new of(null,a,b,c,null)}function qf(a,b,c,d,e){this.meta=a;this.Ga=b;this.i=c;this.s=d;this.l=e;this.o=0;this.j=32374860}g=qf.prototype;g.toString=function(){return Yb(this)};g.equiv=function(a){return this.n(null,a)};g.C=function(){return this.meta};
g.K=function(){var a=this.l;return null!=a?a:this.l=a=sc(this)};g.n=function(a,b){return Gc(this,b)};g.O=function(){return Sc(nc,this.meta)};g.S=function(a,b){return hd(b,this)};g.T=function(a,b,c){return id(b,c,this)};g.U=function(){return L(this.s)};g.aa=function(){var a=this.Ga,b=this.i,c=M(this.s);return rf?rf(null,a,b,c):lf.call(null,null,a,b,c)};g.M=function(){return this};g.F=function(a,b){return new qf(b,this.Ga,this.i,this.s,this.l)};g.L=function(a,b){return P(b,this)};qf.prototype[Da]=function(){return qc(this)};
function lf(){switch(arguments.length){case 1:return kf(arguments[0]);case 4:return rf(arguments[0],arguments[1],arguments[2],arguments[3]);default:throw Error([w("Invalid arity: "),w(arguments.length)].join(""));}}function kf(a){return rf(null,a,0,null)}function rf(a,b,c,d){if(null==d)for(d=b.length;;)if(c<d){var e=b[c];if(r(e)&&(e=e.bb(),r(e)))return new qf(a,b,c+1,e,null);c+=1}else return null;else return new qf(a,b,c,d,null)}
function sf(a,b,c,d,e,f){this.meta=a;this.k=b;this.root=c;this.V=d;this.ca=e;this.l=f;this.j=16123663;this.o=8196}g=sf.prototype;g.toString=function(){return Yb(this)};g.equiv=function(a){return this.n(null,a)};g.keys=function(){return qc(Oe.c?Oe.c(this):Oe.call(null,this))};g.entries=function(){return Je(J(this))};g.values=function(){return qc(Pe.c?Pe.c(this):Pe.call(null,this))};g.has=function(a){return gd(this,a)};g.get=function(a,b){return this.t(null,a,b)};
g.forEach=function(a){for(var b=J(this),c=null,d=0,e=0;;)if(e<d){var f=c.w(null,e),h=S(f,0),f=S(f,1);a.d?a.d(f,h):a.call(null,f,h);e+=1}else if(b=J(b))$c(b)?(c=Qb(b),b=Rb(b),h=c,d=R(c),c=h):(c=L(b),h=S(c,0),c=f=S(c,1),a.d?a.d(c,h):a.call(null,c,h),b=M(b),c=null,d=0),e=0;else return null};g.v=function(a,b){return z.h(this,b,null)};g.t=function(a,b,c){return null==b?this.V?this.ca:c:null==this.root?c:this.root.Fa(0,gc(b),b,c)};g.C=function(){return this.meta};
g.ba=function(){return new sf(this.meta,this.k,this.root,this.V,this.ca,this.l)};g.N=function(){return this.k};g.K=function(){var a=this.l;return null!=a?a:this.l=a=uc(this)};g.n=function(a,b){return He(this,b)};g.Xa=function(){return new tf({},this.root,this.k,this.V,this.ca)};g.O=function(){return xb(Te,this.meta)};
g.gb=function(a,b){if(null==b)return this.V?new sf(this.meta,this.k-1,this.root,!1,null,null):this;if(null==this.root)return this;var c=this.root.cb(0,gc(b),b);return c===this.root?this:new sf(this.meta,this.k-1,c,this.V,this.ca,null)};
g.Ja=function(a,b,c){if(null==b)return this.V&&c===this.ca?this:new sf(this.meta,this.V?this.k:this.k+1,this.root,!0,c,null);a=new Xe;b=(null==this.root?ef:this.root).fa(0,gc(b),b,c,a);return b===this.root?this:new sf(this.meta,a.la?this.k+1:this.k,b,this.V,this.ca,null)};g.Va=function(a,b){return null==b?this.V:null==this.root?!1:this.root.Fa(0,gc(b),b,cd)!==cd};g.M=function(){if(0<this.k){var a=null!=this.root?this.root.bb():null;return this.V?P(new Y(null,2,5,we,[null,this.ca],null),a):a}return null};
g.F=function(a,b){return new sf(b,this.k,this.root,this.V,this.ca,this.l)};g.L=function(a,b){if(Zc(b))return fb(this,y.d(b,0),y.d(b,1));for(var c=this,d=J(b);;){if(null==d)return c;var e=L(d);if(Zc(e))c=fb(c,y.d(e,0),y.d(e,1)),d=M(d);else throw Error("conj on a map takes map entries or seqables of map entries");}};
g.call=function(){var a=null,a=function(a,c,d){switch(arguments.length){case 2:return this.v(null,c);case 3:return this.t(null,c,d)}throw Error("Invalid arity: "+arguments.length);};a.d=function(a,c){return this.v(null,c)};a.h=function(a,c,d){return this.t(null,c,d)};return a}();g.apply=function(a,b){return this.call.apply(this,[this].concat(Fa(b)))};g.c=function(a){return this.v(null,a)};g.d=function(a,b){return this.t(null,a,b)};var Te=new sf(null,0,null,!1,null,vc);
function Nc(a,b){for(var c=a.length,d=0,e=Kb(Te);;)if(d<c)var f=d+1,e=e.Za(null,a[d],b[d]),d=f;else return Mb(e)}sf.prototype[Da]=function(){return qc(this)};function tf(a,b,c,d,e){this.A=a;this.root=b;this.count=c;this.V=d;this.ca=e;this.o=56;this.j=258}g=tf.prototype;g.Za=function(a,b,c){return uf(this,b,c)};g.$a=function(a,b){return vf(this,b)};g.ab=function(){var a;if(this.A)this.A=null,a=new sf(null,this.count,this.root,this.V,this.ca,null);else throw Error("persistent! called twice");return a};
g.v=function(a,b){return null==b?this.V?this.ca:null:null==this.root?null:this.root.Fa(0,gc(b),b)};g.t=function(a,b,c){return null==b?this.V?this.ca:c:null==this.root?c:this.root.Fa(0,gc(b),b,c)};g.N=function(){if(this.A)return this.count;throw Error("count after persistent!");};
function vf(a,b){if(a.A){if(b?b.j&2048||b.fc||(b.j?0:t(lb,b)):t(lb,b))return uf(a,Ve.c?Ve.c(b):Ve.call(null,b),We.c?We.c(b):We.call(null,b));for(var c=J(b),d=a;;){var e=L(c);if(r(e))var f=e,c=M(c),d=uf(d,function(){var a=f;return Ve.c?Ve.c(a):Ve.call(null,a)}(),function(){var a=f;return We.c?We.c(a):We.call(null,a)}());else return d}}else throw Error("conj! after persistent");}
function uf(a,b,c){if(a.A){if(null==b)a.ca!==c&&(a.ca=c),a.V||(a.count+=1,a.V=!0);else{var d=new Xe;b=(null==a.root?ef:a.root).ga(a.A,0,gc(b),b,c,d);b!==a.root&&(a.root=b);d.la&&(a.count+=1)}return a}throw Error("assoc! after persistent!");}var Td=function Td(){return Td.m(0<arguments.length?new K(Array.prototype.slice.call(arguments,0),0):null)};Td.m=function(a){for(var b=J(a),c=Kb(Te);;)if(b){a=M(M(b));var d=L(b),b=L(M(b)),c=Nb(c,d,b),b=a}else return Mb(c)};Td.G=0;Td.J=function(a){return Td.m(J(a))};
function wf(a,b){this.W=a;this.Y=b;this.o=0;this.j=32374988}g=wf.prototype;g.toString=function(){return Yb(this)};g.equiv=function(a){return this.n(null,a)};g.C=function(){return this.Y};g.Z=function(){var a=this.W,a=(a?a.j&128||a.hb||(a.j?0:t(cb,a)):t(cb,a))?this.W.Z(null):M(this.W);return null==a?null:new wf(a,this.Y)};g.K=function(){return sc(this)};g.n=function(a,b){return Gc(this,b)};g.O=function(){return Sc(nc,this.Y)};g.S=function(a,b){return hd(b,this)};g.T=function(a,b,c){return id(b,c,this)};
g.U=function(){return this.W.U(null).rb()};g.aa=function(){var a=this.W,a=(a?a.j&128||a.hb||(a.j?0:t(cb,a)):t(cb,a))?this.W.Z(null):M(this.W);return null!=a?new wf(a,this.Y):nc};g.M=function(){return this};g.F=function(a,b){return new wf(this.W,b)};g.L=function(a,b){return P(b,this)};wf.prototype[Da]=function(){return qc(this)};function Oe(a){return(a=J(a))?new wf(a,null):null}function Ve(a){return mb(a)}function xf(a,b){this.W=a;this.Y=b;this.o=0;this.j=32374988}g=xf.prototype;g.toString=function(){return Yb(this)};
g.equiv=function(a){return this.n(null,a)};g.C=function(){return this.Y};g.Z=function(){var a=this.W,a=(a?a.j&128||a.hb||(a.j?0:t(cb,a)):t(cb,a))?this.W.Z(null):M(this.W);return null==a?null:new xf(a,this.Y)};g.K=function(){return sc(this)};g.n=function(a,b){return Gc(this,b)};g.O=function(){return Sc(nc,this.Y)};g.S=function(a,b){return hd(b,this)};g.T=function(a,b,c){return id(b,c,this)};g.U=function(){return this.W.U(null).sb()};
g.aa=function(){var a=this.W,a=(a?a.j&128||a.hb||(a.j?0:t(cb,a)):t(cb,a))?this.W.Z(null):M(this.W);return null!=a?new xf(a,this.Y):nc};g.M=function(){return this};g.F=function(a,b){return new xf(this.W,b)};g.L=function(a,b){return P(b,this)};xf.prototype[Da]=function(){return qc(this)};function Pe(a){return(a=J(a))?new xf(a,null):null}function We(a){return nb(a)}var yf=function yf(){return yf.m(0<arguments.length?new K(Array.prototype.slice.call(arguments,0),0):null)};
yf.m=function(a){return r(Pd(kd,a))?jd(function(a,c){return Ic.d(r(a)?a:Re,c)},a):null};yf.G=0;yf.J=function(a){return yf.m(J(a))};function Af(a,b,c){this.meta=a;this.Ea=b;this.l=c;this.j=15077647;this.o=8196}g=Af.prototype;g.toString=function(){return Yb(this)};g.equiv=function(a){return this.n(null,a)};g.keys=function(){return qc(J(this))};g.entries=function(){var a=J(this);return new Ke(J(a))};g.values=function(){return qc(J(this))};g.has=function(a){return gd(this,a)};
g.forEach=function(a){for(var b=J(this),c=null,d=0,e=0;;)if(e<d){var f=c.w(null,e),h=S(f,0),f=S(f,1);a.d?a.d(f,h):a.call(null,f,h);e+=1}else if(b=J(b))$c(b)?(c=Qb(b),b=Rb(b),h=c,d=R(c),c=h):(c=L(b),h=S(c,0),c=f=S(c,1),a.d?a.d(c,h):a.call(null,c,h),b=M(b),c=null,d=0),e=0;else return null};g.v=function(a,b){return z.h(this,b,null)};g.t=function(a,b,c){return eb(this.Ea,b)?b:c};g.C=function(){return this.meta};g.ba=function(){return new Af(this.meta,this.Ea,this.l)};g.N=function(){return Ua(this.Ea)};
g.K=function(){var a=this.l;return null!=a?a:this.l=a=uc(this)};g.n=function(a,b){return Wc(b)&&R(this)===R(b)&&Od(function(a){return function(b){return gd(a,b)}}(this),b)};g.Xa=function(){return new Bf(Kb(this.Ea))};g.O=function(){return Sc(Cf,this.meta)};g.yb=function(a,b){return new Af(this.meta,kb(this.Ea,b),null)};g.M=function(){return Oe(this.Ea)};g.F=function(a,b){return new Af(b,this.Ea,this.l)};g.L=function(a,b){return new Af(this.meta,U.h(this.Ea,b,null),null)};
g.call=function(){var a=null,a=function(a,c,d){switch(arguments.length){case 2:return this.v(null,c);case 3:return this.t(null,c,d)}throw Error("Invalid arity: "+arguments.length);};a.d=function(a,c){return this.v(null,c)};a.h=function(a,c,d){return this.t(null,c,d)};return a}();g.apply=function(a,b){return this.call.apply(this,[this].concat(Fa(b)))};g.c=function(a){return this.v(null,a)};g.d=function(a,b){return this.t(null,a,b)};var Cf=new Af(null,Re,vc);Af.prototype[Da]=function(){return qc(this)};
function Bf(a){this.Ca=a;this.j=259;this.o=136}g=Bf.prototype;g.call=function(){function a(a,b,c){return z.h(this.Ca,b,cd)===cd?c:b}function b(a,b){return z.h(this.Ca,b,cd)===cd?null:b}var c=null,c=function(c,e,f){switch(arguments.length){case 2:return b.call(this,c,e);case 3:return a.call(this,c,e,f)}throw Error("Invalid arity: "+arguments.length);};c.d=b;c.h=a;return c}();g.apply=function(a,b){return this.call.apply(this,[this].concat(Fa(b)))};
g.c=function(a){return z.h(this.Ca,a,cd)===cd?null:a};g.d=function(a,b){return z.h(this.Ca,a,cd)===cd?b:a};g.v=function(a,b){return z.h(this,b,null)};g.t=function(a,b,c){return z.h(this.Ca,b,cd)===cd?c:b};g.N=function(){return R(this.Ca)};g.$a=function(a,b){this.Ca=Nb(this.Ca,b,null);return this};g.ab=function(){return new Af(null,Mb(this.Ca),null)};function vd(a){if(a&&(a.o&4096||a.hc))return a.name;if("string"===typeof a)return a;throw Error([w("Doesn't support name: "),w(a)].join(""));}
function Df(a,b,c){this.i=a;this.end=b;this.step=c}Df.prototype.jb=function(){return 0<this.step?this.i<this.end:this.i>this.end};Df.prototype.next=function(){var a=this.i;this.i+=this.step;return a};function Ef(a,b,c,d,e){this.meta=a;this.start=b;this.end=c;this.step=d;this.l=e;this.j=32375006;this.o=8192}g=Ef.prototype;g.toString=function(){return Yb(this)};g.equiv=function(a){return this.n(null,a)};
g.w=function(a,b){if(b<Ua(this))return this.start+b*this.step;if(this.start>this.end&&0===this.step)return this.start;throw Error("Index out of bounds");};g.$=function(a,b,c){return b<Ua(this)?this.start+b*this.step:this.start>this.end&&0===this.step?this.start:c};g.Ya=function(){return new Df(this.start,this.end,this.step)};g.C=function(){return this.meta};g.ba=function(){return new Ef(this.meta,this.start,this.end,this.step,this.l)};
g.Z=function(){return 0<this.step?this.start+this.step<this.end?new Ef(this.meta,this.start+this.step,this.end,this.step,null):null:this.start+this.step>this.end?new Ef(this.meta,this.start+this.step,this.end,this.step,null):null};g.N=function(){if(Ba(Db(this)))return 0;var a=(this.end-this.start)/this.step;return Math.ceil.c?Math.ceil.c(a):Math.ceil.call(null,a)};g.K=function(){var a=this.l;return null!=a?a:this.l=a=sc(this)};g.n=function(a,b){return Gc(this,b)};g.O=function(){return Sc(nc,this.meta)};
g.S=function(a,b){return wc(this,b)};g.T=function(a,b,c){for(a=this.start;;)if(0<this.step?a<this.end:a>this.end){var d=a;c=b.d?b.d(c,d):b.call(null,c,d);a+=this.step}else return c};g.U=function(){return null==Db(this)?null:this.start};g.aa=function(){return null!=Db(this)?new Ef(this.meta,this.start+this.step,this.end,this.step,null):nc};g.M=function(){return 0<this.step?this.start<this.end?this:null:this.start>this.end?this:null};g.F=function(a,b){return new Ef(b,this.start,this.end,this.step,this.l)};
g.L=function(a,b){return P(b,this)};Ef.prototype[Da]=function(){return qc(this)};
function Ff(a,b,c,d,e,f,h){var k=oa;oa=null==oa?null:oa-1;try{if(null!=oa&&0>oa)return C(a,"#");C(a,c);if(0===xa.c(f))J(h)&&C(a,function(){var a=Gf.c(f);return r(a)?a:"..."}());else{if(J(h)){var l=L(h);b.h?b.h(l,a,f):b.call(null,l,a,f)}for(var m=M(h),n=xa.c(f)-1;;)if(!m||null!=n&&0===n){J(m)&&0===n&&(C(a,d),C(a,function(){var a=Gf.c(f);return r(a)?a:"..."}()));break}else{C(a,d);var p=L(m);c=a;h=f;b.h?b.h(p,c,h):b.call(null,p,c,h);var u=M(m);c=n-1;m=u;n=c}}return C(a,e)}finally{oa=k}}
function Hf(a,b){for(var c=J(b),d=null,e=0,f=0;;)if(f<e){var h=d.w(null,f);C(a,h);f+=1}else if(c=J(c))d=c,$c(d)?(c=Qb(d),e=Rb(d),d=c,h=R(c),c=e,e=h):(h=L(d),C(a,h),c=M(d),d=null,e=0),f=0;else return null}var If={'"':'\\"',"\\":"\\\\","\b":"\\b","\f":"\\f","\n":"\\n","\r":"\\r","\t":"\\t"};function Jf(a){return[w('"'),w(a.replace(RegExp('[\\\\"\b\f\n\r\t]',"g"),function(a){return If[a]})),w('"')].join("")}
function Kf(a,b,c){if(null==a)return C(b,"nil");if(void 0===a)return C(b,"#\x3cundefined\x3e");if(r(function(){var b=T(c,va);return r(b)?(b=a?a.j&131072||a.gc?!0:a.j?!1:t(tb,a):t(tb,a))?Tc(a):b:b}())){C(b,"^");var d=Tc(a);Lf.h?Lf.h(d,b,c):Lf.call(null,d,b,c);C(b," ")}return null==a?C(b,"nil"):a.La?a.Oa(a,b,c):a&&(a.j&2147483648||a.Q)?a.I(null,b,c):(null==a?null:a.constructor)===Boolean||"number"===typeof a?C(b,""+w(a)):null!=a&&a.constructor===Object?(C(b,"#js "),d=X.d(function(b){return new Y(null,
2,5,we,[ud.c(b),a[b]],null)},ad(a)),Mf.r?Mf.r(d,Lf,b,c):Mf.call(null,d,Lf,b,c)):za(a)?Ff(b,Lf,"#js ["," ","]",c,a):r("string"==typeof a)?r(ua.c(c))?C(b,Jf(a)):C(b,a):Pc(a)?Hf(b,Q(["#\x3c",""+w(a),"\x3e"],0)):a instanceof Date?(d=function(a,b){for(var c=""+w(a);;)if(R(c)<b)c=[w("0"),w(c)].join("");else return c},Hf(b,Q(['#inst "',""+w(a.getUTCFullYear()),"-",d(a.getUTCMonth()+1,2),"-",d(a.getUTCDate(),2),"T",d(a.getUTCHours(),2),":",d(a.getUTCMinutes(),2),":",d(a.getUTCSeconds(),2),".",d(a.getUTCMilliseconds(),
3),"-",'00:00"'],0))):r(a instanceof RegExp)?Hf(b,Q(['#"',a.source,'"'],0)):(a?a.j&2147483648||a.Q||(a.j?0:t(Fb,a)):t(Fb,a))?Gb(a,b,c):Hf(b,Q(["#\x3c",""+w(a),"\x3e"],0))}function Lf(a,b,c){var d=Nf.c(c);return r(d)?(c=U.h(c,Of,Kf),d.h?d.h(a,b,c):d.call(null,a,b,c)):Kf(a,b,c)}
function Pf(a,b){var c;if(Vc(a))c="";else{c=w;var d=new ka;a:{var e=new Xb(d);Lf(L(a),e,b);for(var f=J(M(a)),h=null,k=0,l=0;;)if(l<k){var m=h.w(null,l);C(e," ");Lf(m,e,b);l+=1}else if(f=J(f))h=f,$c(h)?(f=Qb(h),k=Rb(h),h=f,m=R(f),f=k,k=m):(m=L(h),C(e," "),Lf(m,e,b),f=M(h),h=null,k=0),l=0;else break a}c=""+c(d)}return c}function Wd(){return Qf(0<arguments.length?new K(Array.prototype.slice.call(arguments,0),0):null)}function Qf(a){return Pf(a,qa())}
function Rf(){var a=Q(["Setting workerSrc"],0),b=U.h(qa(),ua,!1),a=Pf(a,b);la.c?la.c(a):la.call(null,a);r(ma)&&(a=qa(),la.c?la.c("\n"):la.call(null,"\n"),T(a,sa))}function Mf(a,b,c,d){return Ff(c,function(a,c,d){var k=mb(a);b.h?b.h(k,c,d):b.call(null,k,c,d);C(c," ");a=nb(a);return b.h?b.h(a,c,d):b.call(null,a,c,d)},"{",", ","}",d,J(a))}K.prototype.Q=!0;K.prototype.I=function(a,b,c){return Ff(b,Lf,"("," ",")",c,this)};wd.prototype.Q=!0;wd.prototype.I=function(a,b,c){return Ff(b,Lf,"("," ",")",c,this)};
of.prototype.Q=!0;of.prototype.I=function(a,b,c){return Ff(b,Lf,"("," ",")",c,this)};Me.prototype.Q=!0;Me.prototype.I=function(a,b,c){return Ff(b,Lf,"("," ",")",c,this)};xe.prototype.Q=!0;xe.prototype.I=function(a,b,c){return Ff(b,Lf,"("," ",")",c,this)};td.prototype.Q=!0;td.prototype.I=function(a,b,c){return Ff(b,Lf,"("," ",")",c,this)};sf.prototype.Q=!0;sf.prototype.I=function(a,b,c){return Mf(this,Lf,b,c)};qf.prototype.Q=!0;qf.prototype.I=function(a,b,c){return Ff(b,Lf,"("," ",")",c,this)};
Be.prototype.Q=!0;Be.prototype.I=function(a,b,c){return Ff(b,Lf,"["," ","]",c,this)};Af.prototype.Q=!0;Af.prototype.I=function(a,b,c){return Ff(b,Lf,"#{"," ","}",c,this)};Ad.prototype.Q=!0;Ad.prototype.I=function(a,b,c){return Ff(b,Lf,"("," ",")",c,this)};Qd.prototype.Q=!0;Qd.prototype.I=function(a,b,c){C(b,"#\x3cAtom: ");Lf(this.state,b,c);return C(b,"\x3e")};xf.prototype.Q=!0;xf.prototype.I=function(a,b,c){return Ff(b,Lf,"("," ",")",c,this)};Y.prototype.Q=!0;
Y.prototype.I=function(a,b,c){return Ff(b,Lf,"["," ","]",c,this)};rd.prototype.Q=!0;rd.prototype.I=function(a,b){return C(b,"()")};ra.prototype.Q=!0;ra.prototype.I=function(a,b,c){return Mf(this,Lf,b,c)};Ef.prototype.Q=!0;Ef.prototype.I=function(a,b,c){return Ff(b,Lf,"("," ",")",c,this)};wf.prototype.Q=!0;wf.prototype.I=function(a,b,c){return Ff(b,Lf,"("," ",")",c,this)};qd.prototype.Q=!0;qd.prototype.I=function(a,b,c){return Ff(b,Lf,"("," ",")",c,this)};function Sf(a,b,c){Ib(a,b,c)}
var jc=null,Tf={},Uf=function Uf(b){if(b?b.ac:b)return b.ac(b);var c;c=Uf[q(null==b?null:b)];if(!c&&(c=Uf._,!c))throw v("IEncodeJS.-clj-\x3ejs",b);return c.call(null,b)};function Vf(a){return(a?r(r(null)?null:a.$b)||(a.D?0:t(Tf,a)):t(Tf,a))?Uf(a):"string"===typeof a||"number"===typeof a||a instanceof W||a instanceof D?Wf.c?Wf.c(a):Wf.call(null,a):Qf(Q([a],0))}
var Wf=function Wf(b){if(null==b)return null;if(b?r(r(null)?null:b.$b)||(b.D?0:t(Tf,b)):t(Tf,b))return Uf(b);if(b instanceof W)return vd(b);if(b instanceof D)return""+w(b);if(Yc(b)){var c={};b=J(b);for(var d=null,e=0,f=0;;)if(f<e){var h=d.w(null,f),k=S(h,0),h=S(h,1);c[Vf(k)]=Wf(h);f+=1}else if(b=J(b))$c(b)?(e=Qb(b),b=Rb(b),d=e,e=R(e)):(e=L(b),d=S(e,0),e=S(e,1),c[Vf(d)]=Wf(e),b=M(b),d=null,e=0),f=0;else break;return c}if(null==b?0:b?b.j&8||b.fd||(b.j?0:t(Wa,b)):t(Wa,b)){c=[];b=J(X.d(Wf,b));d=null;
for(f=e=0;;)if(f<e)k=d.w(null,f),c.push(k),f+=1;else if(b=J(b))d=b,$c(d)?(b=Qb(d),f=Rb(d),d=b,e=R(b),b=f):(b=L(d),c.push(b),b=M(d),d=null,e=0),f=0;else break;return c}return b};var Xf=new W(null,"old-state","old-state",1039580704),Yf=new W(null,"path","path",-188191168),Zf=new W(null,"state-map","state-map",-1313872128),$f=new W(null,"new-value","new-value",1087038368),ag=new W(null,"current_page","current_page",-2006507743),bg=new W(null,"descriptor","descriptor",76122018),cg=new W("om.core","not-found","om.core/not-found",1869894275),dg=new W(null,"componentDidUpdate","componentDidUpdate",-1983477981),eg=new W(null,"fn","fn",-1175266204),fg=new W(null,"new-state","new-state",
-490349212),gg=new W(null,"instrument","instrument",-960698844),hg=new W(null,"pdf_width","pdf_width",-134868412),va=new W(null,"meta","meta",1499536964),ig=new W(null,"react-key","react-key",1337881348),jg=new W("om.core","id","om.core/id",299074693),wa=new W(null,"dup","dup",556298533),kg=new W(null,"key","key",-1516042587),lg=new W(null,"skip-render-root","skip-render-root",-5219643),mg=new W(null,"pdf_workerSrc","pdf_workerSrc",-1139408538),ng=new W(null,"isOmComponent","isOmComponent",-2070015162),
Ud=new W(null,"validator","validator",-1966190681),og=new W(null,"page_count","page_count",1423302792),pg=new W(null,"adapt","adapt",-1817022327),qg=new W(null,"navigation","navigation",369417),rg=new W(null,"old-value","old-value",862546795),sg=new W("om.core","pass","om.core/pass",-1453289268),tg=new W(null,"pdf","pdf",1586765132),ug=new W(null,"init-state","init-state",1450863212),vg=new W(null,"state","state",-1988618099),Of=new W(null,"fallback-impl","fallback-impl",-1501286995),wg=new W(null,
"pending-state","pending-state",1525896973),sa=new W(null,"flush-on-newline","flush-on-newline",-151457939),xg=new W(null,"componentWillUnmount","componentWillUnmount",1573788814),yg=new W(null,"componentWillReceiveProps","componentWillReceiveProps",559988974),zg=new W(null,"ignore","ignore",-1631542033),Ag=new W(null,"shouldComponentUpdate","shouldComponentUpdate",1795750960),ua=new W(null,"readably","readably",1129599760),Gf=new W(null,"more-marker","more-marker",-14717935),Bg=new W(null,"key-fn",
"key-fn",-636154479),Cg=new W(null,"render","render",-1408033454),Dg=new W(null,"pdf_url","pdf_url",1987145011),Eg=new W(null,"previous-state","previous-state",1888227923),xa=new W(null,"print-length","print-length",1931866356),Fg=new W(null,"componentWillUpdate","componentWillUpdate",657390932),Gg=new W(null,"getInitialState","getInitialState",1541760916),Hg=new W(null,"opts","opts",155075701),Ig=new W("om.core","index","om.core/index",-1724175434),Jg=new W(null,"shared","shared",-384145993),Kg=
new W(null,"raf","raf",-1295410152),Lg=new W(null,"componentDidMount","componentDidMount",955710936),Mg=new W("om.core","invalid","om.core/invalid",1948827993),Ng=new W(null,"pdf_height","pdf_height",-1452681767),Og=new W(null,"tag","tag",-1290361223),Pg=new W(null,"target","target",253001721),Qg=new W(null,"getDisplayName","getDisplayName",1324429466),Nf=new W(null,"alt-impl","alt-impl",670969595),Rg=new W(null,"componentWillMount","componentWillMount",-285327619),Sg=new W("om.core","defer","om.core/defer",
-1038866178),Tg=new W(null,"render-state","render-state",2053902270),Vg=new W(null,"tx-listen","tx-listen",119130367);function Wg(a,b){var c=function(){return React.createClass({render:function(){var b={};ja(b,this.props,{children:this.props.children,onChange:this.onChange,value:this.state.value});return a.c?a.c(b):a.call(null,b)},componentWillReceiveProps:function(a){return this.setState({value:a.value})},onChange:function(a){var b=this.props.onChange;if(null==b)return null;b.c?b.c(a):b.call(null,a);return this.setState({value:a.target.value})},getInitialState:function(){return{value:this.props.value}},getDisplayName:function(){return b}})}();
React.createFactory(c)}Wg(React.DOM.input,"input");Wg(React.DOM.textarea,"textarea");Wg(React.DOM.option,"option");function Xg(a,b){return React.render(a,b)};var Yg;for(var Zg=Array(1),$g=0;;)if($g<Zg.length)Zg[$g]=null,$g+=1;else break;(function ah(b){"undefined"===typeof Yg&&(Yg=function(b,d,e){this.oc=b;this.pc=d;this.vc=e;this.o=0;this.j=393216},Yg.prototype.C=function(){return this.vc},Yg.prototype.F=function(b,d){return new Yg(this.oc,this.pc,d)},Yg.La=!0,Yg.Ka="cljs.core.async/t33720",Yg.Oa=function(b,d){return C(d,"cljs.core.async/t33720")});return new Yg(b,ah,Re)})(function(){return null});var bh;a:{var ch=aa.navigator;if(ch){var dh=ch.userAgent;if(dh){bh=dh;break a}}bh=""};var eh=-1!=bh.indexOf("Opera")||-1!=bh.indexOf("OPR"),fh=-1!=bh.indexOf("Trident")||-1!=bh.indexOf("MSIE"),gh=-1!=bh.indexOf("Gecko")&&-1==bh.toLowerCase().indexOf("webkit")&&!(-1!=bh.indexOf("Trident")||-1!=bh.indexOf("MSIE")),hh=-1!=bh.toLowerCase().indexOf("webkit");function ih(){var a=aa.document;return a?a.documentMode:void 0}
var jh=function(){var a="",b;if(eh&&aa.opera)return a=aa.opera.version,"function"==q(a)?a():a;gh?b=/rv\:([^\);]+)(\)|;)/:fh?b=/\b(?:MSIE|rv)[: ]([^\);]+)(\)|;)/:hh&&(b=/WebKit\/(\S+)/);b&&(a=(a=b.exec(bh))?a[1]:"");return fh&&(b=ih(),b>parseFloat(a))?String(b):a}(),kh={};
function lh(a){if(!kh[a]){for(var b=0,c=String(jh).replace(/^[\s\xa0]+|[\s\xa0]+$/g,"").split("."),d=String(a).replace(/^[\s\xa0]+|[\s\xa0]+$/g,"").split("."),e=Math.max(c.length,d.length),f=0;0==b&&f<e;f++){var h=c[f]||"",k=d[f]||"",l=RegExp("(\\d*)(\\D*)","g"),m=RegExp("(\\d*)(\\D*)","g");do{var n=l.exec(h)||["","",""],p=m.exec(k)||["","",""];if(0==n[0].length&&0==p[0].length)break;b=fa(0==n[1].length?0:parseInt(n[1],10),0==p[1].length?0:parseInt(p[1],10))||fa(0==n[2].length,0==p[2].length)||fa(n[2],
p[2])}while(0==b)}kh[a]=0<=b}}var mh=aa.document,nh=mh&&fh?ih()||("CSS1Compat"==mh.compatMode?parseInt(jh,10):5):void 0;var oh;if(!(oh=!gh&&!fh)){var ph;if(ph=fh)ph=fh&&9<=nh;oh=ph}oh||gh&&lh("1.9.1");fh&&lh("9");function qh(){}qh.Eb=function(){return qh.Fb?qh.Fb:qh.Fb=new qh};qh.prototype.Gb=0;var rh=null,sh=null,th=null,uh=null,vh=null,wh={},xh=function xh(b){if(b?b.Bc:b)return b.Bc(b);var c;c=xh[q(null==b?null:b)];if(!c&&(c=xh._,!c))throw v("IDisplayName.display-name",b);return c.call(null,b)},yh={},zh=function zh(b){if(b?b.Dc:b)return b.Dc(b);var c;c=zh[q(null==b?null:b)];if(!c&&(c=zh._,!c))throw v("IInitState.init-state",b);return c.call(null,b)},Ah={},Bh=function Bh(b,c,d){if(b?b.Lc:b)return b.Lc(b,c,d);var e;e=Bh[q(null==b?null:b)];if(!e&&(e=Bh._,!e))throw v("IShouldUpdate.should-update",
b);return e.call(null,b,c,d)},Ch={},Dh=function Dh(b){if(b?b.Pc:b)return b.Pc(b);var c;c=Dh[q(null==b?null:b)];if(!c&&(c=Dh._,!c))throw v("IWillMount.will-mount",b);return c.call(null,b)},Eh={},Fh=function Fh(b){if(b?b.Ib:b)return b.Ib();var c;c=Fh[q(null==b?null:b)];if(!c&&(c=Fh._,!c))throw v("IDidMount.did-mount",b);return c.call(null,b)},Gh={},Hh=function Hh(b){if(b?b.Sc:b)return b.Sc(b);var c;c=Hh[q(null==b?null:b)];if(!c&&(c=Hh._,!c))throw v("IWillUnmount.will-unmount",b);return c.call(null,
b)},Ih={},Jh=function Jh(b,c,d){if(b?b.Uc:b)return b.Uc(b,c,d);var e;e=Jh[q(null==b?null:b)];if(!e&&(e=Jh._,!e))throw v("IWillUpdate.will-update",b);return e.call(null,b,c,d)},Kh={},Lh=function Lh(b,c,d){if(b?b.Ac:b)return b.Ac(b,c,d);var e;e=Lh[q(null==b?null:b)];if(!e&&(e=Lh._,!e))throw v("IDidUpdate.did-update",b);return e.call(null,b,c,d)},Mh={},Nh=function Nh(b,c){if(b?b.Qc:b)return b.Qc(b,c);var d;d=Nh[q(null==b?null:b)];if(!d&&(d=Nh._,!d))throw v("IWillReceiveProps.will-receive-props",b);return d.call(null,
b,c)},Oh={},Ph=function Ph(b){if(b?b.Ta:b)return b.Ta(b);var c;c=Ph[q(null==b?null:b)];if(!c&&(c=Ph._,!c))throw v("IRender.render",b);return c.call(null,b)},Qh={},Rh=function Rh(b,c,d){if(b?b.Ic:b)return b.Ic(b,c,d);var e;e=Rh[q(null==b?null:b)];if(!e&&(e=Rh._,!e))throw v("IRenderProps.render-props",b);return e.call(null,b,c,d)},Sh={},Th=function Th(b,c){if(b?b.Kc:b)return b.Kc(b,c);var d;d=Th[q(null==b?null:b)];if(!d&&(d=Th._,!d))throw v("IRenderState.render-state",b);return d.call(null,b,c)},Uh=
{},Vh={},Wh=function Wh(b,c,d,e,f){if(b?b.Gc:b)return b.Gc(b,c,d,e,f);var h;h=Wh[q(null==b?null:b)];if(!h&&(h=Wh._,!h))throw v("IOmSwap.-om-swap!",b);return h.call(null,b,c,d,e,f)},Xh=function Xh(){switch(arguments.length){case 1:return Xh.c(arguments[0]);case 2:return Xh.d(arguments[0],arguments[1]);default:throw Error([w("Invalid arity: "),w(arguments.length)].join(""));}};
Xh.c=function(a){if(a?a.Lb:a)return a.Lb(a);var b;b=Xh[q(null==a?null:a)];if(!b&&(b=Xh._,!b))throw v("IGetState.-get-state",a);return b.call(null,a)};Xh.d=function(a,b){if(a?a.Mb:a)return a.Mb(a,b);var c;c=Xh[q(null==a?null:a)];if(!c&&(c=Xh._,!c))throw v("IGetState.-get-state",a);return c.call(null,a,b)};Xh.G=2;
var Yh=function Yh(){switch(arguments.length){case 1:return Yh.c(arguments[0]);case 2:return Yh.d(arguments[0],arguments[1]);default:throw Error([w("Invalid arity: "),w(arguments.length)].join(""));}};Yh.c=function(a){if(a?a.Jb:a)return a.Jb(a);var b;b=Yh[q(null==a?null:a)];if(!b&&(b=Yh._,!b))throw v("IGetRenderState.-get-render-state",a);return b.call(null,a)};
Yh.d=function(a,b){if(a?a.Kb:a)return a.Kb(a,b);var c;c=Yh[q(null==a?null:a)];if(!c&&(c=Yh._,!c))throw v("IGetRenderState.-get-render-state",a);return c.call(null,a,b)};Yh.G=2;
var Zh=function Zh(b){if(b?b.Rb:b)return b.Rb(b);var c;c=Zh[q(null==b?null:b)];if(!c&&(c=Zh._,!c))throw v("IRenderQueue.-get-queue",b);return c.call(null,b)},$h=function $h(b,c){if(b?b.Sb:b)return b.Sb(b,c);var d;d=$h[q(null==b?null:b)];if(!d&&(d=$h._,!d))throw v("IRenderQueue.-queue-render!",b);return d.call(null,b,c)},ai=function ai(b){if(b?b.Qb:b)return b.Qb(b);var c;c=ai[q(null==b?null:b)];if(!c&&(c=ai._,!c))throw v("IRenderQueue.-empty-queue!",b);return c.call(null,b)},bi=function bi(b){if(b?
b.Wb:b)return b.value;var c;c=bi[q(null==b?null:b)];if(!c&&(c=bi._,!c))throw v("IValue.-value",b);return c.call(null,b)};bi._=function(a){return a};
var ci={},di=function di(b){if(b?b.kb:b)return b.kb(b);var c;c=di[q(null==b?null:b)];if(!c&&(c=di._,!c))throw v("ICursor.-path",b);return c.call(null,b)},ei=function ei(b){if(b?b.lb:b)return b.lb(b);var c;c=ei[q(null==b?null:b)];if(!c&&(c=ei._,!c))throw v("ICursor.-state",b);return c.call(null,b)},fi={},gi=function gi(){switch(arguments.length){case 2:return gi.d(arguments[0],arguments[1]);case 3:return gi.h(arguments[0],arguments[1],arguments[2]);default:throw Error([w("Invalid arity: "),w(arguments.length)].join(""));
}};gi.d=function(a,b){if(a?a.Mc:a)return a.Mc(a,b);var c;c=gi[q(null==a?null:a)];if(!c&&(c=gi._,!c))throw v("IToCursor.-to-cursor",a);return c.call(null,a,b)};gi.h=function(a,b,c){if(a?a.Nc:a)return a.Nc(a,b,c);var d;d=gi[q(null==a?null:a)];if(!d&&(d=gi._,!d))throw v("IToCursor.-to-cursor",a);return d.call(null,a,b,c)};gi.G=3;var hi=function hi(b,c,d,e){if(b?b.xc:b)return b.xc(b,c,d,e);var f;f=hi[q(null==b?null:b)];if(!f&&(f=hi._,!f))throw v("ICursorDerive.-derive",b);return f.call(null,b,c,d,e)};
hi._=function(a,b,c,d){return ii?ii(b,c,d):ji.call(null,b,c,d)};function ki(a){return di(a)}
var li={},mi=function mi(b,c,d,e){if(b?b.mb:b)return b.mb(b,c,d,e);var f;f=mi[q(null==b?null:b)];if(!f&&(f=mi._,!f))throw v("ITransact.-transact!",b);return f.call(null,b,c,d,e)},ni={},oi=function oi(b,c,d){if(b?b.Nb:b)return b.Nb(b,c,d);var e;e=oi[q(null==b?null:b)];if(!e&&(e=oi._,!e))throw v("INotify.-listen!",b);return e.call(null,b,c,d)},pi=function pi(b,c){if(b?b.Pb:b)return b.Pb(b,c);var d;d=pi[q(null==b?null:b)];if(!d&&(d=pi._,!d))throw v("INotify.-unlisten!",b);return d.call(null,b,c)},qi=
function qi(b,c,d){if(b?b.Ob:b)return b.Ob(b,c,d);var e;e=qi[q(null==b?null:b)];if(!e&&(e=qi._,!e))throw v("INotify.-notify!",b);return e.call(null,b,c,d)},ri=function ri(b,c,d,e){if(b?b.Vb:b)return b.Vb(b,c,d,e);var f;f=ri[q(null==b?null:b)];if(!f&&(f=ri._,!f))throw v("IRootProperties.-set-property!",b);return f.call(null,b,c,d,e)},si=function si(b,c){if(b?b.Ub:b)return b.Ub(b,c);var d;d=si[q(null==b?null:b)];if(!d&&(d=si._,!d))throw v("IRootProperties.-remove-properties!",b);return d.call(null,
b,c)},ti=function ti(b,c,d){if(b?b.Tb:b)return b.Tb(b,c,d);var e;e=ti[q(null==b?null:b)];if(!e&&(e=ti._,!e))throw v("IRootProperties.-get-property",b);return e.call(null,b,c,d)},ui=function ui(b,c){if(b?b.Hb:b)return b.Hb(b,c);var d;d=ui[q(null==b?null:b)];if(!d&&(d=ui._,!d))throw v("IAdapt.-adapt",b);return d.call(null,b,c)};ui._=function(a,b){return b};
var vi=function vi(b,c){if(b?b.Fc:b)return b.Fc(b,c);var d;d=vi[q(null==b?null:b)];if(!d&&(d=vi._,!d))throw v("IOmRef.-remove-dep!",b);return d.call(null,b,c)};
function wi(a,b,c,d,e){var f=O.c?O.c(a):O.call(null,a),h=be(ki.c?ki.c(b):ki.call(null,b),c);c=(a?r(r(null)?null:a.vd)||(a.D?0:t(Vh,a)):t(Vh,a))?Wh(a,b,c,d,e):Vc(h)?E.d(a,d):E.r(a,fe,h,d);if(oc.d(c,Sg))return null;a=new ra(null,5,[Yf,h,rg,ce(f,h),$f,ce(O.c?O.c(a):O.call(null,a),h),Xf,f,fg,O.c?O.c(a):O.call(null,a)],null);return null!=e?(e=U.h(a,Og,e),xi.d?xi.d(b,e):xi.call(null,b,e)):xi.d?xi.d(b,a):xi.call(null,b,a)}function yi(a){return a?r(r(null)?null:a.ub)?!0:a.D?!1:t(ci,a):t(ci,a)}
function zi(a){var b=a.props.children;return fd(b)?a.props.children=b.c?b.c(a):b.call(null,a):b}function Ai(a){if(!r(a.isOmComponent))throw Error([w("Assert failed: "),w(Qf(Q([sd(new D(null,"component?","component?",2048315517,null),new D(null,"x","x",-555367584,null))],0)))].join(""));return a.props.__om_cursor}
function Bi(a){if(!r(a.isOmComponent))throw Error([w("Assert failed: "),w(Qf(Q([sd(new D(null,"component?","component?",2048315517,null),new D(null,"owner","owner",1247919588,null))],0)))].join(""));return Xh.c(a)}function Ci(){var a=rh;return null==a?null:a.props.__om_shared}function Di(a){a=a.state;var b=a.__om_pending_state;return r(b)?(a.__om_prev_state=a.__om_state,a.__om_state=b,a.__om_pending_state=null,a):null}
function Gi(a,b){var c=r(b)?b:a.props,d=c.__om_state;if(r(d)){var e=a.state,f=e.__om_pending_state;e.__om_pending_state=yf.m(Q([r(f)?f:e.__om_state,d],0));c.__om_state=null}}function Hi(a){a=a.state;var b=a.__om_refs;return 0===R(b)?null:a.__om_refs=be(Cf,ae(ya,X.d(function(){return function(a){var b=bi(a),e=ei(a),f=ki.c?ki.c(a):ki.call(null,a),h=de(O.c?O.c(e):O.call(null,e),f,cg);Nd(b,cg)?Nd(b,h)&&(b=ii?ii(h,e,f):ji.call(null,h,e,f),a=ui(a,b)):a=null;return a}}(a,b),b)))}
var Ji=Nc([dg,ng,xg,yg,Ag,Cg,Fg,Gg,Lg,Qg,Rg],[function(a){var b=zi(this);if(b?r(r(null)?null:b.zc)||(b.D?0:t(Kh,b)):t(Kh,b)){var c=this.state;a=Ai({isOmComponent:!0,props:a});var d=c.__om_prev_state;Lh(b,a,r(d)?d:c.__om_state)}return this.state.__om_prev_state=null},!0,function(){var a=zi(this);(a?r(r(null)?null:a.Rc)||(a.D?0:t(Gh,a)):t(Gh,a))&&Hh(a);if(a=J(this.state.__om_refs))for(var a=J(a),b=null,c=0,d=0;;)if(d<c){var e=b.w(null,d);Ii.d?Ii.d(this,e):Ii.call(null,this,e);d+=1}else if(a=J(a))$c(a)?
(c=Qb(a),a=Rb(a),b=c,c=R(c)):(b=e=L(a),Ii.d?Ii.d(this,b):Ii.call(null,this,b),a=M(a),b=null,c=0),d=0;else return null;else return null},function(a){var b=zi(this);return(b?r(r(null)?null:b.Gd)||(b.D?0:t(Mh,b)):t(Mh,b))?Nh(b,Ai({isOmComponent:!0,props:a})):null},function(a){var b=this,c=b.props,d=b.state,e=zi(b);Gi(b,a);if(e?r(r(null)?null:e.Ed)||(e.D?0:t(Ah,e)):t(Ah,e))return Bh(e,Ai({isOmComponent:!0,props:a}),Xh.c(b));var f=c.__om_cursor,h=a.__om_cursor;return Nd(bi(f),bi(h))?!0:r(function(){var a=
yi(f);return r(a)?(a=yi(h),r(a)?Nd(di(f),di(h)):a):a}())?!0:Nd(Xh.c(b),Yh.c(b))?!0:r(function(){var a=0!==R(d.__om_refs);return a?Pd(function(){return function(a){var b=bi(a),c;c=ei(a);c=O.c?O.c(c):O.call(null,c);a=de(c,ki.c?ki.c(a):ki.call(null,a),cg);return Nd(b,a)}}(a,f,h,c,d,e,b),d.__om_refs):a}())?!0:c.__om_index!==a.__om_index?!0:!1},function(){var a=zi(this),b=this.props,c=rh,d=uh,e=sh,f=th,h=vh;rh=this;uh=b.__om_app_state;sh=b.__om_instrument;th=b.__om_descriptor;vh=b.__om_root_key;try{return(a?
r(r(null)?null:a.Sa)||(a.D?0:t(Oh,a)):t(Oh,a))?Ph(a):(a?r(r(null)?null:a.Hc)||(a.D?0:t(Qh,a)):t(Qh,a))?Rh(a,b.__om_cursor,Bi(this)):(a?r(r(null)?null:a.Jc)||(a.D?0:t(Sh,a)):t(Sh,a))?Th(a,Bi(this)):a}finally{vh=h,th=f,sh=e,uh=d,rh=c}},function(a){var b=zi(this);(b?r(r(null)?null:b.Tc)||(b.D?0:t(Ih,b)):t(Ih,b))&&Jh(b,Ai({isOmComponent:!0,props:a}),Xh.c(this));Di(this);return Hi(this)},function(){var a=zi(this),b=this.props,c;c=b.__om_init_state;c=r(c)?c:Re;var d=jg.c(c),a={__om_state:yf.m(Q([(a?r(r(null)?
null:a.Cc)||(a.D?0:t(yh,a)):t(yh,a))?zh(a):null,Oc.d(c,jg)],0)),__om_id:r(d)?d:":"+(qh.Eb().Gb++).toString(36)};b.__om_init_state=null;return a},function(){var a=zi(this);return(a?r(r(null)?null:a.yc)||(a.D?0:t(Eh,a)):t(Eh,a))?Fh(a):null},function(){var a=zi(this);return(a?r(r(null)?null:a.rd)||(a.D?0:t(wh,a)):t(wh,a))?xh(a):null},function(){Gi(this,null);var a=zi(this);(a?r(r(null)?null:a.Oc)||(a.D?0:t(Ch,a)):t(Ch,a))&&Dh(a);return Di(this)}]),Ki=function(a){a.ud=!0;a.Lb=function(){return function(){var a=
this.state,c=a.__om_pending_state;return r(c)?c:a.__om_state}}(a);a.Mb=function(){return function(a,c){return ce(Xh.c(this),c)}}(a);a.sd=!0;a.Jb=function(){return function(){return this.state.__om_state}}(a);a.Kb=function(){return function(a,c){return ce(Yh.c(this),c)}}(a);a.Bd=!0;a.Cd=function(){return function(a,c,d){a=this.props.__om_app_state;this.state.__om_pending_state=c;c=null!=a;return r(c?d:c)?$h(a,this):null}}(a);a.Dd=function(){return function(a,c,d,e){var f=this.props;a=this.state;var h=
Xh.c(this),f=f.__om_app_state;a.__om_pending_state=ee(h,c,d);c=null!=f;return r(c?e:c)?$h(f,this):null}}(a);return a}(Wf(Ji));function Li(a){a=a._rootNodeID;if(!r(a))throw Error([w("Assert failed: "),w(Qf(Q([new D(null,"id","id",252129435,null)],0)))].join(""));return a}function Mi(a){return a.props.__om_app_state}
function Ni(a){var b=Mi(a);a=new Y(null,2,5,we,[Zf,Li(a)],null);var c=ce(O.c?O.c(b):O.call(null,b),a);return r(wg.c(c))?E.r(b,fe,a,function(){return function(a){return Oc.d(U.h(U.h(a,Eg,Tg.c(a)),Tg,yf.m(Q([Tg.c(a),wg.c(a)],0))),wg)}}(b,a,c)):null}
U.m(Ji,Gg,function(){var a=zi(this),b=this.props,c=function(){var a=b.__om_init_state;return r(a)?a:Re}(),d=function(){var a=jg.c(c);return r(a)?a:":"+(qh.Eb().Gb++).toString(36)}(),a=yf.m(Q([Oc.d(c,jg),(a?r(r(null)?null:a.Cc)||(a.D?0:t(yh,a)):t(yh,a))?zh(a):null],0)),e=new Y(null,3,5,we,[Zf,Li(this),Tg],null);b.__om_init_state=null;E.r(Mi(this),ee,e,a);return{__om_id:d}},Q([Rg,function(){Gi(this,null);var a=zi(this);(a?r(r(null)?null:a.Oc)||(a.D?0:t(Ch,a)):t(Ch,a))&&Dh(a);return Ni(this)},xg,function(){var a=
zi(this);(a?r(r(null)?null:a.Rc)||(a.D?0:t(Gh,a)):t(Gh,a))&&Hh(a);E.m(Mi(this),fe,new Y(null,1,5,we,[Zf],null),Oc,Q([Li(this)],0));if(a=J(this.state.__om_refs))for(var a=J(a),b=null,c=0,d=0;;)if(d<c){var e=b.w(null,d);Ii.d?Ii.d(this,e):Ii.call(null,this,e);d+=1}else if(a=J(a))$c(a)?(c=Qb(a),a=Rb(a),b=c,c=R(c)):(b=e=L(a),Ii.d?Ii.d(this,b):Ii.call(null,this,b),a=M(a),b=null,c=0),d=0;else return null;else return null},Fg,function(a){var b=zi(this);(b?r(r(null)?null:b.Tc)||(b.D?0:t(Ih,b)):t(Ih,b))&&Jh(b,
Ai({isOmComponent:!0,props:a}),Xh.c(this));Ni(this);return Hi(this)},dg,function(a){var b=zi(this),c=Mi(this),d=ce(O.c?O.c(c):O.call(null,c),new Y(null,2,5,we,[Zf,Li(this)],null)),e=new Y(null,2,5,we,[Zf,Li(this)],null);if(b?r(r(null)?null:b.zc)||(b.D?0:t(Kh,b)):t(Kh,b)){a=Ai({isOmComponent:!0,props:a});var f;f=Eg.c(d);f=r(f)?f:Tg.c(d);Lh(b,a,f)}return r(Eg.c(d))?E.m(c,fe,e,Oc,Q([Eg],0)):null}],0));function Oi(a,b,c){this.value=a;this.state=b;this.path=c;this.j=2163640079;this.o=8192}g=Oi.prototype;
g.v=function(a,b){return z.h(this,b,null)};g.t=function(a,b,c){a=z.h(this.value,b,cg);return oc.d(a,cg)?c:hi(this,a,this.state,Ic.d(this.path,b))};g.I=function(a,b,c){return Gb(this.value,b,c)};g.ub=!0;g.kb=function(){return this.path};g.lb=function(){return this.state};g.C=function(){return Tc(this.value)};g.ba=function(){return new Oi(this.value,this.state,this.path)};g.N=function(){return Ua(this.value)};g.K=function(){return gc(this.value)};
g.n=function(a,b){return r(yi(b))?oc.d(this.value,bi(b)):oc.d(this.value,b)};g.Wb=function(){return this.value};g.O=function(){return new Oi(Kc(this.value),this.state,this.path)};g.gb=function(a,b){return new Oi(kb(this.value,b),this.state,this.path)};g.vb=!0;g.mb=function(a,b,c,d){return wi(this.state,this,b,c,d)};g.Va=function(a,b){return eb(this.value,b)};g.Ja=function(a,b,c){return new Oi(fb(this.value,b,c),this.state,this.path)};
g.M=function(){var a=this;return 0<R(a.value)?X.d(function(b){return function(c){var d=S(c,0);c=S(c,1);return new Y(null,2,5,we,[d,hi(b,c,a.state,Ic.d(a.path,d))],null)}}(this),a.value):null};g.F=function(a,b){return new Oi(Sc(this.value,b),this.state,this.path)};g.L=function(a,b){return new Oi(Ya(this.value,b),this.state,this.path)};
g.call=function(){var a=null,a=function(a,c,d){switch(arguments.length){case 2:return this.v(null,c);case 3:return this.t(null,c,d)}throw Error("Invalid arity: "+arguments.length);};a.d=function(a,c){return this.v(null,c)};a.h=function(a,c,d){return this.t(null,c,d)};return a}();g.apply=function(a,b){return this.call.apply(this,[this].concat(Fa(b)))};g.c=function(a){return this.v(null,a)};g.d=function(a,b){return this.t(null,a,b)};
g.Wa=function(){var a=de,b;b=this.state;b=O.c?O.c(b):O.call(null,b);return a(b,this.path,Mg)};function Pi(a,b,c){this.value=a;this.state=b;this.path=c;this.j=2180424479;this.o=8192}g=Pi.prototype;g.v=function(a,b){return y.h(this,b,null)};g.t=function(a,b,c){return y.h(this,b,c)};g.w=function(a,b){return hi(this,y.d(this.value,b),this.state,Ic.d(this.path,b))};g.$=function(a,b,c){return b<Ua(this.value)?hi(this,y.h(this.value,b,c),this.state,Ic.d(this.path,b)):c};
g.I=function(a,b,c){return Gb(this.value,b,c)};g.ub=!0;g.kb=function(){return this.path};g.lb=function(){return this.state};g.C=function(){return Tc(this.value)};g.ba=function(){return new Pi(this.value,this.state,this.path)};g.N=function(){return Ua(this.value)};g.K=function(){return gc(this.value)};g.n=function(a,b){return r(yi(b))?oc.d(this.value,bi(b)):oc.d(this.value,b)};g.Wb=function(){return this.value};g.O=function(){return new Pi(Kc(this.value),this.state,this.path)};g.vb=!0;
g.mb=function(a,b,c,d){return wi(this.state,this,b,c,d)};g.Va=function(a,b){return eb(this.value,b)};g.Ja=function(a,b,c){return hi(this,rb(this.value,b,c),this.state,this.path)};g.M=function(){var a=this;return 0<R(a.value)?X.h(function(b){return function(c,d){return hi(b,c,a.state,Ic.d(a.path,d))}}(this),a.value,new Ef(null,0,Number.MAX_VALUE,1,null)):null};g.F=function(a,b){return new Pi(Sc(this.value,b),this.state,this.path)};g.L=function(a,b){return new Pi(Ya(this.value,b),this.state,this.path)};
g.call=function(){var a=null,a=function(a,c,d){switch(arguments.length){case 2:return this.v(null,c);case 3:return this.t(null,c,d)}throw Error("Invalid arity: "+arguments.length);};a.d=function(a,c){return this.v(null,c)};a.h=function(a,c,d){return this.t(null,c,d)};return a}();g.apply=function(a,b){return this.call.apply(this,[this].concat(Fa(b)))};g.c=function(a){return this.v(null,a)};g.d=function(a,b){return this.t(null,a,b)};
g.Wa=function(){var a=de,b;b=this.state;b=O.c?O.c(b):O.call(null,b);return a(b,this.path,Mg)};function Qi(a,b,c){var d=Ra(a);d.bc=!0;d.n=function(){return function(b,c){return r(yi(c))?oc.d(a,bi(c)):oc.d(a,c)}}(d);d.vb=!0;d.mb=function(){return function(a,c,d,k){return wi(b,this,c,d,k)}}(d);d.ub=!0;d.kb=function(){return function(){return c}}(d);d.lb=function(){return function(){return b}}(d);d.gd=!0;d.Wa=function(){return function(){return de(O.c?O.c(b):O.call(null,b),c,Mg)}}(d);return d}
function ji(){switch(arguments.length){case 1:return ii(arguments[0],null,Jc);case 2:return ii(arguments[0],arguments[1],Jc);case 3:return ii(arguments[0],arguments[1],arguments[2]);default:throw Error([w("Invalid arity: "),w(arguments.length)].join(""));}}function ii(a,b,c){return r(yi(a))?a:(a?r(r(null)?null:a.Fd)||(a.D?0:t(fi,a)):t(fi,a))?gi.h(a,b,c):Dc(a)?new Pi(a,b,c):Yc(a)?new Oi(a,b,c):(a?a.o&8192||a.Yb||(a.o?0:t(Pa,a)):t(Pa,a))?Qi(a,b,c):a}
function xi(a,b){var c=ei(a),d;d=O.c?O.c(c):O.call(null,c);d=ii(d,c,Jc);return qi(c,b,d)}var Ri=Sd?Sd(Re):Rd.call(null,Re);function Ii(a,b){var c=a.state,d=c.__om_refs;gd(d,b)&&(c.__om_refs=Uc.d(d,b));vi(b,a);return b}var Si=!1,Ti=Sd?Sd(Cf):Rd.call(null,Cf);
function Ui(a){Si=!1;for(var b=J(O.c?O.c(Ti):O.call(null,Ti)),c=null,d=0,e=0;;)if(e<d){var f=c.w(null,e);f.B?f.B():f.call(null);e+=1}else if(b=J(b))c=b,$c(c)?(b=Qb(c),e=Rb(c),c=b,d=R(b),b=e):(b=L(c),b.B?b.B():b.call(null),b=M(c),c=null,d=0),e=0;else break;null==a?a=null:(b=a.Vc,a=a.Vc=(r(b)?b:0)+1);return a}var Vi=Sd?Sd(Re):Rd.call(null,Re);
function Wi(a,b){var c;c=a?r(r(null)?null:a.Sa)?!0:a.D?!1:t(Oh,a):t(Oh,a);c||(c=(c=a?r(r(null)?null:a.Hc)?!0:a.D?!1:t(Qh,a):t(Qh,a))?c:a?r(r(null)?null:a.Jc)?!0:a.D?!1:t(Sh,a):t(Sh,a));if(!c)throw Error([w("Assert failed: "),w([w("Invalid Om component fn, "),w(b.name),w(" does not return valid instance")].join("")),w("\n"),w(Qf(Q([sd(new D(null,"or","or",1876275696,null),sd(new D(null,"satisfies?","satisfies?",-433227199,null),new D(null,"IRender","IRender",590822196,null),new D(null,"x","x",-555367584,
null)),sd(new D(null,"satisfies?","satisfies?",-433227199,null),new D(null,"IRenderProps","IRenderProps",2115139472,null),new D(null,"x","x",-555367584,null)),sd(new D(null,"satisfies?","satisfies?",-433227199,null),new D(null,"IRenderState","IRenderState",-897673898,null),new D(null,"x","x",-555367584,null)))],0)))].join(""));}function Xi(a,b){if(null==a.om$descriptor){var c;r(b)?c=b:(c=th,c=r(c)?c:Ki);c=React.createClass(c);c=React.createFactory(c);a.om$descriptor=c}return a.om$descriptor}
function Yi(a,b,c){if(!fd(a))throw Error([w("Assert failed: "),w(Qf(Q([sd(new D(null,"ifn?","ifn?",-2106461064,null),new D(null,"f","f",43394975,null))],0)))].join(""));if(null!=c&&!Yc(c))throw Error([w("Assert failed: "),w(Qf(Q([sd(new D(null,"or","or",1876275696,null),sd(new D(null,"nil?","nil?",1612038930,null),new D(null,"m","m",-1021758608,null)),sd(new D(null,"map?","map?",-1780568534,null),new D(null,"m","m",-1021758608,null)))],0)))].join(""));if(!r(Od(new Af(null,new ra(null,11,[bg,null,
eg,null,gg,null,ig,null,kg,null,ug,null,vg,null,Bg,null,Hg,null,Ig,null,Jg,null],null),null),Oe(c))))throw Error([w("Assert failed: "),w(Kd(w,"build options contains invalid keys, only :key, :key-fn :react-key, ",":fn, :init-state, :state, and :opts allowed, given ",$d(Oe(c)))),w("\n"),w(Qf(Q([sd(new D(null,"valid-opts?","valid-opts?",1000038576,null),new D(null,"m","m",-1021758608,null))],0)))].join(""));if(null==c){var d=Ci(),e=Xi(a,null),d={children:function(){return function(c){c=a.d?a.d(b,c):
a.call(null,b,c);Wi(c,a);return c}}(d,e),__om_instrument:sh,__om_descriptor:th,__om_app_state:uh,__om_root_key:vh,__om_shared:d,__om_cursor:b};return e.c?e.c(d):e.call(null,d)}var f=dd(c)?Id(Td,c):c,h=T(f,Hg),k=T(f,ug),l=T(f,vg),m=T(f,Bg),n=T(f,kg),p=T(c,eg),u=null!=p?function(){var a=Ig.c(c);return r(a)?p.d?p.d(b,a):p.call(null,b,a):p.c?p.c(b):p.call(null,b)}():b,x=null!=n?T(u,n):null!=m?m.c?m.c(u):m.call(null,u):T(c,ig),d=function(){var a=Jg.c(c);return r(a)?a:Ci()}(),e=Xi(a,bg.c(c)),B;B=r(x)?x:
void 0;d={__om_state:l,__om_instrument:sh,children:null==h?function(b,c,d,e,f,h,k,l,m){return function(b){b=a.d?a.d(m,b):a.call(null,m,b);Wi(b,a);return b}}(c,f,h,k,l,m,n,p,u,x,d,e):function(b,c,d,e,f,h,k,l,m){return function(b){b=a.h?a.h(m,b,d):a.call(null,m,b,d);Wi(b,a);return b}}(c,f,h,k,l,m,n,p,u,x,d,e),__om_init_state:k,key:B,__om_app_state:uh,__om_cursor:u,__om_index:Ig.c(c),__om_shared:d,__om_descriptor:th,__om_root_key:vh};return e.c?e.c(d):e.call(null,d)}
function Zi(a,b,c){if(!fd(a))throw Error([w("Assert failed: "),w(Qf(Q([sd(new D(null,"ifn?","ifn?",-2106461064,null),new D(null,"f","f",43394975,null))],0)))].join(""));if(null!=c&&!Yc(c))throw Error([w("Assert failed: "),w(Qf(Q([sd(new D(null,"or","or",1876275696,null),sd(new D(null,"nil?","nil?",1612038930,null),new D(null,"m","m",-1021758608,null)),sd(new D(null,"map?","map?",-1780568534,null),new D(null,"m","m",-1021758608,null)))],0)))].join(""));if(null!=sh){var d=sh.h?sh.h(a,b,c):sh.call(null,
a,b,c);return oc.d(d,sg)?Yi(a,b,c):d}return Yi(a,b,c)}
function $i(a,b,c){if(!(a?r(r(null)?null:a.Ec)||(a.D?0:t(ni,a)):t(ni,a))){var d=Sd?Sd(Re):Rd.call(null,Re),e=Sd?Sd(Re):Rd.call(null,Re),f=Sd?Sd(Cf):Rd.call(null,Cf);a.wd=!0;a.Rb=function(a,b,c,d){return function(){return O.c?O.c(d):O.call(null,d)}}(a,d,e,f);a.Sb=function(a,b,c,d){return function(a,b){if(gd(O.c?O.c(d):O.call(null,d),b))return null;E.h(d,Ic,b);return E.d(this,kd)}}(a,d,e,f);a.Qb=function(a,b,c,d){return function(){return E.d(d,Kc)}}(a,d,e,f);a.Ec=!0;a.Nb=function(a,b,c){return function(a,
b,d){null!=d&&E.r(c,U,b,d);return this}}(a,d,e,f);a.Pb=function(a,b,c){return function(a,b){E.h(c,Oc,b);return this}}(a,d,e,f);a.Ob=function(a,b,c){return function(a,b,d){a=J(O.c?O.c(c):O.call(null,c));for(var e=null,f=0,h=0;;)if(h<f){var k=e.w(null,h);S(k,0);var k=S(k,1),F=b,I=d;k.d?k.d(F,I):k.call(null,F,I);h+=1}else if(a=J(a))$c(a)?(f=Qb(a),a=Rb(a),e=f,f=R(f)):(e=L(a),S(e,0),e=S(e,1),f=b,h=d,e.d?e.d(f,h):e.call(null,f,h),a=M(a),e=null,f=0),h=0;else break;return this}}(a,d,e,f);a.zd=!0;a.Vb=function(a,
b){return function(a,c,d,e){return E.r(b,ee,new Y(null,2,5,we,[c,d],null),e)}}(a,d,e,f);a.Ad=function(a,b){return function(a,c,d){return E.r(b,Oc,c,d)}}(a,d,e,f);a.Ub=function(a,b){return function(a,c){return E.h(b,Oc,c)}}(a,d,e,f);a.Tb=function(a,b){return function(a,c,d){return ce(O.c?O.c(b):O.call(null,b),new Y(null,2,5,we,[c,d],null))}}(a,d,e,f)}return oi(a,b,c)}
var aj=function aj(b,c){if(r(yi(b))){var d=Ra(b);d.xd=!0;d.yd=function(){return function(){return c}}(d);d.qd=!0;d.Hb=function(){return function(d,f){return aj(ui(b,f),c)}}(d);d.Yb=!0;d.ba=function(){return function(){return aj(Ra(b),c)}}(d);return d}return b};
function bj(){var a=cj,b=Z,c=new ra(null,1,[Pg,document.querySelector("pdf-viewer")],null),d=dd(c)?Id(Td,c):c,e=T(d,Kg),f=T(d,pg),h=T(d,bg),k=T(d,gg),l=T(d,Yf),m=T(d,Vg),n=T(d,Pg);if(!fd(a))throw Error([w("Assert failed: "),w("First argument must be a function"),w("\n"),w(Qf(Q([sd(new D(null,"ifn?","ifn?",-2106461064,null),new D(null,"f","f",43394975,null))],0)))].join(""));if(null==n)throw Error([w("Assert failed: "),w("No target specified to om.core/root"),w("\n"),w(Qf(Q([sd(new D(null,"not","not",
1044554643,null),sd(new D(null,"nil?","nil?",1612038930,null),new D(null,"target","target",1893533248,null)))],0)))].join(""));var p=O.c?O.c(Vi):O.call(null,Vi);gd(p,n)&&T(p,n).call(null);null==jc&&(jc=Sd?Sd(0):Rd.call(null,0));var p=ic(),b=(b?b.o&16384||b.cd||(b.o?0:t(Tb,b)):t(Tb,b))?b:Sd?Sd(b):Rd.call(null,b),u=$i(b,p,m),x=r(f)?f:kd,B=Oc.m(d,Pg,Q([Vg,Yf,pg,Kg],0)),A=Sd?Sd(null):Rd.call(null,null),F=function(b,c,d,e,f,h,k,l,m,n,p,u,x,B,A,F){return function Qa(){E.h(Ti,Uc,Qa);var c=O.c?O.c(d):O.call(null,
d),k=function(){var a=aj(null==B?ii(c,d,Jc):ii(ce(c,B),d,B),b);return e.c?e.c(a):e.call(null,a)}();if(!r(ti(d,b,lg))){var l=Xg(function(){var c=th,e=sh,h=uh,l=vh;th=u;sh=x;uh=d;vh=b;try{return Zi(a,k,f)}finally{vh=l,uh=h,sh=e,th=c}}(),F);null==(O.c?O.c(h):O.call(null,h))&&(Vd.d?Vd.d(h,l):Vd.call(null,h,l))}l=Zh(d);ai(d);if(!Vc(l))for(var l=J(l),m=null,n=0,p=0;;)if(p<n){var A=m.w(null,p);if(r(A.isMounted())){var H=A.state.__om_next_cursor;r(H)&&(A.props.__om_cursor=H,A.state.__om_next_cursor=null);
r(function(){var a=zi(A);return(a=!(a?r(r(null)?null:a.wc)||(a.D?0:t(Uh,a)):t(Uh,a)))?a:A.shouldComponentUpdate(A.props,A.state)}())&&A.forceUpdate()}p+=1}else if(l=J(l)){m=l;if($c(m))l=Qb(m),p=Rb(m),m=l,n=R(l),l=p;else{var da=L(m);r(da.isMounted())&&(l=da.state.__om_next_cursor,r(l)&&(da.props.__om_cursor=l,da.state.__om_next_cursor=null),r(function(){var a=zi(da);return(a=!(a?r(r(null)?null:a.wc)||(a.D?0:t(Uh,a)):t(Uh,a)))?a:da.shouldComponentUpdate(da.props,da.state)}())&&da.forceUpdate());l=M(m);
m=null;n=0}p=0}else break;l=O.c?O.c(Ri):O.call(null,Ri);if(!Vc(l))for(l=J(l),m=null,p=n=0;;)if(p<n){H=m.w(null,p);S(H,0);for(var na=S(H,1),H=function(){var a=na;return O.c?O.c(a):O.call(null,a)}(),H=J(H),N=null,ga=0,ta=0;;)if(ta<ga){var yc=N.w(null,ta);S(yc,0);yc=S(yc,1);r(yc.shouldComponentUpdate(yc.props,yc.state))&&yc.forceUpdate();ta+=1}else if(H=J(H))$c(H)?(ga=Qb(H),H=Rb(H),N=ga,ga=R(ga)):(N=L(H),S(N,0),N=S(N,1),r(N.shouldComponentUpdate(N.props,N.state))&&N.forceUpdate(),H=M(H),N=null,ga=0),
ta=0;else break;p+=1}else if(l=J(l)){if($c(l))n=Qb(l),l=Rb(l),m=n,n=R(n);else{m=L(l);S(m,0);for(var Ei=S(m,1),m=function(){var a=Ei;return O.c?O.c(a):O.call(null,a)}(),m=J(m),n=null,H=p=0;;)if(H<p)N=n.w(null,H),S(N,0),N=S(N,1),r(N.shouldComponentUpdate(N.props,N.state))&&N.forceUpdate(),H+=1;else if(m=J(m))$c(m)?(p=Qb(m),m=Rb(m),n=p,p=R(p)):(n=L(m),S(n,0),n=S(n,1),r(n.shouldComponentUpdate(n.props,n.state))&&n.forceUpdate(),m=M(m),n=null,p=0),H=0;else break;l=M(l);m=null;n=0}p=0}else break;ri(d,b,
lg,!0);return O.c?O.c(h):O.call(null,h)}}(p,b,u,x,B,A,c,d,d,e,f,h,k,l,m,n);Sf(u,p,function(a,b,c,d,e,f,h,k,l,m,n,p,u,x,A,B,F){return function(Qa,gb,hb,vb){Ba(ti(c,a,zg))&&hb!==vb&&ri(c,a,lg,!1);ri(c,a,zg,!1);gd(O.c?O.c(Ti):O.call(null,Ti),h)||E.h(Ti,Ic,h);if(r(Si))return null;Si=!0;return!1===n||"undefined"===typeof requestAnimationFrame?setTimeout(function(a,b,c){return function(){return Ui(c)}}(a,b,c,d,e,f,h,k,l,m,n,p,u,x,A,B,F),16):Pc(n)?n.B?n.B():n.call(null):requestAnimationFrame(function(a,
b,c){return function(){return Ui(c)}}(a,b,c,d,e,f,h,k,l,m,n,p,u,x,A,B,F))}}(p,b,u,x,B,A,F,c,d,d,e,f,h,k,l,m,n));E.r(Vi,U,n,function(a,b,c,d,e,f,h,k,l,m,n,p,u,x,A,B,F){return function(){si(c,a);Jb(c,a);pi(c,a);E.h(Ti,Uc,h);E.h(Vi,Oc,F);return React.unmountComponentAtNode(F)}}(p,b,u,x,B,A,F,c,d,d,e,f,h,k,l,m,n));F()};var dj,ej,fj,gj,hj,ma=!1,la=function(){function a(a){var d=null;if(0<arguments.length){for(var d=0,e=Array(arguments.length-0);d<e.length;)e[d]=arguments[d+0],++d;d=new K(e,0)}return b.call(this,d)}function b(a){return console.log.apply(console,Ia?Ha(a):Ga.call(null,a))}a.G=0;a.J=function(a){a=J(a);return b(a)};a.m=b;return a}();
if("undefined"===typeof Z){var Z,ij=new ra(null,4,[tg,null,Dg,null,mg,null,qg,new ra(null,2,[og,new Y(null,1,5,we,[0],null),ag,new Y(null,1,5,we,[1],null)],null)],null);Z=Sd?Sd(ij):Rd.call(null,ij)}
function jj(){var a=tg.c(O.c?O.c(Z):O.call(null,Z)),b=ce(O.c?O.c(Z):O.call(null,Z),new Y(null,3,5,we,[qg,ag,0],null));return a.getPage(b).then(function(){return function(a){var b=Ng.c(O.c?O.c(Z):O.call(null,Z)),e=a.getViewport(1),b=a.getViewport(b/e.width*1.35),e=document.querySelector("pdf-viewer").querySelector("canvas").getContext("2d");return a.render({canvasContext:e,viewport:b})}}(a,b))}
function kj(a,b){var c=ce(a,new Y(null,2,5,we,[ag,0],null)),c=b.c?b.c(c):b.call(null,c),d=ce(O.c?O.c(Z):O.call(null,Z),new Y(null,3,5,we,[qg,og,0],null));if(r(0<c&&c<=d)){c=new Y(null,2,5,we,[ag,0],null);d=a?r(r(null)?null:a.vb)?!0:a.D?!1:t(li,a):t(li,a);if(!r(d))throw Error([w("Assert failed: "),w(Qf(Q([sd(new D(null,"transactable?","transactable?",780536292,null),new D(null,"cursor","cursor",-1642498285,null))],0)))].join(""));if(!fd(b))throw Error([w("Assert failed: "),w(Qf(Q([sd(new D(null,"ifn?",
"ifn?",-2106461064,null),new D(null,"f","f",43394975,null))],0)))].join(""));c=null==c?Jc:Xc(c)?c:new Y(null,1,5,we,[c],null);mi(a,c,b,null);return jj()}return null}
var lj=function lj(b,c){"undefined"===typeof dj&&(dj=function(b,c,f,h){this.Ba=b;this.cursor=c;this.Yc=f;this.qc=h;this.o=0;this.j=393216},dj.prototype.Sa=!0,dj.prototype.Ta=function(){var b=ce(this.cursor,new Y(null,2,5,we,[ag,0],null)),c=ce(this.cursor,new Y(null,2,5,we,[og,0],null)),b=[w(b),w(" of "),w(c)].join("");return React.DOM.span({className:"pageCount"},b)},dj.prototype.C=function(){return this.qc},dj.prototype.F=function(b,c){return new dj(this.Ba,this.cursor,this.Yc,c)},dj.La=!0,dj.Ka=
"pdf-viewer.core/t32437",dj.Oa=function(b,c){return C(c,"pdf-viewer.core/t32437")});return new dj(c,b,lj,Re)},mj=function mj(b,c){"undefined"===typeof ej&&(ej=function(b,c,f,h){this.Ba=b;this.cursor=c;this.Xc=f;this.rc=h;this.o=0;this.j=393216},ej.prototype.Sa=!0,ej.prototype.Ta=function(){var b=this,c=this,f=ce(b.cursor,new Y(null,2,5,we,[ag,0],null)),h={className:"navButtons"},k=function(){return React.DOM.button({onClick:function(){return function(){return kj(b.cursor,ld)}}(h,f,c)},"\x3c")}(),
l=function(){return React.DOM.button({onClick:function(){return function(){return kj(b.cursor,kc)}}(h,k,f,c)},"\x3e")}();return React.DOM.span(h,k,l)},ej.prototype.C=function(){return this.rc},ej.prototype.F=function(b,c){return new ej(this.Ba,this.cursor,this.Xc,c)},ej.La=!0,ej.Ka="pdf-viewer.core/t32452",ej.Oa=function(b,c){return C(c,"pdf-viewer.core/t32452")});return new ej(c,b,mj,Re)},nj=function nj(b,c){"undefined"===typeof fj&&(fj=function(b,c,f,h){this.Ba=b;this.cursor=c;this.Zc=f;this.sc=
h;this.o=0;this.j=393216},fj.prototype.Sa=!0,fj.prototype.Ta=function(){var b=Zi(mj,this.cursor,null),c=Zi(lj,this.cursor,null);return React.DOM.div({className:"navigation"},b,c)},fj.prototype.C=function(){return this.sc},fj.prototype.F=function(b,c){return new fj(this.Ba,this.cursor,this.Zc,c)},fj.La=!0,fj.Ka="pdf-viewer.core/t32468",fj.Oa=function(b,c){return C(c,"pdf-viewer.core/t32468")});return new fj(c,b,nj,Re)},oj=function oj(b,c){"undefined"===typeof gj&&(gj=function(b,c,f,h){this.Ba=b;this.cursor=
c;this.$c=f;this.tc=h;this.o=0;this.j=393216},gj.prototype.Sa=!0,gj.prototype.Ta=function(){var b={width:hg.c(O.c?O.c(Z):O.call(null,Z)),height:Ng.c(O.c?O.c(Z):O.call(null,Z))};return React.DOM.canvas(b)},gj.prototype.yc=!0,gj.prototype.Ib=function(){null!=mg.c(O.c?O.c(Z):O.call(null,Z))&&(Rf(),PDFJS.workerSrc=mg.c(O.c?O.c(Z):O.call(null,Z)));return PDFJS.getDocument(Dg.c(O.c?O.c(Z):O.call(null,Z))).then(function(b){return function(c){E.r(Z,U,tg,c);E.r(Z,fe,new Y(null,3,5,we,[qg,og,0],null),function(){return function(){return c.numPages}}(b));
return jj()}}(this))},gj.prototype.C=function(){return this.tc},gj.prototype.F=function(b,c){return new gj(this.Ba,this.cursor,this.$c,c)},gj.La=!0,gj.Ka="pdf-viewer.core/t32483",gj.Oa=function(b,c){return C(c,"pdf-viewer.core/t32483")});return new gj(c,b,oj,Re)},cj=function cj(b,c){"undefined"===typeof hj&&(hj=function(b,c,f,h){this.Ba=b;this.cursor=c;this.Wc=f;this.uc=h;this.o=0;this.j=393216},hj.prototype.Sa=!0,hj.prototype.Ta=function(){var b={style:{width:hg.c(O.c?O.c(Z):O.call(null,Z))},id:"om-root"},
c;c=this.cursor.c?this.cursor.c(qg):this.cursor.call(null,qg);c=Zi(nj,c,null);c=React.DOM.div({className:"menu"},c);var f=Zi(oj,this.cursor,null);return React.DOM.div(b,c,f)},hj.prototype.C=function(){return this.uc},hj.prototype.F=function(b,c){return new hj(this.Ba,this.cursor,this.Wc,c)},hj.La=!0,hj.Ka="pdf-viewer.core/t32502",hj.Oa=function(b,c){return C(c,"pdf-viewer.core/t32502")});return new hj(c,b,cj,Re)};function pj(a){return document.querySelector("pdf-viewer").getAttribute(a)}
function qj(){var a=Object.create(HTMLElement.prototype);a.public_method_1=function(){return function(){return console.log("I am a stub for a public API!")}}(a);a.createdCallback=function(a){return function(){return null==(O.c?O.c(Z):O.call(null,Z)).call(null,Dg)?(E.r(Z,fe,new Y(null,1,5,we,[Ng],null),function(){return function(){return pj("height")}}(a)),E.r(Z,fe,new Y(null,1,5,we,[hg],null),function(){return function(){return pj("width")}}(a)),E.r(Z,fe,new Y(null,1,5,we,[mg],null),function(){return function(){return pj("workerSrc")}}(a)),
E.r(Z,fe,new Y(null,1,5,we,[Dg],null),function(){return function(){return pj("src")}}(a))):null}}(a);new (document.registerElement("pdf-viewer",{prototype:a}))}null!=document.querySelector("pdf-viewer")&&(null==(O.c?O.c(Z):O.call(null,Z)).call(null,Dg)&&qj(),bj());