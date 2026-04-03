(define-module (djeis services ceph)
  #:use-module (guix gexp)
  #:use-module (guix records)
  #:use-module (gnu services)
  #:use-module (gnu services shepherd)
  #:use-module ((gnu packages linux) #:select (lvm2))
  #:use-module ((gnu packages storage) #:select (ceph))
  #:use-module ((gnu packages containers) #:select (podman))
  #:export (ceph-osd-config
            ceph-osd-service
            ceph-mon-service
            ceph-mgr-service
            ceph-mds-service
            ceph-rbd-udev))

(define-record-type* <ceph-osd-config>
  ceph-osd-config make-ceph-osd-config
  ceph-osd-config?
  (osd-id ceph-osd-config-osd-id)
  (fsid ceph-osd-config-fsid))

(define osd-script
  (mixed-text-file "start-osd.sh"
                   "
set -exuo pipefail
ceph-volume activate --osd-id $1 --osd-uuid $2 --no-systemd --no-tmpfs >/var/log/ceph/lvm-$1
ceph-osd -i $1 -f
"))

(define (ceph-osd-shepherd-services config)
  (let* ((osd-id (number->string (ceph-osd-config-osd-id config)))
         (prepare-service-name (string->symbol (string-append "ceph-lvm-osd-" osd-id))))
    (list
     (shepherd-service
      (provision (list (string->symbol (string-append "ceph-osd-" osd-id))))
      (requirement '(user-processes))
      (start #~(make-forkexec-constructor
                (list
                 #$(file-append podman "/bin/podman") "run"
                 "--name" (string-append "ceph-osd-" #$osd-id) "--net" "host" "--rm"
                 "--privileged"
                 "-v" "/etc/ceph:/etc/ceph:ro"
                 "-v" "/gnu:/gnu:ro"
                 "-v" "/var/lib/ceph:/var/lib/ceph:O"
                 "-v" "/var/log:/var/log:rw"
                 "-v" "/dev:/dev"
                 "-v" "/run/udev:/run/udev"
                 "-v" "/sys:/sys"
                 "ceph:v18.2.7" "/usr/bin/bash" #$osd-script #$osd-id #$(ceph-osd-config-fsid config))
                #:environment-variables
                (cons* "CONTAINERS_STORAGE_CONF=/etc/containers/storage.ceph.conf" (default-environment-variables))))
      (stop #~(make-kill-destructor))))))

(define ceph-osd-service
  (service-type (name 'ceph-osd)
                (description "Run a ceph osd")
                (extensions
                 (list
                  (service-extension shepherd-root-service-type
                                     ceph-osd-shepherd-services)))))

(define (ceph-mon-shepherd-services mon-name)
  (list
   (shepherd-service
    (provision '(ceph-mon))
    (requirement '(user-processes))
    (start #~(make-forkexec-constructor (list
                                         #$(file-append podman "/bin/podman") "run"
                                         "--name" "ceph-mon" "--net" "host" "--rm"
                                         "-v" "/etc/ceph:/etc/ceph:ro"
                                         "-v" "/var/lib/ceph:/var/lib/ceph:rw"
                                         "-v" "/var/log:/var/log:rw"
                                         "ceph:v18.2.7" "/usr/bin/ceph-mon" "-i" #$mon-name "-f")
                                        #:environment-variables
                                        (cons* "CONTAINERS_STORAGE_CONF=/etc/containers/storage.ceph.conf" (default-environment-variables))))
    (stop #~(make-kill-destructor)))))

(define ceph-mon-service
  (service-type (name 'ceph-mon)
                (description "Run a ceph mon")
                (extensions
                 (list
                  (service-extension shepherd-root-service-type
                                     ceph-mon-shepherd-services)))))

(define (ceph-mgr-shepherd-services mgr-name)
  (list
   (shepherd-service
    (provision '(ceph-mgr))
    (start #~(make-forkexec-constructor (list
                                         #$(file-append podman "/bin/podman") "run"
                                         "--name" "ceph-mgr" "--net" "host" "--rm"
                                         "-v" "/etc/ceph:/etc/ceph:ro"
                                         "-v" "/var/lib/ceph:/var/lib/ceph:rw"
                                         "-v" "/var/log:/var/log:rw"
                                         "ceph:v18.2.7" "/usr/bin/ceph-mgr" "-i" #$mgr-name "-f")
                                        #:environment-variables
                                        (cons* "CONTAINERS_STORAGE_CONF=/etc/containers/storage.ceph.conf" (default-environment-variables))))
    (stop #~(make-kill-destructor)))))

(define ceph-mgr-service
  (service-type (name 'ceph-mgr)
                (description "Run a ceph mgr")
                (extensions
                 (list
                  (service-extension shepherd-root-service-type
                                     ceph-mgr-shepherd-services)))))

(define (ceph-mds-shepherd-services mds-name)
  (list
   (shepherd-service
    (provision (list (string->symbol (string-append "ceph-mds-" mds-name))))
    (requirement '(user-processes))
    (start #~(make-forkexec-constructor
              (list
               #$(file-append podman "/bin/podman") "run"
               "--name" (string-append "ceph-mds-" #$mds-name) "--net" "host" "--rm"
               "-v" "/etc/ceph:/etc/ceph:ro"
               "-v" "/var/lib/ceph:/var/lib/ceph:rw"
               "-v" "/var/log:/var/log:rw"
               "ceph:v18.2.7" "/usr/bin/ceph-mds" "-i" #$mds-name "-f")
              #:environment-variables
              (cons* "CONTAINERS_STORAGE_CONF=/etc/containers/storage.ceph.conf" (default-environment-variables))))
    (stop #~(make-kill-destructor)))))

(define ceph-mds-service
  (service-type (name 'ceph-mds)
                (description "Run a ceph mds")
                (extensions
                 (list
                  (service-extension shepherd-root-service-type
                                     ceph-mds-shepherd-services)))))

(define ceph-rbdnamer
  (program-file "ceph-rbdnamer"
                #~(begin
                    (use-modules (ice-9 rdelim)
                                 (ice-9 regex)
                                 (ice-9 format))

                    (define (read-file path)
                      "Read entire file contents as a string, trimming whitespace"
                      (if (file-exists? path)
                          (string-trim-right (call-with-input-file path read-string))
                          #f))

                    (define (extract-num dev)
                      "Extract device number from device name"
                      (let* ((without-p (car (string-split dev #\p)))
                             (num-str (regexp-substitute/global #f "[a-z]" without-p 'pre "" 'post)))
                        num-str))

                    (define (build-rbd-path dev)
                      "Build RBD path from device name"
                      (let* ((num (extract-num dev))
                             (base-path (string-append "/sys/devices/rbd/" num))
                             (pool (read-file (string-append base-path "/pool")))
                             (pool-ns-path (string-append base-path "/pool_ns"))
                             (namespace (read-file pool-ns-path))
                             (image (read-file (string-append base-path "/name")))
                             (snap (read-file (string-append base-path "/current_snap"))))
                        
                        (when (not pool)
                          (error "Could not read pool information"))
                        
                        ;; Build output string
                        (display pool)
                        (when (and namespace (not (string=? namespace "")))
                          (display "/")
                          (display namespace))
                        (display "/")
                        (display image)
                        (when (and snap (not (string=? snap "-")))
                          (display "@")
                          (display snap))
                        (newline)))

                    ;; Main entry point
                    (define (main args)
                      (if (< (length args) 2)
                          (begin
                            (format (current-error-port) "Usage: ~a DEVICE~%" (car args))
                            (exit 1))
                          (build-rbd-path (cadr args))))

                    ;; Run if executed as script
                    (when (batch-mode?)
                      (main (command-line))))))

(define ceph-rbd-udev
  (mixed-text-file "rbd.rules"
                   "
KERNEL==\"rbd[0-9]*\", ENV{DEVTYPE}==\"disk\", PROGRAM=\"" ceph-rbdnamer " %k\", SYMLINK+=\"rbd/%c\"
KERNEL==\"rbd[0-9]*\", ENV{DEVTYPE}==\"partition\", PROGRAM=\"" ceph-rbdnamer " %k\", SYMLINK+=\"rbd/%c-part%n\"
"))

