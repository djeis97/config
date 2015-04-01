(require 'package)

(setq package-enable-at-startup nil)
(package-initialize)

(push '("marmalade" . "http://marmalade-repo.org/packages/")
      package-archives )
(push '("melpa" . "http://melpa.milkbox.net/packages/")
      package-archives)

(require 'smartparens-config)

(require 'evil)
(evil-mode 1)
(autoload 'python-mode "python-mode.el" "Python mode." t)
(setq auto-mode-alist (append '(("/.*\.py\'" . python-mode)) auto-mode-alist))

(require 'evil-smartparens)


(smartparens-global-mode t)

(require 'rainbow-delimiters)
(global-rainbow-delimiters-mode)

(require 'hy-mode)

(custom-set-variables
 ;; custom-set-variables was added by Custom.
 ;; If you edit it by hand, you could mess it up, so be careful.
 ;; Your init file should contain only one such instance.
 ;; If there is more than one, they won't work right.
 )
(custom-set-faces
 ;; custom-set-faces was added by Custom.
 ;; If you edit it by hand, you could mess it up, so be careful.
 ;; Your init file should contain only one such instance.
 ;; If there is more than one, they won't work right.
 '(rainbow-delimiters-depth-1-face ((t (:foreground "dark olive green"))))
 '(rainbow-delimiters-depth-2-face ((t (:foreground "blue"))))
 '(rainbow-delimiters-depth-3-face ((t (:foreground "dark orange"))))
 '(rainbow-delimiters-depth-4-face ((t (:foreground "dark violet"))))
 '(rainbow-delimiters-depth-5-face ((t (:foreground "dark green"))))
 '(rainbow-delimiters-unmatched-face ((t (:foreground "red")))))
