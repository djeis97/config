(define-module (djeis packages sshuttle)
  #:use-module ((guix licenses) #:prefix license:)
  #:use-module (guix packages)
  #:use-module (guix download)
  #:use-module (guix gexp)
  #:use-module (guix build-system python)
  #:use-module (guix build-system pyproject)
  #:use-module (gnu packages)
  #:use-module (gnu packages check)
  #:use-module (gnu packages python)
  #:use-module (gnu packages python-xyz)
  #:use-module (gnu packages python-build)
  #:use-module (guix utils)
  #:use-module (ice-9 match)
  #:use-module (srfi srfi-1))


(define-public sshuttle
  (package
    (name "sshuttle")
    (version "1.1.2")
    (source
     (origin
       (method url-fetch)
       (uri (pypi-uri name version))
       (sha256
        (base32
         "1mk3qxlz0ng2wpcxhzg1m7c38shs1zxb0f1zakvmsx25kk2jpy7i"))))
    (build-system pyproject-build-system)
    (arguments
     `(#:tests? #f
       #:phases
       (modify-phases %standard-phases
         (add-after 'unpack 'patch-FHS-file-names
           (lambda _
             (substitute* "sshuttle/client.py"
               (("/usr/bin/env") (which "env")))
             (substitute* "sshuttle/ssh.py"
               (("/bin/sh") "sh"))
             #t)))))
    (native-inputs
     (list python-setuptools-scm
           ;; For tests only.
           python-flake8
           python-mock
           python-pytest-cov
           python-pytest-runner
           python-poetry-core))
    (home-page "https://github.com/sshuttle/sshuttle")
    (synopsis "VPN that transparently forwards connections over SSH")
    (description "sshuttle creates an encrypted virtual private network (VPN)
connection to any remote server to which you have secure shell (SSH) access.
The only requirement is a suitable version of Python on the server;
administrative privileges are required only on the client.  Unlike most VPNs,
sshuttle forwards entire sessions, not packets, using kernel transparent
proxying.  This makes it faster and more reliable than SSH's own tunneling and
port forwarding features.  It can forward both TCP and UDP traffic, including
DNS domain name queries.")
    (license license:lgpl2.0))) ; incorrectly identified as GPL in ‘setup.py’
