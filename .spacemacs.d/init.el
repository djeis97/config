;; -*- mode: dotspacemacs -*-

;; It must be stored in your home directory.

(defun dotspacemacs/layers ()
  "Configuration Layers declaration."
  (setq-default
   dotspacemacs-distribution 'spacemacs
   dotspacemacs-enable-lazy-installation 'unused
   dotspacemacs-ask-for-lazy-installation t
   dotspacemacs-configuration-layer-path '()
   dotspacemacs-configuration-layers
   '(
     djeis97-common
     djeis97-work
     c-c++
     javascript
     csv
     html
     java
     javascript
     lua
     markdown
     python
     sql
     yaml
     )
   dotspacemacs-excluded-packages '()
   dotspacemacs-additional-packages '(dired+
                                      symon
                                      simple-mpc
                                      load-theme-buffer-local)

   ;; If non-nil spacemacs will delete any orphan packages, i.e. packages that
   ;; are declared in a layer which is not a member of
   ;; the list `dotspacemacs-configuration-layers'
   dotspacemacs-delete-orphan-packages nil))

(defun dotspacemacs/init ()
  "Initialization function.
This function is called at the very startup of Spacemacs initialization
before layers configuration."
  ;; This setq-default sexp is an exhaustive list of all the supported
  ;; spacemacs settings.
  (setq-default
   dotspacemacs-elpa-https t
   dotspacemacs-elpa-timeout 5
   dotspacemacs-check-for-update nil
   dotspacemacs-elpa-subdirectory nil
   dotspacemacs-editing-style 'vim
   dotspacemacs-verbose-loading nil
   dotspacemacs-startup-banner 'random
   dotspacemacs-always-show-changelog t
   dotspacemacs-startup-lists '(recents projects)
   dotspacemacs-themes '(spacemacs-dark)
   dotspacemacs-colorize-cursor-according-to-state t
   dotspacemacs-default-font '("Source Code Pro"
                               :size 11
                               :weight normal
                               :width normal
                               :powerline-scale 1.1)
   powerline-default-separator 'curve
   dotspacemacs-leader-key "SPC"
   dotspacemacs-emacs-leader-key "<f20>"
   dotspacemacs-major-mode-leader-key ","
   ;; Major mode leader key accessible in `emacs state' and `insert state'
   dotspacemacs-major-mode-emacs-leader-key "<M-F20>"
   dotspacemacs-command-key ":"
   dotspacemacs-enable-paste-micro-state t
   dotspacemacs-guide-key-delay 0.4
   dotspacemacs-loading-progress-bar t
   dotspacemacs-fullscreen-use-non-native nil
   dotspacemacs-maximized-at-startup nil
   dotspacemacs-active-transparency 100
   dotspacemacs-inactive-transparency 100
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
  ;; User initialization goes here
  (set-face-attribute 'default nil :height 83))

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
    (meghanada white-sand-theme wgrep solarized-theme smex sly-macrostep sly sayid rebecca-theme org-category-capture org-brain madhat2r-theme ledger-mode ivy-purpose ivy-hydra ibuffer-projectile fuzzy flyspell-correct-ivy flycheck-ledger evil-org autothemer counsel-projectile counsel company-lua flyspell-correct-helm flyspell-correct auto-dictionary pdf-tools tablist exwm simple-mpc edn queue alert log4e gntp zoutline parent-mode pos-tip flx goto-chg undo-tree diminish web-completion-data paredit peg eval-sexp-fu pkg-info epl packed pythonic avy popup powerline org swiper ivy projectile inflections seq highlight request helm-core multiple-cursors magit-popup git-commit with-editor async web-beautify livid-mode skewer-mode simple-httpd json-mode json-snatcher json-reformat js2-refactor js2-mode js-doc company-tern dash-functional tern coffee-mode floobits sourcerer-theme spinner hide-comnt helm-purpose window-purpose imenu-list disaster company-c-headers cmake-mode clang-format yapfify railscasts-theme py-isort pug-mode org-projectile org-download git-link eyebrowse evil-visual-mark-mode evil-unimpaired dumb-jump darkokai-theme company-emacs-eclim eclim column-enforce-mode clojure-snippets macrostep gitignore-mode clojure-mode bind-key bind-map magit cider anaconda-mode auto-complete yasnippet anzu smartparens flycheck helm iedit company slime hydra package-build evil f s dash yaml-mode web-mode tagedit slim-mode scss-mode sass-mode mmm-mode markdown-toc markdown-mode lispy less-css-mode jade-mode helm-css-scss haml-mode gh-md emmet-mode csv-mode company-web zonokai-theme zenburn-theme zen-and-art-theme xterm-color ws-butler window-numbering which-key volatile-highlights vi-tilde-fringe uuidgen use-package underwater-theme ujelly-theme twilight-theme twilight-bright-theme twilight-anti-bright-theme tronesque-theme toxi-theme toc-org tao-theme tangotango-theme tango-plus-theme tango-2-theme sunny-day-theme sublime-themes subatomic256-theme subatomic-theme stekene-theme spacemacs-theme spaceline spacegray-theme soothe-theme soft-stone-theme soft-morning-theme soft-charcoal-theme smyx-theme smooth-scrolling smeargle slime-company shell-pop seti-theme reverse-theme restart-emacs rainbow-delimiters quelpa pyvenv python pytest pyenv-mode purple-haze-theme professional-theme popwin planet-theme pip-requirements phoenix-dark-pink-theme phoenix-dark-mono-theme persp-mode pcre2el pastels-on-dark-theme paradox page-break-lines orgit organic-green-theme org-repo-todo org-present org-pomodoro org-plus-contrib org-bullets open-junk-file omtose-phellack-theme oldlace-theme occidental-theme obsidian-theme noctilux-theme niflheim-theme neotree naquadah-theme mustang-theme multi-term move-text monokai-theme monochrome-theme molokai-theme moe-theme minimal-theme material-theme majapahit-theme magit-gitflow lush-theme lua-mode lorem-ipsum load-theme-buffer-local live-py-mode linum-relative link-hint light-soap-theme leuven-theme jbeans-theme jazz-theme ir-black-theme inkpot-theme info+ indent-guide ido-vertical-mode hy-mode hungry-delete htmlize hl-todo highlight-parentheses highlight-numbers highlight-indentation heroku-theme hemisu-theme help-fns+ helm-themes helm-swoop helm-pydoc helm-projectile helm-mode-manager helm-make helm-gitignore helm-flx helm-descbinds helm-company helm-c-yasnippet helm-ag hc-zenburn-theme gruvbox-theme gruber-darker-theme grandshell-theme gotham-theme google-translate golden-ratio gnuplot gitconfig-mode gitattributes-mode git-timemachine git-messenger gandalf-theme flycheck-pos-tip flx-ido flatui-theme flatland-theme firebelly-theme fill-column-indicator farmhouse-theme fancy-battery expand-region exec-path-from-shell evil-visualstar evil-tutor evil-surround evil-search-highlight-persist evil-numbers evil-nerd-commenter evil-mc evil-matchit evil-magit evil-lisp-state evil-indent-plus evil-iedit-state evil-exchange evil-escape evil-ediff evil-cleverparens evil-args evil-anzu espresso-theme eshell-z eshell-prompt-extras esh-help elisp-slime-nav dracula-theme django-theme define-word darktooth-theme darkmine-theme darkburn-theme dakrone-theme cython-mode cyberpunk-theme company-statistics company-quickhelp company-anaconda common-lisp-snippets colorsarenice-theme color-theme-sanityinc-tomorrow color-theme-sanityinc-solarized clues-theme clj-refactor clean-aindent-mode cider-eval-sexp-fu cherry-blossom-theme busybee-theme buffer-move bubbleberry-theme bracketed-paste birds-of-paradise-plus-theme badwolf-theme auto-yasnippet auto-highlight-symbol auto-compile arduino-mode apropospriate-theme anti-zenburn-theme ample-zen-theme ample-theme alect-themes aggressive-indent afternoon-theme adjust-parens adaptive-wrap ace-window ace-link ace-jump-helm-line ac-ispell)))
 '(pos-tip-background-color "#eee8d5")
 '(pos-tip-foreground-color "#586e75")
 '(prettify-symbols-unprettify-at-point t)
 '(safe-local-variable-values
   (quote
    ((Base . 10)
     (Package . CL-PPCRE)
     (Syntax . COMMON-LISP))))
 '(tramp-default-method "rsync")
 '(tramp-persistency-file-name "/home/ea004237/.emacs.d/.cache/tramp" t (tramp))
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
