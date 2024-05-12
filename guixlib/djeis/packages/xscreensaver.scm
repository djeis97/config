(define-module (djeis packages xscreensaver)
  #:use-module ((guix licenses) #:prefix license:)
  #:use-module (guix packages)
  #:use-module (guix git-download)
  #:use-module (guix gexp)
  #:use-module (guix build-system gnu)
  #:use-module (gnu packages)
  #:use-module (gnu packages xorg)
  #:use-module (gnu packages xdisorg)
  #:use-module (gnu packages autotools)
  #:use-module (gnu packages pkg-config)
  #:use-module (guix utils)
  #:use-module (ice-9 match)
  #:use-module (srfi srfi-1))

(define-public xscreensaver-no-auth
  (package
    (inherit xscreensaver)
    (name "xscreensaver-no-auth")
    (arguments
     (substitute-keyword-arguments (package-arguments xscreensaver)
       ((#:phases phases) `(modify-phases ,phases
                             (add-after 'install 'remove-xscreensaver-auth
                               (lambda* (#:key outputs #:allow-other-keys)
                                 (delete-file (string-append (assoc-ref outputs "out") "/libexec/xscreensaver/xscreensaver-auth"))))))))))
