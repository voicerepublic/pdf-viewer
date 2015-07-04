(ns ^:figwheel-always pdfjs_component.core
  (:require-macros [cljs.core.async.macros :refer [go]])
  (:require [om.core :as om]
            [om.dom :as dom]
            [cljs.core.async :refer [put! chan <! timeout]]
            [pdfjs]))

(enable-console-print!)

(defonce app-state (atom {:pdf nil
                          :pdf_url nil
                          :navigation {
                                       :page_count [0]
                                       :current_page [1]}
                          }))

;; Webcomponent
;; TODO: Use defonce
(if
  (not (.. js/document (querySelector "x-pdf-component")))
  (do
    (def PDFComponent (.registerElement js/document "x-pdf-component"))
    (let [component (PDFComponent.)]
      (.appendChild (.-body js/document) component))))

(defn valid-page? [page-num]
  (let [page-count (get-in @app-state [:navigation :page_count 0])]
    (and (> page-num 0) (<= page-num page-count))))

;; PDFjs helper function
;; TODO:
;;   * Do the grunt work only once instead of on every render
(defn render-page []
  (let [pdf (:pdf @app-state)
        current_page (get-in @app-state [:navigation :current_page 0])]
    (.then (.getPage pdf current_page)
           (fn[page]

             (let [desiredWidth (:pdf_height @app-state)
                   viewport (.getViewport page 1)
                   scale (/ desiredWidth (.-width viewport))
                   scaledViewport (.getViewport page (* 1.3 scale))
                   canvas (.. js/document (querySelector "x-pdf-component") (querySelector "canvas"))
                   context (.getContext canvas "2d")
                   height (.-height viewport)
                   width (.-width viewport)
                   renderContext (js-obj "canvasContext" context "viewport" scaledViewport)]

               ;; TODO: Eval employing the renderTask promise of PDFjs
               (.render page renderContext))))))

;; OM Component
(defn pdf-navigation-position [cursor owner]
  (reify
    om/IRender
    (render [this]
      (let [current_page (get-in cursor [:current_page 0])
            page_count (get-in cursor [:page_count 0])]
        (dom/span nil
                  (str current_page " of " page_count))))))

(defn render-page-if-valid [cursor f]
  (let [current_page (get-in cursor [:current_page 0])]
    (if (valid-page? (f current_page))
      (do
        (om/transact! cursor [:current_page 0] f)
        (render-page)))))

(defn pdf-navigation-buttons [cursor owner]
  (reify
    om/IRender
    (render [this]
      (let [current_page (get-in cursor [:current_page 0])]
        (dom/span nil
          (dom/button #js {:onClick (fn[e]
                                          (render-page-if-valid cursor dec))}
                      "<")
          (dom/button #js {:onClick (fn[e]
                                          (render-page-if-valid cursor inc))}
                      ">"))))))

(defn pdf-navigation-view [cursor owner]
  (reify
    om/IRender
    (render [this]
      (dom/div #js {:className "navigation"}
               (om/build pdf-navigation-buttons cursor)
               (om/build pdf-navigation-position cursor)))))

;; PDFjs
(defn render-pdfjs []
  (.then (.getDocument js/PDFJS (:pdf_url @app-state))
         (fn[pdf]
           (swap! app-state assoc :pdf pdf)
           (swap! app-state update-in [:navigation :page_count 0] #(.-numPages pdf))
           (render-page))))

(defn pdf-component-view [cursor owner]
  (reify
    om/IDidMount
    (did-mount [_]
      (render-pdfjs))
    om/IRender
    (render [this]
      (dom/div #js {:id "om-root"}
               (dom/div #js {:className "menu"
                             :style #js { :width (:pdf_width @app-state)}}
                        (om/build pdf-navigation-view (cursor :navigation)))
               (dom/canvas #js {:height (:pdf_height @app-state)
                                :width (:pdf_width @app-state)
                                })))))

(defn attach-om-root []
  (om/root pdf-component-view app-state
           {:target (.. js/document (querySelector "x-pdf-component"))}))

(defn get-attr[attr]
  (.. (.querySelector js/document "x-pdf-component") (getAttribute attr)))

(js/setTimeout
  (fn[]
    ; TODO: This could be done in the .createdCallback handler when registering
    ; the web-component
    (swap! app-state update-in [:pdf_height] (fn[] (get-attr "height")))
    (swap! app-state update-in [:pdf_width] (fn[] (get-attr "width")))
    (swap! app-state update-in [:pdf_url] (fn[] (get-attr "src")))
    ; TODO: This works, but there is a callback from Polymer that tells when the
    ; component is ready!
    (attach-om-root)
    ) 250)



(comment

  (in-ns 'pdfjs_component.core)

  ; TODOs:
  ;      *

  )
