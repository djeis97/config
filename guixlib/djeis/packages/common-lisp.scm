(define-module (djeis packages common-lisp)
  #:use-module (guix packages)
  #:use-module (gnu packages)
  #:use-module ((guix utils) #:select (substitute-keyword-arguments))
  #:use-module ((gnu packages lisp-xyz) #:select (sbcl-mcclim sbcl-cl-fad)))

(define-public sbcl-mcclim+listener
  (package
    (inherit sbcl-mcclim)
    (name "sbcl-mcclim+listener")
    (arguments
     (substitute-keyword-arguments (package-arguments sbcl-mcclim)
       ((#:asd-systems systems) `(cons* "clim-listener" ,systems))))
    (inputs
     (cons* (list "sbcl-cl-fad" sbcl-cl-fad) (package-inputs sbcl-mcclim)))))
