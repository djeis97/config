(define-module (djeis packages email)
  #:use-module ((guix licenses) #:prefix license:)
  #:use-module (guix packages)
  #:use-module (guix git-download)
  #:use-module (guix gexp)
  #:use-module (guix build-system ant)
  #:use-module (gnu packages)
  #:use-module (guix utils)
  #:use-module (ice-9 match)
  #:use-module (srfi srfi-1))

(define-public davmail
  (let ((commit "3dec538d13eff60602dcce76dbf6286432ce9dba")
        (revision "1"))
    (package
     (name "davmail")
     (version (git-version "6.0.1" revision commit))
     (source (origin
              (method git-fetch)
              (uri (git-reference
                    (url "https://github.com/mguessan/davmail")
                    (commit commit)))
              (file-name (git-file-name name version))
              (sha256
               (base32
                "1cb4agk6ahhm9zh05j2bypps6prqxyf66qmviib4lhs36ggv853c"))
              (modules '((guix build utils)))
              (snippet
               '(begin
                  (for-each delete-file (find-files "archive/" ".*"))
                  (for-each delete-file (find-files "." "\\.bat$"))
                  (for-each delete-file (find-files "." "\\.dll$"))
                  #t))))
     (build-system ant-build-system)
     (arguments
      `(#:tests? #f; No tests
        #:build-target "prepare-dist"
        #:phases
        (modify-phases
         %standard-phases
         (replace 'install
                  (lambda* (#:key outputs #:allow-other-keys)
                    (let ((dir (string-append (assoc-ref outputs "out") "/lib/")))
                      (mkdir-p dir)
                      (copy-recursively "lib/" dir)
                      (copy-file "dist/davmail.jar" (string-append (assoc-ref outputs "out") "/davmail.jar"))
                      #t))))))
     (home-page "https://github.com/mguessan/davmail")
     (synopsis "")
     (description "")
     (license license:gpl2))))
