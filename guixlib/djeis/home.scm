(define-module (djeis home)
  #:use-module (gnu home)
  #:use-module (gnu home services)
  #:use-module (gnu packages)
  #:use-module (gnu packages gnupg)
  #:use-module (gnu services)
  #:use-module (guix packages)
  #:use-module (guix gexp)
  #:use-module (guix transformations)
  #:use-module (guix channels)
  #:use-module (gnu home services guix)
  #:use-module (gnu home services shells)
  #:use-module (gnu home services shepherd)
  #:use-module (gnu home services desktop)
  #:use-module (gnu home services dotfiles)
  #:use-module (gnu home services sound)
  #:use-module (djeis channel)
  #:use-module (djeis packages email)
  #:use-module (djeis packages sshuttle)
  #:use-module (djeis packages x2x)
  #:use-module (djeis packages kubectl)
  #:use-module (djeis emacs-config)
  #:use-module (djeis services)
  #:use-module (srfi srfi-1))

(define-public (minimal-home-services host-name)
  (cons* (service home-channels-service-type
                  (list (channel
                         (name 'nonguix)
                         (url (string-append "file://" (getenv "HOME") "/Dropbox/Projects/nonguix"))
                         (branch "pull")
                         (introduction
                          (make-channel-introduction
                           "897c1a470da759236cc11798f4e0a5f7d4d59fbc"
                           (openpgp-fingerprint
                            "2A39 3FFF 68F4 EF7A 3D29  12AF 6F51 20A0 22FB B2D5"))))
                        (channel
                         (name 'guix)
                         (url (string-append "file://" (getenv "HOME") "/Dropbox/Projects/guix"))
                         (branch "pull")
                         (introduction
                          (make-channel-introduction
                           "9edb3f66fd807b096b48283debdcddccfea34bad"
                           (openpgp-fingerprint
                            "BBB0 2DDF 2CEA F6A8 0D1D  E643 A2A0 6DF2 A33A 54FA"))))))
         (service
          home-bash-service-type
          (home-bash-configuration
           (bashrc
            (list (local-file (string-append %channel-root "/djeis/dots/.bashrc")
                              "bashrc")))))
         (simple-service 'djeis-guixlib-package-path home-environment-variables-service-type
                         `(("GUIX_PACKAGE_PATH" . ,%channel-root)))
         (service home-dotfiles-service-type
                  (home-dotfiles-configuration
                   (source-directory %channel-root)
                   (directories '("./djeis/dots"))
                   (layout 'stow)
                   (packages (if host-name
                                 (list host-name "common")
                                 (list "common")))))
         %base-home-services))

(define-public (base-home-services host-name)
  (cons* (service home-extra-profiles-service-type
                  (list (cons* "iris"
                               (list (specification->package "openjdk@17") "jdk")
                               sshuttle
                               kubectl
                               (map specification->package
                                    '("python" "curl" "rlwrap" "nftables" "podman"
                                      "git-crypt" "leiningen" "node" "mysql"
                                      "ruby-solargraph" "postgresql"
                                      "wireguard-tools")))
                        (cons* "coq"
                               (map specification->package
                                    '("coq" "coq-equations")))
                        (cons* "typst" (list (specification->package "typst")))))
         (service home-dbus-service-type)
         (service home-pipewire-service-type)
         (simple-service 'syncthing home-shepherd-service-type
                         (list (shepherd-service
                                (provision '(syncthing))
                                (start #~(make-forkexec-constructor '("syncthing" "--no-browser")))
                                (stop #~(make-kill-destructor)))))
         (simple-service 'flatpak-xdg
                         home-environment-variables-service-type
                         '(("XDG_DATA_DIRS" . "/home/jay/.local/share/flatpak/exports/share${XDG_DATA_DIRS:+:$XDG_DATA_DIRS}")))
         emacs-basics
         emacs-appearance
         emacs-lang-config
         emacs-keys
         (minimal-home-services host-name)))

(define-public (minimal-home-packages)
  (map specification->package
       '("just" "vim" "git")))

(define-public (base-home-packages)
  (cons*
                                        ;emacs-vterm
                                        ;emacs-doom-themes
                                        ;emacs-doom-modeline
                                        ;emacs-evil
                                        ;emacs-general
                                        ;emacs-bind-map
                                        ;emacs-use-package
   x2x
   (list (specification->package "bind") "utils")
   (append (map specification->package
                '("direnv" "syncthing" "jq" "rsync"
                  "font-juliamono" "ripgrep" "ncurses"
                  "xrdb" "xcape" "xmodmap" "xinit" "xterm"
		  "xrandr" "picom" "feh" "libvterm"
                  "setxkbmap" "sqlite" "trayer-srg"
                  "guile" "gnupg"
                  "btrbk" "password-store" "dunst"
                  "xautolock" "openjdk" "mu" "isync"
                  "bluez" "sqlite" "unzip" "openssh"
		  "xss-lock" "playerctl"
		  "nss-certs" "clojure-lsp"))
           (minimal-home-packages))))

(define-public (desktop-home-packages)
  (append (map specification->package
	       '("remmina" "firefox" "flatpak" "qutebrowser"))
	  (base-home-packages)))


(define-public (bootstrapping-home-config)
  (home-environment
   (packages (append (map specification->package '("nss-certs" "bash" "coreutils"
                                                   "binutils" "inetutils" "guix"))
                     (minimal-home-packages)))
   (services (minimal-home-services #f))))

(define (base-home-config host-name)
  (home-environment
   (packages (desktop-home-packages))
   (services (base-home-services host-name))))

(define-public (get-home-config name)
  (let ((mod (resolve-module (list 'djeis 'home (string->symbol name)) #:ensure #f)))
    (if mod
        (module-ref mod 'home)
        (base-home-config name))))

(define-public (get-this-host-home-config)
  (get-home-config (gethostname)))
