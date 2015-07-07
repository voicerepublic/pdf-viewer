# PDFjs Component

A Web Component based on [HTML5 Custom Element](https://w3c.github.io/webcomponents/spec/custom/)
containing a [React](http://facebook.github.io/react/) component providing a
convenient PDF viewer based on [PDFjs](https://github.com/mozilla/pdf.js).

If that weren't enough trendy buzzwords, the whole thing is written in
[ClojureScript](http://github.com/clojure/clojurescript) employing
[Figwheel](https://github.com/bhauman/lein-figwheel) for an awesome development
experience.

The Custom Element Web Component enables using a new HTML tag `pdf-viewer`
that can be configured with the attributes `src`, `height` and `width`. Easy as
that.

## Usage

There is a working demo in the folder `dist`.

```html
<pdf-viewer src="your_pdf.pdf" height="480" width="640"></pdf-viewer>
<script src="pdfjs_component.js" type="text/javascript"></script>
```

Please note that you should have `pdfjs_component.worker.js` in the same
directory as `pdfjs_component.js`.

Optionally you can use the `style.css` file, or you might chose bring your own
style sheet.

### API

The Web Components' API can be customised. Soon this will enable calling the
component from the outside to flick through pages. Right now there's only a
stubbed method that can be called like this:

```javascript
document.querySelector("pdf-viewer").public_method_1()
```

## Screenshot

![pdfjs component screenshot](https://github.com/munen/pdfjs_component/raw/master/screenshot.png "pdfjs component screenshot")

## Todos

  * [ ] Observe current_page state change instead of explicit render
  * [ ] Use `core.async` for switching pages
  * [ ] Write a public API for switching pages employing `core.async`
  * [ ] Use the current scope of `.createdCallback` to read the attributes of
        the component instead of `get-attr`

## Copyright and license

Copyright © 2015 Munen Alain M. Lafon

Licensed under the EPL (see the file epl.html)

Please note that PDFjs itself is licensed under Apache License  Version 2.
pdfjs\_component bundles PDFjs without any modifications.
