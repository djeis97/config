(define-module (djeis services)
  #:use-module (gnu services)
  #:use-module (guix gexp)
  #:use-module (guix monads)
  #:use-module (guix store)
  #:use-module (guix profiles)
  #:use-module (gnu home services)
  #:use-module (gnu home services utils)
  #:use-module (srfi srfi-1)
  #:export (home-extra-profiles-service-type))

(define (manifests->profiles manifests)
  (mlet %store-monad ((_ (current-target-system)))
    (let* ((profiles (map (lambda (key)
                            (list key
                                  (profile
                                   (content
                                    (concatenate-manifests
                                     (map (lambda (ext)
                                            (if (manifest? (cdr ext))
                                                (cdr ext)
                                                (packages->manifest (cdr ext))))
                                          (filter (lambda (ext) (equal? (car ext) key))
                                                  manifests)))))))
                          (delete-duplicates (map car manifests)))))
      (return `(("extra-profiles" ,(file-union "extra-profiles" profiles)))))))

(define home-extra-profiles-service-type
  (service-type
   (name 'home-extra-profiles)
   (extensions
    (list (service-extension home-service-type manifests->profiles)))
   (compose concatenate)
   (extend append)
   (description "")))




