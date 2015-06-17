(ns ^:figwheel-always pdfjs_component.core
  (:require-macros [cljs.core.async.macros :refer [go]])
  (:require [lucuma :as l :refer-macros [defwebcomponent]]
            [om.core :as om]
            [om.dom :as dom]
            [cljs.core.async :refer [put! chan <! timeout]]
            [pdfjs]))


(enable-console-print!)

(defonce app-state (atom {:__figwheel_counter 0}))

;(println (str "Reloads: " (:__figwheel_counter (deref pdfjs_component.core/app-state))))
;
;(defn on-js-reload []
;  (swap! app-state update-in [:__figwheel_counter] inc)
;  )

(def canvas-chan (chan))

;(defn some-method [el]
;  (js/alert "foo"))

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
(defwebcomponent pdf-js
  :document "<div>initial</div>"
  :style "* { color: green; }"
  :properties {:threshold 10}
  ;:methods {:method some-method}
  ; TODO: Remember src url
  :on-created #(println (.getAttribute %1 "src" )))

(l/register pdf-js)

(defn attach-om-root []
  (om/root canvas {:text "Crazy stack: PDFJS (Promise based API) -> Om -> ReactJS -> Lucuma -> Webcomponent (with Figwheel)"}
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
    (let [load-pdf (.getDocument js/PDFJS "./fixtures/presentation.pdf")
          load-doc (.then load-pdf (fn [doc] (.getPage doc 1)))]

      (.then load-doc (fn [page]
        (let [scale 1.5
              viewport (.getViewport page scale)
              canvas (.. (.querySelector js/document "pdf-js") -shadowRoot (querySelector "canvas"))
              context (.getContext canvas "2d")
              height (.-height viewport)
              width (.-width viewport)
              renderContext (js-obj "canvasContext" context "viewport" viewport)]
          (.render page renderContext)
        ))))
    :else (println ("Unknown message" msg)))))


; tipp from skratl0x1C on #clojurescript
; imo it's just: (.then my-promise (fn [v] (put! out v)))
; alt:
;     (defn promise->chan [p] (let [c (chan)] (.then p (fn [x] (put! c x))) c))

(comment

  (in-ns 'pdfjs_component.core)

 )
