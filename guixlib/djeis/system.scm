(define-module (djeis system)
  #:use-module (gnu system)
  #:use-module (gnu system shadow)
  #:use-module (gnu services)
  #:use-module (gnu services guix)
  #:use-module (gnu services base)
  #:use-module (gnu services desktop)
  #:use-module (gnu services linux)
  #:use-module (gnu services dns)
  #:use-module (gnu services ssh)
  #:use-module (gnu packages)
  #:use-module (gnu packages linux)
  #:use-module (nongnu packages linux)
  #:use-module (nongnu system linux-initrd)
  #:use-module (djeis home)
  #:use-module (djeis keys)
  #:export (%djeis-common-desktop-users
            djeis-common-desktop-services
            %djeis-common-desktop-os
            get-os
            get-this-host-os))

(define %djeis-common-desktop-users
  (cons (user-account
         (name "jay")
	 (uid 1000)
         (comment "Elijah Malaby")
         (group "users")
         (supplementary-groups '("wheel" "netdev"
                                 "audio" "video")))
        %base-user-accounts))

(define (djeis-common-desktop-services os)
  (append
   (list
    (service guix-home-service-type
             `(("jay" ,(get-home-config (operating-system-host-name os)))))
    (service gnome-desktop-service-type)
    (service xfce-desktop-service-type)
    (service openssh-service-type
             (openssh-configuration
              (password-authentication? #f)
              (x11-forwarding? #t)))
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
                               "https://guix.bordeaux.inria.fr"
                               %default-substitute-urls))
       (authorized-keys (cons* nonguix-key
                               bordeaux-inria-key
                               %default-authorized-guix-keys)))))))

(define %djeis-common-desktop-os
  (operating-system
    (host-name "common")
    (timezone "America/New_York")
    (kernel linux-lts)
    (firmware (cons* linux-firmware sof-firmware %base-firmware))
    (initrd (lambda (file-systems . rest)
              (apply microcode-initrd file-systems
                     #:volatile-root? #t
                     rest)))
    (bootloader #f)
    (file-systems #f)
    (users %djeis-common-desktop-users)
    (services (djeis-common-desktop-services this-operating-system))))

(define (get-os name)
  (module-ref (resolve-interface (list 'djeis 'system (string->symbol name))) 'os))

(define (get-this-host-os)
  (get-os (gethostname)))
