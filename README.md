# PDFjs Component

A [React](http://facebook.github.io/react/) component providing a convenient
PDF viewer based on [PDFjs](https://github.com/mozilla/pdf.js). Written in
[ClojureScript](http://github.com/clojure/clojurescript).

The component enables you to use a new HTML tag `x-pdf-component` that can be
configured with the attributes `src`, `height` and `width`. Easy as that.

## Usage

There is a working demo in the folder `dist`.

```html
<x-pdf-component src="your_pdf.pdf" height="480" width="640"></x-pdf-component>
<script src="pdfjs_component.js" type="text/javascript"></script>
```

Please note that you should have `pdfjs_component.worker.js` in the same
directory as `pdfjs_component.js`.

Optionally you can use the `style.css` file, or you might chose bring your own
stylesheet.

## Screenshot

![pdfjs component screenshot](https://github.com/munen/pdfjs_component/raw/master/screenshot.png "pdfjs component screenshot")

## Copyright and license

Copyright © 2015 Munen Alain M. Lafon

Licensed under the EPL (see the file epl.html)

Please note that PDFjs itself is licensed under Apache License  Version 2.
pdfjs\_component bundles PDFjs without any modifications.
