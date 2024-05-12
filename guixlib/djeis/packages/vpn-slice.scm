(define-module (djeis packages vpn-slice)
  #:use-module (guix packages)
  #:use-module (guix download)
  #:use-module ((gnu packages python-xyz) #:select (python-dnspython python-setproctitle))
  #:use-module ((guix build-system python) #:select (pypi-uri python-build-system)))


(define-public python-vpn-slice
  (package
   (name "python-vpn-slice")
   (version "0.16.1")
   (source (origin
            (method url-fetch)
            (uri (pypi-uri "vpn-slice" version))
            (sha256
             (base32
              "1anfx4hn2ggm6sbwqmqx68s3l2rjcy4z4l038xqb440jnk8jvl18"))))
   (build-system python-build-system)
   (propagated-inputs (list python-dnspython python-setproctitle))
   (home-page "https://github.com/dlenski/vpn-slice")
   (synopsis "vpnc-script replacement for easy split-tunnel VPN setup")
   (description "vpnc-script replacement for easy split-tunnel VPN setup")
   (license #f)))
