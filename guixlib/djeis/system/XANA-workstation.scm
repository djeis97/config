(define-module (djeis system XANA-workstation)
  #:use-module (gnu)
  #:use-module (djeis system)
  #:use-module (gnu system nss)
  #:use-module (guix utils)
  #:use-module (gnu packages linux)
  #:use-module (nongnu packages nvidia)
  #:use-module (nongnu packages linux)
  #:use-module (nongnu system linux-initrd)
  #:use-module (nongnu services nvidia)
  #:use-module ((djeis keys) #:select (nonguix-key bordeaux-inria-key))
  #:use-module (djeis services autofs)
  #:use-module (djeis packages tailscale)
  #:use-module ((djeis services ceph) #:select (ceph-rbd-udev))
  #:use-module (gnu services desktop)
  #:use-module (gnu services shepherd)
  #:use-module (gnu services linux)
  #:use-module (gnu services xorg)
  #:use-module (gnu services sound)
  #:use-module (gnu services nix)
  #:use-module (gnu packages xorg)
  #:use-module (gnu packages gnome)
  #:use-module (gnu packages package-management)
  #:use-module ((gnu packages backup) #:select (btrbk))
  #:use-module ((gnu packages storage) #:select (ceph)))

(define-public os
  (operating-system
    (inherit %djeis-common-desktop-os)
    (host-name "XANA-workstation")

    (kernel-loadable-modules (list v4l2loopback-linux-module))

    (kernel-arguments (cons* "module_blacklist=nouveau,r8152" ; r8152 is the buggy driver for the network adapter in my KVM
                             "nvidia_drm.fbdev=1"
                             "nvidia_drm.modeset=1"
                             "elogind.legacy_elogind_cgroup_controller=1"
                             "systemd.unified_cgroup_hierarchy=0"
                             %default-kernel-arguments))

    (bootloader (bootloader-configuration
                  (bootloader grub-efi-bootloader)
                  (targets '("/boot/efi"))))

    (mapped-devices (list (mapped-device
                            (source (uuid "bb0f6c71-6ad3-439a-9b48-8022ec4f8862"))
                            (target "workstation-root")
                            (type luks-device-mapping))))

    (file-systems (cons* (file-system
                           (device "/dev/mapper/workstation-root")
                           (mount-point "/")
                           (type "xfs"))
                         (file-system
                           (device (uuid "5124-B141" 'fat))
                           (mount-point "/boot/efi")
                           (type "vfat"))
                         %base-file-systems))

    (users (cons* (user-account
                    (name "vpn")
                    (comment "VPN user")
                    (uid 1002)
                    (group "users")
                    (supplementary-groups (list)))
                  %djeis-common-desktop-users))


    ;; This is where we specify system-wide packages.
    (packages (cons* tailscale ceph nvidia-driver %base-packages))

    (services (append (list (service nix-service-type
                                     (nix-configuration
                                       (extra-config (list "secret-key-files = /nix/var/nix/keyring/XANA-workstation/secret\n"))))
                            (service nvidia-service-type)
                            (service automount-service-type
                                     (automount-config
                                      (autofs-conf (plain-file "autofs.conf" ""))
                                      (autofs-master autofs-master-map)))
                            (service zram-device-service-type
                                     (zram-device-configuration
                                       (size "16G")
                                       (memory-limit "17G")
                                       (priority 2000)))
                            (service bluetooth-service-type (bluetooth-configuration
                                                              (multi-profile 'multiple)))
                            (simple-service 'tailscale-service shepherd-root-service-type
                                            (list (shepherd-service
                                                    (provision '(tailscaled))
                                                    (requirement '(user-processes))
                                                    (start #~(make-forkexec-constructor
                                                              (list
                                                               #$(file-append tailscale "/bin/tailscaled")
                                                               "-state" "mem:"
                                                               "-statedir" "/var/lib/tailscale/"))))))
                            ;; (simple-service 'my-timers shepherd-root-service-type
                            ;;                 (list (shepherd-timer '(take-snapshots)
                            ;;                                       "0 * * * *"
                            ;;                                       #~(#$(file-append btrbk "/bin/btrbk")
                            ;;                                            "-c" "/btrroot/btrbk.conf"
                            ;;                                            "-p"
                            ;;                                            "snapshot")
                            ;;                                       #:requirement '(user-processes))))
                            (udev-rules-service 'ceph-rbd-udev-rules (file->udev-rule "50-ceph.rules" ceph-rbd-udev))
                            (set-xorg-configuration
                             (xorg-configuration
                               (modules (cons nvda %default-xorg-modules))
                               (drivers '("nvidia")))))
                      (djeis-common-desktop-services this-operating-system)))

    ;; Allow resolution of '.local' host names with mDNS.
    (name-service-switch %mdns-host-lookup-nss)))
