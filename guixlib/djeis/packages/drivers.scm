(define-module (djeis packages drivers)
  #:use-module ((guix licenses) #:prefix license:)
  #:use-module (guix packages)
  #:use-module (guix git-download)
  #:use-module (guix gexp)
  #:use-module (guix build-system linux-module)
  #:use-module (gnu packages)
  #:use-module (guix utils)
  #:use-module (ice-9 match)
  #:use-module (srfi srfi-1)
  #:export (in-tree-module-package mt7921e))

(define (in-tree-module-package name path flags)
  (lambda (kernel)
    (package
      (inherit kernel)
      (name name)
      (build-system linux-module-build-system)
      (arguments `(#:linux ,kernel
                   #:source-directory ,path
                   #:tests? #f
                   #:make-flags ',flags)))))

(define mt7921e (in-tree-module-package "mt76"
                                        "drivers/net/wireless/mediatek/mt76"
                                        '("CONFIG_MT7921E=m"
                                          "CONFIG_MT7921_COMMON=m"
                                          "CONFIG_MT76_CONNAC_LIB=m"
                                          "CONFIG_MT76_CORE=m")))
