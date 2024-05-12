(define-module (djeis services libvirt-vms)
  #:use-module ((gnu packages virtualization) #:select (libvirt qemu))
  #:use-module (gnu system)
  #:use-module (gnu services)
  #:use-module (gnu services shepherd)
  #:use-module (guix gexp)
  #:use-module (guix records)
  #:use-module (guix modules)
  #:use-module (gnu image)
  #:use-module (gnu system image)
  #:export (libvirt-vm
            libvirt-network-interface
            libvirt-network-bridge-source
            libvirt-network-macvtap-source
            vmxml))

(define-record-type* <libvirt-vm>
  libvirt-vm make-libvirt-vm
  libvirt-vm?
  (system libvirt-vm-system)
  (uuid libvirt-vm-uuid)
  (qemu libvirt-vm-qemu (default qemu))
  (disk-size libvirt-vm-disk-size (default (expt 2 20)))
  (network-interfaces libvirt-vm-network-interfaces (default (list)))
  (extra-devices libvirt-vm-extra-devices (default (list))))

(define-record-type* <libvirt-network-bridge-source>
  libvirt-network-bridge-source make-libvirt-network-bridge-source
  libvirt-network-bridge-source?
  (bridge libvirt-network-bridge-source-bridge))

(define-record-type* <libvirt-network-macvtap-source>
  libvirt-network-macvtap-source make-libvirt-network-macvtap-source
  libvirt-network-macvtap-source?
  (device libvirt-network-macvtap-source-device)
  (mode libvirt-network-macvtap-source-mode (default "bridge")))

(define (libvirt-network-source? x)
  (or (libvirt-network-bridge-source? x)
      (libvirt-network-macvtap-source? x)))

(define (libvirt-network-source-type x)
  (cond ((libvirt-network-bridge-source? x) "bridge")
        ((libvirt-network-macvtap-source? x) "direct")))

(define-record-type* <libvirt-network-interface>
  libvirt-network-interface make-libvirt-network-interface
  libvirt-network-interface?
  (model-type libvirt-network-interface-model-type (default "virtio"))
  (address libvirt-network-interface-address)
  (source libvirt-network-interface-source))

(define (network-source->source-xml source)
  (cond ((libvirt-network-bridge-source? source)
         #~(source (@ (bridge #$(libvirt-network-bridge-source-bridge source)))))
        ((libvirt-network-macvtap-source? source)
         #~(source (@ (dev #$(libvirt-network-macvtap-source-device source))
                      (mode #$(libvirt-network-macvtap-source-mode source)))))))

(define (interface->interface-xml interface)
  (let ((source (libvirt-network-interface-source interface)))
    #~(interface (@ (type #$(libvirt-network-source-type source)))
                 (mac (@ (address #$(libvirt-network-interface-address interface))))
                 #$(network-source->source-xml source)
                 (model (@ (type #$(libvirt-network-interface-model-type interface)))))))

(define (sxml-file name sxml)
  (computed-file
   name
   (with-imported-modules
       (source-module-closure '(sxml simple))
     #~(begin
         (use-modules (sxml simple))
         (let ((sxml `#$sxml))
           (call-with-output-file #$output:out
             (lambda (port)
               (set-port-encoding! port "UTF-8")
               (sxml->xml sxml port))))))))

(define (vmxml vm)
  (let ((disk (system-image
               (image
                (inherit (raw-with-offset-disk-image))
                (operating-system (libvirt-vm-system vm))
                (size (libvirt-vm-disk-size vm))
                (shared-store? #t)
                (volatile-root? #t))))
        (os (libvirt-vm-system vm)))
    (sxml-file
     "domain.xml"
     #~(domain (@ (type kvm))
               (name #$(operating-system-host-name os))
               (uuid #$(libvirt-vm-uuid vm))
               (memory (@ (unit GiB)) 2)
               (os
                (type (@ (arch x86_64) (machine pc-q35-6.2)) hvm)
                (boot (@ (dev hd)))
                (kernel #$(operating-system-kernel-file os))
                (initrd #$(file-append os "/initrd"))
                (cmdline ,(string-join (list #$@(operating-system-kernel-arguments os "/dev/vda1")) " ")))
               (features (acpi) (apic) (vmport (@ (state off))))
               (cpu (@ (mode host-model) (check partial)))
               (clock (@ (offset utc))
                      (timer (@ (name rtc) (tickpolicy catchup)))
                      (timer (@ (name pit) (tickpolicy delay)))
                      (timer (@ (name hpet) (present no))))
               (on_poweroff destroy)
               (on_reboot restart)
               (on_crash destroy)
               (pm (suspend-to-mem (@ (enabled no)))
                   (suspend-to-disk (@ (enabled no))))
               (devices
                (emulator #$(file-append qemu "/bin/qemu-system-x86_64"))
                (disk (@ (type file) (device disk))
                      (driver (@ (name qemu) (type raw)))
                      (source (@ (file #$disk)))
                      (backingStore)
                      (readonly)
                      (target (@ (dev vda) (bus virtio))))
                (filesystem (@ (type mount) (accessmode passthrough))
                            (source (@ (dir "/gnu/store")))
                            (target (@ (dir "guix-store")))
                            (readonly))
                #$@(map interface->interface-xml (libvirt-vm-network-interfaces vm))
                #$@(libvirt-vm-extra-devices vm)
                (console (@ (type pty)))
                (channel (@ (type unix))
                         (source (@ (mode bind)))
                         (target (@ (type virtio) (name "org.qemu.guest_agent.0"))))
                (channel (@ (type spicevmc))
                         (target (@ (type virtio) (name "com.redhat.spice.0"))))
                (input (@ (type tablet) (bus usb)))
                (graphics (@ (type spice) (port -1) (tlsPort -1) (autoport yes)))
                (sound (@ (model ich9)))
                (video (model (@ (type qxl))))
                (redirdev (@ (bus usb) (type spicevmc)))
                (redirdev (@ (bus usb) (type spicevmc)))
                (memballoon (@ (model virtio)))
                (controller (@ (type pci) (model pcie-root)))
                (rng (@ (model virtio))
                     (backend (@ (model random)) "/dev/urandom")))))))

(define (vms->shepherd-services vms)
  (define (vm->shepherd-service vm)
    (let* ((vm-name (operating-system-host-name (libvirt-vm-system vm)))
           (service-name (string->symbol (string-append "virtual-machine-" vm-name))))
      (shepherd-service
       (provision (list service-name))
       (requirement '(user-processes libvirtd virt-bridge))
       (start #~(make-system-constructor #$libvirt "/bin/virsh create " #$(vmxml vm)))
       (stop #~(make-system-destructor #$libvirt "/bin/virsh shutdown " #$(libvirt-vm-uuid vm))))))
  (map vm->shepherd-service vms))

(define-public libvirt-vms-service-type
  (service-type
   (name 'libvirt-vms)
   (description "Configure libvirt VMs")
   (extensions (list (service-extension shepherd-root-service-type vms->shepherd-services)))
   (default-value '())))

