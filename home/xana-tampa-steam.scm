(use-modules (nongnu packages game-client)
             (nonguix multiarch-container)
             (gnu packages freedesktop)
             (gnu packages lsof)
             (guix packages))

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
