;;; djeis97-lisp.el --- My lisp bindings and such -*- lexical-binding: t; -*-
;;
;; Copyright (C) 2022 Elijah Malaby
;;
;; Author: Elijah Malaby <qwe12345678910@gmail.com>
;; Maintainer: Elijah Malaby <qwe12345678910@gmail.com>
;; Created: October 03, 2022
;; Modified: October 03, 2022
;; Version: 0.0.1
;; Keywords: local
;; Homepage: https://github.com/jay/djeis97-utils
;; Package-Requires: ((emacs "28.1"))
;;
;; This file is not part of GNU Emacs.
;;
;;; Commentary:
;;
;;  My lisp bindings and such
;;
;;; Code:

(require 'smartparens)
(require 'elisp-mode)
(require 'scheme)
(require 'lisp-mode)
(require 'clojure-mode)

;;;###autoload
(defvar djeis97-lisp-mode-hooks '(scheme-mode-hook emacs-lisp-mode-hook lisp-mode-hook clojure-mode-hook))

(defun djeis97-lisp/close-paren ()
  (interactive)
  (ignore-errors
    (let ((next-line-only-close-parens (save-excursion
                                         (forward-line)
                                         (beginning-of-line)
                                         (looking-at "\s*\)+\s*$"))))
      (sp-forward-barf-sexp '(4))
      (save-excursion
        (forward-line)
        (beginning-of-line)
        (if (and next-line-only-close-parens
                 (looking-at "\s*$"))
            (ignore-errors
              (kill-whole-line))))))
  (right-char))

;;;###autoload
(define-minor-mode djeis97-lisp-paren-management-mode
  "Bindings to better manage parens."
  :keymap (let ((map (make-sparse-keymap)))
            ;; (define-key map (kbd "<tab>") 'lisp-indent-adjust-parens)
            ;; (define-key map (kbd "<backtab>") 'lisp-dedent-adjust-parens)
            (define-key map (kbd "(") (lambda ()
                                        (interactive)
                                        (sp-insert-pair "(")
                                        (sp-forward-slurp-sexp '(4))))
            (define-key map (kbd "C-(") (lambda ()
                                          (interactive)
                                          (sp-insert-pair "[")
                                          (sp-forward-slurp-sexp '(4))))
            (define-key map (kbd "M-(") (lambda ()
                                          (interactive)
                                          (sp-insert-pair "{")
                                          (sp-forward-slurp-sexp '(4))))

            (define-key map [remap newline-and-indent] (lambda ()
                                                         (interactive)
                                                         (newline-and-indent)
                                                         (if (char-equal (char-after (point)) ?\))
                                                             (save-excursion
                                                               (newline-and-indent)))
                                                         (indent-according-to-mode)))
            (define-key map (kbd ")") #'djeis97-lisp/close-paren)
            (define-key map [remap delete-backward-char] #'sp-backward-delete-char)
            map))

(dolist (h djeis97-lisp-mode-hooks)
  (add-hook h 'djeis97-lisp-paren-management-mode))

(provide 'djeis97-lisp)
;;; djeis97-lisp.el ends here
