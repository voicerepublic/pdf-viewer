# `<pdf-viewer>`

This project gives you a new HTML tag `<pdf-viewer>` that can be configured
with the attributes `src`, `height` and `width`. Easy as that.

More specifically, this is a Web Component based on [HTML5 Custom
Element](https://w3c.github.io/webcomponents/spec/custom/) containing a
[React](http://facebook.github.io/react/) component providing a PDF
viewer based on [PDFjs](https://github.com/mozilla/pdf.js).  Since Custom
Elements are not yet [supported in all
browsers](http://caniuse.com/#feat=custom-elements), this project uses
[Webreflections
document-register-element](https://github.com/WebReflection/document-register-element)
library.

If that weren't enough trendy buzzwords, the whole thing is written in
[ClojureScript](http://github.com/clojure/clojurescript) employing
[Figwheel](https://github.com/bhauman/lein-figwheel) for an awesome development
experience. Also it's not actually written in React, but in
[OM](https://github.com/omcljs/om), a ClojureScript interface to React.

## Usage

There is a working demo in the folder `dist`. You can go there and serve the
folder locally(for example with `python -m SimpleHTTPServer`) for testing
purposes. Also you can use the assets in there and copy them to the project
where you might want to employ `pdf-viewer`.

To enable the `<pdf-viewer>` tag in your project, you need to include the
[pdf-viewer.js](dist/pdf-viewer.js) JavaScript file, preferably just before
your `</body>` element.

```html
<script src="pdf-viewer.js" type="text/javascript"></script>
```

Then, whereever you want to render a PDF viewer, insert the tag, configure the
link to your PDF and give it a width and height:

```html
<pdf-viewer src="your_pdf.pdf" height="480" width="640"></pdf-viewer>
```

Please note that you should have `pdf-viewer.worker.js` in the same directory
as `pdf-viewer.js`. If you do not fancy that, you can optionally set a
`workerSrc` attribute on `<pdf-viewer>` for the PDFjs worker.

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

![pdfjs component screenshot](https://github.com/munen/pdf-viewer/raw/master/screenshot.png "pdfjs component screenshot")

## Get Started

You only need to install one tool, the Clojure project automation project
[Leiningen](http://leiningen.org/).

* OSX
  * `brew install leiningen`

* Debian
  * `apt-get install leiningen`

Then clone this repository, `cd` into it and run `lein figwheel`. This will
download all dependencies(see `project.clj` file if you're interested) and
start a local webserver so that you can access the project on
`http://localhost:3449/`.

## Todos

  * [ ] Minify the PDFjs worker using Google Closure
  * [ ] Employ proper Clojure namespacing
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
