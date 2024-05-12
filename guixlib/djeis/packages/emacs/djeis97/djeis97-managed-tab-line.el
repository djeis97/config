;;; djeis97-managed-tab-line.el ---- Set up my custom tab bar -*- lexical-binding: t; -*-
;;
;; Copyright (C) 2022 Elijah Malaby
;;
;; Author: Elijah Malaby <qwe12345678910@gmail.com>
;; Maintainer: Elijah Malaby <qwe12345678910@gmail.com>
;; Created: October 03, 2022
;; Modified: October 03, 2022
;; Version: 0.0.1
;; Keywords: abbrev bib c calendar comm convenience data docs emulations extensions faces files frames games hardware help hypermedia i18n internal languages lisp local maint mail matching mouse multimedia news outlines processes terminals tex tools unix vc wp
;; Homepage: https://example.com
;; Package-Requires: ((emacs "28.1") (doom-modeline "3.3.1") (exwm "0.26"))
;;
;; This file is not part of GNU Emacs.
;;
;;; Commentary:
;; N/A
;;
;;
;;
;;; Code:


(require 'djeis97-utils)
(require 'project-tab-groups)

;;;###autoload
(defun djeis97-managed-tab-line-face-function (tab tabs face is-buf selected)
  (let ((proj-root (when is-buf
                     (with-current-buffer tab
                       (let ((p (project-current nil)))
                         (when p (project-root p)))))))
    (if (or (not is-buf) (not (or selected proj-root)))
        face
      (append `(:inherit ,face)
              (when selected
                (list :inverse-video t))
              (when proj-root
                (list :box 
                      (list :color (djeis97-utils-color-hash
                                    (project-tab-groups-tab-group-name
                                     proj-root))
                            :line-width (cons 3 -1))))))))

(defun djeis97-managed-tab-line-update-next-prev-buffers (window modes)
  (let* ((old-prev-buffers (window-prev-buffers window))
         (buffers (seq-sort-by #'buffer-name #'string<
                               (seq-filter (lambda (b)
                                             (or (eql b (current-buffer))
                                                 (with-current-buffer b
                                                   (apply #'derived-mode-p modes))))
                                           (buffer-list))))
         (next-bufs (memq (current-buffer) buffers)))
    (set-window-prev-buffers window (mapcar (lambda (b)
                                              (or (assq b old-prev-buffers)
                                                  (with-current-buffer b
                                                    (list b (point-min-marker) (point-marker)))))
                                            (reverse (remove (current-buffer) buffers))))
    (set-window-next-buffers window (cdr next-bufs))))

(defun djeis97-managed-tab-line-configure-for-1 (modes)
  (tab-line-mode 1)
  (add-hook 'window-buffer-change-functions (lambda (w) (djeis97-managed-tab-line-update-next-prev-buffers w modes)) nil t))

;;;###autoload
(defun djeis97-managed-tab-line-configure-for (modes hooks)
  (dolist (h hooks)
    (add-hook h (lambda () (djeis97-managed-tab-line-configure-for-1 modes)))))

;;;###autoload
(defun djeis97-managed-tab-line-switch-buffer ()
  (interactive)
  (let* ((window (selected-window))
         (next-buffers (copy-sequence (window-next-buffers window)))
         (prev-buffers (copy-sequence (window-prev-buffers window)))
         (prev-buffers (if next-buffers
                           prev-buffers
                         (cons (list (current-buffer) (point-min-marker) (point-marker))
                               prev-buffers)))
         (buffers (mapcar (lambda (b)
                            (buffer-name (if (consp b) (car b) b)))
                          prev-buffers))
         (new-buffer (get-buffer (read-buffer "Switch to buffer in tab line: " nil t
                                              (lambda (b)
                                                (let ((name (if (consp b) (car b) b)))
                                                  (member name buffers)))))))
    (set-window-buffer window new-buffer)
    (set-window-prev-buffers window prev-buffers)
    (set-window-next-buffers window (cdr (memq new-buffer
                                               (reverse
                                                (mapcar (lambda (b) (if (consp b) (car b) b))
                                                        prev-buffers)))))
    ))

(provide 'djeis97-managed-tab-line)
;;; djeis97-managed-tab-line.el ends here
