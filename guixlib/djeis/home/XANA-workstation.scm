(define-module (djeis home XANA-workstation)
  #:use-module (gnu home)
  #:use-module (gnu services)
  #:use-module (gnu home services)
  #:use-module (gnu home services shepherd)
  #:use-module (djeis home)
  #:use-module (nongnu packages game-client)
  #:use-module (nongnu packages nvidia)
  #:use-module (nonguix multiarch-container)
  #:use-module (gnu packages freedesktop)
  #:use-module (gnu packages lsof)
  #:use-module (guix gexp)
  #:use-module (guix transformations)
  #:use-module (guix packages))

(define test-free-for-32bit
  (options->transformation '((without-tests . "libcamera")
                             (without-tests . "gst-plugins-good"))))

(define steam-package
  (let* ((steam-container-base (steam-container-for nvda)))
    (nonguix-container->package
     (nonguix-container
      (inherit steam-container-base)
      (shared (list "/localmedia/steam_share/" "/auto/cephfs/steam/"))
      (packages (cons* (list "portal" xdg-desktop-portal-gtk)
                       (ngc-packages steam-container-base)))
      (union32 (fhs-union (ngc-packages steam-container-base)
                          #:name "fhs-union-32"
                          #:system "i686-linux"))))))

(define-public home
  (home-environment
   (packages (cons steam-package (desktop-home-packages)))
   (services (base-home-services "XANA-workstation"))))
