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
     ;; Spacemacs interface
     (auto-completion :variables
                      auto-completion-enable-snippets-in-popup t)
     ivy
     themes-megapack
     ;; Langs
     (clojure :variables
              clojure-enable-fancify-symbols t)
     c-c++
     common-lisp-sly
     csv
     emacs-lisp
     html
     java
     javascript
     lua
     markdown
     org
     python
     sql
     yaml
     ;; Lang Tools
     spell-checking
     (syntax-checking :variables
                      flycheck-gcc-language-standard "c++11")
     ;; Dev tools
     floobits
     git
     (shell :variables
            shell-default-shell 'eshell
            shell-enable-smart-eshell t)
     ;; Emacs apps
     pdf-tools
     ;; Mine
     exwm
     personal-layer
     work
     )
   ;; A list of packages and/or extensions that will not be install and loaded.
   dotspacemacs-excluded-packages '()
   dotspacemacs-additional-packages '(ob-ipython
                                      dired+
                                      simple-mpc
                                      load-theme-buffer-local
                                      macrostep
                                      adjust-parens
                                      evil-cleverparens
                                      lispy)
   ;; If non-nil spacemacs will delete any orphan packages, i.e. packages that
   ;; are declared in a layer which is not a member of
   ;; the list `dotspacemacs-configuration-layers'
   dotspacemacs-delete-orphan-packages nil))

(defun dotspacemacs/init ()
  "Initialization function.
This function is called at the very startup of Spacemacs initialization
before layers configuration."
  (setq-default
   dotspacemacs-editing-style 'vim
   dotspacemacs-verbose-loading nil
   dotspacemacs-startup-banner 'random
   dotspacemacs-always-show-changelog t
   dotspacemacs-startup-lists '(recents projects)
   custom-theme-directory "~/.spacemacs.d/themes"
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
   dotspacemacs-fullscreen-at-startup t
   ;; If non nil `spacemacs/toggle-fullscreen' will not use native fullscreen.
   ;; Use to disable fullscreen animations in OSX."
   dotspacemacs-fullscreen-use-non-native nil
   dotspacemacs-maximized-at-startup nil
   dotspacemacs-active-transparency 100
   dotspacemacs-inactive-transparency 100
   dotspacemacs-mode-line-unicode-symbols t
   dotspacemacs-smooth-scrolling t
   ;; If non-nil smartparens-strict-mode will be enabled in programming modes.
   dotspacemacs-smartparens-strict-mode t
   ;; If non nil advises quit functions to keep server open when quitting.
   dotspacemacs-persistent-server nil
   dotspacemacs-search-tools '("ag" "pt" "ack" "grep")
   dotspacemacs-default-package-repository nil

   dotspacemacs-auto-save-file-location 'original

   ;; User vars
   dotspacemacs-smartparens-strict-mode t
   sly-lisp-implementations '((sbcl ("sbcl" "--dynamic-space-size" "2048"))))

  ;; User initialization goes here
  (set-face-attribute 'default nil :height 83))

(defun dotspacemacs/user-config ()
  "Configuration function.
 This function is called at the very end of Spacemacs initialization after
layers configuration."
  (defadvice switch-to-buffer (before save-buffer-now activate)
    (when buffer-file-name (save-buffer)))
  (defadvice other-window (before other-window-now activate)
    (when buffer-file-name (save-buffer)))
  (add-to-load-path "~/.spacemacs.d/")
  (require 'anchored-transpose)
  (defvar use-enter-escape-mode t)
  (with-eval-after-load 'exwm
    (spacemacs/set-leader-keys "<SPC>" 'spacemacs/exwm-app-launcher))
  (evil-leader/set-key-for-mode 'lisp-mode "dm" 'spacemacs/macrostep-transient-state/body)

  (global-prettify-symbols-mode 1))


;; Do not write anything past this comment. This is where Emacs will
;; auto-generate custom variable definitions.
(custom-set-variables
 ;; custom-set-variables was added by Custom.
 ;; If you edit it by hand, you could mess it up, so be careful.
 ;; Your init file should contain only one such instance.
 ;; If there is more than one, they won't work right.
 '(ansi-color-faces-vector
   [default bold shadow italic underline bold bold-italic bold])
 '(ansi-color-names-vector
   ["#14191f" "#d15120" "#81af34" "#deae3e" "#7e9fc9" "#a878b5" "#7e9fc9" "#dcdddd"])
 '(ansi-term-color-vector
   [term term-color-black term-color-red term-color-green term-color-yellow term-color-blue term-color-magenta term-color-cyan term-color-white] t)
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
 '(evil-cleverparens-use-additional-bindings nil)
 '(evil-cleverparens-use-additional-movement-keys nil)
 '(evil-emacs-state-cursor (quote ("#E57373" bar)) t)
 '(evil-insert-state-cursor (quote ("#E57373" hbar)) t)
 '(evil-normal-state-cursor (quote ("#FFEE58" box)) t)
 '(evil-visual-state-cursor (quote ("#C5E1A5" box)) t)
 '(evil-want-Y-yank-to-eol nil)
 '(eyebrowse-mode t)
 '(eyebrowse-wrap-around t)
 '(fci-rule-character-color "#192028")
 '(fci-rule-color "#eee8d5" t)
 '(frame-brackground-mode (quote dark))
 '(highlight-changes-colors (quote ("#d33682" "#6c71c4")))
 '(highlight-symbol-foreground-color "#586e75")
 '(highlight-tail-colors
   (quote
    (("#eee8d5" . 0)
     ("#B4C342" . 20)
     ("#69CABF" . 30)
     ("#69B7F0" . 50)
     ("#DEB542" . 60)
     ("#F2804F" . 70)
     ("#F771AC" . 85)
     ("#eee8d5" . 100))))
 '(hl-bg-colors
   (quote
    ("#DEB542" "#F2804F" "#FF6E64" "#F771AC" "#9EA0E5" "#69B7F0" "#69CABF" "#B4C342")))
 '(hl-fg-colors
   (quote
    ("#fdf6e3" "#fdf6e3" "#fdf6e3" "#fdf6e3" "#fdf6e3" "#fdf6e3" "#fdf6e3" "#fdf6e3")))
 '(linum-format " %7i ")
 '(magit-diff-use-overlays nil)
 '(org-file-apps
   (quote
    ((auto-mode . emacs)
     ("\\.mm\\'" . default)
     ("\\.x?html?\\'" . default))))
 '(package-selected-packages
   (quote
    (edn queue alert log4e gntp zoutline parent-mode pos-tip flx goto-chg undo-tree diminish web-completion-data paredit peg eval-sexp-fu pkg-info epl packed pythonic avy popup powerline org swiper ivy projectile inflections seq highlight request helm-core multiple-cursors magit-popup git-commit with-editor async web-beautify livid-mode skewer-mode simple-httpd json-mode json-snatcher json-reformat js2-refactor js2-mode js-doc company-tern dash-functional tern coffee-mode floobits sourcerer-theme spinner hide-comnt helm-purpose window-purpose imenu-list disaster company-c-headers cmake-mode clang-format yapfify railscasts-theme py-isort pug-mode org-projectile org-download git-link eyebrowse evil-visual-mark-mode evil-unimpaired dumb-jump darkokai-theme company-emacs-eclim eclim column-enforce-mode clojure-snippets macrostep gitignore-mode clojure-mode bind-key bind-map magit cider anaconda-mode auto-complete yasnippet anzu smartparens flycheck helm iedit company slime hydra package-build evil f s dash yaml-mode web-mode tagedit slim-mode scss-mode sass-mode mmm-mode markdown-toc markdown-mode lispy less-css-mode jade-mode helm-css-scss haml-mode gh-md emmet-mode csv-mode company-web zonokai-theme zenburn-theme zen-and-art-theme xterm-color ws-butler window-numbering which-key volatile-highlights vi-tilde-fringe uuidgen use-package underwater-theme ujelly-theme twilight-theme twilight-bright-theme twilight-anti-bright-theme tronesque-theme toxi-theme toc-org tao-theme tangotango-theme tango-plus-theme tango-2-theme sunny-day-theme sublime-themes subatomic256-theme subatomic-theme stekene-theme spacemacs-theme spaceline spacegray-theme soothe-theme soft-stone-theme soft-morning-theme soft-charcoal-theme smyx-theme smooth-scrolling smeargle slime-company shell-pop seti-theme reverse-theme restart-emacs rainbow-delimiters quelpa pyvenv python pytest pyenv-mode purple-haze-theme professional-theme popwin planet-theme pip-requirements phoenix-dark-pink-theme phoenix-dark-mono-theme persp-mode pcre2el pastels-on-dark-theme paradox page-break-lines orgit organic-green-theme org-repo-todo org-present org-pomodoro org-plus-contrib org-bullets open-junk-file omtose-phellack-theme oldlace-theme occidental-theme obsidian-theme noctilux-theme niflheim-theme neotree naquadah-theme mustang-theme multi-term move-text monokai-theme monochrome-theme molokai-theme moe-theme minimal-theme material-theme majapahit-theme magit-gitflow lush-theme lua-mode lorem-ipsum load-theme-buffer-local live-py-mode linum-relative link-hint light-soap-theme leuven-theme jbeans-theme jazz-theme ir-black-theme inkpot-theme info+ indent-guide ido-vertical-mode hy-mode hungry-delete htmlize hl-todo highlight-parentheses highlight-numbers highlight-indentation heroku-theme hemisu-theme help-fns+ helm-themes helm-swoop helm-pydoc helm-projectile helm-mode-manager helm-make helm-gitignore helm-flx helm-descbinds helm-company helm-c-yasnippet helm-ag hc-zenburn-theme gruvbox-theme gruber-darker-theme grandshell-theme gotham-theme google-translate golden-ratio gnuplot gitconfig-mode gitattributes-mode git-timemachine git-messenger gandalf-theme flycheck-pos-tip flx-ido flatui-theme flatland-theme firebelly-theme fill-column-indicator farmhouse-theme fancy-battery expand-region exec-path-from-shell evil-visualstar evil-tutor evil-surround evil-search-highlight-persist evil-numbers evil-nerd-commenter evil-mc evil-matchit evil-magit evil-lisp-state evil-indent-plus evil-iedit-state evil-exchange evil-escape evil-ediff evil-cleverparens evil-args evil-anzu espresso-theme eshell-z eshell-prompt-extras esh-help elisp-slime-nav dracula-theme django-theme define-word darktooth-theme darkmine-theme darkburn-theme dakrone-theme cython-mode cyberpunk-theme company-statistics company-quickhelp company-anaconda common-lisp-snippets colorsarenice-theme color-theme-sanityinc-tomorrow color-theme-sanityinc-solarized clues-theme clj-refactor clean-aindent-mode cider-eval-sexp-fu cherry-blossom-theme busybee-theme buffer-move bubbleberry-theme bracketed-paste birds-of-paradise-plus-theme badwolf-theme auto-yasnippet auto-highlight-symbol auto-compile arduino-mode apropospriate-theme anti-zenburn-theme ample-zen-theme ample-theme alect-themes aggressive-indent afternoon-theme adjust-parens adaptive-wrap ace-window ace-link ace-jump-helm-line ac-ispell)))
 '(pos-tip-background-color "#eee8d5")
 '(pos-tip-foreground-color "#586e75")
 '(safe-local-variable-values
   (quote
    ((Syntax . Ansi-common-lisp)
     (Package SCREAMER :USE CL :COLON-MODE :EXTERNAL)
     (Base . 10)
     (Package . CL-PPCRE)
     (Syntax . COMMON-LISP))))
 '(slime-company-completion (quote fuzzy))
 '(tabbar-background-color "#353535" t)
 '(term-default-bg-color "#fdf6e3")
 '(term-default-fg-color "#657b83")
 '(tramp-default-method "rsync")
 '(tramp-use-ssh-controlmaster-options nil)
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
 '(company-tooltip-common ((t (:inherit company-tooltip :weight bold :underline nil))))
 '(company-tooltip-common-selection ((t (:inherit company-tooltip-selection :weight bold :underline nil)))))
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
 '(ansi-color-faces-vector
   [default bold shadow italic underline bold bold-italic bold])
 '(ansi-color-names-vector
   ["#14191f" "#d15120" "#81af34" "#deae3e" "#7e9fc9" "#a878b5" "#7e9fc9" "#dcdddd"])
 '(ansi-term-color-vector
   [term term-color-black term-color-red term-color-green term-color-yellow term-color-blue term-color-magenta term-color-cyan term-color-white] t)
 '(beacon-color "#ec4780")
 '(browse-url-browser-function (quote browse-url-generic))
 '(browse-url-generic-program "vivaldi")
 '(compilation-message-face (quote default))
 '(cua-global-mark-cursor-color "#2aa198")
 '(cua-normal-cursor-color "#657b83")
 '(cua-overwrite-cursor-color "#b58900")
 '(cua-read-only-cursor-color "#859900")
 '(custom-enabled-themes (quote (LCARS)))
 '(custom-safe-themes
   (quote
    ("96d29d4d033b1be6298e75d2a8b6e8fcb0c558115643e4fd9a36a03682a6bc84" "0f6956b200865951957b22fabcd84698ead5a08bdda2d10ffa180fd524893f8f" "1548a6dd58254c7283b9b1319e66060e547707f75275634bfc0d2325b1526312" "5e2dc1360a92bb73dafa11c46ba0f30fa5f49df887a8ede4e3533c3ab6270e08" "66132890ee1f884b4f8e901f0c61c5ed078809626a547dbefbb201f900d03fd8" "51e228ffd6c4fff9b5168b31d5927c27734e82ec61f414970fc6bcce23bc140d" "868f73b5cf78e72ca2402e1d48675e49cc9a9619c5544af7bf216515d22b58e7" "27b2ef08bfb2f93f90c74bcb36162593bec9fe5c30c05621259baac95edb7137" "34e91dd54521213bfc88b0fd851d434f9de3ce8c1120bfc32b4c2972b2cfb288" "3302a3c048adfaefe36f3c46819e608fbda46c42662d390e905655bb8ecc8b3a" "7c63592fde37aa731a057ea6f9aa96966230785f7aba108357fb175c0191c6f6" "bf478be41439d9cc355f9c2d1b307e1dfebba7bf9b16e6ea651b1469b6307f66" "44d23f972730816fd6ebb0d621820344fa39bfeafb7a5246ca1c0b71b2e9e451" "c7ba6ff9a5db0a64f858b3a49ab410de51988fa2c52630eeb95aee847a6711b3" "f9adafd67c2ec471d1b304fb545efa14fe7265355839bf7c6812c4271714a05c" default)))
 '(display-time-24hr-format t)
 '(enable-recursive-minibuffers t)
 '(evil-cleverparens-use-additional-bindings nil)
 '(evil-cleverparens-use-additional-movement-keys nil)
 '(evil-emacs-state-cursor (quote ("#E57373" bar)) t)
 '(evil-insert-state-cursor (quote ("#E57373" hbar)) t)
 '(evil-normal-state-cursor (quote ("#FFEE58" box)) t)
 '(evil-visual-state-cursor (quote ("#C5E1A5" box)) t)
 '(evil-want-Y-yank-to-eol nil)
 '(fci-rule-character-color "#192028")
 '(fci-rule-color "#eee8d5" t)
 '(frame-brackground-mode (quote dark))
 '(highlight-changes-colors (quote ("#d33682" "#6c71c4")))
 '(highlight-symbol-foreground-color "#586e75")
 '(highlight-tail-colors
   (quote
    (("#eee8d5" . 0)
     ("#B4C342" . 20)
     ("#69CABF" . 30)
     ("#69B7F0" . 50)
     ("#DEB542" . 60)
     ("#F2804F" . 70)
     ("#F771AC" . 85)
     ("#eee8d5" . 100))))
 '(hl-bg-colors
   (quote
    ("#DEB542" "#F2804F" "#FF6E64" "#F771AC" "#9EA0E5" "#69B7F0" "#69CABF" "#B4C342")))
 '(hl-fg-colors
   (quote
    ("#fdf6e3" "#fdf6e3" "#fdf6e3" "#fdf6e3" "#fdf6e3" "#fdf6e3" "#fdf6e3" "#fdf6e3")))
 '(magit-diff-use-overlays nil)
 '(org-agenda-files
   (quote
    ("~/Dropbox/org/DG.org" "~/Dropbox/org/stu orgs.org" "~/Dropbox/org/usf.org" "inbox.org" "calendar.org")))
 '(org-agenda-skip-deadline-prewarning-if-scheduled t)
 '(org-agenda-skip-scheduled-if-done t)
 '(org-agenda-sorting-strategy
   (quote
    ((agenda habit-up time-up priority-down category-keep)
     (todo priority-down category-keep)
     (tags priority-down category-keep)
     (search category-keep))))
 '(org-agenda-todo-ignore-scheduled (quote future))
 '(org-refile-targets
   (quote
    ((nil :maxlevel . 2)
     (org-agenda-files :maxlevel . 2))))
 '(package-selected-packages
   (quote
    (exwm winum white-sand-theme wgrep symon string-inflection solarized-theme smex simple-mpc rebecca-theme madhat2r-theme ivy-purpose ivy-hydra groovy-mode groovy-imports pcache gradle-mode fuzzy flyspell-correct-ivy flyspell-correct ensime sbt-mode scala-mode ein websocket autothemer counsel-projectile counsel auto-dictionary meghanada edn queue alert log4e gntp zoutline parent-mode pos-tip flx goto-chg undo-tree diminish web-completion-data paredit peg eval-sexp-fu pkg-info epl packed pythonic avy popup powerline org swiper ivy projectile inflections seq highlight request helm-core multiple-cursors magit-popup git-commit with-editor async web-beautify livid-mode skewer-mode simple-httpd json-mode json-snatcher json-reformat js2-refactor js2-mode js-doc company-tern dash-functional tern coffee-mode floobits sourcerer-theme spinner hide-comnt helm-purpose window-purpose imenu-list disaster company-c-headers cmake-mode clang-format yapfify railscasts-theme py-isort pug-mode org-projectile org-download git-link eyebrowse evil-visual-mark-mode evil-unimpaired dumb-jump darkokai-theme company-emacs-eclim eclim column-enforce-mode clojure-snippets macrostep gitignore-mode clojure-mode bind-key bind-map magit cider anaconda-mode auto-complete yasnippet anzu smartparens flycheck helm iedit company slime hydra package-build evil f s dash yaml-mode web-mode tagedit slim-mode scss-mode sass-mode mmm-mode markdown-toc markdown-mode lispy less-css-mode jade-mode helm-css-scss haml-mode gh-md emmet-mode csv-mode company-web zonokai-theme zenburn-theme zen-and-art-theme xterm-color ws-butler window-numbering which-key volatile-highlights vi-tilde-fringe uuidgen use-package underwater-theme ujelly-theme twilight-theme twilight-bright-theme twilight-anti-bright-theme tronesque-theme toxi-theme toc-org tao-theme tangotango-theme tango-plus-theme tango-2-theme sunny-day-theme sublime-themes subatomic256-theme subatomic-theme stekene-theme spacemacs-theme spaceline spacegray-theme soothe-theme soft-stone-theme soft-morning-theme soft-charcoal-theme smyx-theme smooth-scrolling smeargle slime-company shell-pop seti-theme reverse-theme restart-emacs rainbow-delimiters quelpa pyvenv python pytest pyenv-mode purple-haze-theme professional-theme popwin planet-theme pip-requirements phoenix-dark-pink-theme phoenix-dark-mono-theme persp-mode pcre2el pastels-on-dark-theme paradox page-break-lines orgit organic-green-theme org-repo-todo org-present org-pomodoro org-plus-contrib org-bullets open-junk-file omtose-phellack-theme oldlace-theme occidental-theme obsidian-theme noctilux-theme niflheim-theme neotree naquadah-theme mustang-theme multi-term move-text monokai-theme monochrome-theme molokai-theme moe-theme minimal-theme material-theme majapahit-theme magit-gitflow lush-theme lua-mode lorem-ipsum load-theme-buffer-local live-py-mode linum-relative link-hint light-soap-theme leuven-theme jbeans-theme jazz-theme ir-black-theme inkpot-theme info+ indent-guide ido-vertical-mode hy-mode hungry-delete htmlize hl-todo highlight-parentheses highlight-numbers highlight-indentation heroku-theme hemisu-theme help-fns+ helm-themes helm-swoop helm-pydoc helm-projectile helm-mode-manager helm-make helm-gitignore helm-flx helm-descbinds helm-company helm-c-yasnippet helm-ag hc-zenburn-theme gruvbox-theme gruber-darker-theme grandshell-theme gotham-theme google-translate golden-ratio gnuplot gitconfig-mode gitattributes-mode git-timemachine git-messenger gandalf-theme flycheck-pos-tip flx-ido flatui-theme flatland-theme firebelly-theme fill-column-indicator farmhouse-theme fancy-battery expand-region exec-path-from-shell evil-visualstar evil-tutor evil-surround evil-search-highlight-persist evil-numbers evil-nerd-commenter evil-mc evil-matchit evil-magit evil-lisp-state evil-indent-plus evil-iedit-state evil-exchange evil-escape evil-ediff evil-cleverparens evil-args evil-anzu espresso-theme eshell-z eshell-prompt-extras esh-help elisp-slime-nav dracula-theme django-theme define-word darktooth-theme darkmine-theme darkburn-theme dakrone-theme cython-mode cyberpunk-theme company-statistics company-quickhelp company-anaconda common-lisp-snippets colorsarenice-theme color-theme-sanityinc-tomorrow color-theme-sanityinc-solarized clues-theme clj-refactor clean-aindent-mode cider-eval-sexp-fu cherry-blossom-theme busybee-theme buffer-move bubbleberry-theme bracketed-paste birds-of-paradise-plus-theme badwolf-theme auto-yasnippet auto-highlight-symbol auto-compile arduino-mode apropospriate-theme anti-zenburn-theme ample-zen-theme ample-theme alect-themes aggressive-indent afternoon-theme adjust-parens adaptive-wrap ace-window ace-link ace-jump-helm-line ac-ispell)))
 '(pos-tip-background-color "#eee8d5")
 '(pos-tip-foreground-color "#586e75")
 '(python-shell-extra-pythonpaths (quote ("/mnt/ea004237/tampa/Dev/PyLibs")))
 '(safe-local-variable-values
   (quote
    ((Base . 10)
     (Package . CL-PPCRE)
     (Syntax . COMMON-LISP))))
 '(slime-company-completion (quote fuzzy) t)
 '(tabbar-background-color "#353535" t)
 '(term-default-bg-color "#fdf6e3")
 '(term-default-fg-color "#657b83")
 '(tramp-persistency-file-name "/home/ea004237/.emacs.d/.cache/tramp")
 '(tramp-save-ad-hoc-proxies t nil (tramp))
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
    (unspecified "#fdf6e3" "#eee8d5" "#990A1B" "#dc322f" "#546E00" "#859900" "#7B6000" "#b58900" "#00629D" "#268bd2" "#93115C" "#d33682" "#00736F" "#2aa198" "#657b83" "#839496")) t)
 '(window-numbering-auto-assign-0-to-minibuffer nil))
(custom-set-faces
 ;; custom-set-faces was added by Custom.
 ;; If you edit it by hand, you could mess it up, so be careful.
 ;; Your init file should contain only one such instance.
 ;; If there is more than one, they won't work right.
 '(company-tooltip-common ((t (:inherit company-tooltip :weight bold :underline nil))))
 '(company-tooltip-common-selection ((t (:inherit company-tooltip-selection :weight bold :underline nil))))
 '(term ((t (:inherit default)))))
)
