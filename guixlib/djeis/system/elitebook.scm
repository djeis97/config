(define-module (djeis system elitebook)
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
    (host-name "elitebook")

    (kernel-arguments (cons* "module_blacklist=r8152" %default-kernel-arguments))

    (bootloader (bootloader-configuration
                 (bootloader grub-efi-bootloader)
                 (targets '("/boot/"))))

    (file-systems (cons* (btrfs-fs "@guixroot" "/")
                         (file-system
                           (device (uuid "C8EA-53E6" 'fat))
                           (mount-point "/boot/")
                           (type "vfat"))
                         (btrfs-fs "@guix/store" "/gnu/store")
                         (btrfs-fs "@guix/var" "/var/guix")
                         (btrfs-fs "@home" "/home")
                         (btrfs-fs "@nix" "/nix")
                         (btrfs-fs "@snapshots" "/.snapshots")
                         %base-file-systems))

    (services (cons* (simple-service 'subuid-subgid etc-service-type
                                     `(("subuid"
                                        ,(plain-file "subuid"
                                                     (string-join
                                                      '("root:65536:65536"
                                                        "jay:16777216:65536")
                                                      "\n" 'suffix)))
                                       ("subgid"
                                        ,(plain-file "subgid"
                                                     (string-join
                                                      '("root:65536:65536"
                                                        "jay:16777216:65536")
                                                      "\n" 'suffix)))))
                     (service nix-service-type
                              (nix-configuration
                               (extra-config (list "extra-trusted-public-keys = XANA-tampa:9htb3W8vceNG0NdY6UGPH8kJnRRvf+B5XlWSMCDQ3F0=jay@XANA-tampa\n"))))
                     (service zram-device-service-type
                              (zram-device-configuration
                               (size "4G")))
                     (set-xorg-configuration (xorg-configuration))
                     (djeis-common-desktop-services this-operating-system)))

    ;; Allow resolution of '.local' host names with mDNS.
    (name-service-switch %mdns-host-lookup-nss)))
