(define-module (djeis packages x2x)
  #:use-module ((guix licenses) #:prefix license:)
  #:use-module (guix packages)
  #:use-module (guix git-download)
  #:use-module (guix gexp)
  #:use-module (guix build-system gnu)
  #:use-module (gnu packages)
  #:use-module (gnu packages xorg)
  #:use-module (gnu packages autotools)
  #:use-module (gnu packages pkg-config)
  #:use-module (guix utils)
  #:use-module (ice-9 match)
  #:use-module (srfi srfi-1))

(define-public x2x
  (let ((commit "6189028f1e13a0c9fb9c176f812ed05310290369")
        (revision "117"))
    (package
     (name "x2x")
     (version (git-version "0.0.1" revision commit))
     (source (origin
              (method git-fetch)
              (uri (git-reference
                    (url "https://github.com/dottedmag/x2x")
                    (commit commit)))
              (file-name (git-file-name name version))
              (sha256
               (base32
                "0078p7i22b915rpzlwj1a01slw2b537qfcg0m9cari0ha8whp9bs"))))
     (build-system gnu-build-system)
     (native-inputs (list autoconf automake pkg-config))
     (inputs (list libx11 libxext libxtst))
     (home-page "https://github.com/dottedmag/x2x")
     (synopsis "")
     (description "")
     (license (license:non-copyleft "file://COPYING")))))

