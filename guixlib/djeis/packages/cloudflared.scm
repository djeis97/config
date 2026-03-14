(define-module (djeis packages cloudflared)
  #:use-module ((guix licenses) #:prefix license:)
  #:use-module (guix packages)
  #:use-module (guix download)
  #:use-module (guix gexp)
  #:use-module (guix build-system trivial)
  #:use-module (gnu packages)
  #:use-module (guix utils))

(package
  (name "cloudflared-linux-amd64")
  (version "2025.2.0")
  (source (origin
            (method url-fetch)
            (uri (string-append "https://github.com/cloudflare/cloudflared/releases/download/"
                                version "/" name))
            (sha256
             (base32 "0gwvfdb6xaacy2phz3fivcyycirf428inxjxlnvls27fdmd8rlfb"))))
  (build-system trivial-build-system)
  (arguments
   (list #:builder
         (with-imported-modules '((guix build utils))
           #~(begin
               (use-modules (guix build utils))
               (let* ((bin (string-append #$output "/bin"))
                      (outfile (string-append bin "/cloudflared")))
                 (mkdir-p bin)
                 (copy-file #+source outfile)
                 (chmod outfile #o555))))))
  (home-page "https://github.com/cloudflare/cloudflared")
  (synopsis "")
  (description "")
  (license license:asl2.0))
