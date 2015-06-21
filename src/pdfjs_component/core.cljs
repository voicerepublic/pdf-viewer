(ns ^:figwheel-always pdfjs_component.core
  (:require-macros [cljs.core.async.macros :refer [go]])
  (:require [lucuma :as l :refer-macros [defwebcomponent]]
            [om.core :as om]
            [om.dom :as dom]
            [cljs.core.async :refer [put! chan <! timeout]]
            [pdfjs]))

(enable-console-print!)

(defonce app-state (atom {:pdf_url nil
                          :navigation {
                                       :pdf_page_count [0]}
                          }))

(def canvas-chan (chan))

;; Webcomponent
(defwebcomponent pdf-js
  :document "<div>initial</div>"
  :on-created (fn[elem]
                (swap! app-state update-in [:pdf_url] (fn[] (.getAttribute elem "src")))
                (swap! app-state update-in [:pdf_height] (fn[] (.getAttribute elem "height")))
                (swap! app-state update-in [:pdf_width] (fn[] (.getAttribute elem "width")))))
(l/register pdf-js)

;; OM Component
(defn pdf-navigation-view [cursor owner]
  (reify
    om/IRender
    (render [this]
      (dom/span #js {:className "pageCount"}
                (str "pages: " (get-in cursor [:pdf_page_count 0]))))))

(defn pdf-component-view [cursor owner]
  (reify
    om/IDidMount
    (did-mount [_]
      (put! canvas-chan "available"))
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
           {:target (.. js/document (querySelector "pdf-js") -shadowRoot (querySelector "div"))}))

;(defn is-available? [elem]
;  (when (nil? (.querySelector js/document elem))
;    (js/setTimeout (fn[] (is-available? elem)) 10)
;  true))

; TODO: This works, but should be improved with something like is-available?
(js/setTimeout (fn[] (attach-om-root)) 250)

;; PDFjs
(defn render-page [pdf num]
  (.then (.getPage pdf num)
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
             ))))

(go (<! (timeout 10))
    (let [msg (<! canvas-chan)]
      (cond
        (= msg "available")
        (.then (.getDocument js/PDFJS (:pdf_url @app-state))
               (fn[pdf]
                 (swap! app-state update-in [:navigation :pdf_page_count 0] #(.-numPages pdf))
                 (render-page pdf 1)))
        ;; 1
        :else (println ("Unknown message" msg)))))

(comment

  (in-ns 'pdfjs_component.core)

  ; TODOs:
  ;      *

  )
