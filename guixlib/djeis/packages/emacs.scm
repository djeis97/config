(define-module (djeis packages emacs)
  #:use-module ((djeis channel) #:prefix djeis:)
  #:use-module (gnu packages emacs)
  #:use-module ((gnu packages emacs-build) #:prefix gnu:)
  #:use-module ((gnu packages emacs-xyz) #:prefix gnu:)
  #:use-module ((gnu packages tree-sitter) #:select (tree-sitter))
  #:use-module ((gnu packages xorg) #:select (libxrender libxt))
  #:use-module (guix packages)
  #:use-module (guix download)
  #:use-module (guix git-download)
  #:use-module (guix gexp)
  #:use-module (guix build-system emacs)
  #:use-module (guix build-system copy)
  #:use-module (gnu packages)
  #:use-module (guix utils)
  #:use-module (ice-9 match)
  #:use-module (srfi srfi-1))

(define-public emacs-transp
  (package
    (inherit emacs-next)
    (name "emacs-transp")
    (version (package-version emacs-next))
    (source
     (origin
       (inherit (package-source emacs-next))
       (method git-fetch)
       (file-name (git-file-name name version))
       (patches
        (cons*
         (local-file (djeis:search-patch "0001-Make-border-and-dividers-transparent.patch"))
         (origin-patches (package-source emacs-next))))))
    (inputs (modify-inputs (package-inputs emacs-next) (prepend libxt) (prepend libxrender)))))

(define-public emacs-doom-themes
  (let ((commit "dc25efea6f82494864f2bc83b7947bad953a3b87"))
    (package
      (inherit gnu:emacs-doom-themes)
      (version (git-version "2.3.0" "2" commit))
      (source
       (origin
         (inherit (package-source gnu:emacs-doom-themes))
         (method git-fetch)
         (uri (git-reference
               (url "https://github.com/dalugm/emacs-doom-themes")
               (commit commit)))
         (file-name (git-file-name (package-name gnu:emacs-doom-themes) version))
         (sha256 (base32 "026brjv3ckjw364fp1fai09ys49429mflzs625yh9ajd219riicr")))))))

(define-public emacs-just-mode
  (let ((commit "4c0df4cc4b8798f1a7e99fb78b79c4bf7eec12c1"))
    (package
      (name "emacs-just-mode")
      (version (git-version "0.1.0" "0" commit))
      (source
       (origin
         (method git-fetch)
         (uri (git-reference
               (url "https://github.com/leon-barrett/just-mode.el")
               (commit commit)))
         (file-name (git-file-name name version))
         (sha256 (base32 "0lxx22hp1j7q6cjr5ryiymkf7d70pcn5blihrd45h0h5swjx85fl"))))
      (build-system emacs-build-system)
      (synopsis "")
      (home-page "")
      (description "")
      (license #f))))

(define-public emacs-justl
  (let ((commit "7b8670bc014938bfdd5b771cf317ca077524a477"))
    (package
      (name "emacs-justl")
      (version (git-version "0.14" "0" commit))
      (source
       (origin
         (method git-fetch)
         (uri (git-reference
               (url "https://github.com/psibi/justl.el")
               (commit commit)))
         (file-name (git-file-name name version))
         (sha256 (base32 "0f13ipz7fwr8yrgb8r1l5nfk1ppr4i514zvr3785d8akv289c537"))))
      (build-system emacs-build-system)
      (synopsis "")
      (home-page "")
      (description "")
      (license #f)
      (propagated-inputs (list gnu:emacs-s gnu:emacs-f gnu:emacs-inheritenv gnu:emacs-transient)))))

(define-public emacs-bqn-mode
  (let ((commit "01814bc00fa9540e70ffea56212ecdef4b1eca30"))
    (package
      (name "emacs-bqn-mode")
      (version (git-version "0.0.0" "0" commit))
      (source
       (origin
         (method git-fetch)
         (uri (git-reference
               (url "https://github.com/museoa/bqn-mode")
               (commit commit)))
         (file-name (git-file-name name version))
         (sha256 (base32 "0cy6v39zkzg2illn5p0nxnnrcl2hgnimmdhhidyjz6alnj3n2fcb"))))
      (build-system emacs-build-system)
      (synopsis "")
      (home-page "")
      (description "")
      (license #f))))

(define-public emacs-ts-modules
  (package
    (name "emacs-ts-modules")
    (version "2.1")
    (source (origin
              (method url-fetch)
              (uri "https://github.com/casouri/tree-sitter-module/releases/download/v2.1/libs-linux-x64.zip")
              (sha256
               (base32 "16ah8qmlzz7xnrrgdzx6zra5m2kk5qlyjbkjbdkc985g84w8zldl"))))
    (build-system copy-build-system)
    (license #f)
    (description "Modules for for tree sitter in emacs")
    (synopsis "Modules for tree sitter in emacs")
    (home-page "https://github.com/casouri/tree-sitter-module")
    (native-inputs (list (specification->package "unzip")))))

(define-public emacs-powerline
  (let ((commit "c35c35bdf5ce2d992882c1f06f0f078058870d4a"))
    (package
      (inherit gnu:emacs-powerline)
      (version (git-version "2.4" "0" commit))
      (source (origin
                (method git-fetch)
                (uri (git-reference
                      (url "https://github.com/milkypostman/powerline")
                      (commit commit)))
                (file-name (git-file-name (package-name gnu:emacs-powerline) version))
                (sha256 (base32 "0k1n5pg8v3ybkqxcipw80jqv94ka0dp63qxl0hvjwlxk16gxp8kb")))))))

(define-public emacs-general
  (let ((commit "ced143c30de8e20f5a3761a465e684a1dc48471e"))
    (package
      (inherit gnu:emacs-general)
      (version (git-version "0" "5" commit))
      (source (origin
                (method git-fetch)
                (uri (git-reference
                      (url "https://github.com/noctuid/general.el")
                      (commit commit)))
                (file-name (git-file-name (package-name gnu:emacs-general) version))
                (sha256 (base32 "0c13kax2h14b06zjs8wj950y7ykzmabfwdmb8imwmpgfcaasycf2")))))))

(define-public emacs-kele
  (let ((commit "beec4a76c090101d8a98e631c292207be3c3a6a1"))
    (package
      (name "emacs-kele")
      (version "0.6.0")
      (source (origin
                (method git-fetch)
                (uri (git-reference
                      (url "https://github.com/jinnovation/kele.el")
                      (commit commit)))
                (file-name (git-file-name name version))
                (sha256 (base32 "0h67jvvql9z969wzzxx8g2hnnzxw5p1wqc211258bgyxm6p25yzq"))))
      (build-system emacs-build-system)
      (license #f)
      (description "")
      (synopsis "")
      (home-page "https://github.com/jinnovation/kele.el")
      (propagated-inputs (list gnu:emacs-dash
                               gnu:emacs-async
                               gnu:emacs-f
                               gnu:emacs-ht
                               gnu:emacs-memoize
                               gnu:emacs-plz
                               gnu:emacs-s
                               gnu:emacs-yaml)))))

(define-public emacs-kubed
  (let ((commit "a429d82e05e4d097ee431cd385f1a6679f606815"))
    (package
      (name "emacs-kubed")
      (version (git-version "0.4.1" "0" commit))
      (source (origin
                (method git-fetch)
                (uri (git-reference
                      (url "https://git.sr.ht/~eshel/kubed")
                      (commit commit)))
                (file-name (git-file-name name version))
                (sha256 (base32 "1p37x82nkvmcbylp7cj5g6a9g8hih6zhiy1kwhvrplh9fcl9pzlf"))))
      (build-system emacs-build-system)
      (license #f)
      (description "")
      (synopsis "")
      (home-page "https://eshelyaron.com/kubed.html"))))

(define-public emacs-kubel
  (let ((commit "7b4f967ee8733a1f8798c39255a26d71aff1f55b"))
    (package
      (name "emacs-kubel")
      (version (git-version "3.0" "0" commit))
      (source (origin
                (method git-fetch)
                (uri (git-reference
                      (url "https://github.com/abrochard/kubel")
                      (commit commit)))
                (file-name (git-file-name name version))
                (sha256 (base32 "07yn3g8znzgndkg2bajmkwywdzrdjslkvldzanj8cnhlmax80kvn"))))
      (build-system emacs-build-system)
      (license #f)
      (description "")
      (synopsis "")
      (home-page "https://github.com/abrochard/kubel")
      (propagated-inputs (list gnu:emacs-dash
                               gnu:emacs-s
                               gnu:emacs-yaml-mode
                               gnu:emacs-transient
                               gnu:emacs-evil)))))


(define* (local-emacs-package base-name #:optional (deps (list)))
  (package
    (name (string-append "emacs-" base-name))
    (source
     (let ((base-path (string-append djeis:%channel-root "/djeis/packages/emacs/" base-name)))
       (if (file-exists? (string-append base-path ".el"))
           (local-file (string-append base-path ".el"))
           (local-file (string-append base-path) #:recursive? #t))))
    (version "0.0.1")
    (build-system emacs-build-system)
    (synopsis "")
    (description "")
    (home-page "")
    (license #f)
    (propagated-inputs deps)))

;;(define-public emacs-project-tab-groups (local-emacs-package "project-tab-groups"))
(define-public emacs-djeis97 (local-emacs-package "djeis97" (list gnu:emacs-exwm
                                                                  gnu:emacs-project-tab-groups
                                                                  gnu:emacs-vterm
                                                                  gnu:emacs-clojure-mode
                                                                  gnu:emacs-doom-modeline
                                                                  gnu:emacs-marginalia
                                                                  gnu:emacs-emprise
                                                                  gnu:emacs-consult
                                                                  gnu:emacs-posframe
                                                                  gnu:emacs-smartparens
                                                                  gnu:emacs-embark
                                                                  gnu:emacs-which-key)))
;; (define-public emacs-djeis97-utils (local-emacs-package "djeis97-utils.el"))
;; (define-public emacs-djeis97-tab-bar
;;   (local-emacs-package "djeis97-tab-bar" (list emacs-djeis97-utils
;;                                                emacs-exwm
;;                                                gnu:emacs-doom-modeline)))
;; (define-public emacs-djeis97-managed-tab-line (local-emacs-package "djeis97-managed-tab-line"
;;                                                                    (list emacs-djeis97-utils
;;                                                                          emacs-project-tab-groups)))
;; (define-public emacs-djeis97-exwm
;;   (local-emacs-package "djeis97-exwm"
;;                        (list emacs-exwm
;;                              gnu:emacs-doom-modeline
;;                              gnu:emacs-marginalia
;;                              ;; gnu:emacs-exwm-edit
;;                              gnu:emacs-emprise
;;                              emacs-djeis97-utils)))

;; (define-public emacs-djeis97-lisp
;;   (local-emacs-package "djeis97-lisp" (list gnu:emacs-smartparens)))
;; (define-public emacs-djeis97-exwm-consult (local-emacs-package "djeis97-exwm-consult"
;;                                                                (list emacs-exwm
;;                                                                      gnu:emacs-consult
;;                                                                      gnu:emacs-posframe)))
(define-public emacs-open-junk-file (local-emacs-package "open-junk-file"))
