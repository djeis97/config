(define-module (djeis system XANA-tampa)
  #:use-module (gnu)
  #:use-module (djeis system)
  #:use-module (gnu packages storage)
  #:use-module (gnu system nss)
  #:use-module (guix utils)
  #:use-module (gnu packages linux)
  #:use-module (nongnu packages nvidia)
  #:use-module (nongnu packages linux)
  #:use-module (nongnu system linux-initrd)
  #:use-module (nongnu services nvidia)
  #:use-module ((djeis keys) #:select (nonguix-key bordeaux-inria-key))
  #:use-module (djeis services autofs)
  #:use-module (gnu services desktop)
  #:use-module (gnu services linux)
  #:use-module (gnu services xorg)
  #:use-module (gnu services sound)
  #:use-module (gnu services nix)
  #:use-module (gnu packages xorg)
  #:use-module (gnu packages gnome)
  #:use-module (gnu packages package-management))

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

    (kernel-arguments (cons* "modprobe.blacklist=nouveau"
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
    (packages (cons* ceph nvidia-driver %base-packages))

    (services (append (list (service nix-service-type)
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
                                                             (multi-profile 'multiple))))
                      (modify-services
                          (djeis-common-desktop-services this-operating-system)
                        (gdm-service-type
                         config =>
                         (gdm-configuration
                          (inherit config)
                          (xorg-configuration (xorg-configuration
                                               (modules (cons* nvidia-driver %default-xorg-modules))
                                               (server (replace-mesa xorg-server))
                                               (drivers '("nvidia")))))))))

    ;; Allow resolution of '.local' host names with mDNS.
    (name-service-switch %mdns-host-lookup-nss)))
