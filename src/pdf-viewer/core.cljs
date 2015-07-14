(ns ^:figwheel-always pdf-viewer.core
  (:require-macros [cljs.core.async.macros :refer [go]])
  (:require [om.core :as om]
            [om.dom :as dom]
            [cljs.core.async :refer [put! chan <! timeout]]
            [pdfjs]
            [cljsjs.document-register-element]))

(enable-console-print!)

(defonce app-state (atom {:pdf nil
                          :pdf_url nil
                          :pdf_workerSrc nil
                          :navigation {:page_count [0]
                                       :current_page [1]}}))

;; empirically determined magic factor to remove white space below pdf
(def height-factor 1.13)

; PDFjs helper functions
; TODO: Do the grunt work only once instead of on every render
(defn render-page []
  (let [pdf (:pdf @app-state)
        current_page (get-in @app-state [:navigation :current_page 0])]
    (.then (.getPage pdf current_page)
           (fn [page]
             (let [desiredWidth (:pdf_width @app-state)
                   viewport (.getViewport page 1)
                   height (.-height viewport)
                   width (.-width viewport)
                   scale (/ desiredWidth width)
                   scaledViewport (.getViewport page scale)
                   canvas (-> js/document
                              (.querySelector "pdf-viewer")
                              (.querySelector "canvas"))
                   context (.getContext canvas "2d")
                   renderContext (js-obj "canvasContext" context "viewport" scaledViewport)]
               ; TODO: Eval employing the renderTask promise of PDFjs
               (aset canvas "height" (/ height height-factor))
               (.render page renderContext))))))


; OM Component helper functions
(defn valid-page? [page-num]
  (let [page-count (get-in @app-state [:navigation :page_count 0])]
    (and (> page-num 0) (<= page-num page-count))))

(defn render-page-if-valid [cursor f]
  (let [current_page (get-in cursor [:current_page 0])]
    (if (valid-page? (f current_page))
      (do
        (om/transact! cursor [:current_page 0] f)
        (render-page)))))

; OM Components
(defn pdf-navigation-position [cursor owner]
  (reify
    om/IRender
    (render [this]
      (let [current_page (get-in cursor [:current_page 0])
            page_count (get-in cursor [:page_count 0])]
        (dom/span #js {:className "pageCount" }
                  (str current_page " of " page_count))))))

(defn pdf-navigation-buttons [cursor owner]
  (reify
    om/IRender
    (render [this]
      (let [current_page (get-in cursor [:current_page 0])]
        (dom/span #js {:className "navButtons" }
                  (dom/button #js {:onClick (fn [e]
                                              (render-page-if-valid cursor dec))}
                              "<")
                  (dom/button #js {:onClick (fn [e]
                                              (render-page-if-valid cursor inc))}
                              ">"))))))

(defn pdf-navigation-view [cursor owner]
  (reify
    om/IRender
    (render [this]
      (dom/div #js {:className "navigation"}
               (om/build pdf-navigation-buttons cursor)
               (om/build pdf-navigation-position cursor)))))

(defn pdfjs-viewer [cursor owner]
  (reify
    om/IDidMount
    (did-mount [_]
      (if (not (nil? (:pdf_workerSrc @app-state)))
        (do
          (aset js/PDFJS "workerSrc" (:pdf_workerSrc @app-state))))
      (.then (.getDocument js/PDFJS (:pdf_url @app-state))
             (fn [pdf]
               (swap! app-state assoc :pdf pdf)
               (swap! app-state update-in [:navigation :page_count 0] #(.-numPages pdf))
               (render-page))))
    om/IRender
    (render [this]
      (dom/canvas #js {:width (:pdf_width @app-state)}))))

(defn pdf-component-view [cursor owner]
  (reify
    om/IRender
    (render [this]
      (dom/div #js {:id "om-root"
                    :style #js { :width (:pdf_width @app-state)}}
               (dom/div #js {:className "menu" }
                        (om/build pdf-navigation-view (cursor :navigation)))
               (om/build pdfjs-viewer cursor)))))

(defn attach-om-root []
  (om/root pdf-component-view app-state
           {:target (-> js/document
                        (.querySelector "pdf-viewer"))}))


; Initialise application
(defn get-attr[attr]
  (-> js/document
      (.querySelector "pdf-viewer")
      (.getAttribute attr)))

(defn initialise-webcomponent []
  (let [proto (.create js/Object (.-prototype js/HTMLElement))]
    (aset proto "public_method_1" (fn [] (.log js/console "I am a stub for a public API!")))
    (aset proto "createdCallback" (fn []
                                    ; safeguard! createdCallback will trigger
                                    ; twice. reason: unfortunately unknown.
                                    (if (nil? (@app-state :pdf_url))
                                      (do
                                        ; read attributes of webcomponent element
                                        (swap! app-state update-in [:pdf_width] #(get-attr "width"))
                                        (swap! app-state update-in [:pdf_workerSrc] #(get-attr "workerSrc"))
                                        (swap! app-state update-in [:pdf_url] #(get-attr "src"))))))

    (let [PDFComponent (.registerElement js/document "pdf-viewer" #js {:prototype proto})]
      (PDFComponent.))))

; Initialise Web Component and OM, whilst
; * Thinking of Figwheel by checking whether the Web Component has already been
;   initialised.
; * Checking whether there's actually a <pdf-viewer> element on the page
(if (not (nil? (-> js/document (.querySelector "pdf-viewer"))))
  (do
    (if (nil? (@app-state :pdf_url))
      (initialise-webcomponent))
    (attach-om-root)))

(comment

  (in-ns 'pdf-viewer.core)


  )
