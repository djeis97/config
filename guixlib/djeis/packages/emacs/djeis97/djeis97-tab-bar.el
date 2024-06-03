;;; djeis97-tab-bar.el ---- Set up my custom tab bar -*- lexical-binding: t; -*-
;;
;; Copyright (C) 2022 Elijah Malaby
;;
;; Author: Elijah Malaby <qwe12345678910@gmail.com>
;; Maintainer: Elijah Malaby <qwe12345678910@gmail.com>
;; Created: October 03, 2022
;; Modified: October 03, 2022
;; Version: 0.0.1
;; Keywords: convenience faces
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


(require 'battery)
(require 'doom-modeline)
(require 'exwm)
(require 'seq)
(require 'djeis97-utils)

;;;###autoload
(defun djeis97/tab-bar-exwm-workspaces ()
  (let* ((current-monitor (frame-parameter nil 'exwm-randr-monitor))
         (current-frame (selected-frame))
         (frames (cl-remove-if-not (lambda (f) (string= (frame-parameter f 'exwm-randr-monitor) current-monitor)) exwm-workspace--list)))
    (cl-loop for f in frames
             for p = (cl-position f exwm-workspace--list)
             append `((,(intern (format "djeis97/exwm-wo-sep-%s" p)) menu-item ,(tab-bar-separator) ignore)
                      (,(intern (format "djeis97/exwm-wo-%s" p)) menu-item
                       ,(propertize (format "%s" (+ 1 p)) 'face (if (eql f current-frame)
                                                                    'success
                                                                  '(:inherit mode-line
                                                                             :foreground "#ffffff")))
                       ignore)))))


(defconst +djeis97/processor-glyph+ "")
(defconst +djeis97/mem-glyph+ "")

;;;###autoload
(defun djeis97/tab-bar-format-align-right ()
  "Align the rest of tab bar items to the right."
  (let* ((rest (cdr (memq 'djeis97/tab-bar-format-align-right tab-bar-format)))
         (rest (tab-bar-format-list rest))
         (rest (mapconcat (lambda (item) (nth 2 item)) rest ""))
         (spec (1+ (cl-count-if (lambda (x) (< 256 x)) rest)))
         (hpos (length rest))
         (str (propertize " " 'display `(space :align-to (- right ,hpos ,spec)))))
    `((align-right menu-item ,str ignore))))

;;;###autoload
(defun djeis97/tab-bar-loadavg ()
  (let* ((loadavg (format "%5.2f" (car (load-average t)))))
    `((djeis97/loadavg menu-item
                       ,(concat
                         (propertize " " 'face '(:inherit font-lock-keyword-face :box t))
                         (propertize +djeis97/processor-glyph+
                                     'face '(:inherit font-lock-keyword-face
                                             :box t
                                             :family "siji")
                                     'display '(raise 0.07))
                         (propertize loadavg
                                     'face '(:inherit font-lock-keyword-face :box t))
                         (propertize " " 'face '(:inherit font-lock-keyword-face :box t)))
                       ignore))))

;;;###autoload
(defun djeis97/tab-bar-meminfo ()
  (let* ((raw-meminfo (memory-info))
         (meminfo (format "%4.1f%% %4.1f%%"
                          (* 100 (/ (float (- (car raw-meminfo) (cadr raw-meminfo)))
                                    (car raw-meminfo)))
                          (* 100 (/ (float (- (caddr raw-meminfo) (cadddr raw-meminfo)))
                                    (+ 1 (caddr raw-meminfo)))))))
    `((djeis97/meminfo menu-item
                       ,(concat
                         (propertize " " 'face '(:inherit font-lock-variable-name-face :box t))
                         (propertize +djeis97/mem-glyph+
                                     'face '(:inherit font-lock-variable-name-face
                                             :box t
                                             :family "siji")
                                     'display '(raise -0.15))
                         (propertize meminfo
                                     'face '(:inherit font-lock-variable-name-face :box t))
                         (propertize " " 'face '(:inherit font-lock-variable-name-face :box t)))
                       ignore))))

(defvar djeis97/tab-bar-network-interface-index 0)

(defun djeis97/tab-bar-list-network-interfaces ()
  (cl-remove "lo" (network-interface-list) :key #'car :test #'string=))

(defun djeis97/tab-bar-next-network-interface ()
  (interactive)
  (setf djeis97/tab-bar-network-interface-index
        (mod (+ 1 djeis97/tab-bar-network-interface-index)
             (length (djeis97/tab-bar-list-network-interfaces))))
  (djeis97/tab-bar-cache-handler))

(defun djeis97/tab-bar-network-interfaces ()
  (let* ((raw-interface (nth djeis97/tab-bar-network-interface-index
                             (djeis97/tab-bar-list-network-interfaces)))
         (interface (format "%s: %s" (car raw-interface) (format-network-address (cdr raw-interface) t))))
    `((djeis97/network-interfaces menu-item
                                  ,(concat
                                    (propertize " " 'face '(:inherit font-lock-string-face :box t))
                                    (propertize interface
                                                'face '(:inherit font-lock-string-face :box t))
                                    (propertize " " 'face '(:inherit font-lock-string-face :box t)))
                                  djeis97/tab-bar-next-network-interface))))

(defvar djeis97/tab-bar-time-style :short)

(defun djeis97/tab-bar-toggle-time-style ()
  (interactive)
  (setf djeis97/tab-bar-time-style
        (cl-case djeis97/tab-bar-time-style
          (:short :long)
          (:long :short)))
  (djeis97/tab-bar-cache-handler))

;;;###autoload
(defun djeis97/tab-bar-current-time ()
  (let* ((raw-time (current-time))
         (time (cl-case djeis97/tab-bar-time-style
                 (:short (format-time-string "%H:%M" raw-time))
                 (:long (current-time-string raw-time)))))
    `((djeis97/time menu-item
                    ,(concat
                      (propertize " " 'face '(:inherit font-lock-builtin-face :box t))
                      (propertize "" 'face '(:inherit font-lock-builtin-face :box t)
                                  'display '(raise 0.0575))
                      (propertize " " 'face '(:inherit font-lock-builtin-face :box t))
                      (propertize time
                                  'face '(:inherit font-lock-builtin-face :box t))
                      (propertize " " 'face '(:inherit font-lock-builtin-face :box t))
                      " ")
                    djeis97/tab-bar-toggle-time-style))))

;;;###autoload
(defun djeis97/tab-bar-battery ()
  (let* ((data (and battery-status-function
                    (functionp battery-status-function)
                    (funcall battery-status-function)))
         (charging? (string-equal "on-line" (cdr (assoc ?L data))))
         (percentage (car (read-from-string (or (cdr (assq ?p data)) "ERR"))))
         (valid-percentage? (and (numberp percentage)
                                 (>= percentage 0)
                                 (<= percentage battery-mode-line-limit)))
         (face (if valid-percentage?
                   (cond (charging? 'success)
                         ((< percentage battery-load-critical) 'error)
                         ((< percentage 25) 'warning)
                         ((< percentage 95) 'default)
                         (t 'success))
                 'doom-modeline-battery-error))
         (icon (if valid-percentage?
                   (cond (charging?
                          (propertize "" 'face face 'display '(raise -0.05)))
                         ((> percentage 95)
                          (doom-modeline-icon 'faicon "nf-fa-battery_4" "" "-"
                                              :face face :v-adjust -0.0575))
                         ((> percentage 70)
                          (doom-modeline-icon 'faicon "nf-fa-battery_3" "" "-"
                                              :face face :v-adjust -0.0575))
                         ((> percentage 40)
                          (doom-modeline-icon 'faicon "nf-fa-battery_2" "" "-"
                                              :face face :v-adjust -0.0575))
                         ((> percentage battery-load-critical)
                          (doom-modeline-icon 'faicon "nf-fa-battery_1" "" "-"
                                              :face face :v-adjust -0.0575))
                         (t (doom-modeline-icon 'faicon "nf-fa-battery_0" "" "!"
                                                :face face :v-adjust -0.0575)))
                 (doom-modeline-icon 'faicon "nf-fa-battery_0" "⚠" "N/A"
                                     :face face :v-adjust -0.0575)))
         (text (if valid-percentage? (format " %d%%" percentage) ""))
         (help-echo (if (and battery-echo-area-format data valid-percentage?)
                        (battery-format battery-echo-area-format data)
                      "Battery status not available")))
    `((djeis97/battery menu-item ,(concat icon (propertize text 'face face))
                       ignore
                       :help ,help-echo))))

(defvar djeis97/tab-bar-right-cache '())
(defvar djeis97/tab-bar-right-elements '(djeis97/tab-bar-battery
                                         tab-bar-separator
                                         djeis97/tab-bar-network-interfaces
                                         tab-bar-separator
                                         djeis97/tab-bar-meminfo
                                         tab-bar-separator
                                         djeis97/tab-bar-loadavg
                                         tab-bar-separator
                                         djeis97/tab-bar-current-time))

;;;###autoload
(defun djeis97/update-tab-bar-cache ()
  (setf djeis97/tab-bar-right-cache (tab-bar-format-list djeis97/tab-bar-right-elements)))

;;;###autoload
(defun djeis97/cached-tab-bar-right ()
  (or djeis97/tab-bar-right-cache
      (djeis97/update-tab-bar-cache)))

;;;###autoload
(defun djeis97/tab-bar-cache-handler ()
  (ignore-errors
    (djeis97/update-tab-bar-cache))
  (force-mode-line-update t))

;;;###autoload
(defun djeis97/tab-bar-tab-face-group-color (tab)
  (let ((group (funcall tab-bar-tab-group-function tab))
        (current-p (eq (car tab) 'current-tab))
        (base (tab-bar-tab-face-default tab)))
    (if (or group current-p)
        (append
         (list :inherit base)
         (when group
           (list :box (list :color (djeis97-utils-color-hash group)
                            :line-width (cons 3 -1))))
         (when current-p
           (list :inverse-video t)))
      base)))

(defvar djeis97-tab-bar-timer nil)

(defun djeis97-tab-bar-group-name-shorten (group)
  (let ((split (split-string group "[ _\\-]")))
    (if (< 1 (length split))
        (upcase (concat (seq-subseq (cl-first split) 0 1)
                        (seq-subseq (cl-second split) 0 1)))
      (capitalize (seq-subseq group 0 2)))))

;;;###autoload
(defun djeis97-tab-bar-tab-name-format (tab i)
  (let ((current-p (eq (car tab) 'current-tab))
        (group (funcall tab-bar-tab-group-function tab)))
    (concat
     (if group
         (propertize (concat (djeis97-tab-bar-group-name-shorten group) " ")
                     'face (list :inherit (tab-bar-tab-face-default tab)
                                 :foreground "#000000"
                                 :background (djeis97-utils-color-hash group)
                                 :box (list :color (djeis97-utils-color-hash group)
                                            :line-width (cons 3 -1))))
       "")
     (propertize
      (concat 
       (alist-get 'name tab)
       (or (and tab-bar-close-button-show
                (not (eq tab-bar-close-button-show
                         (if current-p 'non-selected 'selected)))
                tab-bar-close-button)
           ""))
      'face (funcall tab-bar-tab-face-function tab)))))

;;;###autoload
(defun djeis97-tab-bar-reset ()
  (interactive)
  (when djeis97-tab-bar-timer
    (cancel-timer djeis97-tab-bar-timer))
  (setq djeis97-tab-bar-timer (run-at-time t 5 'djeis97/tab-bar-cache-handler))
  (setq-default tab-bar-format '(djeis97/tab-bar-exwm-workspaces
                                 tab-bar-format-history
                                 tab-bar-format-tabs
                                 tab-bar-separator
                                 tab-bar-format-add-tab
                                 djeis97/tab-bar-format-align-right
                                 djeis97/cached-tab-bar-right
                                 )
                tab-bar-tab-name-function 'tab-bar-tab-name-truncated
                tab-bar-tab-name-format-function 'djeis97-tab-bar-tab-name-format
                tab-bar-tab-name-truncated-max 15
                tab-bar-tab-face-function 'djeis97/tab-bar-tab-face-group-color
                tab-bar-auto-width nil))

(provide 'djeis97-tab-bar)
;;; djeis97-tab-bar.el ends here
