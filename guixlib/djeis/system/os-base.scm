(define-module (djeis system os-base)
  #:use-module (gnu bootloader)
  #:use-module (gnu bootloader grub)
  #:use-module (gnu packages certs)
  #:use-module (gnu packages package-management)
  #:use-module (gnu services)
  #:use-module (gnu services base)
  #:use-module (gnu services ssh)
  #:use-module (gnu services networking)
  #:use-module (gnu system)
  #:use-module (gnu system file-systems)
  #:use-module (guix gexp)
  #:use-module (guix packages)
  #:use-module (djeis keys))

(define-public sshd-config
  (openssh-configuration
   (authorized-keys
    `(("root" ,elijah-key)))
   (password-authentication? #f)
   (x11-forwarding? #t)
   (permit-root-login 'prohibit-password)))

(define-public grub-efi-/boot-config
  (bootloader-configuration
   (bootloader grub-efi-bootloader)
   (targets '("/boot/efi"))))

(define-public djeis-base-services
  (cons (service openssh-service-type sshd-config)
        %base-services))

(define efi
  (file-system
   (mount-point "/boot/efi")
   (device "/dev/sda1")
   (type "vfat")))

(define-public base-file-systems
  (cons efi %base-file-systems))

(define-public basic-os
  (operating-system
   (host-name "base")
   (timezone "America/New_York")
   (locale "en_US.utf8")
   (label (string-append "GNU Guix " (package-version guix)))
   (bootloader grub-efi-/boot-config)
   (services djeis-base-services)
   (packages (cons nss-certs %base-packages))
   (file-systems (cons (file-system
                        (mount-point "/")
                        (device "none")
                        (type "tmpfs"))
                       efi))))

(define-public basic-vm-os
  (operating-system
   (inherit basic-os)
   (bootloader grub-efi-/boot-config)
   (file-systems (cons* (file-system
                         (mount-point "/")
                         (device "/dev/vda2")
                         (type "ext4"))
                        (file-system
                         (mount-point "/boot/efi")
                         (device "/dev/vda1")
                         (type "vfat"))
                        %base-file-systems))))
