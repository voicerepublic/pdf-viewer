(ns ^:figwheel-always pdfjs_component.core
  (:require-macros [cljs.core.async.macros :refer [go]])
  (:require [lucuma :as l :refer-macros [defwebcomponent]]
            [om.core :as om]
            [om.dom :as dom]
            [cljs.core.async :refer [put! chan <! timeout]]
            [pdfjs_worker]
            [pdfjs]))


(enable-console-print!)

(defonce app-state (atom {:__figwheel_counter 0}))

;(println (str "Reloads: " (:__figwheel_counter (deref pdfjs_component.core/app-state))))

;(defn on-js-reload []
;  (swap! app-state update-in [:__figwheel_counter] inc)
;  )

;(defn some-method [el]
;  (js/alert "foo"))


;; Webcomponent
(defwebcomponent pdf-js
  :document "<div>initial</div>"
  :style "* { color: green; }"
  :properties {:threshold 10}
  ;:methods {:method some-method}
  ; TODO: Remember src url
  :on-created #(println (.getAttribute %1 "src" )))
(l/register pdf-js)

(def canvas-chan (chan))

;; OM Component
(defn canvas [data owner]
  (reify
    ;om/IInitState
    ;(init-state [_]
    ;  {:canvas-chan (chan) })
    om/IDidMount
    (did-mount [_]
      (put! canvas-chan "available"))
    om/IRender
    (render [this]
      (dom/div nil
        (dom/h1 nil (:text data))
        (dom/p nil "I am a paragraph")
        (dom/canvas #js {:id "pdf-canvas"})))))

(extend-type js/NodeList
  ISeqable
  (-seq [array] (array-seq array 0)))

(om/root canvas {:text "Crazy stack: PDFJS (Promise based API) -> Om -> ReactJS -> Lucuma -> Webcomponent (with Figwheel)"}
  {:target (last (.. (.querySelector js/document "pdf-js") -shadowRoot -childNodes))})


(go (<! (timeout 2000))
  (let [msg (<! canvas-chan)]
    (cond
      (= msg "available")
      (
        ;; PDFjs
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
      )
      :else (println ("Unknown message" msg)))))


; tipp from skratl0x1C on #clojurescript
; imo it's just: (.then my-promise (fn [v] (put! out v)))
; alt:
;     (defn promise->chan [p] (let [c (chan)] (.then p (fn [x] (put! c x))) c))

(comment

  (in-ns 'pdfjs_component.core)

  (def c (chan))

  (put! c "braunz")

  (go (<! (timeout 2000))
    (let [msg (<! c)]
      (cond
        (= msg "braunz") (println "You wrote BRAUNZ")
        :else (println "STRANGE MESSAGES COMING IN"))))
 )
