(define-module (djeis system drivey)
  #:use-module (gnu)
  #:use-module (guix utils)
  #:use-module ((djeis keys) #:select (nonguix-key))
  #:use-module (djeis system)
  #:use-module (gnu services linux)
  #:use-module (gnu services xorg))

(use-modules (gnu) (guix utils))
(use-modules ((djeis keys) #:select (nonguix-key))
             (djeis system))
(use-service-modules linux nix)

(define (btrfs-fs subvol target)
  (file-system
    (device (uuid "4536cfbc-1d68-441e-9ab5-17c804414ccc"))
    (mount-point target)
    (type "btrfs")
    (options (string-append "subvol=" subvol))))

(define-public os
  (operating-system
    (inherit %djeis-common-desktop-os)
    (host-name "drivey")

    (kernel-arguments (cons* "module_blacklist=r8152" %default-kernel-arguments))

    (bootloader (bootloader-configuration
                  (bootloader grub-efi-removable-bootloader)
                  (targets '("/boot/efi"))))

    (file-systems (cons* (file-system
                           (device (uuid "a7c74828-081a-419f-bb45-ac2f8b6b52ef"))
                           (mount-point "/")
                           (type "ext4"))
                         (file-system
                           (device (uuid "0E9B-C5DB" 'fat))
                           (mount-point "/boot/efi")
                           (type "vfat"))
                         (file-system
                           (device (uuid "32CA-5355" 'fat))
                           (mount-point "/data")
                           (type "vfat"))
                         %base-file-systems))

    (services (cons* (set-xorg-configuration (xorg-configuration))
                     (djeis-common-desktop-services this-operating-system)))

    ;; Allow resolution of '.local' host names with mDNS.
    (name-service-switch %mdns-host-lookup-nss)))
