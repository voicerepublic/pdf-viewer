(ns ^:figwheel-always pdfjs_component.core
  (:require-macros [cljs.core.async.macros :refer [go]])
  (:require [om.core :as om]
            [om.dom :as dom]
            [cljs.core.async :refer [put! chan <! timeout]]
            [pdfjs]))

(enable-console-print!)

(defonce app-state (atom {:pdf_url nil
                          :navigation {
                                       :pdf_page_count [0]
                                       :click_count [0]}
                          }))

(def canvas-chan (chan))

;; Webcomponent
(defonce PDFComponent (.registerElement js/document "x-pdf-component"))
(let [component (PDFComponent.)]
  (.appendChild (.-body js/document) component))

;; OM Component
(defn pdf-navigation-view [cursor owner]
  (reify
    om/IRender
    (render [this]
      (dom/div nil
               (dom/span nil
                         (str "Click count: " (get-in cursor [:click_count 0])))
               (dom/button #js {:onClick (fn[e]
                                           (om/transact! cursor [:click_count 0] inc))}
                           "click me!")
               (dom/span #js {:className "pageCount"}
                         (str "pages: " (get-in cursor [:pdf_page_count 0])))))))

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
           {:target (.. js/document (querySelector "x-pdf-component"))}))

(defn get-attr[attr]
  (.. (.querySelector js/document "x-pdf-component") (getAttribute attr)))


; TODO: This works, but there is a callback from Polymer that tells when the
; component is ready!
(js/setTimeout
  (fn[]
    ; TODO: This could be done in the .createdCallback handler when registering
    ; the web-component
    (swap! app-state update-in [:pdf_height] (fn[] (get-attr "height")))
    (swap! app-state update-in [:pdf_width] (fn[] (get-attr "width")))
    (swap! app-state update-in [:pdf_url] (fn[] (get-attr "src")))
    (attach-om-root)
    ) 250)

;; PDFjs
(defn render-page [pdf num]
  (.then (.getPage pdf num)
         (fn[page]
           (let [desiredWidth (:pdf_height @app-state)
                 viewport (.getViewport page 1)
                 scale (/ desiredWidth (.-width viewport))
                 scaledViewport (.getViewport page scale)
                 canvas (.. js/document (querySelector "x-pdf-component") (querySelector "canvas"))
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
