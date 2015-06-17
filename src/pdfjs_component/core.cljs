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
      (dom/div nil
               (dom/h1 nil (:text data))
               (dom/p nil "I am a paragraph")
               (dom/canvas nil)))))

;; Webcomponent

;(defn some-method [el]
;  (js/alert "foo"))

(defwebcomponent pdf-js
  :document "<div>initial</div>"
  :style "* { color: green; }"
  :properties {:threshold 10}
  ;:methods {:method some-method}
  :on-created #(swap! app-state update-in [:pdf_url] (fn[] (.getAttribute %1 "src" ))))

(l/register pdf-js)

(defn attach-om-root []
  (om/root canvas
           {:text "Crazy stack: PDFJS (Promise based API) -> Om -> ReactJS -> Lucuma -> Webcomponent (with Figwheel)"}
           {:target (.. (.querySelector js/document "pdf-js") -shadowRoot (querySelector "div"))}))

;(defn is-available? [elem]
;  (when (nil? (.querySelector js/document elem))
;    (js/setTimeout (fn[] (is-available? elem)) 10)
;  true))

; This works, but should be improved with something like is-available?
(js/setTimeout (fn[] (attach-om-root)) 250)

;; PDFjs
(go (<! (timeout 10))
    (let [msg (<! canvas-chan)]
      (cond
        (= msg "available")
        (.then (.getDocument js/PDFJS (:pdf_url @app-state))
               (fn[pdf]
                 (.then (.getPage pdf 1)
                        (fn[page]
                          (let [scale 1.5
                                viewport (.getViewport page scale)
                                canvas (.. (.querySelector js/document "pdf-js") -shadowRoot (querySelector "canvas"))
                                context (.getContext canvas "2d")
                                height (.-height viewport)
                                width (.-width viewport)
                                renderContext (js-obj "canvasContext" context "viewport" viewport)]
                            (.render page renderContext)
                            )))))
        :else (println ("Unknown message" msg)))))

(comment

  (in-ns 'pdfjs_component.core)

  ; TODOs:
  ;      *

  )
