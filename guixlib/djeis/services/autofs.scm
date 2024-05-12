(define-module (djeis services autofs)
  #:use-module (gnu services)
  #:use-module (gnu system file-systems)
  #:use-module (gnu services shepherd)
  #:use-module (gnu packages admin)
  #:use-module ((gnu packages file-systems) #:select (autofs))
  #:use-module (guix gexp)
  #:use-module (guix records)
  #:use-module (ice-9 match)
  #:export (file-system->autofs-line
            automount-config
            automount-service-type))

(define (file-system->autofs-line fs)
  (string-append (file-system-mount-point fs)
                 " -fstype=" (file-system-type fs)
                 (if (file-system-options fs)
                     (string-append "," (file-system-options fs))
                     "")
                 " " (file-system-device fs)
                 "\n"))

(define-record-type* <automount-config>
  automount-config make-automount-config
  automount-config?
  (autofs-conf automount-config-file)
  (autofs-master automount-config-master))

(define (automount-shepherd-service config)
  (list (shepherd-service
         (provision '(automount))
         (documentation "Run the automount server.")
         (requirement '(networking))
         (start #~(make-forkexec-constructor
                   (list #$(file-append autofs "/sbin/automount") "-f"
                         #$(automount-config-master config))
                   #:log-file "/var/log/automount.log"
                   #:environment-variables
                   '("PATH=/run/current-system/profile/bin:/run/current-system/profile/sbin")))
         (stop #~(make-kill-destructor))
         (actions
          (list
           (shepherd-action
            (name 'reload)
            (documentation "Reload the settings file from disk.")
            (procedure #~(lambda (pid)
                           (if pid
                               (begin
                                 (kill pid SIGHUP)
                                 (display "Service automount has \
been asked to reload its settings file."))
                               (display "Service automount is not \
running."))))))))))

(define automount-service-type
  (service-type
   (name 'automount)
   (description "Run the automount server.")
   (extensions
    (list (service-extension shepherd-root-service-type
                             automount-shepherd-service)
          (service-extension etc-service-type
                             (lambda (config)
                               `(("autofs.conf" ,(automount-config-file config)))))))
   (default-value '())))
