;;; packages.el --- personal-layer layer packages file for Spacemacs.
;;
;; Copyright (c) 2012-2016 Sylvain Benner & Contributors
;;
;; Author: Jay <jay@XANA-Laptop-Dual>
;; URL: https://github.com/syl20bnr/spacemacs
;;
;; This file is not part of GNU Emacs.
;;
;;; License: GPLv3

;;; Commentary:

;; See the Spacemacs documentation and FAQs for instructions on how to implement
;; a new layer:
;;
;;   SPC h SPC layers RET
;;
;;
;; Briefly, each package to be installed or configured by this layer should be
;; added to `personal-layer-packages'. Then, for each package PACKAGE:
;;
;; - If PACKAGE is not referenced by any other Spacemacs layer, define a
;;   function `personal-layer/init-PACKAGE' to load and initialize the package.

;; - Otherwise, PACKAGE is already referenced by another Spacemacs layer, so
;;   define the functions `personal-layer/pre-init-PACKAGE' and/or
;;   `personal-layer/post-init-PACKAGE' to customize the package as it is loaded.

;;; Code:

(defconst personal-layer-packages
  '(evil-cleverparens
    lispy
    (paren-management :location local)
    (adjust-parens :location local)
    slime
    (dired :location built-in)
    (python :location built-in)
    (tramp :location built-in))
  "The list of Lisp packages required by the personal-layer layer.

Each entry is either:

1. A symbol, which is interpreted as a package to be installed, or

2. A list of the form (PACKAGE KEYS...), where PACKAGE is the
    name of the package to be installed or loaded, and KEYS are
    any number of keyword-value-pairs.

    The following keys are accepted:

    - :excluded (t or nil): Prevent the package from being loaded
      if value is non-nil

    - :location: Specify a custom installation location.
      The following values are legal:

      - The symbol `elpa' (default) means PACKAGE will be
        installed using the Emacs package manager.

      - The symbol `local' directs Spacemacs to load the file at
        `./local/PACKAGE/PACKAGE.el'

      - A list beginning with the symbol `recipe' is a melpa
        recipe.  See: https://github.com/milkypostman/melpa#recipe-format")

(defmacro define-lisp-state-key (key cmd)
  `(if evil-lisp-state-global
       (define-key evil-lisp-state-map (kbd ,key)
         (evil-lisp-state-enter-command ,cmd))
     (define-key evil-lisp-state-major-mode-map (kbd ,key)
       (evil-lisp-state-enter-command ,cmd))))

(defun define-lisp-state-keys (keys)
  (dolist (k keys)
    (let ((key (car k))
          (cmd (cdr k)))
      (eval `(define-lisp-state-key ,key ,cmd)))))

(defun personal-layer/init-evil-cleverparens ()
  (use-package evil-cleverparens
    :defer t
    :commands (evil-cp-<
               evil-cp->))
  (spacemacs|use-package-add-hook evil-lisp-state
    :post-config
    (progn
      (define-lisp-state-keys '(("<" . evil-cp-<)
                                (">" . evil-cp->)))))
  (spacemacs|use-package-add-hook smartparens
    :post-config
    (add-hook 'smartparens-enabled-hook 'evil-cleverparens-mode)))

(defun personal-layer/init-lispy ()
  (use-package lispy
    :defer t
    :commands (lispy-x lh-knight/body))
  (spacemacs|use-package-add-hook evil-lisp-state
    :post-config
    (progn
      (define-lisp-state-keys '(("x" . lispy-x)
                                ("z" . lh-knight/body))))))

(defun personal-layer/init-paren-management ()
  (use-package paren-management
    :defer t
    :commands (paren-management))
  (spacemacs/add-to-hooks 'paren-management '(lisp-mode-hook emacs-lisp-mode-hook))
  (evil-define-key 'insert paren-management-map (kbd "DEL")
    (lambda (arg)
      (interactive "p")
      (if (looking-back "[^ ]  +" (+ 2 (- (point) (line-beginning-position))))
          (delete-region (+ (match-beginning 0) 1) (point)))
      (sp-backward-delete-char arg))))

(defun personal-layer/init-adjust-parens ())

(defun personal-layer/post-init-slime ()
  (push 'slime-highlight-edits slime-contribs))

(defun personal-layer/post-init-dired ()
  (spacemacs|use-package-add-hook dired
    :post-config
    (setq dired-omit-files "^\\.[^.]\\|^#.*#$")))

(defun personal-layer/post-init-python ()
  (use-package python
    :defer t
    :mode "\\.pyt\\'"))

(defun personal-layer/post-init-tramp ()
  (with-eval-after-load 'tramp
    (add-to-list 'tramp-remote-path 'tramp-own-remote-path)))

;;; packages.el ends here
