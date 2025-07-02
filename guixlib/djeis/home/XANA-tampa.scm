(define-module (djeis home XANA-tampa)
  #:use-module (gnu home)
  #:use-module (gnu services)
  #:use-module (gnu home services)
  #:use-module (gnu home services shepherd)
  #:use-module (djeis home)
  #:use-module (nongnu packages game-client)
  #:use-module (nonguix multiarch-container)
  #:use-module (gnu packages freedesktop)
  #:use-module (gnu packages lsof)
  #:use-module (guix gexp)
  #:use-module (guix packages))


(define-public home
  (home-environment
   (packages (cons
              (nonguix-container->package
               (nonguix-container
                (inherit steam-nvidia-container)
                (shared (list "/btrroot/@localmedia/steam_share/" "/auto/cephfs/steam/"))
                (union64
                 (fhs-union (list (list "union" (ngc-union64 steam-nvidia-container))
                                  (list "portal" xdg-desktop-portal-gtk)
                                  (list "lsof" lsof)
                                  (list "xdg-user-dirs" xdg-user-dirs))
                            #:name "fhs-union-64"))
                (union32
                 (fhs-union (list (list "union" (ngc-union32 steam-nvidia-container))
                                  (list "portal" xdg-desktop-portal-gtk))
                            #:name "fhs-union-32"
                            #:system "i686-linux"))))
              (desktop-home-packages)))
   (services (cons*
              (simple-service 'syncthing home-shepherd-service-type
                              (list (shepherd-service
                                     (provision '(syncthing))
                                     (start #~(make-forkexec-constructor '("syncthing" "-no-browser")))
                                     (stop #~(make-kill-destructor)))))
              (base-home-services "XANA-tampa")))))
