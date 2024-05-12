(define-module (djeis packages clojure-lsp)
  #:use-module (guix gexp)
  #:use-module ((guix licenses) #:prefix license:)
  #:use-module (guix packages)
  #:use-module (guix download)
  #:use-module (guix build-system trivial)
  #:use-module ((gnu packages java) #:select (openjdk17)))


(define-public clojure-lsp
  (package
   (name "clojure-lsp")
   (version "00.14.57")
   (source (origin
            (method url-fetch)
            (uri "https://github.com/clojure-lsp/clojure-lsp/releases/download/2022.11.03-00.14.57/clojure-lsp-standalone.jar")
            (sha256
             (base32 "1dplrbzv57xz21rznybakycrpdkc8zznijlfyih6l89jvi4aiq29"))))
   (build-system trivial-build-system)
   (arguments
    (list
     #:builder
     (with-imported-modules '((guix build utils))
                            #~(begin
                                (use-modules (guix build utils))
                                (mkdir-p (string-append #$output "/bin"))
                                (symlink #$(program-file "clojure-lsp"
                                                         #~(apply system*
                                                                  #$(file-append (this-package-input "openjdk")
                                                                                 "/bin/java")
                                                                  "-Xmx2g" "-server"
                                                                  "-jar" #$(package-source this-package)
                                                                  (cdr (program-arguments))))
                                         (string-append #$output "/bin/clojure-lsp"))))))
   (inputs (list openjdk17))
   (synopsis "")
   (description "")
   (home-page "https://clojure-lsp.io")
   (license license:expat)))
