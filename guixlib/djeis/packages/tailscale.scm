;;; Based on nonguix/packages/k8s.scm
;;; License header from that file:
;;; SPDX-License-Identifier: GPL-3.0-or-later
;;; Copyright © 2023 Giacomo Leidi <goodoldpaul@autistici.org>

(define-module (djeis packages tailscale)
  #:use-module (guix build-system copy)
  #:use-module (guix download)
  #:use-module (guix gexp)
  #:use-module (guix packages)
  #:use-module ((guix licenses) :prefix license:))

(define-public tailscale
  (package
    (name "tailscale")
    (version "1.94.2")
    (source (origin
              (method url-fetch)
              (uri (string-append
                    "https://pkgs.tailscale.com/stable/tailscale_" version "_amd64.tgz"))
              (sha256 (base32 "0cnwxhzmyn5j9jzcd2mhvzfw6vvmx5lqs602d6sq6xscfxfrmyf6"))))
    (build-system copy-build-system)
    (arguments
     (list
      #:substitutable? #f
      #:install-plan
      #~'(("tailscale" "bin/")
          ("tailscaled" "bin/"))))
    (home-page "https://tailscale.com")
    (supported-systems '("x86_64-linux"))
    (synopsis "Tailscale client")
    (description
     "Tailscale is a zero trust vpn")
    (license license:bsd-3)))
