(define-module (djeis home EMALAB-PF5815M2)
  #:use-module (gnu home)
  #:use-module (gnu services)
  #:use-module (gnu home services)
  #:use-module (djeis home)
  #:use-module (gnu packages emacs)
  #:use-module (djeis services emacs-config)
  #:use-module (guix packages))


(define-public home
  (home-environment
   (packages (base-home-packages))
   (services (base-home-services "EMALAB-PF5815M2"))))
