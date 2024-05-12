
;; This is an operating system configuration template
;; for a "desktop" setup with GNOME and Xfce where the
;; root partition is encrypted with LUKS, and a swap file.

(use-modules (gnu) (gnu system nss) (guix utils))
(use-modules (nongnu packages linux) (nongnu system linux-initrd))
(use-modules ((djeis keys) #:select (nonguix-key)))
(use-service-modules ssh desktop sddm xorg sound vpn linux dns nix)
(use-package-modules certs gnome connman)

(operating-system
 (host-name "elitebook")
 (timezone "America/New_York")
 (locale "en_US.utf8")

 (kernel linux)
 (firmware (cons* linux-firmware sof-firmware %base-firmware))

 ;; Use the UEFI variant of GRUB with the EFI System
 ;; Partition mounted on /boot/efi.
 (bootloader (bootloader-configuration
              (bootloader grub-efi-bootloader)
              (targets '("/boot/"))))

 (file-systems (append
                (list (file-system
                       (device (uuid "4536cfbc-1d68-441e-9ab5-17c804414ccc"))
                       (mount-point "/")
                       (type "btrfs")
                       (options "subvol=@guixroot"))
                      (file-system
                       (device (uuid "C8EA-53E6" 'fat))
                       (mount-point "/boot/")
                       (type "vfat"))
                      (file-system
                       (device (uuid "4536cfbc-1d68-441e-9ab5-17c804414ccc"))
                       (mount-point "/gnu/store")
                       (type "btrfs")
                       (options "subvol=@guix/store"))
                      (file-system
                       (device (uuid "4536cfbc-1d68-441e-9ab5-17c804414ccc"))
                       (mount-point "/var/guix")
                       (type "btrfs")
                       (options "subvol=@guix/var"))
                      (file-system
                       (device (uuid "4536cfbc-1d68-441e-9ab5-17c804414ccc"))
                       (mount-point "/home")
                       (type "btrfs")
                       (options "subvol=@home"))
                      (file-system
                       (device (uuid "4536cfbc-1d68-441e-9ab5-17c804414ccc"))
                       (mount-point "/.snapshots")
                       (type "btrfs")
                       (options "subvol=@snapshots")))
                %base-file-systems))

 (initrd (lambda (file-systems . rest)
           (apply microcode-initrd file-systems
                  #:volatile-root? #t
                  rest)))

 (users (cons (user-account
               (name "jay")
               (comment "Elijah Malaby")
               (group "users")
               (supplementary-groups '("wheel" "netdev"
                                       "audio" "video")))
              %base-user-accounts))


 ;; This is where we specify system-wide packages.
 (packages (append (list
                    ;; for HTTPS access
                    nss-certs
                    ;; for user mounts
                    gvfs

                    connman)
                   %base-packages))

 ;; Add GNOME and Xfce---we can choose at the log-in screen
 ;; by clicking the gear.  Use the "desktop" services, which
 ;; include the X11 log-in service, networking with
 ;; NetworkManager, and more.
 (services (append (list (simple-service 'subuid-subgid etc-service-type
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
                         (service zram-device-service-type
                                  (zram-device-configuration
                                   (size "4G")))
                         (service openssh-service-type
                                  (openssh-configuration
                                    (password-authentication? #f)
                                    (x11-forwarding? #t)))
                         (service gnome-desktop-service-type)
                         (service xfce-desktop-service-type)
                         (service wireguard-service-type
                           (wireguard-configuration
                             (interface "wg1")
                             (port 51821)
                             (addresses (list "10.49.0.36" "2001:db8:a160::24"))
                             (dns (list "1.1.1.1" "172.31.58.19" "fd00::f:3a13"))
                             (private-key "/etc/wireguard/wg1.key")
                             (peers (list (wireguard-peer
                                           (name "iris")
                                           (public-key "wDzZ8G7wpECPm/TCtgQ9J25F8JBr62WxpzCBCpbxKDU=")
                                           (preshared-key "/etc/wireguard/wg1-psk.key")
                                           (endpoint "52.44.60.165:51820")
                                           (allowed-ips (list
                                        ;"fde6:8273:a154:40ce::/64"
                                        ;"172.16.0.0/16"
                                        ;"131.247.2.45/32"
                                        ;"131.247.3.200/32"
                                                         "0.0.0.0/0"
                                                         "::/0"))
                                           (keep-alive 15))))))
                         (service nix-service-type)
                         (service dnsmasq-service-type
                                   (dnsmasq-configuration
                                    (no-resolv? #t)
                                    (servers
                                     '("/ec2.internal/127.10.0.1"
                                       "/iris.internal/127.10.0.1"
                                       "1.1.1.1")))))
                   (modify-services %desktop-services
                                    (guix-service-type
                                     config =>
	                             (guix-configuration
		                      (inherit config)
		                      (substitute-urls (cons "https://substitutes.nonguix.org" %default-substitute-urls))
		                      (authorized-keys (cons nonguix-key %default-authorized-guix-keys)))))))

 ;; Allow resolution of '.local' host names with mDNS.
 (name-service-switch %mdns-host-lookup-nss))
