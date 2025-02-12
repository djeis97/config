(define-module (djeis home EMALAB-PF5815M2)
  #:use-module (gnu home)
  #:use-module (gnu packages)
  #:use-module (gnu services)
  #:use-module (gnu home services)
  #:use-module (djeis home)
  #:use-module (gnu packages emacs)
  #:use-module (djeis services emacs-config)
  #:use-module (guix packages)
  #:use-module (guix utils)
  #:use-module (guix build-system trivial)
  #:use-module (guix gexp)
  #:use-module (ice-9 ftw)
  #:use-module (srfi srfi-13))

(define win-gpg-dir "/mnt/c/Users/emalaby/gpg4win/bin/")

(define gpg-exes
  (map (lambda (s) (cons (string-drop-right s 4)
                         (string-append win-gpg-dir s)))
       (scandir win-gpg-dir (lambda (s) (and (string-prefix? "gpg" s)
                                             (string-suffix? ".exe" s))))))

(define fake-gpg
  (package
    (name "wigpg")
    (version "0.0.1")
    (source #f)
    (build-system trivial-build-system)
    (arguments
     (list #:modules '((guix build utils))
           #:builder
           #~(begin
               (use-modules (guix build utils))
               (let ((bin (string-append #$output "/bin/")))
                 (mkdir-p bin)
                 (map (lambda (exe)
                        (symlink (cdr exe)
                                 (string-append bin (car exe))))
                      '#$gpg-exes)))))
    (license #f)
    (description #f)
    (synopsis #f)
    (home-page #f)))

(define replaced-gpg
  (package
    (inherit (specification->package "gnupg"))
    (replacement fake-gpg)))

(define hacked-pass
  (let ((pass (specification->package "password-store")))
    (package
      (inherit pass)
      (inputs (modify-inputs (package-inputs pass)
                             (delete "gnupg")
                             (append replaced-gpg))))))

(define (package-or-output-package-name e)
  (package-name
   (if (list? e)
       (car e)
       e)))

(define-public home
  (home-environment
   (packages (cons*
              fake-gpg
              hacked-pass
              (filter (lambda (p)
                        (not (or (string=? (package-or-output-package-name p) "password-store")
                                 (string=? (package-or-output-package-name p) "gnupg"))))
                      (base-home-packages))))
   (services (cons*
              (emacs-config-service emacs-system-pass
                (prologue
                  (setq-default password-store-executable #$(file-append hacked-pass "/bin/pass"))))
              
              (emacs-config-service emacs-system-keyremap
                (prologue
                  (define-key input-decode-map (kbd "<XF86AudioMicMute>") (kbd "<f20>"))))
              (service emacs-packages-service-type
                       (emacs-packaging-config (emacs emacs-next)))
              (base-home-services "EMALAB-PF5815M2")))))
