;;; Based on nonguix/packages/k8s.scm
;;; License header from that file:
;;; SPDX-License-Identifier: GPL-3.0-or-later
;;; Copyright © 2023 Giacomo Leidi <goodoldpaul@autistici.org>

(define-module (djeis packages kubectl)
  #:use-module (guix build-system copy)
  #:use-module (guix download)
  #:use-module (guix gexp)
  #:use-module (guix packages)
  #:use-module ((guix licenses) :prefix license:))

(define-public kubectl
  (package
    (name "kubectl")
    (version "1.31.0")
    (source (origin
              (method url-fetch)
              (uri (string-append
                    "https://dl.k8s.io/release/v" version "/bin/linux/amd64/kubectl"))
              (sha256
               (base32
                "0dr40ckdj65ka6ndp8knyprh1k0nx6vg8yyg7p6c1lc49b3as9vw"))))
    (build-system copy-build-system)
    (arguments
     (list
      #:substitutable? #f
      #:install-plan
      #~'(("kubectl" "bin/"))
      #:phases
      #~(modify-phases %standard-phases
          (replace 'unpack
            (lambda _
              (copy-file #$source "./kubectl")
              (chmod "kubectl" #o644)))
          (add-before 'install 'chmod
            (lambda _
              (chmod "kubectl" #o555))))))
    (home-page "https://github.com/kubernetes/kubectl")
    (supported-systems '("x86_64-linux"))
    (synopsis "Kubernetes command line tool")
    (description
     "kubectl allows you to run commands against Kubernetes clusters. You can
use kubectl to deploy applications, inspect and manage cluster resources, and
view logs.")
    (license license:asl2.0)))
