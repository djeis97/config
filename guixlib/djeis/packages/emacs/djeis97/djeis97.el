;;; djeis97.el --- My emacs configuration -*- lexical-binding: t; -*-
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
;;  My emacs configuration
;;
;;; Code:

(eval-when-compile
  (require 'exwm)
  (require 'djeis97-exwm)
  (require 'djeis97-exwm-consult))

(with-eval-after-load 'exwm
  (require 'djeis97-exwm)
  (with-eval-after-load 'consult
    (require 'djeis97-exwm-consult)
    (add-hook 'exwm-init-hook 'djeis97-exwm-consult-setup)))

(with-eval-after-load 'tab-bar
  (add-hook 'tab-bar-mode-hook 'djeis97-tab-bar-reset))

(with-eval-after-load 'tab-line
  (add-to-list 'tab-line-tab-face-functions 'djeis97-managed-tab-line-face-function))

(provide 'djeis97)
;;; djeis97.el ends here
