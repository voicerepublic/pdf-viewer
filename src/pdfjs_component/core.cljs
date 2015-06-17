(ns ^:figwheel-always pdfjs_component.core
  (:require-macros [cljs.core.async.macros :refer [go]])
  (:require [lucuma :as l :refer-macros [defwebcomponent]]
            [om.core :as om]
            [om.dom :as dom]
            [cljs.core.async :refer [put! chan <! timeout]]
            [pdfjs]))

(enable-console-print!)

(defonce app-state (atom {:pdf_url nil}))

(def canvas-chan (chan))

;; OM Component
(defn canvas [data owner]
  (reify
    om/IDidMount
    (did-mount [_]
      (put! canvas-chan "available"))
    om/IRender
    (render [this]
      (dom/div #js {:id "om-root"}
               (dom/h1 nil (:text data))
               (dom/div #js {:className "menu"
                             :style #js { :width (:pdf_width @app-state)}}
                 (dom/span #js {:className "pageCount"}
                           (:pdf_pages @app-state)))
               (dom/canvas #js {:height (:pdf_height @app-state)
                                :width (:pdf_width @app-state)
                                })))))

;; Webcomponent
(defwebcomponent pdf-js
  :document "<div>initial</div>"
  :on-created (fn[elem]
                (swap! app-state update-in [:pdf_url] (fn[] (.getAttribute elem "src")))
                (swap! app-state update-in [:pdf_height] (fn[] (.getAttribute elem "height")))
                (swap! app-state update-in [:pdf_width] (fn[] (.getAttribute elem "width")))))
(l/register pdf-js)

(defn attach-om-root []
  (om/root canvas
           {:text "Crazy stack: PDFJS (Promise based API) -> Om -> ReactJS -> Lucuma -> Webcomponent (with Figwheel)"}
           {:target (.. js/document (querySelector "pdf-js") -shadowRoot (querySelector "div"))}))

;(defn is-available? [elem]
;  (when (nil? (.querySelector js/document elem))
;    (js/setTimeout (fn[] (is-available? elem)) 10)
;  true))

; TODO: This works, but should be improved with something like is-available?
(js/setTimeout (fn[] (attach-om-root)) 250)

;; PDFjs
(go (<! (timeout 10))
    (let [msg (<! canvas-chan)]
      (cond
        (= msg "available")
        ;; 1
        (.then (.getDocument js/PDFJS (:pdf_url @app-state))
               (fn[pdf]
                 (swap! app-state update-in [:pdf_pages] (fn[] (.-numPages pdf)))
                 (.then (.getPage pdf 1)
                        (fn[page]
                          (let [desiredWidth (:pdf_height @app-state)
                                viewport (.getViewport page 1)
                                scale (/ desiredWidth (.-width viewport))
                                scaledViewport (.getViewport page scale)
                                canvas (.. js/document (querySelector "pdf-js") -shadowRoot (querySelector "canvas"))
                                context (.getContext canvas "2d")
                                height (.-height viewport)
                                width (.-width viewport)
                                renderContext (js-obj "canvasContext" context "viewport" scaledViewport)]
                            (.render page renderContext)
                            )))))
        :else (println ("Unknown message" msg)))))

(comment

  (in-ns 'pdfjs_component.core)

  ; TODOs:
  ;      *

  )
