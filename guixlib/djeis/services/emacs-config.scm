(define-module (djeis services emacs-config)
  #:use-module (djeis packages emacs)
  #:use-module (guix packages)
  #:use-module (gnu packages)
  #:use-module ((gnu packages emacs-xyz) #:prefix pkg:)
  #:use-module ((gnu packages emacs) #:select (emacs emacs-minimal))
  #:use-module (guix gexp)
  #:use-module (guix utils)
  #:use-module (guix transformations)
  #:use-module (gnu services)
  #:use-module (gnu home services)
  #:use-module (gnu home services utils)
  #:use-module (guix records)
  #:use-module (srfi srfi-1)
  #:export (emacs-init-file-service-type
            emacs-packaging-config
            emacs-packages-service-type
            emacs-config-service-type
            emacs-config
            emacs-use-package
            use-package
            emacs-prologue
            prologue
            emacs-epilogue
            epilogue
            emacs-config-service))

;; (define (build-emacs-pdump emacs pkgs)
;;   (with-imported-modules (source-module-closure '((guix build emacs-utils)))
;;     #~(begin
;;         (use-modules (guix build emacs-utils))
;;         (setenv "PATH" ))))

(define-record-type* <emacs-packaging-config>
  emacs-packaging-config make-emacs-packaging-config
  emacs-packaging-config?
  (emacs emacs-packaging-config-emacs-package (default emacs-transp))
  (packages emacs-packaging-config-packages (default (list))))


(define (config-sections->init-file sections)
  (scheme-file "init.el"
               (append-map cdr (sort sections (lambda (x y) (< (car x) (car y)))))
               #:splice? #t
               #:set-load-path? #f))

(define (emacs-config-files sections)
  `(("emacs/init.el" ,(config-sections->init-file sections))))

(define emacs-init-file-service-type
  (service-type
   (name 'emacs-init-file)
   (description "Generate emacs init file")
   (extensions (list (service-extension home-xdg-configuration-files-service-type
                                        emacs-config-files)))
   (compose concatenate)
   (extend append)
   (default-value '())))

(define (package-without-tests p)
  (package
    (inherit p)
    (arguments
     (substitute-keyword-arguments (package-arguments p)
       ((#:tests? _ #f) #f)
       ((#:phases phases)
        #~(modify-phases #$phases
            (delete 'check)))))))


(define (emacs-packaging-config->packages config)
  (let* ((the-emacs (emacs-packaging-config-emacs-package config))
         (transformer (package-mapping
                       (lambda (p)
                         (let ((emacsen (list "emacs" "emacs-minimal"))
                               (untestworthy (list
                                              "emacs-ess"
                                              "emacs-buttercup"
                                              "emacs-helpful"
                                              ;; "emacs-elisp-refs"
                                              ;; "emacs-all-the-icons"
                                              ;; "emacs-rainbow-delimiters"
                                              "emacs-lispy"
                                              "emacs-yasnippet"
                                              ))
                               (sub-alist `(("emacs-powerline" . ,emacs-powerline)
                                            ("emacs-general" . ,emacs-general)
                                            ("emacs-which-key" . ,the-emacs)))) ;; Which-key is built in now.
                           (cond ((member (package-name p) emacsen) the-emacs)
                                 ((member (package-name p) untestworthy) (package-without-tests p))
                                 ((assoc-ref sub-alist (package-name p)))
                                 (else p))))
                       (const #f)
                       #:deep? #t)))
    (cons* the-emacs
           (map (lambda (package-pair)
                  (let ((package (car package-pair)))
                    (if (cdr package-pair)
                        (transformer package)
                        package)))
                (emacs-packaging-config-packages config)))))

(define emacs-packages-service-type
  (service-type
   (name 'emacs-packages)
   (description "Add emacs packages to profile, possibly recompiling with alternate emacs")
   (extensions (list (service-extension home-profile-service-type
                                        emacs-packaging-config->packages)))
   (compose concatenate)
   (extend (lambda (config packages)
             (emacs-packaging-config
              (inherit config)
              (packages (append (emacs-packaging-config-packages config) packages)))))
   (default-value (emacs-packaging-config))))

(define-record-type* <emacs-use-package>
  emacs-use-package make-emacs-use-package
  emacs-use-package?
  (name emacs-use-package-name)
  (package emacs-use-package-package (default #f))
  (body emacs-use-package-body (default (list)))
  (native? emacs-use-package-native? (default #t)))

(define-syntax use-package
  (syntax-rules ()
    ((_ the-name (k v) rest ...)
     (emacs-use-package
      (inherit (use-package the-name rest ...))
      (k v)))
    ((_ the-name the-body ...)
     (emacs-use-package (name 'the-name) (body #~(the-body ...))))))

(define-record-type* <emacs-prologue>
  emacs-prologue make-emacs-prologue
  emacs-prologue?
  (body emacs-prologue-body))

(define-syntax prologue
  (syntax-rules ()
    ((_ code ...) (emacs-prologue (body (list #~code ...))))))

(define-record-type* <emacs-epilogue>
  emacs-epilogue make-emacs-epilogue
  emacs-epilogue?
  (body emacs-epilogue-body))

(define-syntax epilogue
  (syntax-rules ()
    ((_ code ...) (emacs-epilogue (body (list #~code ...))))))

(define-record-type* <emacs-config>
  emacs-config make-emacs-config
  emacs-config?
  ;; (use-package emacs-config-use-package (default pkg:emacs-use-package))
  (general emacs-config-general (default pkg:emacs-general))
  (sections emacs-config-sections (default (list))))

(define (config->packages config)
  (cons* ;; (cons (emacs-config-use-package config) #t)
   (cons (emacs-config-general config) #t)
   (map (lambda (use-package)
          (cons (or (emacs-use-package-package use-package)
                    (specification->package
                     (string-append "emacs-"
                                    (symbol->string
                                     (emacs-use-package-name use-package)))))
                (emacs-use-package-native? use-package)))
        (filter (lambda (s)
                  (and (emacs-use-package? s)
                       (not (eqv? (emacs-use-package-package s) 'builtin))))
                (emacs-config-sections config)))))

(define (use-package->config-sect use-package)
  #~(use-package #$(emacs-use-package-name use-package)
                 #$@(emacs-use-package-body use-package)))

(define (config->init-sections config)
  (let ((sections (emacs-config-sections config)))
    (list
     (cons* 10
            #~(require 'use-package)
            #~(require 'general)
            (append-map emacs-prologue-body (filter emacs-prologue? sections)))
     (cons 50 (map use-package->config-sect (filter emacs-use-package? sections)))
     (cons 90 (append-map emacs-epilogue-body (filter emacs-epilogue? sections))))))

(define emacs-config-service-type
  (service-type
   (name 'emacs-config)
   (description "Configure emacs")
   (extensions (list (service-extension emacs-packages-service-type config->packages)
                     (service-extension emacs-init-file-service-type config->init-sections)))
   (compose concatenate)
   (extend (lambda (config sections)
             (emacs-config
              (inherit config)
              (sections (append (emacs-config-sections config) sections)))))
   (default-value (emacs-config))))

(define-syntax emacs-config-service
  (syntax-rules ()
    ((_ name sections ...) (simple-service 'name emacs-config-service-type (list sections ...)))))
