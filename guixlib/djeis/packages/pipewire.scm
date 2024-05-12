(define-module (djeis packages pipewire)
  #:use-module (guix packages)
  #:use-module (guix download)
  #:use-module (guix gexp)
  #:use-module (guix build-system gnu)
  #:use-module (gnu packages)
  #:use-module ((gnu packages linux) #:select (wireplumber))
  #:use-module ((gnu packages python) #:select (python))
  #:use-module ((gnu packages xml) #:select (python-lxml))
  #:use-module ((gnu packages glib) #:select (gobject-introspection))
  #:use-module ((gnu packages documentation) #:select (doxygen))
  #:use-module (guix utils)
  #:use-module (ice-9 match)
  #:use-module (srfi srfi-1))

(define-public wireplumber-gi
  (package
   (inherit wireplumber)
   (name "wireplumber+gi")
   (arguments
    `(#:configure-flags '("-Dsystemd=disabled"
                          "-Dsystem-lua=true"
                          "-Dintrospection=enabled")))
   (native-inputs
    `(("gobject-introspection" ,gobject-introspection)
      ("python" ,python)
      ("python-lxml" ,python-lxml)
      ("doxygen" ,doxygen)
      ,@(package-native-inputs wireplumber)))))
