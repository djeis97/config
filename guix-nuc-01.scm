;; This is an operating system configuration template
;; for a "desktop" setup with GNOME and Xfce where the
;; root partition is encrypted with LUKS, and a swap file.

(use-modules (gnu)
             (gnu image)
             ((gnu packages base) #:select (coreutils))
             ((gnu packages containers) #:select (podman))
             ((gnu packages linux) #:select (lvm2))
             ((gnu packages rsync) #:select (rsync))
             ((gnu packages samba) #:select (samba))
             ((gnu packages file-systems) #:select (fuse-overlayfs))
             (gnu system nss)
             (gnu system image)
             (gnu system vm)
             (gnu services)
             (gnu services dns)
             (gnu services shepherd)
             (gnu services networking)
             (gnu services ssh)
             (gnu services sysctl)
             (gnu services virtualization)
             (guix gexp)
             (guix records)
             (guix utils)
             (nongnu packages linux)
             (nongnu system linux-initrd)
             ((djeis keys) #:select (xana-tampa-key elijah-key nonguix-key))
             (djeis services ceph)
             (djeis services libvirt-vms)
             (djeis services autofs)
             (djeis packages ceph-mount))

(define-public sshd-config
  (openssh-configuration
   (authorized-keys
    `(("root" ,elijah-key)))
   (password-authentication? #f)
   (x11-forwarding? #t)
   (permit-root-login 'prohibit-password)))

(define btrfs-uuid "423b4a3b-8a28-41ae-96e2-39d2443de80c")

(define podman-containers-policy
  (plain-file "policy.json"
              "
{
  \"default\": [{\"type\":\"insecureAcceptAnything\"}]
}"))

(define podman-containers-storage
  (mixed-text-file "storage.conf"
                   "
[storage]
driver = \"overlay\"
runroot = \"/run/containers/storage\"
graphroot = \"/var/lib/containers/storage\"
[storage.options]
additionalimagestores = [ \"/auto/cephfs/containers/registry\" ]
mount_program = \"" (file-append fuse-overlayfs "/bin/fuse-overlayfs") "\"
"))

(define podman-ceph-containers-storage
  (mixed-text-file "storage.conf"
                   "
[storage]
driver = \"overlay\"
runroot = \"/run/containers/storage\"
graphroot = \"/opt/ceph_podman_root/\"
[storage.options]
mount_program = \"" (file-append fuse-overlayfs "/bin/fuse-overlayfs") "\"
"))

(define ceph-file-system
  (file-system
    (mount-point "cephfs")
    (device "192.168.0.137:6789:/")
    (type "ceph")
    (options "name=admin")))
(define autofs-auto-map
  (plain-file "autofs.auto" (file-system->autofs-line ceph-file-system)))
(define autofs-master-map
  (mixed-text-file "autofs.master" "/auto " autofs-auto-map "\n"))

;; (define testing-vm
;;   (basic-libvirt+ceph-vm-system
;;    (operating-system
;;     (inherit basic-libvirt+ceph-vm-system)
;;     (host-name "tester")
;;     (packages (cons* ceph podman nss-certs %base-packages))
;;     (services (cons*
;;                (simple-service 'plex-container shepherd-root-service-type
;;                                (list (shepherd-service
;;                                       (provision '(plex))
;;                                       (requirement '(networking virt-bridge ceph-keyring automount))
;;                                       (start #~(make-forkexec-constructor
;;                                                 (list #$(file-append podman "/bin/podman")
;;                                                       "run" "--name=plex" "--net=host" "--rm"
;;                                                       "-e" "PUID=0" "-e" "PGID=0"
;;                                                       "-v" "/auto/cephfs/containers/plex:/config"
;;                                                       "-v" "/auto/cephfs/media:/media-drive:ro"
;;                                                       "lscr.io/linuxserver/plex:1.26.2")))
;;                                       (stop #~(make-kill-destructor)))))
;;                (extra-special-file "/etc/containers/policy.json" podman-containers-policy)
;;                (extra-special-file "/etc/containers/storage.conf" podman-containers-storage)
;;                (basic-libvirt+ceph-vm-services "192.168.86.105/32"))))
;;    "be6e51ec-f0b0-4a4e-91c6-75e352060864"
;;    "enp89s0"
;;    "virt-bridge"))

(define-public samba-config
  (plain-file "smb.conf"
              "
[global]
  netbios name = GUIX-NUC-01
  clustering = no
  load printers = no
  server role = standalone
  map to guest = bad user
  allow insecure wide links = yes
  unix extensions = no
  read raw = Yes
  write raw = Yes
  socket options = TCP_NODELAY IPTOS_LOWDELAY SO_SNDBUF=8192 SO_RCVBUF=8192
  min receivefile size = 16384
  use sendfile = true
  aio read size = 16384
  aio write size = 16384

[ceph]
  path = /auto/cephfs/samba
  read only = no
  oplocks = no
  kernel share modes = no
  valid users = sophia

[media]
  path = /auto/cephfs/media
  available = yes
  read only = yes
  public = yes
  guest ok = yes
  force user = nobody
  follow symlinks = yes
  wide links = yes
"))

(define system
  (operating-system
    (host-name "guix-nuc-01")
    (timezone "America/New_York")
    (locale "en_US.utf8")

    (kernel linux)
    (kernel-arguments (cons "elogind.legacy_elogind_cgroup_controller=1 systemd.unified_cgroup_hierarchy=0" %default-kernel-arguments))
    (firmware (cons linux-firmware %base-firmware))
    (initrd microcode-initrd)

    ;; Use the UEFI variant of GRUB with the EFI System
    ;; Partition mounted on /boot/efi.
    (bootloader (bootloader-configuration
                 (bootloader grub-efi-bootloader)
                 (targets '("/boot/efi/"))))

    (packages (cons* rsync podman ceph-mount %base-packages))

    (users (cons* (user-account
                   (name "ceph")
                   (group "ceph")
                   (system? #t))
                  (user-account
                   (name "jay")
                   (uid 1000)
                   (group "users")
                   (comment "Elijah Malaby"))
                  (user-account
                   (name "sophia")
                   (uid 1001)
                   (group "users")
                   (comment "Sophia Jones"))
                  %base-user-accounts))
    (groups (cons* (user-group (name "ceph")) %base-groups))

    (file-systems (append
                   (list (file-system
                           (device (uuid btrfs-uuid))
                           (mount-point "/")
                           (type "btrfs")
                           (options "subvol=@"))
                         (file-system
                           (device (uuid "60F1-27D6" 'fat))
                           (mount-point "/boot/efi/")
                           (type "vfat"))
                         (file-system
                           (device (uuid btrfs-uuid))
                           (mount-point "/gnu/store")
                           (type "btrfs")
                           (options "subvol=@guix/store"))
                         (file-system
                           (device (uuid btrfs-uuid))
                           (mount-point "/var/guix")
                           (type "btrfs")
                           (options "subvol=@guix/var"))
                         (file-system
                           (device (uuid btrfs-uuid))
                           (mount-point "/.snapshots")
                           (type "btrfs")
                           (options "subvol=@snapshots")))
                   %control-groups
                   %base-file-systems))

    (swap-devices
     (list
      (swap-space
       (target (uuid "a8b607a4-16f2-4b2a-b6bd-da483dbd9772"))
       (discard? #t))))

    (services (append (list
                       (simple-service samba shepherd-root-service-type
                                       (list
                                        (shepherd-service
                                         (provision '(samba))
                                         (requirement '(automount user-processes networking))
                                         (start #~(make-forkexec-constructor
                                                   (list #$(file-append samba "/sbin/smbd")
                                                         "-s" #$samba-config
                                                         "--foreground" "--no-process-group")))
                                         (stop #~(make-kill-destructor)))))
                       (service openssh-service-type sshd-config)
                       (service dhcpcd-service-type)
                       (service static-networking-service-type
                                (list
                                 (static-networking
                                  (provision '(virt-bridge))
                                  (links (list
                                          (network-link
                                           (name "virt-bridge")
                                           (type 'bridge)
                                           (arguments (list)))))
                                  (addresses (list)))
                                 (static-networking
                                  (provision '(virt-bridge-address))
                                  (requirement '(virt-bridge))
                                  (addresses (list
                                              (network-address
                                               (device "virt-bridge")
                                               (value "192.168.87.1/24")))))))
                       ;;(service libvirt-service-type (libvirt-configuration))
                       ;;(service virtlog-service-type (virtlog-configuration))
                       (service automount-service-type
                                (automount-config
                                 (autofs-conf (plain-file "autofs.conf" ""))
                                 (autofs-master autofs-master-map)))
                       ;; (simple-service 'gtnh-container shepherd-root-service-type
                       ;;                 (list (shepherd-service
                       ;;                        (auto-start? #f)
                       ;;                        (provision '(gtnh))
                       ;;                        (requirement '(networking automount))
                       ;;                        (start #~(make-forkexec-constructor
                       ;;                                  (list #$(file-append podman "/bin/podman")
                       ;;                                        "run" "-i" "--name=gtnh" "--net=host" "--rm"
                       ;;                                        "--memory=15g" "--memory-swap=20g"
                       ;;                                        "-e" "PUID=0" "-e" "PGID=0"
                       ;;                                        "-v" "/auto/cephfs/containers/GTNHServer:/GTNHServer"
                       ;;                                        "-v" "/opt/GTNHWorld/:/GTNHServer/World"
                       ;;                                        "-w" "/GTNHServer"
                       ;;                                        "eclipse-temurin:17-alpine" "./startserver-java9.sh"))) 
                       ;;                        (stop #~(make-kill-destructor)))))

                       (simple-service 'factorio-container shepherd-root-service-type
                                       (list (shepherd-service
                                              (auto-start? #f)
                                              (provision '(factorio))
                                              (requirement '(networking automount))
                                              (start #~(make-forkexec-constructor
                                                        (list #$(file-append podman "/bin/podman")
                                                              "run" "-i" "--name=factorio" "--net=host" "--rm"
                                                              "--memory=8g" "--memory-swap=16g"
                                                              "-e" "CONSOLE_LOG_LOCATION=/factorio/console.log"
                                                              "-e" "USERNAME=djeis"
                                                              "-e" "UPDATE_MODS_ON_START=true"
                                                              "-v" "/auto/cephfs/containers/factorio:/factorio"
                                                              "--secret" "factorio_token,type=env,target=TOKEN"
                                                              "factorio:2.0.76")))
                                              (stop #~(let ((sd (make-system-destructor #$(file-append podman "/bin/podman") " exec -it factorio rcon /quit"))
                                                            (kd (make-kill-destructor SIGINT #:grace-period 30)))
                                                        (lambda args
                                                          (and (apply sd args)
                                                               (apply kd args))))))))
                       (simple-service 'factorio-bot-container shepherd-root-service-type
                                       (list (shepherd-service
                                              (auto-start? #f)
                                              (provision '(factorio-bot))
                                              (requirement '(factorio networking automount))
                                              (start #~(make-forkexec-constructor
                                                        (list #$(file-append podman "/bin/podman")
                                                              "run" "-i" "--name=factorio-bot" "--net=host" "--rm"
                                                              "--memory=1g"
                                                              "-e" "DISCORD_CHANNEL_ID=1411157034174382100"
                                                              "-e" "RCON_IP=127.0.0.1"
                                                              "-e" "RCON_PORT=27015"
                                                              "-e" "FACTORIO_LOG=/factorio/console.log"
                                                              "-e" "MOD_LOG=/factorio/script-output/factorigo-chat-bot/factorigo-chat-bot.log"
                                                              "-e" "ALL_ROCKET_LAUNCHES=false"
                                                              "--secret" "factorio_discord_token,type=env,target=DISCORD_TOKEN"
                                                              "--secret" "factorio_rconpw,type=env,target=RCON_PASSWORD"
                                                              "-v" "/auto/cephfs/containers/factorio:/factorio"
                                                              "factorigo-chat-bot:latest")))
                                              (stop #~(make-kill-destructor)))))
                       (simple-service 'atm9-container shepherd-root-service-type
                                       (list (shepherd-service
                                              (auto-start? #f)
                                              (provision '(atm9))
                                              (requirement '(networking automount))
                                              (start #~(make-forkexec-constructor
                                                        (list #$(file-append podman "/bin/podman")
                                                              "run" "-i" "--name=atm9" "--net=host" "--rm"
                                                              "--memory=15g" "--memory-swap=20g"
                                                              "-e" "PUID=0" "-e" "PGID=0"
                                                              "-v" "/auto/cephfs/containers/ATM9Server:/ATM9Server"
                                                              "-v" "/opt/ATM9World/:/ATM9Server/world"
                                                              "-w" "/ATM9Server"
                                                              "amazoncorretto:20-alpine" "./run.sh")))
                                              (stop #~(make-kill-destructor)))))
                       (simple-service 'atm10-container shepherd-root-service-type
                                       (list (shepherd-service
                                              (auto-start? #f)
                                              (provision '(atm10))
                                              (requirement '(networking automount))
                                              (start #~(make-forkexec-constructor
                                                        (list #$(file-append podman "/bin/podman")
                                                              "run" "-i" "--name=atm10" "--net=host" "--rm"
                                                              "--memory=15g" "--memory-swap=20g"
                                                              "-e" "UID=1000" "-e" "GID=998" "-e" "EULA=true"
                                                              "-e" "MEMORY=12G"
                                                              "-e" "SERVER_NAME=Djeis' Minecraft"
                                                              "-e" "TYPE=AUTO_CURSEFORGE"
                                                              "-e" "CF_SLUG=all-the-mods-10"
                                                              "-e" "CF_EXCLUDE_MODS=1133580"
                                                              "-e" "CURSEFORGE_FILES=distant-horizons:6791190"
                                                              "-e" "MODRINTH_PROJECTS=dcintegration:Tvnxofx4"
                                                              "--secret" "CF_API_KEY,type=env,target=CF_API_KEY"
                                                              "-v" "/auto/cephfs/containers/ATM10Server:/data"
                                                              "-v" "/opt/ATM10World/:/data/world"
                                                              "minecraft-server:java21")))
                                              (stop #~(make-kill-destructor)))))
                       ;; (simple-service 'atm8-container shepherd-root-service-type
                       ;;                 (list (shepherd-service
                       ;;                        (auto-start? #f)
                       ;;                        (provision '(atm8))
                       ;;                        (requirement '(networking automount))
                       ;;                        (start #~(make-forkexec-constructor
                       ;;                                  (list #$(file-append podman "/bin/podman")
                       ;;                                        "run" "-i" "--name=atm8" "--net=host" "--rm"
                       ;;                                        "--memory=15g" "--memory-swap=20g"
                       ;;                                        "-e" "PUID=0" "-e" "PGID=0"
                       ;;                                        "-v" "/auto/cephfs/containers/ATM8Server:/ATM8Server"
                       ;;                                        "-v" "/opt/ATM8World/:/ATM8Server/world"
                       ;;                                        "-w" "/ATM8Server"
                       ;;                                        "openjdk:17-alpine" "./run.sh")))
                       ;;                        (stop #~(make-kill-destructor)))))
                       ;;             ;(simple-service 'aqm3-container shepherd-root-service-type
                       ;;             ;                (list (shepherd-service
                       ;;             ;                       (provision '(aqm3))
                       ;;             ;                       (requirement '(networking automount))
                       ;;             ;                       (start #~(make-forkexec-constructor
                       ;;             ;                                 (list #$(file-append podman "/bin/podman")
                       ;;             ;                                       "run" "--name=aqm3" "--net=host" "--rm"
                       ;;             ;                                       "--memory=15g" "--memory-swap=20g"
                       ;;             ;                                       "-e" "PUID=0" "-e" "PGID=0"
                       ;;             ;                                       "-v" "/auto/cephfs/containers/AQM3Server:/AQM3Server"
                       ;;             ;                                       "-w" "/AQM3Server"
                       ;;             ;                                       "openjdk:17-alpine" "sh" "./start.sh")))
                       ;;             ;                       (stop #~(make-kill-destructor)))))
                       (simple-service 'plex-container shepherd-root-service-type
                                       (list (shepherd-service
                                              (auto-start? #f)
                                              (provision '(plex))
                                              (requirement '(networking automount))
                                              (start #~(make-forkexec-constructor
                                                        (list #$(file-append podman "/bin/podman")
                                                              "run" "--name=plex" "--net=host" "--rm"
                                                              "--memory=4g" "--memory-swap=6g"
                                                              "-e" "PUID=0" "-e" "PGID=0"
                                                              "-v" "/auto/cephfs/containers/plex:/config"
                                                              "-v" "/auto/cephfs/media:/media-drive:rw"
                                                              "--device" "/dev/dri:/dev/dri"
                                                              "lscr.io/linuxserver/plex:1.42.1")))
                                              (stop #~(make-kill-destructor)))))
                       ;; (simple-service 'home-containers shepherd-root-service-type
                       ;;                 (list (shepherd-service
                       ;;                        (auto-start? #f)
                       ;;                        (provision '(mosquitto))
                       ;;                        (requirement '(networking automount))
                       ;;                        (start #~(make-forkexec-constructor
                       ;;                                  (list #$(file-append podman "/bin/podman")
                       ;;                                        "run" "--name=mosquitto" "--net=host" "--rm"
                       ;;                                        "--memory=512m"
                       ;;                                        "-v" "/auto/cephfs/containers/mosquitto/:/mosquitto/config/"
                       ;;                                        "docker.io/library/eclipse-mosquitto:2.0.14")))
                       ;;                        (stop #~(make-kill-destructor)))
                       ;;                       (shepherd-service
                       ;;                        (auto-start? #f)
                       ;;                        (provision '(openhab))
                       ;;                        (requirement '(networking automount udev))
                       ;;                        (start #~(make-forkexec-constructor
                       ;;                                  (list #$(file-append podman "/bin/podman")
                       ;;                                        "run" "--name=openhab" "--net=host" "--rm"
                       ;;                                        "--memory=1g" "--memory-swap=2g"
                       ;;                                        "-e" "GROUP_ID=995" "--device=/dev/ttyACM0"
                       ;;                                        "-e" #$(string-append "EXTRA_JAVA_OPTS=-Duser.timezone=" timezone)
                       ;;                                        "-v" "/etc/localtime:/etc/localtime:ro"
                       ;;                                        "-v" "/etc/timezone:/etc/timezone:ro"
                       ;;                                        "-v" "/auto/cephfs/containers/openhab/conf:/openhab/conf"
                       ;;                                        "-v" "/auto/cephfs/containers/openhab/addons:/openhab/addons"
                       ;;                                        "-v" "/auto/cephfs/containers/openhab/userdata:/openhab/userdata"
                       ;;                                        "docker.io/openhab/openhab:3.2.0-debian")))
                       ;;                        (stop #~(make-kill-destructor)))
                       ;;                       ))
                       (extra-special-file "/etc/containers/policy.json" podman-containers-policy)
                       (extra-special-file "/etc/containers/storage.conf" podman-containers-storage)
                       (extra-special-file "/etc/containers/storage.ceph.conf" podman-ceph-containers-storage)
                       (service ceph-mon-service host-name)
                       (service ceph-mgr-service host-name)
                       (service ceph-mds-service (string-append host-name "-a"))
                       )
                      (map (lambda (pair) (service ceph-osd-service (ceph-osd-config (osd-id (car pair)) (fsid (cdr pair)))))
                           '((0 . "44000608-0dc6-4b9d-af17-e01c5b36fcc2")
                             (1 . "bb11606b-f170-438a-824e-baacf6cf5bda")
                             (2 . "c62fbe43-0b7c-4554-bf9f-502a983bf021")
                             (3 . "e88c198b-e531-4b4a-a672-0b179d1a6ab4")
                             (4 . "1e2c7fc6-01c3-43dc-ab4d-8f9bb3d83098")
                             (5 . "e58072fe-6fea-4502-a8b7-2a0ee32cd74c")))
                      (modify-services %base-services
                        (guix-service-type config =>
                                           (guix-configuration
                                            (inherit config)
                                            (substitute-urls (cons "https://substitutes.nonguix.org"
                                                                   %default-substitute-urls))
                                            (authorized-keys (cons* xana-tampa-key nonguix-key %default-authorized-guix-keys))))
                        (sysctl-service-type config =>
                                             (sysctl-configuration
                                              (settings (append '(("net.ipv4.ip_forward" . "1"))
                                                                %default-sysctl-settings)))))))

    ;; Allow resolution of '.local' host names with mDNS.
    (name-service-switch %mdns-host-lookup-nss)))

(list
 (machine
  (operating-system system)
  (environment managed-host-environment-type)
  (configuration
   (machine-ssh-configuration
    (host-name "192.168.0.137")
    (system "x86_64-linux")
    (user "root")
    (safety-checks? #t)
    (authorize? #t)))))
