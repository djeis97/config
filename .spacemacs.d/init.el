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
     ;; auto-completion
     ;; better-defaults
     ;; (git :variables
     ;;      git-gutter-use-fringe t)
     ;; markdown
     ;; org
     git
     (auto-completion :variables
                      auto-completion-enable-snippets-in-popup t)
     emacs-lisp
     (shell :variables
            shell-default-shell 'eshell
            shell-enable-smart-eshell t
            )
     syntax-checking
     org
     common-lisp
     clojure
     lua
     java
     themes-megapack
     python
     )
   ;; A list of packages and/or extensions that will not be install and loaded.
   dotspacemacs-excluded-packages '()
   dotspacemacs-additional-packages '(load-theme-buffer-local
                                      arduino-mode
                                      macrostep
                                      adjust-parens
                                      hc-zenburn-theme
                                      slime-company
                                      gruber-darker-theme
                                      apropospriate-theme
                                      evil-cleverparens)
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
   ;; Either `vim' or `emacs'. Evil is always enabled but if the variable
   ;; is `emacs' then the `holy-mode' is enabled at startup.
   dotspacemacs-editing-style 'vim
   ;; If non nil output loading progess in `*Messages*' buffer.
   dotspacemacs-verbose-loading nil
   ;; Specify the startup banner. Default value is `official', it displays
   ;; the official spacemacs logo. An integer value is the index of text
   ;; banner, `random' chooses a random text banner in `core/banners'
   ;; directory. A string value must be a path to a .PNG file.
   ;; If the value is nil then no banner is displayed.
   ;; dotspacemacs-startup-banner 'official
   dotspacemacs-startup-banner 'official
   ;; t if you always want to see the changelog at startup
   dotspacemacs-always-show-changelog t
   ;; List of items to show in the startup buffer. If nil it is disabled.
   ;; Possible values are: `recents' `bookmarks' `projects'."
   dotspacemacs-startup-lists '(recents projects)
   ;; List of themes, the first of the list is loaded when spacemacs starts.
   ;; Press <SPC> T n to cycle to the next theme in the list (works great
   ;; with 2 themes variants, one dark and one light)
   dotspacemacs-themes '(cyberpunk
                         zen-and-art
                         hc-zenburn
                         gruber-darker-theme
                         apropospriate-dark
                         solarized-light
                         solarized-dark
                         leuven
                         monokai
                         zenburn)
   ;; If non nil the cursor color matches the state color.
   dotspacemacs-colorize-cursor-according-to-state t
   ;; Default font. `powerline-scale' allows to quickly tweak the mode-line
   ;; size to make separators look not too crappy.
   dotspacemacs-default-font '("Source Code Pro"
                               :size 13
                               :weight normal
                               :width normal
                               :powerline-scale 1.1)
   ;; The leader key
   dotspacemacs-leader-key "SPC"
   ;; The leader key accessible in `emacs state' and `insert state'
   dotspacemacs-emacs-leader-key "M-m"
   ;; Major mode leader key is a shortcut key which is the equivalent of
   ;; pressing `<leader> m`. Set it to `nil` to disable it.
   dotspacemacs-major-mode-leader-key ","
   ;; Major mode leader key accessible in `emacs state' and `insert state'
   dotspacemacs-major-mode-emacs-leader-key "C-M-m"
   ;; The command key used for Evil commands (ex-commands) and
   ;; Emacs commands (M-x).
   ;; By default the command key is `:' so ex-commands are executed like in Vim
   ;; with `:' and Emacs commands are executed with `<leader> :'.
   dotspacemacs-command-key ":"
   ;; If non nil the paste micro-state is enabled. While enabled pressing `p`
   ;; several times cycle between the kill ring content.
   dotspacemacs-enable-paste-micro-state t
   ;; Guide-key delay in seconds. The Guide-key is the popup buffer listing
   ;; the commands bound to the current keystrokes.
   dotspacemacs-guide-key-delay 0.4
   ;; If non nil a progress bar is displayed when spacemacs is loading. This
   ;; may increase the boot time on some systems and emacs builds, set it to
   ;; nil ;; to boost the loading time.
   dotspacemacs-loading-progress-bar t
   ;; If non nil the frame is fullscreen when Emacs starts up.
   ;; (Emacs 24.4+ only)
   dotspacemacs-fullscreen-at-startup nil
   ;; If non nil `spacemacs/toggle-fullscreen' will not use native fullscreen.
   ;; Use to disable fullscreen animations in OSX."
   dotspacemacs-fullscreen-use-non-native nil
   ;; If non nil the frame is maximized when Emacs starts up.
   ;; Takes effect only if `dotspacemacs-fullscreen-at-startup' is nil.
   ;; (Emacs 24.4+ only)
   dotspacemacs-maximized-at-startup nil
   ;; A value from the range (0..100), in increasing opacity, which describes
   ;; the transparency level of a frame when it's active or selected.
   ;; Transparency can be toggled through `toggle-transparency'.
   dotspacemacs-active-transparency 90
   ;; A value from the range (0..100), in increasing opacity, which describes
   ;; the transparency level of a frame when it's inactive or deselected.
   ;; Transparency can be toggled through `toggle-transparency'.
   dotspacemacs-inactive-transparency 90
   ;; If non nil unicode symbols are displayed in the mode line.
   dotspacemacs-mode-line-unicode-symbols t
   ;; If non nil smooth scrolling (native-scrolling) is enabled. Smooth
   ;; scrolling overrides the default behavior of Emacs which recenters the
   ;; point when it reaches the top or bottom of the screen.
   dotspacemacs-smooth-scrolling t
   ;; If non-nil smartparens-strict-mode will be enabled in programming modes.
   dotspacemacs-smartparens-strict-mode t
   ;; If non nil advises quit functions to keep server open when quitting.
   dotspacemacs-persistent-server nil
   ;; List of search tool executable names. Spacemacs uses the first installed
   ;; tool of the list. Supported tools are `ag', `pt', `ack' and `grep'.
   dotspacemacs-search-tools '("ag" "pt" "ack" "grep")
   ;; The default package repository used if no explicit repository has been
   ;; specified with an installed package.
   ;; Not used for now.
   dotspacemacs-default-package-repository nil

   dotspacemacs-auto-save-file-location 'original
   )
  ;; User initialization goes here
  )


(defun dotspacemacs/user-config ()
  "Configuration function.
 This function is called at the very end of Spacemacs initialization after
layers configuration."
  (setq inferior-lisp-program "sbcl")
  (require 'tramp)
  (with-eval-after-load 'evil-cleverparens
    (define-key evil-lisp-state-major-mode-map (kbd "<")
      (evil-lisp-state-enter-command evil-cp-<))
    (define-key evil-lisp-state-major-mode-map (kbd ">")
      (evil-lisp-state-enter-command evil-cp->))
    (define-key evil-lisp-state-map (kbd "<")
      (evil-lisp-state-enter-command evil-cp-<))
    (define-key evil-lisp-state-map (kbd ">")
      (evil-lisp-state-enter-command evil-cp->))
    (dolist (x evil-cp-additional-bindings)
      (let ((key (car x))
            (cmd (cdr x)))
        (eval
         `(progn
            (if evil-lisp-state-global
                (define-key evil-lisp-state-map ,(kbd key)
                  (evil-lisp-state-enter-command ,cmd))
              (define-key evil-lisp-state-major-mode-map ,(kbd key)
                (evil-lisp-state-enter-command ,cmd))))))))
  (with-eval-after-load 'smartparens
    (add-hook 'smartparens-enabled-hook #'evil-cleverparens-mode))

  (add-to-list 'tramp-remote-path 'tramp-own-remote-path)
  (defadvice switch-to-buffer (before save-buffer-now activate)
    (when buffer-file-name (save-buffer)))
  (defadvice other-window (before other-window-now activate)
    (when buffer-file-name (save-buffer)))
  (setq powerline-default-separator 'curve)
  (slime-setup '(slime-company))
  (add-to-load-path "~/.spacemacs.d/")
  (require 'anchored-transpose)
  (require 'adjust-parens)
  (defun fake-key (key)
    (let ((command (key-binding (kbd "RET")))
          (keys (function 'this-command-keys))
          (vector-keys (function 'this-command-keys-vector))
          (read-key-seq (function 'read-key-sequence))
          (read-key-seq-vec (function 'read-key-sequence-vector))
          (indirecting t))
      (flet ((this-command-keys ()
                                (if indirecting
                                    [?\n]
                                  (funcall keys)))
             (this-command-keys-vector ()
                                       (if indirecting
                                           [?\n]
                                         (funcall keys)))
             (read-key-sequence ()
                                (setq indirecting nil)
                                (funcall read-key-seq))
             (read-key-sequence-vector ()
                                       (setq indirecting nil)
                                       (funcall read-key-seq-vec)))
        (setq this-command command)
        (call-interactively command))))
  (defun close-paren ()
    (interactive)
    (let ((next-line-only-close-parens (save-excursion
                                         (next-line)
                                         (beginning-of-line)
                                         (looking-at "\s*\)+\s*$"))))
      (sp-forward-barf-sexp '(4))
      (save-excursion
        (next-line)
        (beginning-of-line)
        (if (and next-line-only-close-parens
                 (looking-at "\s*$"))
            (ignore-errors
              (kill-whole-line)))))
    (right-char))
  (define-minor-mode paren-management
    "Bindings to better manage parens."
    :keymap (let ((map (make-sparse-keymap)))
              (define-key map (kbd "<C-tab>") 'lisp-indent-adjust-parens)
              (define-key map (kbd "<C-iso-lefttab>") 'lisp-dedent-adjust-parens)
              (define-key map (kbd "(") (lambda ()
                                          (interactive)
                                          (sp-insert-pair "(")
                                          (sp-forward-slurp-sexp '(4))))
              (define-key map (kbd ")") 'close-paren)
              (define-key map (kbd "RET") (lambda ()
                                            (interactive)
                                            (newline-and-indent)
                                            (if (char-equal (char-after (point)) ?\))
                                                (save-excursion
                                                  (newline-and-indent)))
                                            (indent-according-to-mode)))
              map))
  (defvar use-enter-escape-mode t)
  (define-minor-mode enter-escape-mode
    "Advanced enter key."
    :keymap (let ((map (make-sparse-keymap)))
              (define-key map (kbd "RET") (lambda ()
                                            (interactive)
                                            (enter-escape-mode 0)
                                            (evil-normal-state)))
              (define-key map (kbd "S-<return>") (lambda ()
                                                   (interactive)
                                                   (enter-escape-mode 0)
                                                   (enter-newline-mode)
                                                   (let ((command (key-binding (kbd "RET")))
                                                         (keys (function 'this-command-keys))
                                                         (vector-keys (function 'this-command-keys-vector))
                                                         (read-key-seq (function 'read-key-sequence))
                                                         (read-key-seq-vec (function 'read-key-sequence-vector))
                                                         (indirecting t))
                                                     (flet ((this-command-keys ()
                                                                               (if indirecting
                                                                                   [?\n]
                                                                                 (funcall keys)))
                                                            (this-command-keys-vector ()
                                                                                      (if indirecting
                                                                                          [?\n]
                                                                                        (funcall keys)))
                                                            (read-key-sequence ()
                                                                               (setq indirecting nil)
                                                                               (funcall read-key-seq))
                                                            (read-key-sequence-vector ()
                                                                                      (setq indirecting nil)
                                                                                      (funcall read-key-seq-vec)))
                                                       (setq this-command command)
                                                       (call-interactively command)))))
              (define-key map (kbd "C-j") (lambda ()
                                            (interactive)
                                            (enter-escape-mode 0)
                                            (enter-newline-mode)
                                            (let ((command (key-binding (kbd "RET")))
                                                  (keys (function 'this-command-keys))
                                                  (vector-keys (function 'this-command-keys-vector))
                                                  (read-key-seq (function 'read-key-sequence))
                                                  (read-key-seq-vec (function 'read-key-sequence-vector))
                                                  (indirecting t))
                                              (flet ((this-command-keys ()
                                                                        (if indirecting
                                                                            [?\n]
                                                                          (funcall keys)))
                                                     (this-command-keys-vector ()
                                                                               (if indirecting
                                                                                   [?\n]
                                                                                 (funcall keys)))
                                                     (read-key-sequence ()
                                                                        (setq indirecting nil)
                                                                        (funcall read-key-seq))
                                                     (read-key-sequence-vector ()
                                                                               (setq indirecting nil)
                                                                               (funcall read-key-seq-vec)))
                                                (setq this-command command)
                                                (call-interactively command)))))
              map))
  (define-minor-mode enter-newline-mode
    "Advanced enter key."
    :keymap (let ((map (make-sparse-keymap)))
              (define-key map (kbd "S-<return>") (lambda ()
                                                   (interactive)
                                                   (enter-newline-mode 0)
                                                   (enter-escape-mode)
                                                   (evil-normal-state)))
              map))

  (defun toggle-enter-escape-mode ()
    (interactive)
    (setq use-enter-escape-mode (not use-enter-escape-mode)))
  (spacemacs|add-toggle enter->escape
    :status use-enter-escape-mode
    :on (setq use-enter-escape-mode t)
    :off (setq use-enter-escape-mode nil)
    :documentation "Enable rebinding enter to escape in insert mode."
    :evil-leader "te")
  (spacemacs|diminish enter-escape-mode " e")
  (spacemacs|diminish enter-newline-mode " E")
  (add-hook 'evil-insert-state-entry-hook (lambda () (if use-enter-escape-mode (enter-escape-mode))))
  (add-hook 'evil-insert-state-exit-hook (lambda ()
                                           (enter-escape-mode 0)
                                           (enter-newline-mode 0)))
  (evil-leader/set-key-for-mode 'lisp-mode "dm" 'spacemacs/macrostep-micro-state)

  (global-prettify-symbols-mode 1)
  ;;  (define-key evil-insert-state-map (kbd "S-<return>") (lambda () (interactive) (newline-and-indent)))
  ;;  (define-key evil-insert-state-map (kbd "RET") (kbd "<escape>"))
  (add-hook 'lisp-mode-hook 'paren-management)
  )
;; Do not write anything past this comment. This is where Emacs will
;; auto-generate custom variable definitions.
(custom-set-variables
 ;; custom-set-variables was added by Custom.
 ;; If you edit it by hand, you could mess it up, so be careful.
 ;; Your init file should contain only one such instance.
 ;; If there is more than one, they won't work right.
 '(ansi-term-color-vector
   [unspecified "#424242" "#EF9A9A" "#C5E1A5" "#FFEE58" "#64B5F6" "#E1BEE7" "#80DEEA" "#E0E0E0"] t)
 '(beacon-color "#ec4780")
 '(compilation-message-face (quote default))
 '(cua-global-mark-cursor-color "#2aa198")
 '(cua-normal-cursor-color "#657b83")
 '(cua-overwrite-cursor-color "#b58900")
 '(cua-read-only-cursor-color "#859900")
 '(custom-enabled-themes (quote (LCARS)))
 '(custom-safe-themes
   (quote
    ("66132890ee1f884b4f8e901f0c61c5ed078809626a547dbefbb201f900d03fd8" "51e228ffd6c4fff9b5168b31d5927c27734e82ec61f414970fc6bcce23bc140d" "868f73b5cf78e72ca2402e1d48675e49cc9a9619c5544af7bf216515d22b58e7" "27b2ef08bfb2f93f90c74bcb36162593bec9fe5c30c05621259baac95edb7137" "34e91dd54521213bfc88b0fd851d434f9de3ce8c1120bfc32b4c2972b2cfb288" "3302a3c048adfaefe36f3c46819e608fbda46c42662d390e905655bb8ecc8b3a" "7c63592fde37aa731a057ea6f9aa96966230785f7aba108357fb175c0191c6f6" "bf478be41439d9cc355f9c2d1b307e1dfebba7bf9b16e6ea651b1469b6307f66" "44d23f972730816fd6ebb0d621820344fa39bfeafb7a5246ca1c0b71b2e9e451" "c7ba6ff9a5db0a64f858b3a49ab410de51988fa2c52630eeb95aee847a6711b3" "f9adafd67c2ec471d1b304fb545efa14fe7265355839bf7c6812c4271714a05c" default)))
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
 '(package-selected-packages
   (quote
    (slime macrostep gitignore-mode flycheck company clojure-mode anaconda-mode package-build bind-key bind-map evil tango-2-theme paradox orgit magit-gitflow magit helm-flx git-commit evil-magit company-quickhelp clj-refactor zonokai-theme zenburn-theme zen-and-art-theme xterm-color ws-butler window-numbering which-key volatile-highlights vi-tilde-fringe use-package underwater-theme ujelly-theme twilight-theme twilight-bright-theme twilight-anti-bright-theme tronesque-theme toxi-theme toc-org tao-theme tangotango-theme tango-plus-theme sunny-day-theme sublime-themes subatomic256-theme subatomic-theme stekene-theme spacemacs-theme spaceline spacegray-theme soothe-theme soft-stone-theme soft-morning-theme soft-charcoal-theme smyx-theme smooth-scrolling smeargle slime-company shell-pop seti-theme reverse-theme restart-emacs rainbow-delimiters quelpa pyvenv python pytest pyenv-mode purple-haze-theme professional-theme popwin planet-theme pip-requirements phoenix-dark-pink-theme phoenix-dark-mono-theme persp-mode pcre2el pastels-on-dark-theme page-break-lines organic-green-theme org-repo-todo org-present org-pomodoro org-plus-contrib org-bullets open-junk-file omtose-phellack-theme oldlace-theme occidental-theme obsidian-theme noctilux-theme niflheim-theme neotree naquadah-theme mustang-theme multi-term move-text monokai-theme monochrome-theme molokai-theme moe-theme minimal-theme material-theme majapahit-theme lush-theme lua-mode lorem-ipsum linum-relative light-soap-theme leuven-theme jbeans-theme jazz-theme ir-black-theme inkpot-theme info+ indent-guide ido-vertical-mode hy-mode hungry-delete htmlize hl-todo highlight-parentheses highlight-numbers highlight-indentation heroku-theme hemisu-theme help-fns+ helm-themes helm-swoop helm-pydoc helm-projectile helm-mode-manager helm-make helm-gitignore helm-descbinds helm-company helm-c-yasnippet helm-ag hc-zenburn-theme gruvbox-theme gruber-darker-theme grandshell-theme gotham-theme google-translate golden-ratio gnuplot gitconfig-mode gitattributes-mode git-timemachine git-messenger gandalf-theme flycheck-pos-tip flx-ido flatui-theme flatland-theme firebelly-theme fill-column-indicator farmhouse-theme fancy-battery expand-region exec-path-from-shell evil-visualstar evil-tutor evil-surround evil-search-highlight-persist evil-numbers evil-nerd-commenter evil-mc evil-matchit evil-lisp-state evil-jumper evil-indent-plus evil-iedit-state evil-exchange evil-escape evil-args evil-anzu espresso-theme eshell-prompt-extras esh-help emacs-eclim elisp-slime-nav dracula-theme django-theme define-word darktooth-theme darkmine-theme darkburn-theme dakrone-theme cython-mode cyberpunk-theme company-statistics company-anaconda colorsarenice-theme color-theme-sanityinc-tomorrow color-theme-sanityinc-solarized clues-theme clean-aindent-mode cider-eval-sexp-fu cider cherry-blossom-theme busybee-theme buffer-move bubbleberry-theme bracketed-paste birds-of-paradise-plus-theme badwolf-theme auto-yasnippet auto-highlight-symbol auto-compile apropospriate-theme anti-zenburn-theme ample-zen-theme ample-theme alect-themes aggressive-indent afternoon-theme adaptive-wrap ace-window ace-link ace-jump-helm-line ac-ispell)))
 '(pos-tip-background-color "#eee8d5")
 '(pos-tip-foreground-color "#586e75")
 '(tabbar-background-color "#353535" t)
 '(term-default-bg-color "#fdf6e3" t)
 '(term-default-fg-color "#657b83" t)
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
