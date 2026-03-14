(define-module (djeis packages ceph-mount)
  #:use-module ((guix licenses) #:prefix license:)
  #:use-module (guix build-system gnu)
  #:use-module (guix git-download)
  #:use-module (guix packages)
  #:use-module (guix gexp)
  #:use-module (gnu packages python)
  #:use-module (gnu packages crypto))


(define-public ceph-mount
  (let ((commit "c8aff98a30a1a1326334b146915ea9eafa1a8183")
        (revision "0"))
    (package
      (name "ceph-mount")
      (version (git-version "0.0.1" revision commit))
      (source (origin
                (method git-fetch)
                (uri (git-reference
                      (url "https://github.com/SFTtech/ceph-mount")
                      (commit commit)))
                (file-name (git-file-name name version))
                (sha256
                 (base32
                  "1dlkbxwgrsz43mnr31c084h7p8qr62v4si2k51h1l7c2nkx3isp5"))))
      (build-system gnu-build-system)
      (arguments
       (list
        #:phases
        #~(modify-phases %standard-phases
            (delete 'configure)
            (delete 'build)
            (delete 'check)
            (add-after 'unpack 'patch-source
              (lambda* (#:key inputs #:allow-other-keys)
                (substitute* "cephfs_mount"
                  (("ctypes.util.find_library\\(\"keyutils\"\\)")
                   (string-append "'" (search-input-file inputs "lib/libkeyutils.so.1") "'")))
                (substitute* "mount.ceph"
                  (("help=\"increase program verbosity\"\\)")
                   "help=\"increase program verbosity\")
    cli.add_argument(\"-n\", action=\"count\", default=0,
                     help=\"No mtab (actually ignored)\")"))))
            (replace 'install
              (lambda* (#:key #:allow-other-keys)
                (mkdir-p (string-append #$output "/sbin/"))
                (install-file "cephfs_mount" (string-append #$output "/sbin/"))
                (install-file "mount.ceph" (string-append #$output "/sbin/")))))))
      (inputs (list python keyutils))
      (home-page "https://github.com/dottedmag/x2x")
      (synopsis "")
      (description "")
      (license #f))))
