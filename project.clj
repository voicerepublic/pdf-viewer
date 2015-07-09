(defproject pdf-viewer "0.1.0-SNAPSHOT"
  :description "PDFjs wrapped into a webcomponent composed of Om components"
  :url "https://github.com/munen/pdf-viewer"
  :license {:name "Eclipse Public License"
            :url "http://www.eclipse.org/legal/epl-v10.html"}

  :dependencies [[org.clojure/clojure "1.6.0"]
                 [org.clojure/clojurescript "0.0-3211"]
                 [cljsjs/document-register-element "0.4.3-0"]
                 [org.omcljs/om "0.8.8"]
                 [org.clojure/core.async "0.1.346.0-17112a-alpha"]]

  :plugins [[lein-cljsbuild "1.0.5"]
            [lein-figwheel "0.3.1"]]

  :source-paths ["src"]

  ; Compiling PDFjs inline requires enough memory
  :jvm-opts ^:replace ["-Xms1024m" "-Xmx1024m" "-server"]

  :clean-targets ^{:protect false} ["resources/public/js/compiled" "target"]

  :cljsbuild {
    :builds [{:id "dev"
              :source-paths ["src"]

              :figwheel { :on-jsload "pdf-viewer.core/on-js-reload" }

              :compiler {:main pdf-viewer.core
                         :asset-path "js/compiled/out"
                         :output-to "resources/public/js/compiled/pdf-viewer.js"
                         :externs ["src/libs/pdf-externs.js"]
                         :foreign-libs [
                                        {:file "src/libs/pdf.js"
                                         :provides ["pdfjs"]}
                                        ]
                         :output-dir "resources/public/js/compiled/out"
                         :source-map-timestamp true }}
             {:id "min"
              :source-paths ["src"]
              :compiler {:output-to "dist/pdf-viewer.js"
                         :main pdf-viewer.core
                         :externs ["src/libs/pdf-externs.js"]
                         :foreign-libs [
                                        {:file "src/libs/pdf.js"
                                         :provides ["pdfjs"]}
                                        ]
                         :optimizations :advanced
                         :pretty-print false}}]}

  :figwheel {
             ;; :http-server-root "public" ;; default and assumes "resources"
             ;; :server-port 3449 ;; default
             :css-dirs ["resources/public/css"] ;; watch and update CSS

             ;; Start an nREPL server into the running figwheel process
             :nrepl-port 7888

             ;; Server Ring Handler (optional)
             ;; if you want to embed a ring handler into the figwheel http-kit
             ;; server, this is for simple ring servers, if this
             ;; doesn't work for you just run your own server :)
             ;; :ring-handler hello_world.server/handler

             ;; To be able to open files in your editor from the heads up display
             ;; you will need to put a script on your path.
             ;; that script will have to take a file path and a line number
             ;; ie. in  ~/bin/myfile-opener
             ;; #! /bin/sh
             ;; emacsclient -n +$2 $1
             ;;
             ;; :open-file-command "myfile-opener"

             ;; if you want to disable the REPL
             ;; :repl false

             ;; to configure a different figwheel logfile path
             ;; :server-logfile "tmp/logs/figwheel-logfile.log"
             })
