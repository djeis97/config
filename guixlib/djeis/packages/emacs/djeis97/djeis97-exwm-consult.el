;;; djeis97-exwm-consult.el --- My integration between exwm and consult -*- lexical-binding: t; -*-
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
;;  My integration between exwm and consult
;;
;;; Code:

(require 'exwm)
(require 'consult)
(require 'posframe)

(defun djeis97-exwm-consult--cleanup-posframe (the-posframe)
  (when-let ((buf (cdr (frame-parameter the-posframe 'posframe-buffer))))
    (with-current-buffer buf
      (setq posframe--frame nil)))
  (let ((delete-frame-functions nil))
    (delete-frame the-posframe t)))

(defun djeis97-exwm-consult--show-preview-posframe (buffer)
  (posframe-show buffer
                 :parent exwm-workspace--current
                 :refposhandler 'posframe-refposhandler-xwininfo
                 :poshandler 'posframe-poshandler-frame-center
                 :border-width 4
                 :border-color "#ffffff"
                 :respect-mode-line t
                 :respect-header-line t
                 :cursor t))

;;;###autoload
(defun djeis97-exwm-consult--buffer-preview ()
  (let ((the-posframe nil))
    (lambda (action cand)
      (when the-posframe
        (djeis97-exwm-consult--cleanup-posframe the-posframe)
        (setq the-posframe nil))
      (when (and (eq action 'preview) cand (get-buffer cand))
        (setq the-posframe (djeis97-exwm-consult--show-preview-posframe cand))
        (when-let ((mini (active-minibuffer-window)))
          (select-window mini))
        ;; (select-window (frame-first-window the-posframe))
        ))))

;;;###autoload
(defun djeis97-exwm-consult--jump-preview (orig-fun &rest args)
  (let ((the-posframe nil)
        (shown-buffer nil)
        (orig-state (apply orig-fun args)))
    (lambda (action cand)
      (let ((cand (if (listp cand) (cl-first cand) cand)))
        (when (and shown-buffer (or (eq action 'exit)
                                    (and (markerp cand)
                                         (not (equal (marker-buffer cand) shown-buffer)))))
          (djeis97-exwm-consult--cleanup-posframe the-posframe)
          (setq the-posframe nil)
          (setq shown-buffer nil))
        (when (and (eq action 'preview) (markerp cand) (marker-buffer cand) (not the-posframe))
          (setq the-posframe (djeis97-exwm-consult--show-preview-posframe (marker-buffer cand)))
          (setq shown-buffer (marker-buffer cand)))
        (when the-posframe
          (select-window (frame-first-window the-posframe)))
        (funcall orig-state action cand)
        (when-let ((mini (active-minibuffer-window)))
          (select-window mini))))))



;;;###autoload
(defun djeis97-exwm-consult-setup ()
  (advice-add 'consult--buffer-preview :override 'djeis97-exwm-consult--buffer-preview)
  (advice-add 'consult--jump-preview :around 'djeis97-exwm-consult--jump-preview))

(provide 'djeis97-exwm-consult)
;;; djeis97-exwm-consult.el ends here
