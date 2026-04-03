(define-module (djeis system XANA-tampa)
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

(define autofs-master-map
  (let* ((cephfs (file-system
                   (mount-point "cephfs")
                   (device "::/")
                   (type "ceph")
                   (options "name=admin")))
         (autofs-auto-map
          (plain-file "autofs.auto" (file-system->autofs-line cephfs))))
    (mixed-text-file "autofs.master" "/auto " autofs-auto-map "\n")))

(define (btrfs-fs subvol target)
  (file-system
    (device (uuid "363a6d7c-4d33-4117-9f08-affeecc006d8"))
    (mount-point target)
    (type "btrfs")
    (options (string-append "subvol=" subvol))))

(define-public os
  (operating-system
    (inherit %djeis-common-desktop-os)
    (host-name "XANA-tampa")

    (kernel-loadable-modules (list v4l2loopback-linux-module))

    (kernel-arguments (cons* "module_blacklist=nouveau,r8152" ; r8152 is the buggy driver for the network adapter in my KVM
                             "nvidia_drm.fbdev=1"
                             "nvidia_drm.modeset=1"
                             "elogind.legacy_elogind_cgroup_controller=1"
                             "systemd.unified_cgroup_hierarchy=0"
                             %default-kernel-arguments))

    (bootloader (bootloader-configuration
                  (bootloader grub-bootloader)
                  (targets '("/dev/sda"))))

    (file-systems (cons* (btrfs-fs "/@guixroot" "/")
                         (btrfs-fs "/@boot" "/boot")
                         (btrfs-fs "/" "/btrroot")
                         (btrfs-fs "/@gnu/store" "/gnu/store")
                         (btrfs-fs "/@gnu/var" "/var/guix")
                         (btrfs-fs "/@home" "/home")
                         (btrfs-fs "/@nix" "/nix")
                         (btrfs-fs "/@snapshots" "/.snapshots")
                         %base-file-systems))

    (swap-devices
     (list
      (swap-space
        (target "/btrroot/@swap/swapfile")
        (dependencies (filter (file-system-mount-point-predicate "/btrroot")
                              file-systems))
        (priority 1000)
        (discard? #t))))

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
                                       (extra-config (list "secret-key-files = /nix/var/nix/keyring/XANA-tampa/secret\n"))))
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
                            (simple-service 'my-timers shepherd-root-service-type
                                            (list (shepherd-timer '(take-snapshots)
                                                                  "0 * * * *"
                                                                  #~(#$(file-append btrbk "/bin/btrbk")
                                                                       "-c" "/btrroot/btrbk.conf"
                                                                       "-p"
                                                                       "snapshot")
                                                                  #:requirement '(user-processes))))
                            (udev-rules-service 'ceph-rbd-udev-rules (file->udev-rule "50-ceph.rules" ceph-rbd-udev))
                            (set-xorg-configuration
                             (xorg-configuration
                               (modules (cons nvda %default-xorg-modules))
                               (drivers '("nvidia")))))
                      (djeis-common-desktop-services this-operating-system)))

    ;; Allow resolution of '.local' host names with mDNS.
    (name-service-switch %mdns-host-lookup-nss)))
