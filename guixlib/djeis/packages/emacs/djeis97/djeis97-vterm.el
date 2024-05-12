;;; djeis97-vterm.el --- Utilities for working with vterm -*- lexical-binding: t; -*-
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
;;  Utilities for working with vterm
;;
;;; Code:


(require 'vterm)
(require 'project)
(require 'project-tab-groups)

(cl-defun djeis97-vterm--guess-proj-root (name)
  (dolist (p project--list)
    (when (equal (project-tab-groups-tab-group-name (car p))
                 name)
      (cl-return-from djeis97-vterm--guess-proj-root (car p)))))

;;;###autoload
(defun djeis97-vterm-open-full-ssh-dwim ()
  )

;;;###autoload
(defun djeis97-vterm-open-simple-ssh-dwim (arg host)
  (interactive "Ps")
  
  )

;;;###autoload
(defun djeis97-vterm-open-new (arg)
  (interactive "P")
  (let* ((tab-group (alist-get 'group (cdr (tab-bar--current-tab))))
         (default-directory (or (when tab-group
                                  (or (when-let ((proj (project-current nil)))
                                        (when (equal tab-group
                                                     (project-tab-groups-tab-group-name
                                                      (project-root proj)))
                                          (project-root proj)))
                                      (djeis97-vterm--guess-proj-root tab-group)))
                                (expand-file-name "~")))
         (buf (generate-new-buffer vterm-buffer-name)))
    (with-current-buffer buf
      (vterm-mode))
    (pop-to-buffer buf)))

;;;###autoload
(defun djeis97-vterm-open-dwim (arg)
  (interactive "P")
  (if (or arg (derived-mode-p 'vterm-mode))
      (djeis97-vterm-open-new arg)
    (let* ((tab-group (alist-get 'group (cdr (tab-bar--current-tab))))
           (bufs (seq-filter (lambda (b)
                               (with-current-buffer b
                                 (and (derived-mode-p 'vterm-mode)
                                      (if-let ((proj (project-current nil)))
                                          (equal tab-group
                                                 (project-tab-groups-tab-group-name
                                                  (project-root proj)))
                                        (not tab-group)))))
                             (buffer-list))))
      (if (not bufs)
          (djeis97-vterm-open-new arg)
        (pop-to-buffer (car bufs))))))


(provide 'djeis97-vterm)
;;; djeis97-vterm.el ends here
