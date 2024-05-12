;;; djeis97-org-utils.el --- Utilities in my emacs config -*- lexical-binding: t; -*-
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

(require 'calendar)
(require 'org-datetree)

;;;###autoload
(defun djeis97-org-utils-datetree-find-date (date)
  "Find/create the datetree entry at `date'."
  (interactive (list (if current-prefix-arg (calendar-read-date) (calendar-current-date))))
  (org-datetree-find-date-create date))

(provide 'djeis97-org-utils)
;;; djeis97-org-utils.el ends here
