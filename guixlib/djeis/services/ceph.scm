(define-module (djeis services ceph)
  #:use-module (guix gexp)
  #:use-module (guix records)
  #:use-module (gnu services)
  #:use-module (gnu services shepherd)
  #:use-module ((gnu packages linux) #:select (lvm2))
  #:use-module ((gnu packages storage) #:select (ceph))
  #:export (ceph-osd-config
            ceph-osd-service
            ceph-mon-service
            ceph-mgr-service
            ceph-mds-service))

(define-record-type* <ceph-osd-config>
  ceph-osd-config make-ceph-osd-config
  ceph-osd-config?
  (osd-id ceph-osd-config-osd-id)
  (fsid ceph-osd-config-fsid))

(define (ceph-osd-shepherd-services config)
  (let* ((osd-id (number->string (ceph-osd-config-osd-id config)))
         (prepare-service-name (string->symbol (string-append "ceph-lvm-osd-" osd-id))))
    (list
     (shepherd-service
      (provision (list prepare-service-name))
      (requirement '(user-processes))
      (one-shot? #t)
      (start #~(make-system-constructor "PATH=/run/setuid-programs:/run/current-system/profile/bin:/run/current-system/profile/sbin "
                                        #$(file-append ceph "/sbin/ceph-volume")
                                        " lvm activate " #$osd-id " " #$(ceph-osd-config-fsid config) " --no-systemd"
                                        " >>/var/log/ceph-lvm-" #$osd-id " 2>&1")))
     (shepherd-service
      (provision (list (string->symbol (string-append "ceph-osd-" osd-id))))
      (requirement (list prepare-service-name))
      (start #~(make-forkexec-constructor (list #$(file-append ceph "/bin/ceph-osd") "-i" #$osd-id "-f")))
      (stop #~(make-kill-destructor))))))

(define ceph-osd-service
  (service-type (name 'ceph-osd)
                (description "Run a ceph osd")
                (extensions
                 (list
                  (service-extension shepherd-root-service-type
                                     ceph-osd-shepherd-services)
                  (service-extension profile-service-type
                                     (const (list lvm2 ceph)))))))

(define (ceph-mon-shepherd-services mon-name)
  (list
   (shepherd-service
    (provision '(ceph-mon))
    (requirement '(user-processes))
    (start #~(make-forkexec-constructor (list #$(file-append ceph "/bin/ceph-mon") "-i" #$mon-name "-f")))
    (stop #~(make-kill-destructor)))))

(define ceph-mon-service
  (service-type (name 'ceph-mon)
                (description "Run a ceph mon")
                (extensions
                 (list
                  (service-extension shepherd-root-service-type
                                     ceph-mon-shepherd-services)
                  (service-extension profile-service-type
                                     (const (list ceph)))))))

(define (ceph-mgr-shepherd-services mgr-name)
  (list
   (shepherd-service
    (provision '(ceph-mgr))
    (start #~(make-forkexec-constructor (list #$(file-append ceph "/bin/ceph-mgr") "-i" #$mgr-name "-f")
                                        #:environment-variables
                                        (cons* (string-append "PYTHONPATH=" #$(file-append ceph "/lib/python3.9/site-packages"))
                                               (default-environment-variables))))
    (stop #~(make-kill-destructor)))))

(define ceph-mgr-service
  (service-type (name 'ceph-mgr)
                (description "Run a ceph mgr")
                (extensions
                 (list
                  (service-extension shepherd-root-service-type
                                     ceph-mgr-shepherd-services)
                  (service-extension profile-service-type
                                     (const (list ceph)))))))

(define (ceph-mds-shepherd-services mds-name)
  (list
   (shepherd-service
    (provision '(ceph-mds-a))
    (requirement '(user-processes))
    (start #~(make-forkexec-constructor (list #$(file-append ceph "/bin/ceph-mds") "-i" #$mds-name "-f")))
    (stop #~(make-kill-destructor)))))

(define ceph-mds-service
  (service-type (name 'ceph-mds)
                (description "Run a ceph mds")
                (extensions
                 (list
                  (service-extension shepherd-root-service-type
                                     ceph-mds-shepherd-services)
                  (service-extension profile-service-type
                                     (const (list ceph)))))))
