(ns ^:figwheel-always pdfjs_component.core
  (:require [lucuma :as l :refer-macros [defwebcomponent]]
            [om.core :as om]
            [om.dom :as dom]
            [pdfjs_worker]
            [pdfjs]))


(enable-console-print!)

(defonce app-state (atom {:__figwheel_counter 0}))

(println (str "Reloads: " (:__figwheel_counter (deref pdfjs_component.core/app-state))))

(defn some-method [el]
  (js/alert "foo"))

(defwebcomponent pdf-js
  :document "<div>initial</div>"
  :style "* { color: green; }"
  :properties {:threshold 10}
  :methods {:method some-method}
  ; TODO: Remember src url
  :on-created #(println (.getAttribute %1 "src" )))
(l/register pdf-js)


(extend-type js/NodeList
  ISeqable
  (-seq [array] (array-seq array 0)))

(defn widget [data owner]
  (reify
    om/IRender
    (render [this]
      (dom/h1 nil (:text data)))))
(om/root widget {:text "Crazy stack: PDFJS (Promise based API) -> Om -> ReactJS -> Lucuma -> Webcomponent (with Figwheel)"}
  {:target (last (.. (.querySelector js/document "pdf-js") -shadowRoot -childNodes))})


(defn on-js-reload []
  (swap! app-state update-in [:__figwheel_counter] inc)
  )



(def load-pdf (.getDocument js/PDFJS "./presentation.pdf"))

(def load-doc (.then load-pdf (fn [doc] (.getPage doc 1))))

(.then load-doc (fn [page]
  (let [scale 1.5
        viewport (.getViewport page scale)
        canvas (.getElementById js/document "the-canvas")
        context (.getContext canvas "2d")
        height (.-height viewport)
        width (.-width viewport)
        renderContext (js-obj "canvasContext" context "viewport" viewport)]
    (.render page renderContext)
  )))


; tipp from skratl0x1C on #clojurescript
; imo it's just: (.then my-promise (fn [v] (put! out v)))
; alt:
;     (defn promise->chan [p] (let [c (chan)] (.then p (fn [x] (put! c x))) c))


