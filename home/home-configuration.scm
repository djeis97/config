;; This "home-environment" file can be passed to 'guix home reconfigure'
;; to reproduce the content of your profile.  This is "symbolic": it only
;; specifies package names.  To reproduce the exact same profile, you also
;; need to capture the channels being used, as returned by "guix describe".
;; See the "Replicating Guix" section in the manual.

(use-modules
 (gnu home)
 (gnu home services)
 (gnu packages)
 (gnu packages gnupg)
 (gnu services)
 (guix packages)
 (guix gexp)
 (guix transformations)
 (gnu home services shells)
 (gnu home services shepherd)
 (gnu home services desktop)
 (djeis packages email)
 (djeis packages sshuttle)
 (djeis packages x2x)
 (djeis emacs-config)
 (djeis services)
 (djeis services pipewire)
 (srfi srfi-1))

                                        ;(define transform1
                                        ;  (options->transformation
                                        ;    '((with-source . "c2ffi=/home/jay/installs/c2ffi"))))

(home-environment
 (packages
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
   (map specification->package
        '("direnv" "just" "syncthing" "vim" "git"
          "rsync" "font-juliamono" "ripgrep" "ncurses"
          "flatpak" "xrdb" "xcape" "xmodmap" "xinit"
          "xterm" "xrandr" "picom" "feh" "libvterm"
          "setxkbmap" "sqlite" "trayer-srg" "cmake"
          "make" "gcc-toolchain" "guile" "gnupg" "btrbk"
          "password-store" "firefox" "dunst" "xautolock"
          "openjdk" "mu" "isync" "qutebrowser" "remmina"
          "bluez" "sqlite" "unzip" "virt-manager" "openssh"
          "playerctl" "w3m" "nss-certs" "clojure-lsp"))))
 (services
  (list (service
         home-bash-service-type
         (home-bash-configuration
          (aliases '(("ls" . "'ls --color=auto'")))
          (bashrc
           (list (local-file
                  "/home/jay/Dropbox/system-management/home/.bashrc"
                  "bashrc")))))
        (service home-extra-profiles-service-type
                 (list (cons* "iris"
                              (list (specification->package "openjdk@17") "jdk")
                              sshuttle
                              (map specification->package
                                   '("python" "curl" "rlwrap" "kubectl" "nftables"
                                     "podman" "git-crypt" "leiningen" "node" "mysql"
                                     "ruby-solargraph")))
                       (cons* "coq"
                              (map specification->package
                                   '("coq" "coq-equations")))))
        (service home-dbus-service-type)
        (service home-pipewire-service-type)
        (simple-service 'clojure-config home-xdg-configuration-files-service-type
                        `(("clojure/deps.edn" ,(plain-file "deps.edn" "\
{:aliases {:djeis/nrepl {:extra-deps {nrepl/nrepl {:mvn/version \"1.0.0\"}} :main-opts [\"-m\" \"nrepl.cmdline\"]}}}"))))
        (simple-service 'nix-config home-xdg-configuration-files-service-type
                        `(("nix/nix.conf" ,(plain-file "nix.conf" "\
experimental-features = nix-command flakes"))))
        (simple-service 'gitignore-config home-xdg-configuration-files-service-type
                        `(("git/ignore" ,(plain-file "ignore" "**/*~"))))
        (simple-service 'flatpak-xdg
                        home-environment-variables-service-type
                        '(("XDG_DATA_DIRS" . "/home/jay/.local/share/flatpak/exports/share${XDG_DATA_DIRS:+:$XDG_DATA_DIRS}")))
        (simple-service 'syncthing home-shepherd-service-type
                        (list (shepherd-service
                               (provision '(syncthing))
                               (start #~(make-forkexec-constructor '("syncthing" "-no-browser")))
                               (stop #~(make-kill-destructor)))))
        (simple-service 'davmail home-shepherd-service-type
                        (list (shepherd-service
                               (provision '(davmail))
                               (start #~(make-forkexec-constructor '("java"
                                                                     "-cp" #$(file-append davmail "/davmail.jar")
                                                                     "davmail.DavGateway")))
                               (stop #~(make-kill-destructor)))))
        emacs-basics
        emacs-appearance
        emacs-lang-config
        emacs-keys)))
