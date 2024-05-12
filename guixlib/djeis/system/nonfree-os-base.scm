(define-module (djeis system nonfree-os-base)
  #:use-module (djeis system os-base)
  #:use-module (djeis keys)
  #:use-module (gnu services)
  #:use-module (gnu services base)
  #:use-module (gnu services ssh)
  #:use-module (gnu system)
  #:use-module (guix packages)
  #:use-module (nongnu packages linux)
  #:use-module (nongnu system linux-initrd))

(define-public (guix-config-with-nonguix-substitutes config)
  (guix-configuration
   (inherit config)
   (substitute-urls (cons "https://substitutes.nonguix.org"
                          (guix-configuration-substitute-urls config)))
   (authorized-keys (cons* nonguix-key
                           (guix-configuration-authorized-keys config)))))

(define-public (services-with-nonguix-substitutes services)
  (modify-services services
                   (guix-service-type config => (guix-config-with-nonguix-substitutes config))))

(define-public (os-with-nonguix-substitutes os)
  (operating-system
   (inherit os)
   (services (services-with-nonguix-substitutes (operating-system-user-services os)))))

(define-public (infect-os os)
  (operating-system
   (inherit os)
   (kernel linux)
   (firmware (cons linux-firmware %base-firmware))
   (initrd microcode-initrd)))

(define-public basic-nonfree-os (os-with-nonguix-substitutes (infect-os basic-os)))
