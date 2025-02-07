;;; djeis97-exwm.el --- My exwm configuration -*- lexical-binding: t; -*-
;;
;; Copyright (C) 2022 Elijah Malaby
;;
;; Author: Elijah Malaby <qwe12345678910@gmail.com>
;; Maintainer: Elijah Malaby <qwe12345678910@gmail.com>
;; Created: October 03, 2022
;; Modified: October 03, 2022
;; Version: 0.0.1
;; Keywords: extensions frames local mouse processes tools unix
;; Homepage: https://github.com/djeis97/
;; Package-Requires: ((emacs "28.1"))
;;
;; This file is not part of GNU Emacs.
;;
;;; Commentary:
;;
;;  My exwm configuration
;;
;;; Code:

(require 'exwm)
(require 'exwm-randr)
(require 'exwm-systemtray)
(require 'exwm-xim)
(require 'cl-lib)
(require 'doom-modeline)
;; (require 'exwm-edit)
(require 'emprise)
(require 'marginalia)
(require 'djeis97-utils)
(require 'comint)

(defun exwm//flatenum (i ls)
  (if ls (cons i (cons (car ls) (exwm//flatenum  (1+ i) (cdr ls)))) (list)))

(defun djeis97/exwm-update-randr ()
  (let* ((exwm-randr-stuff (if exwm-randr--compatibility-mode
                               (exwm-randr--get-outputs)
                             (exwm-randr--get-monitors)))
         (primary-monitor (elt exwm-randr-stuff 0))
         (outputs (mapcar #'car (elt exwm-randr-stuff 1)))
         (exwm--randr-displays (cons primary-monitor (remove primary-monitor outputs))))
    (setq exwm-workspace-number (length exwm--randr-displays))
    (setq exwm-randr-workspace-monitor-plist (exwm//flatenum 0 exwm--randr-displays))))

(defun djeis97-exwm/runner (pname pbuffer command)
  (let ((proc (start-process-shell-command pname pbuffer command)))
    (when pbuffer
      (with-current-buffer (process-buffer proc)
        (comint-mode)))))

(setq mouse-autoselect-window t
      focus-follows-mouse t)
;; disable dialog boxes since they are unusable in exwm
(setq use-dialog-box nil)

(exwm-input-set-key (kbd "s-l") (lambda () (interactive) (djeis97-utils-app-launcher "loginctl lock-session")))
(exwm-input-set-key (kbd "s-r") 'exwm-reset)
;; + Bind a key to switch workspace interactively
(exwm-input-set-key (kbd "s-w") 'exwm-workspace-switch)
;; + Set shortcuts to switch to a certain workspace.
(exwm-input-set-key (kbd "s-1") (lambda () (interactive) (exwm-workspace-switch 0)))
(exwm-input-set-key (kbd "s-2") (lambda () (interactive) (exwm-workspace-switch 1)))
(exwm-input-set-key (kbd "s-3") (lambda () (interactive) (exwm-workspace-switch 2)))
(exwm-input-set-key (kbd "s-4") (lambda () (interactive) (exwm-workspace-switch 3)))
(exwm-input-set-key (kbd "s-5") (lambda () (interactive) (exwm-workspace-switch 4)))
(exwm-input-set-key (kbd "s-6") (lambda () (interactive) (exwm-workspace-switch 5)))
(exwm-input-set-key (kbd "s-7") (lambda () (interactive) (exwm-workspace-switch 6)))
(exwm-input-set-key (kbd "s-8") (lambda () (interactive) (exwm-workspace-switch 7)))
(exwm-input-set-key (kbd "s-9") (lambda () (interactive) (exwm-workspace-switch 8)))
(exwm-input-set-key (kbd "s-0") (lambda () (interactive) (exwm-workspace-switch 9)))

(exwm-input-set-key (kbd "s-SPC") #'djeis97-utils-app-launcher)

(push ?\C-q exwm-input-prefix-keys)
(define-key exwm-mode-map [?\C-q] 'exwm-input-send-next-key)

(add-hook 'exwm-init-hook #'exwm-workspace-attach-minibuffer)

(add-hook 'exwm-init-hook #'djeis97/exwm-update-randr)
(add-hook 'exwm-randr-refresh-hook #'djeis97/exwm-update-randr)
(exwm-randr-mode +1)

(exwm-systemtray-mode +1)

(push ?\C-\\ exwm-input-prefix-keys)
(setenv "GTK_IM_MODULE" "xim")
(setenv "QT_IM_MODULE" "xim")
(setenv "CLUTTER_IM_MODULE" "xim")
(setenv "XMODIFIERS" "@im=exwm-xim")
(exwm-xim-mode +1)

(defsubst djeis97/doom-modeline--exwm-title ()
  "The current buffer name."
  ;; Only display the buffer name if the window is small, but doesn't need to
  ;; respect file-name style.
  (propertize exwm-title
              'face (cond ((doom-modeline--active) 'doom-modeline-buffer-file)
                          (t 'mode-line-inactive))
              'mouse-face 'mode-line-highlight
              'help-echo "Buffer name
mouse-1: Previous buffer\nmouse-3: Next buffer"
              'local-map mode-line-buffer-identification-keymap))

(doom-modeline-def-segment djeis97-exwm-title
  "Combined information about the current buffer, including the current working
directory, the file name, and its state (modified, read-only or non-existent)."
  (djeis97/doom-modeline--exwm-title))

(doom-modeline-def-modeline 'djeis97-exwm
  '(bar workspace-name window-number modals djeis97-exwm-title)
  '(objed-state misc-info persp-name battery grip irc mu4e gnus github lsp minor-modes input-method major-mode process vcs))

(defun djeis97/doom-modeline-set-exwm-modeline ()
  "Set exwm mode-line."
  (doom-modeline-set-modeline 'djeis97-exwm))

(add-hook 'exwm-update-class-hook (lambda () (interactive) (exwm-workspace-rename-buffer exwm-class-name)))
(add-hook 'exwm-update-title-hook (lambda () (interactive) (exwm-workspace-rename-buffer exwm-title)))
(add-hook 'exwm-mode-hook 'djeis97/doom-modeline-set-exwm-modeline)

(add-to-list 'exwm-manage-configurations
             '((string= "Uzbl-core" exwm-class-name)
               tiling-header-line (:eval (tabbar-line))
               tiling-mode-line nil))
(add-to-list 'exwm-manage-configurations
             '((string= exwm-instance-name "pinentry-gtk-2")
               char-mode t))
(add-to-list 'exwm-manage-configurations
             '((string= exwm-instance-name "pinentry")
               char-mode t))

;(cl-pushnew exwm-input-prefix-keys 'XF86AudioPlay)
;(exwm-input-set-key
; (kbd "<XF86AudioPlay>")
; (lambda (p)
;   (interactive "P")
;   (emprise-play-pause-players
;    (if p
;        (emprise--select-players)
;      (list (make-emprise-service "org.mpris.MediaPlayer2.playerctld"))))))

(add-hook 'exwm-init-hook
          (lambda ()
            (interactive)
            (exwm-workspace--modify-all-x-frames-parameters
             '((internal-border-width . 10)))
            (cl-loop for f in (frame-list) do
                     (if (not (eql (frame-parameter f 'minibuffer) 'only))
                         (set-frame-parameter f 'internal-border-width 10)))))

(defun djeis97/marginalia-annotate-bufler-buffer+exwm (cand)
  (let ((cand (replace-regexp-in-string ".* » " "" cand)))
    (when-let (buffer (get-buffer cand))
      (with-current-buffer buffer
        (if (derived-mode-p 'exwm-mode)
            (format " (%s)" exwm-title)
          (marginalia-annotate-buffer cand))))))

(with-eval-after-load 'marginalia
  (push '(bufler-buffer djeis97/marginalia-annotate-bufler-buffer+exwm builtin none) marginalia-annotator-registry))

(setq-default exwm-workspace-minibuffer-position 'bottom)

(provide 'djeis97-exwm)
;;; djeis97-exwm.el ends here
