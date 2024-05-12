(define-module (djeis packages fuse-overlayfs)
  #:use-module ((guix licenses) #:prefix license:)
  #:use-module (guix packages)
  #:use-module (guix git-download)
  #:use-module (guix gexp)
  #:use-module (guix build-system gnu)
  #:use-module (gnu packages)
  #:use-module (gnu packages autotools)
  #:use-module (gnu packages pkg-config)
  #:use-module (gnu packages linux)
  #:use-module (guix utils)
  #:use-module (ice-9 match)
  #:use-module (srfi srfi-1))

(define-public fuse-overlayfs
  (let ((commit "878cb0ccad071d4adda506db3147b3bcefdff27e")
        (revision "0"))
    (package
     (name "fuse-overlayfs")
     (version (git-version "1.8.2" revision commit))
     (source (origin
              (method git-fetch)
              (uri (git-reference
                    (url "https://github.com/containers/fuse-overlayfs")
                    (commit commit)))
              (file-name (git-file-name name version))
              (sha256
               (base32
                "0lqisrzblyg6ak1ww9qgbi60a8g5881cx22mhapgwzi67mvf6f7g"))))
     (build-system gnu-build-system)
     (native-inputs (list autoconf automake pkg-config))
     (inputs (list fuse-3))
     (home-page "https://github.com/containers/fuse-overlayfs")
     (synopsis "")
     (description "")
     (license license:gpl3))))
