(require 'adjust-parens)
(require 'smartparens)

(defun fake-key (key)
  (let ((command (key-binding (kbd "RET")))
        (keys (function 'this-command-keys))
        (vector-keys (function 'this-command-keys-vector))
        (read-key-seq (function 'read-key-sequence))
        (read-key-seq-vec (function 'read-key-sequence-vector))
        (indirecting t))
    (cl-flet ((this-command-keys ()
                                 (if indirecting
                                     [?\n]
                                   (funcall keys)))
              (this-command-keys-vector ()
                                        (if indirecting
                                            [?\n]
                                          (funcall keys)))
              (read-key-sequence ()
                                 (setq indirecting nil)
                                 (funcall read-key-seq))
              (read-key-sequence-vector ()
                                        (setq indirecting nil)
                                        (funcall read-key-seq-vec)))
      (setq this-command command)
      (call-interactively command))))

(defun close-paren ()
  (interactive)
  (let ((next-line-only-close-parens (save-excursion
                                       (next-line)
                                       (beginning-of-line)
                                       (looking-at "\s*\)+\s*$"))))
    (sp-forward-barf-sexp '(4))
    (save-excursion
      (next-line)
      (beginning-of-line)
      (if (and next-line-only-close-parens
               (looking-at "\s*$"))
          (ignore-errors
            (kill-whole-line)))))
  (right-char))

;;;###autoload
(define-minor-mode paren-management
  "Bindings to better manage parens."
  :keymap (let ((map (make-sparse-keymap)))
            (define-key map (kbd "<C-tab>") 'lisp-indent-adjust-parens)
            (define-key map (kbd "<C-iso-lefttab>") 'lisp-dedent-adjust-parens)
            (define-key map (kbd "(") (lambda ()
                                        (interactive)
                                        (sp-insert-pair "(")
                                        (sp-forward-slurp-sexp '(4))))
            (define-key map (kbd ")") 'close-paren)
            (define-key map (kbd "RET") (lambda ()
                                          (interactive)
                                          (newline-and-indent)
                                          (if (char-equal (char-after (point)) ?\))
                                              (save-excursion
                                                (newline-and-indent)))
                                          (indent-according-to-mode)))
            map))

(provide 'paren-management)
