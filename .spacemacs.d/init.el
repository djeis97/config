;; -*- mode: dotspacemacs -*-

;; It must be stored in your home directory.

(defun dotspacemacs/layers ()
  "Configuration Layers declaration."
  (setq-default
   ;; List of additional paths where to look for configuration layers.
   ;; Paths must have a trailing slash (ie. `~/.mycontribs/')
   dotspacemacs-configuration-layer-path '()
   ;; List of configuration layers to load. If it is the symbol `all' instead
   ;; of a list then all discovered layers will be installed.
   dotspacemacs-configuration-layers
   '(
     ;; --------------------------------------------------------
     ;; Example of useful layers you may want to use right away
     ;; Uncomment a layer name and press C-c C-c to install it
     ;; --------------------------------------------------------
     ;; better-defaults
     djeis97-common
     djeis97-home
     (djeis97-org :variables
                  org-mobile-directory "~/Dropbox/Apps/MobileOrg")
     lua
     java
     python
     c-c++
     javascript
     csv
     yaml
     html
     markdown
     )
   ;; A list of packages and/or extensions that will not be install and loaded.
   dotspacemacs-excluded-packages '()
   dotspacemacs-additional-packages '(dired+
                                      symon
                                      simple-mpc
                                      load-theme-buffer-local
                                      arduino-mode)

   ;; If non-nil spacemacs will delete any orphan packages, i.e. packages that
   ;; are declared in a layer which is not a member of
   ;; the list `dotspacemacs-configuration-layers'
   dotspacemacs-delete-orphan-packages t
   dotspacemacs-smartparens-strict-mode t))

(defun dotspacemacs/init ()
  "Initialization function.
This function is called at the very startup of Spacemacs initialization
before layers configuration."
  ;; This setq-default sexp is an exhaustive list of all the supported
  ;; spacemacs settings.
  (setq-default
   dotspacemacs-editing-style 'vim
   dotspacemacs-verbose-loading nil
   dotspacemacs-startup-banner 'official
   dotspacemacs-always-show-changelog t
   dotspacemacs-startup-lists '(recents projects)
   dotspacemacs-themes '(spacemacs-dark)
   dotspacemacs-colorize-cursor-according-to-state t
   dotspacemacs-default-font '("Source Code Pro"
                               :size 13
                               :weight normal
                               :width normal
                               :powerline-scale 1.1)
   powerline-default-separator 'bar
   dotspacemacs-leader-key "SPC"
   dotspacemacs-emacs-leader-key "<f20>"
   dotspacemacs-major-mode-leader-key ","
   dotspacemacs-major-mode-emacs-leader-key "C-M-m"
   dotspacemacs-command-key ":"
   dotspacemacs-enable-paste-micro-state t
   dotspacemacs-guide-key-delay 0.4
   dotspacemacs-loading-progress-bar t
   dotspacemacs-fullscreen-at-startup nil
   dotspacemacs-fullscreen-use-non-native nil
   dotspacemacs-maximized-at-startup nil
   dotspacemacs-active-transparency 90
   dotspacemacs-inactive-transparency 90
   dotspacemacs-mode-line-unicode-symbols t
   dotspacemacs-smooth-scrolling t
   dotspacemacs-smartparens-strict-mode t
   dotspacemacs-persistent-server nil
   dotspacemacs-search-tools '("ag" "pt" "ack" "grep")
   ;; The default package repository used if no explicit repository has been
   ;; specified with an installed package.
   ;; Not used for now.
   dotspacemacs-default-package-repository nil

   dotspacemacs-auto-save-file-location 'original


   )
  (set-face-attribute 'default nil :height 83)
  ;; User initialization goes here
  ;; (load (expand-file-name "~/quicklisp/slime-helper.el"))
  )

(defun dotspacemacs/user-config ()
  "Configuration function.
 This function is called at the very end of Spacemacs initialization after
layers configuration."
  (setq powerline-default-separator 'bar))

(defun dotspacemacs/emacs-custom-settings ()
  "Emacs custom settings.
This is an auto-generated function, do not modify its content directly, use
Emacs customize menu instead.
This function is called at the very end of Spacemacs initialization."
(custom-set-variables
 ;; custom-set-variables was added by Custom.
 ;; If you edit it by hand, you could mess it up, so be careful.
 ;; Your init file should contain only one such instance.
 ;; If there is more than one, they won't work right.
 '(beacon-color "#ec4780")
 '(browse-url-browser-function (quote browse-url-xdg-open))
 '(compilation-message-face (quote default))
 '(cua-global-mark-cursor-color "#2aa198")
 '(cua-normal-cursor-color "#657b83")
 '(cua-overwrite-cursor-color "#b58900")
 '(cua-read-only-cursor-color "#859900")
 '(custom-safe-themes
   (quote
    ("96d29d4d033b1be6298e75d2a8b6e8fcb0c558115643e4fd9a36a03682a6bc84" "0f6956b200865951957b22fabcd84698ead5a08bdda2d10ffa180fd524893f8f" "1548a6dd58254c7283b9b1319e66060e547707f75275634bfc0d2325b1526312" "5e2dc1360a92bb73dafa11c46ba0f30fa5f49df887a8ede4e3533c3ab6270e08" "66132890ee1f884b4f8e901f0c61c5ed078809626a547dbefbb201f900d03fd8" "51e228ffd6c4fff9b5168b31d5927c27734e82ec61f414970fc6bcce23bc140d" "868f73b5cf78e72ca2402e1d48675e49cc9a9619c5544af7bf216515d22b58e7" "27b2ef08bfb2f93f90c74bcb36162593bec9fe5c30c05621259baac95edb7137" "34e91dd54521213bfc88b0fd851d434f9de3ce8c1120bfc32b4c2972b2cfb288" "3302a3c048adfaefe36f3c46819e608fbda46c42662d390e905655bb8ecc8b3a" "7c63592fde37aa731a057ea6f9aa96966230785f7aba108357fb175c0191c6f6" "bf478be41439d9cc355f9c2d1b307e1dfebba7bf9b16e6ea651b1469b6307f66" "44d23f972730816fd6ebb0d621820344fa39bfeafb7a5246ca1c0b71b2e9e451" "c7ba6ff9a5db0a64f858b3a49ab410de51988fa2c52630eeb95aee847a6711b3" "f9adafd67c2ec471d1b304fb545efa14fe7265355839bf7c6812c4271714a05c" default)))
 '(frame-brackground-mode (quote dark))
 '(global-prettify-symbols-mode t)
 '(highlight-changes-colors (quote ("#d33682" "#6c71c4")))
 '(highlight-symbol-foreground-color "#586e75")
 '(hl-bg-colors
   (quote
    ("#DEB542" "#F2804F" "#FF6E64" "#F771AC" "#9EA0E5" "#69B7F0" "#69CABF" "#B4C342")))
 '(hl-fg-colors
   (quote
    ("#fdf6e3" "#fdf6e3" "#fdf6e3" "#fdf6e3" "#fdf6e3" "#fdf6e3" "#fdf6e3" "#fdf6e3")))
 '(magit-diff-use-overlays nil)
 '(org-agenda-custom-commands
   (quote
    (("n" "Agenda and all TODOs"
      ((agenda "" nil)
       (alltodo "" nil))
      nil
      ("~/org/Calendar.pdf")))))
 '(org-agenda-deadline-leaders (quote ("D:  " "%3d d.: " "%2d d.: ")))
 '(org-agenda-files
   (quote
    ("~/org/DG.org" "~/org/stu orgs.org" "~/org/usf.org" "~/org/inbox.org" "~/org/calendar.org")))
 '(org-agenda-scheduled-leaders (quote ("S: " "S.%2dx: ")))
 '(org-agenda-skip-deadline-if-done t)
 '(org-agenda-skip-deadline-prewarning-if-scheduled (quote pre-scheduled))
 '(org-agenda-skip-scheduled-if-done t)
 '(org-agenda-todo-ignore-scheduled (quote all))
 '(org-refile-targets
   (quote
    ((org-agenda-files :maxlevel . 2)
     (nil :maxlevel . 2))))
 '(package-selected-packages
   (quote
    (white-sand-theme wgrep solarized-theme smex sly-macrostep sly sayid rebecca-theme org-category-capture org-brain madhat2r-theme ledger-mode ivy-purpose ivy-hydra ibuffer-projectile fuzzy flyspell-correct-ivy flycheck-ledger evil-org autothemer counsel-projectile counsel company-lua flyspell-correct-helm flyspell-correct auto-dictionary pdf-tools tablist exwm simple-mpc edn queue alert log4e gntp zoutline parent-mode pos-tip flx goto-chg undo-tree diminish web-completion-data paredit peg eval-sexp-fu pkg-info epl packed pythonic avy popup powerline org swiper ivy projectile inflections seq highlight request helm-core multiple-cursors magit-popup git-commit with-editor async web-beautify livid-mode skewer-mode simple-httpd json-mode json-snatcher json-reformat js2-refactor js2-mode js-doc company-tern dash-functional tern coffee-mode floobits sourcerer-theme spinner hide-comnt helm-purpose window-purpose imenu-list disaster company-c-headers cmake-mode clang-format yapfify railscasts-theme py-isort pug-mode org-projectile org-download git-link eyebrowse evil-visual-mark-mode evil-unimpaired dumb-jump darkokai-theme company-emacs-eclim eclim column-enforce-mode clojure-snippets macrostep gitignore-mode clojure-mode bind-key bind-map magit cider anaconda-mode auto-complete yasnippet anzu smartparens flycheck helm iedit company slime hydra package-build evil f s dash yaml-mode web-mode tagedit slim-mode scss-mode sass-mode mmm-mode markdown-toc markdown-mode lispy less-css-mode jade-mode helm-css-scss haml-mode gh-md emmet-mode csv-mode company-web zonokai-theme zenburn-theme zen-and-art-theme xterm-color ws-butler window-numbering which-key volatile-highlights vi-tilde-fringe uuidgen use-package underwater-theme ujelly-theme twilight-theme twilight-bright-theme twilight-anti-bright-theme tronesque-theme toxi-theme toc-org tao-theme tangotango-theme tango-plus-theme tango-2-theme sunny-day-theme sublime-themes subatomic256-theme subatomic-theme stekene-theme spacemacs-theme spaceline spacegray-theme soothe-theme soft-stone-theme soft-morning-theme soft-charcoal-theme smyx-theme smooth-scrolling smeargle slime-company shell-pop seti-theme reverse-theme restart-emacs rainbow-delimiters quelpa pyvenv python pytest pyenv-mode purple-haze-theme professional-theme popwin planet-theme pip-requirements phoenix-dark-pink-theme phoenix-dark-mono-theme persp-mode pcre2el pastels-on-dark-theme paradox page-break-lines orgit organic-green-theme org-repo-todo org-present org-pomodoro org-plus-contrib org-bullets open-junk-file omtose-phellack-theme oldlace-theme occidental-theme obsidian-theme noctilux-theme niflheim-theme neotree naquadah-theme mustang-theme multi-term move-text monokai-theme monochrome-theme molokai-theme moe-theme minimal-theme material-theme majapahit-theme magit-gitflow lush-theme lua-mode lorem-ipsum load-theme-buffer-local live-py-mode linum-relative link-hint light-soap-theme leuven-theme jbeans-theme jazz-theme ir-black-theme inkpot-theme info+ indent-guide ido-vertical-mode hy-mode hungry-delete htmlize hl-todo highlight-parentheses highlight-numbers highlight-indentation heroku-theme hemisu-theme help-fns+ helm-themes helm-swoop helm-pydoc helm-projectile helm-mode-manager helm-make helm-gitignore helm-flx helm-descbinds helm-company helm-c-yasnippet helm-ag hc-zenburn-theme gruvbox-theme gruber-darker-theme grandshell-theme gotham-theme google-translate golden-ratio gnuplot gitconfig-mode gitattributes-mode git-timemachine git-messenger gandalf-theme flycheck-pos-tip flx-ido flatui-theme flatland-theme firebelly-theme fill-column-indicator farmhouse-theme fancy-battery expand-region exec-path-from-shell evil-visualstar evil-tutor evil-surround evil-search-highlight-persist evil-numbers evil-nerd-commenter evil-mc evil-matchit evil-magit evil-lisp-state evil-indent-plus evil-iedit-state evil-exchange evil-escape evil-ediff evil-cleverparens evil-args evil-anzu espresso-theme eshell-z eshell-prompt-extras esh-help elisp-slime-nav dracula-theme django-theme define-word darktooth-theme darkmine-theme darkburn-theme dakrone-theme cython-mode cyberpunk-theme company-statistics company-quickhelp company-anaconda common-lisp-snippets colorsarenice-theme color-theme-sanityinc-tomorrow color-theme-sanityinc-solarized clues-theme clj-refactor clean-aindent-mode cider-eval-sexp-fu cherry-blossom-theme busybee-theme buffer-move bubbleberry-theme bracketed-paste birds-of-paradise-plus-theme badwolf-theme auto-yasnippet auto-highlight-symbol auto-compile arduino-mode apropospriate-theme anti-zenburn-theme ample-zen-theme ample-theme alect-themes aggressive-indent afternoon-theme adjust-parens adaptive-wrap ace-window ace-link ace-jump-helm-line ac-ispell)))
 '(pos-tip-background-color "#eee8d5")
 '(pos-tip-foreground-color "#586e75")
 '(prettify-symbols-unprettify-at-point t)
 '(safe-local-variable-values
   (quote
    ((Base . 10)
     (Package . CL-PPCRE)
     (Syntax . COMMON-LISP))))
 '(send-mail-function (quote smtpmail-send-it))
 '(slime-company-completion (quote fuzzy))
 '(symon-mode t)
 '(tabbar-background-color "#353535" t)
 '(term-default-bg-color "#fdf6e3")
 '(term-default-fg-color "#657b83")
 '(tramp-default-method "rsync")
 '(tramp-persistency-file-name "/home/jay/.emacs.d/.cache/tramp" t (tramp))
 '(vc-annotate-background nil t)
 '(vc-annotate-color-map
   (quote
    ((20 . "#dc322f")
     (40 . "#c85d17")
     (60 . "#be730b")
     (80 . "#b58900")
     (100 . "#a58e00")
     (120 . "#9d9100")
     (140 . "#959300")
     (160 . "#8d9600")
     (180 . "#859900")
     (200 . "#669b32")
     (220 . "#579d4c")
     (240 . "#489e65")
     (260 . "#399f7e")
     (280 . "#2aa198")
     (300 . "#2898af")
     (320 . "#2793ba")
     (340 . "#268fc6")
     (360 . "#268bd2"))) t)
 '(vc-annotate-very-old-color nil t)
 '(weechat-color-list
   (quote
    (unspecified "#fdf6e3" "#eee8d5" "#990A1B" "#dc322f" "#546E00" "#859900" "#7B6000" "#b58900" "#00629D" "#268bd2" "#93115C" "#d33682" "#00736F" "#2aa198" "#657b83" "#839496")) t))
(custom-set-faces
 ;; custom-set-faces was added by Custom.
 ;; If you edit it by hand, you could mess it up, so be careful.
 ;; Your init file should contain only one such instance.
 ;; If there is more than one, they won't work right.
 )
)
