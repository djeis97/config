(define-module (djeis vms)
  #:use-module (gnu)
  #:use-module (gnu bootloader)
  #:use-module (gnu bootloader grub)
  #:use-module (gnu system)
  #:use-module (gnu system file-systems)
  #:use-module (gnu services)
  #:use-module (gnu services base)
  #:use-module (gnu services ssh)
  #:use-module (gnu services shepherd)
  #:use-module (gnu services networking)
  #:use-module (guix gexp)
  #:use-module (djeis keys)
  #:use-module (djeis services autofs)
  #:use-module (djeis services libvirt-vms))


(define sshd-config
  (openssh-configuration
   (authorized-keys
    `(("root" ,elijah-key)))
   (password-authentication? #f)
   (x11-forwarding? #t)
   (permit-root-login 'prohibit-password)))

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

(define-public (basic-libvirt+ceph-vm-services host-ip)
  (cons*
   (service dhcpcd-service-type)
   (service static-networking-service-type
            (list
             (static-networking
              (provision '(virt-bridge))
              (addresses (list
                          (network-address
                           (device "eth1")
                           (value "192.168.87.2/24"))))
              (routes (list (network-route
                             (destination host-ip)
                             (gateway "192.168.87.1")))))))
   (service qemu-guest-agent-service-type
            (qemu-guest-agent-configuration
             (device "/dev/virtio-ports/org.qemu.guest_agent.0")))
   (service openssh-service-type sshd-config)
   (simple-service 'ceph-activation activation-service-type
                   #~(begin
                       (mkdir-p "/etc/ceph")
                       (symlink #$(local-file "/etc/ceph/ceph.conf") "/etc/ceph/ceph.conf")))
   (simple-service 'ceph-keyring-shepherd-service shepherd-root-service-type
                   (list (shepherd-service
                          (provision '(ceph-keyring))
                          (requirement '(udev))
                          (start #~(make-system-constructor #$coreutils "/bin/head -zn1 /dev/fd0 | "
                                                            #$coreutils "/bin/tr -d '\\0' >/etc/ceph/keyring"))
                          (one-shot? #t))))
   (service automount-service-type
            (automount-config
             (autofs-conf (plain-file "autofs.conf" ""))
             (autofs-master autofs-master-map)))
   %base-services))

(define-public basic-libvirt+ceph-vm-system
  (operating-system
    (host-name "a-vm")
    (timezone "America/New_York")
    (locale "en_US.utf8")
    (bootloader #f)
    (initrd (lambda (file-systems . rest)
              (apply base-initrd file-systems
                     #:volatile-root? #t
                     rest)))
    (file-systems (cons* (file-system
                           (mount-point "/")
                           (device "/dev/vda1")
                           (type "ext4"))
                         (file-system
                           (mount-point "/gnu/store")
                           (device "guix-store")
                           (flags '(read-only))
                           (options "loose,trans=virtio,msize=512000")
                           (type "9p")
                           (needed-for-boot? #t)
                           (create-mount-point? #t))
                         (append %control-groups %base-file-systems)))))

(define (basic-libvirt+ceph-vm system uuid host-lan-interface host-bridge)
  (libvirt-vm
   (system system)
   (uuid uuid)
   (network-interfaces (let ((mac-tail (string-append
                                        (substring/shared uuid 4 6) ":"
                                        (substring/shared uuid 6 8) ":"
                                        (substring/shared uuid 9 11))))
                         (list (libvirt-network-interface
                                (address (string-append "42:be:6e:" mac-tail))
                                (source (libvirt-network-macvtap-source
                                         (device host-lan-interface))))
                               (libvirt-network-interface
                                (address (string-append "52:be:6e:" mac-tail))
                                (source (libvirt-network-bridge-source
                                         (bridge host-bridge)))))))
   (extra-devices '((disk (@ (type file) (device floppy))
                          (driver (@ (name qemu) (type raw)))
                          (source (@ (file "/etc/ceph/ceph.client.admin.keyring")))
                          (backingStore)
                          (target (@ (dev fda) (bus fdc)))
                          (readonly))))))
