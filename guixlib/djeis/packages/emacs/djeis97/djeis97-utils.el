;;; djeis97-utils.el --- Utilities in my emacs config -*- lexical-binding: t; -*-
;;
;; Copyright (C) 2022 Elijah Malaby
;;
;; Author: Elijah Malaby <qwe12345678910@gmail.com>
;; Maintainer: Elijah Malaby <qwe12345678910@gmail.com>
;; Created: October 03, 2022
;; Modified: October 03, 2022
;; Version: 0.0.1
;; Keywords: local
;; Homepage: https://github.com/djeis97
;; Package-Requires: ((emacs "24.3"))
;;
;; This file is not part of GNU Emacs.
;;
;;; Commentary:
;;
;;  Utilities in my Emacs config
;;
;;; Code:

(require 'color)
(require 'vc)

(defvar djeis97-utils-launcher--prompt "$ ")

;;;###autoload
(defun djeis97-utils-app-launcher (command)
  "Launches an application in your PATH.
Can show completions at point for COMMAND using helm or ido"
  (interactive (list (read-shell-command djeis97-utils-launcher--prompt)))
  (start-process-shell-command command nil command))

;; (defun thready-process-lines (program &rest args)
;;   (make-thread
;;    (lambda ()
;;      (with-temp-buffer
;;        (let ((proc (make-process :name program
;;                                  :buffer (current-buffer)
;;                                  :command (cons program args)
;;                                  :sentinel #'ignore
;;                                  :connection-type 'pipe)))
;;          (while (accept-process-output proc))
;;          (unless (eq (process-exit-status proc) 0)
;;            (error "%s exited with status %s" program (process-exit-status proc)))
;;          (goto-char (point-min))
;;          (let (lines)
;;            (while (not (eobp))
;;              (setq lines (cons (buffer-substring-no-properties
;;                                 (line-beginning-position)
;;                                 (line-end-position))
;;                                lines))
;;              (forward-line 1))
;;            (nreverse lines)))))))

;; )(defun thread-then (thread cb)
;;   (make-thread (lambda () (funcall cb (thread-join thread)))))

;; ;;;###autoload
;; (defun djeis97-load-guix-emacs-package (name)
;;   (interactive "s")
;;   (let ((lines 

(defun djeis97-utils-reset-load-path ()
  "Essentially, ripped straight from the emacs source for
normal-top-level... Maybe needed to be updated some day?"
  (interactive)
  (setf load-path (mapcar #'expand-file-name
                          (list "~/.guix-home/profile/share/emacs/site-lisp/"
                                (format "~/.guix-home/profile/share/emacs/%s/lisp/" emacs-version))))
  (let ((tail load-path)
        (lispdir (expand-file-name "../lisp" data-directory))
        dir)
    (while tail
      (setq dir (car tail))
      (let ((default-directory dir))
        (load (expand-file-name "subdirs.el") t t t))
      ;; Do not scan standard directories that won't contain a leim-list.el.
      ;; https://lists.gnu.org/r/emacs-devel/2009-10/msg00502.html
      ;; (Except the preloaded one in lisp/leim.)
      (or (string-prefix-p lispdir dir)
          (let ((default-directory dir))
            (load (expand-file-name "leim-list.el") t t t)))
      ;; We don't use a dolist loop and we put this "setq-cdr" command at
      ;; the end, because the subdirs.el files may add elements to the end
      ;; of load-path and we want to take it into account.
      (setq tail (cdr tail)))))


(defvar djeis97-utils-color-hash-sats '(0.6 0.8 1.0))
(defvar djeis97-utils-color-hash-lights '(0.2 0.5 0.8))

(defvar djeis97-utils-color-prime 1299499)

(defvar djeis97-utils-color-prime
  (* 23 941158108593117403649629736845187897472405878976857154368432566259108446499) ;; Note sha256
  ;; 1299499
  )

(defun djeis97-utils-color-hash-hsl (obj)
  (let ((hash (cl-parse-integer (secure-hash 'sha256 obj) :radix 16)))
    (list
     (/ (mod hash djeis97-utils-color-prime) (float djeis97-utils-color-prime))
     (nth (mod (floor hash djeis97-utils-color-prime)
               (length djeis97-utils-color-hash-sats))
          djeis97-utils-color-hash-sats)
     (nth (mod (floor hash (* djeis97-utils-color-prime (length djeis97-utils-color-hash-sats)))
               (length djeis97-utils-color-hash-lights))
          djeis97-utils-color-hash-lights))))

;;;###autoload
(defun djeis97-utils-color-hash (obj)
  (apply 'color-rgb-to-hex
         (apply 'color-hsl-to-rgb
                (djeis97-utils-color-hash-hsl obj))))

;;;###autoload
(defun djeis97-utils-raw-switch-to-buffer (buffer)
  (interactive "b")
  (set-window-buffer nil buffer))

;;;###autoload
(defun djeis97-utils-display-buffer-maybe-switch-to-project-tab (buffer alist)
  (let ((proj (with-current-buffer buffer (project-current nil))))
    (when proj
      (project-tab-groups--select-or-create-tab-group
       (funcall project-tab-groups-tab-group-name-function
                (with-current-buffer buffer
                  (project-root proj))))))
  nil)

;;;###autoload
(defun djeis97-utils-display-buffer-same-mode-same-window (buffer alist)
  (let* ((alist-mode-entry (assq 'mode alist))
         (buffer-mode (with-current-buffer buffer major-mode))
         (modes (if alist-mode-entry
                    (cdr alist-mode-entry)
                  (list buffer-mode))))
    (unless (cdr (assq 'inhibit-same-window alist))
      (with-current-buffer (window-buffer (selected-window))
        (when (apply #'derived-mode-p modes)
          (window--display-buffer buffer (selected-window) 'reuse alist))))))

;;;###autoload
(defun djeis97-utils-vterm-ssh-rename (hostname)
  (interactive "s")
  (rename-buffer (concat "*vterm-" hostname "*")))

;;;###autoload
(defun djeis97-utils-auto-save-tweaks ()
  (if (and buffer-file-name (vc-registered buffer-file-name))
      (progn
        (auto-save-mode 0)
        (auto-save-visited-mode 1))
    (progn
      (auto-save-mode 1)
      (auto-save-visited-mode 0))))

(provide 'djeis97-utils)
;;; djeis97-utils.el ends here
