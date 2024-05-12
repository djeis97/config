
;; This is an operating system configuration template
;; for a "desktop" setup with GNOME and Xfce where the
;; root partition is encrypted with LUKS, and a swap file.

(use-modules (gnu) (gnu packages storage) (gnu system nss) (guix transformations) (guix utils) (gnu packages linux))
(use-modules (nongnu packages nvidia) (nongnu packages linux) (nongnu system linux-initrd) (nongnu services nvidia))
(use-modules ((djeis keys) #:select (nonguix-key bordeaux-inria-key))
             (djeis services autofs))
(use-service-modules desktop linux sddm xorg sound ssh dns nix)
(use-package-modules xorg certs gnome connman package-management)

(define transform
  (options->transformation
   '((with-graft . "mesa=nvda"))))

(define ceph-file-system
  (file-system
   (mount-point "cephfs")
   (device "::/")
   (type "ceph")
   (options "name=admin")))
(define autofs-auto-map
  (plain-file "autofs.auto" (file-system->autofs-line ceph-file-system)))
(define autofs-master-map
  (mixed-text-file "autofs.master" "/auto " autofs-auto-map "\n"))

(operating-system
  (host-name "XANA-tampa")
  (timezone "America/New_York")
  (locale "en_US.utf8")

  (kernel linux-lts)
  (kernel-arguments (cons "modprobe.blacklist=nouveau elogind.legacy_elogind_cgroup_controller=1 systemd.unified_cgroup_hierarchy=0" %default-kernel-arguments))
  (firmware (cons* linux-firmware sof-firmware %base-firmware))

  ;; Use the UEFI variant of GRUB with the EFI System
  ;; Partition mounted on /boot/efi.
  (bootloader (bootloader-configuration
               (bootloader grub-bootloader)
               (targets '("/dev/sda"))
               (menu-entries
                (list
                 (menu-entry
                  (label "Arch")
                  (device (uuid "363a6d7c-4d33-4117-9f08-affeecc006d8"))
                  (device-mount-point "/gnu/store")
                  (linux (local-file "/boot/vmlinuz-linux"))
                  (initrd (local-file "/boot/initramfs-linux.img")))))))

  (file-systems (append
                 (list (file-system
                         (device (uuid "363a6d7c-4d33-4117-9f08-affeecc006d8"))
                         (mount-point "/")
                         (type "btrfs")
                         (options "subvol=/@guixroot"))
                       (file-system
                         (device (uuid "363a6d7c-4d33-4117-9f08-affeecc006d8"))
                         (mount-point "/boot")
                         (type "btrfs")
                         (options "subvol=/@boot"))
                       (file-system
                         (device (uuid "363a6d7c-4d33-4117-9f08-affeecc006d8"))
                         (mount-point "/btrroot")
                         (type "btrfs")
                         (options "subvolid=5"))
                       (file-system
                         (device (uuid "363a6d7c-4d33-4117-9f08-affeecc006d8"))
                         (mount-point "/gnu/store")
                         (type "btrfs")
                         (options "subvol=/@gnu/store"))
                       (file-system
                         (device (uuid "363a6d7c-4d33-4117-9f08-affeecc006d8"))
                         (mount-point "/var/guix")
                         (type "btrfs")
                         (options "subvol=/@gnu/var"))
                       (file-system
                         (device (uuid "363a6d7c-4d33-4117-9f08-affeecc006d8"))
                         (mount-point "/home")
                         (type "btrfs")
                         (options "subvol=/@home"))
                       (file-system
                         (device (uuid "363a6d7c-4d33-4117-9f08-affeecc006d8"))
                         (mount-point "/nix")
                         (type "btrfs")
                         (options "subvol=/@nix"))
                       (file-system
                         (device (uuid "363a6d7c-4d33-4117-9f08-affeecc006d8"))
                         (mount-point "/.snapshots")
                         (type "btrfs")
                         (options "subvol=/@snapshots")))
                 %base-file-systems))

  (swap-devices
   (list
    (swap-space
     (target "/btrroot/@swap/swapfile")
     (dependencies (filter (file-system-mount-point-predicate "/btrroot")
                           file-systems))
     (priority 1000)
     (discard? #t))))
  (initrd (lambda (file-systems . rest)
            (apply microcode-initrd file-systems
                   #:volatile-root? #t
                   rest)))

  (users (cons* (user-account
                 (name "jay")
                 (comment "Elijah Malaby")
                 (group "users")
                 (supplementary-groups '("wheel" "netdev"
                                         "audio" "video")))
                (user-account
                 (name "vpn")
                 (comment "VPN user")
                 (uid 1002)
                 (group "users")
                 (supplementary-groups (list)))
                %base-user-accounts))


  ;; This is where we specify system-wide packages.
  (packages (append (list
                     ;; for user mounts
                     gvfs

                     connman

                     ceph

                     nvidia-driver)
                    %base-packages))

  ;; Add GNOME and Xfce---we can choose at the log-in screen
  ;; by clicking the gear.  Use the "desktop" services, which
  ;; include the X11 log-in service, networking with
  ;; NetworkManager, and more.
  (services (append (list (service nix-service-type)
                          (service gnome-desktop-service-type)
                          (service xfce-desktop-service-type)
                          (service nvidia-service-type)
                          (service openssh-service-type
                                   (openssh-configuration
                                    (password-authentication? #f)
                                    (x11-forwarding? #t)))
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
                          (udev-rules-service 'pipewire pipewire)
                          (service dnsmasq-service-type
                                   (dnsmasq-configuration
                                    (no-resolv? #t)
                                    (servers
                                     '("/ec2.internal/127.10.0.1"
                                       "/iris.internal/127.10.0.1"
                                       "1.1.1.1")))))
                    (modify-services
                        %desktop-services
                      (guix-service-type
                       config =>
                       (guix-configuration
                        (inherit config)
                        (substitute-urls (cons* "https://substitutes.nonguix.org"
                                                "https://guix.bordeaux.iria.fr"
                                                %default-substitute-urls))
                        (authorized-keys (cons* nonguix-key
                                                bordeaux-inria-key
                                                %default-authorized-guix-keys))))
                      (gdm-service-type
                       config =>
                       (gdm-configuration
                        (inherit config)
                        (xorg-configuration (xorg-configuration
                                             (modules (cons* nvidia-driver %default-xorg-modules))
                                             (server (transform xorg-server))
                                             (drivers '("nvidia")))))))))

  ;; Allow resolution of '.local' host names with mDNS.
  (name-service-switch %mdns-host-lookup-nss))
