(define-module (djeis emacs-config)
  #:use-module (gnu packages)
  #:use-module (srfi srfi-1)
  #:use-module (djeis services emacs-config)
  #:use-module (djeis packages emacs)
  #:use-module ((gnu packages coq) #:select (proof-general))
  #:use-module ((gnu packages tree-sitter) #:select (tree-sitter-json tree-sitter-dockerfile tree-sitter-rust)))

(define-public emacs-basics
  (emacs-config-service emacs-basics
    (prologue
      (defvar djeis-side-window-modes '(vterm-mode vterm-copy-mode))
      (defvar djeis-side-window-regexp "^\\*vterm")
      (setq-default user-full-name "Elijah Malaby"
                    user-mail-address "qwe12345678910@gmail.com"
                    ediff-window-setup-function 'ediff-setup-windows-plain
                    mouse-wheel-scroll-amount '(3)
                    mouse-wheel-progressive-speed nil
                    mouse-wheel-follow-mouse t
                    mouse-autoselect-window t
                    focus-follows-mouse t
                    scroll-step 1
                    windmove-allow-all-windows t
                    vc-follow-symlinks t
                    enable-recursive-minibuffers t
                    fill-column 120
                    indent-tabs-mode nil
                    tab-width 4
                    tramp-use-ssh-controlmaster-options nil
                    tramp-shell-prompt-pattern "\\(?:\\(?:^\\|\\)[^]\n#-%>]*#?[]#-%>].*\\)"
                    tramp-verbose 0
                    window-divider-default-right-width 10
                    window-divider-default-bottom-width 10
                    window-divider-default-places t
                    use-package-always-defer t
                    auth-sources '(password-store)
                    display-buffer-alist '(
                                           ;; ((lambda (buf act)
                                           ;;    (when (active-minibuffer-window)
                                           ;;      (select-window (minibuffer-selected-window) nil))))
                                           ("^\\*Local" display-buffer-in-side-window)
                                           ("^ ?\\*Dirvish")
                                           ((lambda
                                                (buf act)
                                              (tab-bar-get-buffer-tab buf 0 nil))
                                            display-buffer-in-tab
                                            (reusable-frames . 0))
                                           ((lambda (buf act) (or (string-match djeis-side-window-regexp buf)
                                                                  (with-current-buffer buf (apply 'derived-mode-p djeis-side-window-modes))))
                                            (djeis97-utils-display-buffer-maybe-switch-to-project-tab
                                             djeis97-utils-display-buffer-same-mode-same-window
                                             display-buffer-in-side-window)
                                            (side . bottom))
                                           (".*"  (djeis97-utils-display-buffer-maybe-switch-to-project-tab
                                                   djeis97-utils-display-buffer-same-mode-same-window
                                                   display-buffer-reuse-mode-window)))
                    switch-to-buffer-obey-display-actions nil
                    dired-dwim-target t
                    dired-listing-switches "-Agoth --group-directories-first"
                    eldoc-echo-area-use-multiline-p 5
                    eldoc-idle-delay 1
                    enable-local-variables :safe
                    safe-local-variable-directories '("/home/jay/IRISProjects/monorepo/docs/")
                    project-find-functions (list (lambda (dir)
                                                   (when (bound-and-true-p eglot-lsp-context)
                                                     (let ((f (locate-dominating-file dir ".lsp")))
                                                       (when f
                                                         (cons 'transient f)))))
                                                 'project-try-vc)
                    eglot-connect-timeout 120
                    auto-save-file-name-transforms (list (list ".*" "~/.cache/emacs/auto-saves/" t))
                    warning-suppress-types '((comp)))
      (with-eval-after-load 'tramp
                            (add-to-list 'tramp-remote-path 'tramp-own-remote-path))
      (push '(progn
              (setq-local
               org-roam-directory (expand-file-name (locate-dominating-file
                                                     default-directory ".dir-locals.el")))
              (setq-local
               org-roam-db-location (expand-file-name "org-roam.db"
                                                      org-roam-directory)))
            safe-local-eval-forms)
      (add-hook 'after-init-hook 
                (lambda ()
                  (server-start)
                  (which-key-mode)
                  (winner-mode)
                  (tab-bar-mode)
                  (tab-bar-history-mode 1)
                  (window-divider-mode 1)
                  (menu-bar-mode -1)
                  (tool-bar-mode -1)
                  (scroll-bar-mode -1)
                  (tooltip-mode +1)))
      (add-hook 'find-file-hook 'djeis97-utils-auto-save-tweaks 90))
    (prologue (setq-default treesit-extra-load-path '(#$emacs-ts-modules)))
    (use-package browse-at-remote
      :custom (browse-at-remote-prefer-symbolic nil))
    (use-package djeis97
      :demand t)
    (use-package app-launcher
      :general (djeis-leader "a a" 'app-launcher-run-app))
    (use-package avy
      :general (:states '(normal motion)
                "M-g c" 'avy-goto-char-timer
                "M-g C" 'goto-char
                "M-g g" 'avy-goto-line
                "M-g G" 'goto-line))
    (use-package bluetooth)
    (use-package consult
      :custom (xref-show-xrefs-function 'consult-xref)
      :general
      (djeis-leader
       "b b" 'consult-buffer
       "s d" 'consult-ripgrep
       "p b" 'consult-project-buffer)
      ("M-g l" 'consult-line
       "M-g i" 'consult-imenu))
    (use-package corfu :hook (after-init . global-corfu-mode))
    (use-package dirvish)
    (use-package dired-hacks
       :init
       (use-package dired-filter
          :after dired
          :demand t)
       (use-package dired-subtree
          :after dired
          :demand t)
       (use-package dired-collapse
          :demand t
          :hook (dired-mode . dired-collapse-mode))
       (use-package dired-rainbow
         :demand t
         :config
         (dired-rainbow-define-chmod directory "#6cb2eb" "d.*")
         (dired-rainbow-define html "#eb5286" ("css" "less" "sass" "scss" "htm" "html" "jhtm" "mht" "eml" "mustache" "xhtml"))
         (dired-rainbow-define xml "#f2d024" ("xml" "xsd" "xsl" "xslt" "wsdl" "bib" "json" "msg" "pgn" "rss" "yaml" "yml" "rdata"))
         (dired-rainbow-define document "#9561e2" ("docm" "doc" "docx" "odb" "odt" "pdb" "pdf" "ps" "rtf" "djvu" "epub" "odp" "ppt" "pptx"))
         (dired-rainbow-define markdown "#ffed4a" ("org" "etx" "info" "markdown" "md" "mkd" "nfo" "pod" "rst" "tex" "textfile" "txt"))
         (dired-rainbow-define database "#6574cd" ("xlsx" "xls" "csv" "accdb" "db" "mdb" "sqlite" "nc"))
         (dired-rainbow-define media "#de751f" ("mp3" "mp4" "MP3" "MP4" "avi" "mpeg" "mpg" "flv" "ogg" "mov" "mid" "midi" "wav" "aiff" "flac"))
         (dired-rainbow-define image "#f66d9b" ("tiff" "tif" "cdr" "gif" "ico" "jpeg" "jpg" "png" "psd" "eps" "svg"))
         (dired-rainbow-define log "#c17d11" ("log"))
         (dired-rainbow-define shell "#f6993f" ("awk" "bash" "bat" "sed" "sh" "zsh" "vim"))
         (dired-rainbow-define interpreted "#38c172" ("py" "ipynb" "rb" "pl" "t" "msql" "mysql" "pgsql" "sql" "r" "clj" "cljs" "scala" "js"))
         (dired-rainbow-define compiled "#4dc0b5" ("asm" "cl" "lisp" "el" "c" "h" "c++" "h++" "hpp" "hxx" "m" "cc" "cs" "cp" "cpp" "go" "f" "for" "ftn" "f90" "f95" "f03" "f08" "s" "rs" "hi" "hs" "pyc" ".java"))
         (dired-rainbow-define executable "#8cc4ff" ("exe" "msi"))
         (dired-rainbow-define compressed "#51d88a" ("7z" "zip" "bz2" "tgz" "txz" "gz" "xz" "z" "Z" "jar" "war" "ear" "rar" "sar" "xpi" "apk" "xz" "tar"))
         (dired-rainbow-define packaged "#faad63" ("deb" "rpm" "apk" "jad" "jar" "cab" "pak" "pk3" "vdf" "vpk" "bsp"))
         (dired-rainbow-define encrypted "#ffed4a" ("gpg" "pgp" "asc" "bfe" "enc" "signature" "sig" "p12" "pem"))
         (dired-rainbow-define fonts "#6cb2eb" ("afm" "fon" "fnt" "pfb" "pfm" "ttf" "otf"))
         (dired-rainbow-define partition "#e3342f" ("dmg" "iso" "bin" "nrg" "qcow" "toast" "vcd" "vmdk" "bak"))
         (dired-rainbow-define vc "#0074d9" ("git" "gitignore" "gitattributes" "gitmodules"))
         (dired-rainbow-define-chmod executable-unix "#38c172" "-.*x.*")))
    (use-package dired-sidebar
       :commands (dired-sidebar-toggle-sidebar)
       :init
       (add-hook 'dired-sidebar-mode-hook
                 (lambda ()
                   (unless (file-remote-p default-directory)
                     (auto-revert-mode +1))))
       :config
       (push 'toggle-window-split dired-sidebar-toggle-hidden-commands)
       (push 'rotate-windows dired-sidebar-toggle-hidden-commands)
       (setq dired-sidebar-theme 'icons)
       (setq dired-sidebar-use-term-integration t)
       (setq dired-sidebar-use-custom-font t))
    (use-package embark
      :init
      (use-package embark-consult
        :after (:and embark consult)
        :demand t)
      (use-package djeis97-embark-which-key
        :after (:and embark which-key)
        :demand t
        :config
        (setq embark-indicators
              '(djeis97-embark-which-key-indicator
                embark-highlight-indicator
                embark-isearch-highlight-indicator))
        (advice-add 'embark-completing-read-prompter
                    :around 'djeis97-embark-which-key-hide-indicator))
      :general
      ("C-;" 'embark-act)
      :config
      (defun djeis97/linux-app-run-on-file (cand file)
        (interactive "sCand:\nf")
        (when-let* ((exec (cdr (assq 'exec (gethash cand app-launcher--cache)))))
                   (message "%s %s" exec file)))
      (defvar-keymap djeis97/embark-linux-app-keymap :parent embark-general-map "f" 'djeis97/linux-app-run-on-file)
      (add-to-list 'embark-keymap-alist '(linux-app . djeis97/embark-linux-app-keymap)))
    (use-package envrc
      :defer 2
      :config
      (envrc-global-mode 1)
      (with-eval-after-load 'org (advice-add 'org-babel-execute-src-block :around 'envrc-propagate-environment)))
    (use-package guix)
    (use-package helpful
      :general (djeis-leader
                "h f" 'helpful-callable
                "h k" 'helpful-key
                "h v" 'helpful-variable))
    (use-package ibuffer-sidebar
      :commands (ibuffer-sidebar-toggle-sidebar))
    (use-package justl)
    ;; (use-package kele)
    (use-package kubed)
    (use-package kubel)
    (use-package marginalia
      :init (marginalia-mode)
      :config
      (add-to-list 'marginalia-prompt-categories '("\\<Run app\\>" . linux-app)))
    ;; (use-package mastodon
    ;;   :custom
    ;;   (mastodon-instance-url "https://parens.social")
    ;;   (mastodon-active-user "djeis"))
    (use-package open-junk-file
      :custom
      (open-junk-file-format "~/Dropbox/junk/%Y/%m/%d-%H%M%S.")
      :general
      (djeis-leader "f J" 'open-junk-file))
    (use-package orderless
      :custom (completion-styles '(orderless basic)))
    (use-package password-store
      :general (djeis-leader "a p i" 'password-store-copy))
    (use-package pdf-tools
      :mode ("\\.pdf\\'" . pdf-view-mode))
    (use-package simple-httpd)
    (use-package speedbar
      (package 'builtin)
      :general
      (:keymaps 'speedbar-mode-map
       :states 'normal
       "q" 'dframe-close-frame)
      ("s-`" (lambda ()
               (interactive)
               (if speedbar-frame
                   (speedbar-get-focus)
                   (speedbar))))
      :hook (speedbar-visiting-file . speedbar)
      :config
      (add-to-list 'speedbar-frame-parameters '(tab-bar-lines . 0)))
    (use-package vertico
      :defer 2
      :custom (vertico-resize t) (vertico-cycle t)
      :general (vertico-map
                "C-j" 'vertico-next
                "C-k" 'vertico-previous
                "DEL" 'vertico-directory-delete-char)
      :config
      (vertico-mode 1)
      (add-hook 'rfn-eshadow-update-overlay-hook 'vertico-directory-tidy))
    (use-package vterm
      :general (djeis-leader
                "o t" 'djeis97-vterm-open-dwim
                "o T" 'vterm
                "t o" 'djeis97-vterm-open-dwim
                "t r" 'djeis97-utils-vterm-ssh-rename)
      :config (djeis97-managed-tab-line-configure-for
               '(vterm-mode vterm-copy-mode)
               '(vterm-mode-hook vterm-copy-mode-hook)))
    (use-package wgrep)))

(define-public emacs-appearance
  (emacs-config-service emacs-appearance
    (use-package all-the-icons)
    (use-package all-the-icons-dired
      :hook (dired-mode . all-the-icons-dired-mode))
    (use-package project-tab-groups
      :after djeis97
      :demand t
      :config (project-tab-groups-mode 1))
    (use-package exwm
      :custom (x-no-window-manager t))
    (use-package doom-themes
      :demand t
      :config
      (setcdr (assoc 'gnus-group-news-low-empty doom-themes-base-faces)
              '(:inherit 'gnus-group-mail-1-empty :weight 'normal))
      (setcdr (assoc 'gnus-group-news-low doom-themes-base-faces)
              '(:inherit 'gnus-group-mail-1-empty :weight 'normal))
      (load-theme 'doom-acario-dark t))
    (use-package doom-modeline
      :defer 2
      :config (doom-modeline-mode 1))))

(define-public emacs-lang-config
  (emacs-config-service emacs-lang-config
    (use-package magit
      :defer 2)
    (use-package smartparens
      :hook (prog-mode . smartparens-strict-mode)
      :general (smartparens-strict-mode-map
                ;; This is to override the similar remapping in insert state baked in to
                ;; evil-mode, which otherwise itself overrides the corresponding (state-less)
                ;; remapping already baked in to smartparens.
                :states 'insert
                "<remap> <delete-backward-char>" 'sp-backward-delete-char)
      :config (require 'smartparens-config))
    (use-package aggressive-indent
      :ghook 'prog-mode-hook)
    (use-package rainbow-delimiters
      :ghook 'smartparens-mode-hook)
    (use-package evil-surround
      :hook (evil-mode . global-evil-surround-mode))
    (use-package evil-cleverparens
      :ghook djeis97-lisp-mode-hooks
      :custom (evil-cleverparens-use-regular-insert nil)
      :general (evil-cleverparens-mode-map
                :states 'normal
                "i" 'evil-insert
                "a" 'evil-append))
    (use-package org
      :mode ("\\.org\\'" . org-mode)
      :gfhook 'org-indent-mode
      :custom
      (org-directory "~/Dropbox/org/")
      (org-src-preserve-indentation t)
      (org-startup-folded 'showall))
    (use-package org-contrib)
    ;; (use-package ob-async ; Tis busted on called code blocks.
    ;;   :after org
    ;;   :demand t)
    (use-package org-roam
      :custom
      (org-roam-directory "~/Dropbox/org/roam/")
      (org-roam-node-display-template "${title:80} (${file:10} > ${file-title:20} > ${olp:30}) [${tags}]")
      (org-roam-capture-templates
       '(("d" "default" plain "%?"
          :target
          (file+head "%<%Y%m%d%H%M%S>-${slug}.org" "#+title: ${title}\n")
          :unnarrowed t)
         ("s" "clojure scratchspace" entry "* Scratchspace
:PROPERTIES:
:header-args+: :eval never-export :exports both
:header-args:clojure+: :ns user.%<%Y%m%d>-${slug} :backend cider
:END:
** Setup
#+begin_src clojure
(ns user.%<%Y%m%d>-${slug}
  (:require [dev]))
#+end_src

#+begin_src clojure
(dev/defenv environment :staging)
#+end_src

%?
"
          :target (file+head "scratch/%<%Y%m%d%H%M%S>-${slug}.org" "#+title: ${title}\n")
          :unnarrowed t)))
      :general
      (djeis-leader
       "n r f" 'org-roam-node-find
       "n r i" 'org-roam-node-insert
       "n r d d" 'org-roam-dailies-capture-today
       "n r d t" 'org-roam-dailies-goto-today)
      :config (org-roam-db-autosync-mode +1))
    (use-package cider
      :custom
      (cider-repl-history-file "~/.cache/emacs/cider-repl-history")
      (nrepl-use-ssh-fallback-for-remote-hosts t)
      :ghook 'clojure-mode-hook)
    (use-package clj-refactor
      :ghook 'clojure-mode-hook)
    (use-package jarchive
      :defer 2
      :config (jarchive-mode +1))
    (use-package sly)
    (use-package proof-general
      (package proof-general))
    (use-package eglot
      :config
      (add-to-list 'eglot-server-programs '((rust-ts-mode rust-mod) "rust-analyzer" :initializationOptions (:checkOnSave t))))
    (use-package agda2-mode)
    (use-package restclient)
    (use-package ob-restclient)
    (use-package yaml-mode)
    (use-package just-mode)
    (use-package bqn-mode)
    (use-package ess)
    (use-package nix-mode)
    (use-package rust-ts-mode
       (package tree-sitter-rust)
       :mode ("\\.rs\\'" . rust-ts-mode))
    (use-package dockerfile-ts-mode
      (package tree-sitter-dockerfile)
      :mode ("[/\\]\\(?:Containerfile\\|Dockerfile\\)\\(?:\\.[^/\\]*\\)?\\'"
             . dockerfile-ts-mode)
      :config (with-eval-after-load 'org
                (add-to-list 'org-src-lang-modes (cons "dockerfile" 'dockerfile-ts))))
    (use-package json-ts-mode
      (package tree-sitter-json)
      :mode ("\\.json\\'" . json-ts-mode)
      :config (with-eval-after-load 'org
                (add-to-list 'org-src-lang-modes (cons "json" 'json-ts))))
    (use-package typst-ts-mode
      :mode ("\\.typ\\'" . typst-ts-mode))))

(define-public emacs-keys
  (emacs-config-service emacs-keys
    (prologue
      (general-create-definer djeis-leader
                              :states '(normal motion visual insert emacs)
                              :prefix "SPC"
                              :global-prefix "<f20>"
                              :prefix-command 'djeis-menu-command
                              :prefix-map 'djeis-menu-map)

      (general-create-definer djeis-local-leader
                              :states '(normal motion visual insert emacs)
                              :prefix ","
                              :global-prefix "M-<f20>")
      (with-eval-after-load 'exwm (exwm-input-set-key (kbd "<f20>") 'djeis-menu-command)))
    (use-package undo-tree)
    (use-package evil
      :defer 2
      :init
      (setq evil-want-integration t)
      (setq evil-want-keybinding nil)
      (setq evil-want-C-d-scroll t)
      (setq evil-want-C-u-scroll t)
      (setq shift-select-mode nil)
      (setq evil-want-abbrev-expand-on-insert-exit nil)
      :config (evil-mode 1))
    (use-package evil-collection
      :hook (evil-mode . evil-collection-init))
    (use-package evil-escape
      :ghook 'evil-mode-hook
      :general (:states '(insert operator replace visual) "C-g" 'evil-escape))
    (use-package evil-goggles
      :ghook 'evil-mode-hook
      :config (evil-goggles-use-diff-faces))
    (use-package evil-commentary
      :ghook 'evil-mode-hook)
    (epilogue
      (general-def
       universal-argument-map
       "SPC u" 'universal-argument-more
       "<f20> u" 'universal-argument-more)
      (djeis-leader
       "<f20>" 'execute-extended-command
       "SPC" 'djeis97-utils-app-launcher
       "u"   'universal-argument
       "a c" 'calc-dispatch
       "b [" 'previous-buffer
       "b ]" 'next-buffer
       "b b" 'switch-to-buffer
       "b B" 'djeis97-utils-raw-switch-to-buffer
       "b l" 'djeis97-managed-tab-line-switch-buffer
       "b s" 'save-buffer
       "b d" 'kill-buffer
       "b R" 'revert-buffer
       "f f" 'find-file
       "f s" 'save-buffer
       "f d" 'dired-sidebar-toggle-sidebar
       "h ." 'display-local-help
       "p" (or (lookup-key djeis-menu-map (kbd "p"))
               (make-composed-keymap nil project-prefix-map))
       "p t" 'project-other-tab-command
       "w" (or (lookup-key djeis-menu-map (kbd "w"))
               (make-composed-keymap nil 'evil-window-map))
       "w -" 'split-window-below
       "w /" 'split-window-right
       "w c" 'tab-bar-new-tab
       "w u" 'tab-bar-history-back
       "w r" 'tab-bar-history-forward
       "w d" 'delete-window
       "w m" 'delete-other-windows
                                        ;             "w t" (or (lookup-key djeis-menu-map (kbd "w t"))
                                        ;                       (make-composed-keymap nil tab-prefix-map))
                                        ;             "w t d" 'tab-close
       "q q" 'save-buffers-kill-emacs)
      ;; Keep the generated stuff separate, so that I can re-eval the static stuff more easily...
      (djeis-leader
       #$@(append-map (lambda (i)
                        `(,(string-append "w " (number->string i))
                          (lambda () (interactive) (tab-bar-select-tab ,i))))
                      (iota 10))))))
