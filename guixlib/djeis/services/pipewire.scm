(define-module (djeis services pipewire)
  #:use-module (gnu packages)
  #:use-module (gnu packages linux)
  #:use-module (gnu services)
  #:use-module (gnu home services)
  #:use-module (gnu services shepherd)
  #:use-module (gnu home services shepherd)
  #:use-module (guix gexp)
  #:use-module (guix records)
  #:export (pipewire-config home-pipewire-service-type))

(define-record-type* <pipewire-config>
  pipewire-config make-pipewire-config
  pipewire-config?
  (pipewire pipewire-config-pipewire (default pipewire))
  (wireplumber pipewire-config-wireplumber (default wireplumber)))

(define (home-pipewire-xdg-files config)
  `(("alsa/asoundrc"
     ,(mixed-text-file
       "asoundrc"
       #~(string-append
          "<"
	  #$(file-append
             (pipewire-config-pipewire config) "/share/alsa/alsa.conf.d/50-pipewire.conf")
	  ">\n<"
	  #$(file-append
             (pipewire-config-pipewire config) "/share/alsa/alsa.conf.d/99-pipewire-default.conf")
          ">\n"
          "
pcm_type.pipewire {
  lib " #$(file-append (pipewire-config-pipewire config) "/lib/alsa-lib/libasound_module_pcm_pipewire.so")
  "
}

ctl_type.pipewire {
  lib " #$(file-append (pipewire-config-pipewire config) "/lib/alsa-lib/libasound_module_ctl_pipewire.so")
  "
}
")))))

(define (home-pipewire-shepherd-services config)
  (list
   (shepherd-service
    (requirement '(dbus))
    (provision '(pipewire))
    (stop  #~(make-kill-destructor))
    (start #~(make-forkexec-constructor
              (list #$(file-append (pipewire-config-pipewire config) "/bin/pipewire"))
              #:log-file (string-append
                          (or (getenv "XDG_LOG_HOME")
                              (format #f "~a/.local/var/log"
                                      (getenv "HOME")))
                          "/pipewire.log")
              #:environment-variables
              (append (list "DISABLE_RTKIT=1")
                      (default-environment-variables)))))
   (shepherd-service
    (requirement '(pipewire))
    (provision '(wireplumber))
    (stop  #~(make-kill-destructor))
    (start #~(make-forkexec-constructor
              (list #$(file-append (pipewire-config-wireplumber config) "/bin/wireplumber"))
              #:log-file (string-append
                          (or (getenv "XDG_LOG_HOME")
                              (format #f "~a/.local/var/log"
                                      (getenv "HOME")))
                          "/wireplumber.log")
              #:environment-variables
              (append (list "DISABLE_RTKIT=1")
                      (default-environment-variables)))))
   (shepherd-service
    (requirement '(pipewire))
    (provision '(pipewire-pulse))
    (stop  #~(make-kill-destructor))
    (start #~(make-forkexec-constructor
              (list #$(file-append (pipewire-config-pipewire config) "/bin/pipewire-pulse"))
              #:log-file (string-append
                          (or (getenv "XDG_LOG_HOME")
                              (format #f "~a/.local/var/log"
                                      (getenv "HOME")))
                          "/pipewire-pulse.log")
              #:environment-variables
              (append (list "DISABLE_RTKIT=1")
                      (default-environment-variables)))))))

(define home-pipewire-service-type
  (service-type
   (name 'pipewire)
   (description "Pipewire service")
   (extensions (list (service-extension home-xdg-configuration-files-service-type
                                        home-pipewire-xdg-files)
                     (service-extension home-shepherd-service-type
                                        home-pipewire-shepherd-services)))
   (default-value (pipewire-config))))
