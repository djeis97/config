(define-module (djeis keys)
  #:use-module (guix gexp))

(define-public elijah-key (plain-file "emalaby.pub" "ssh-rsa AAAAB3NzaC1yc2EAAAADAQABAAACAQCxQGBp3dd2coC7R5mx/PRO3C9DUKRX7R5f5itxx08tFqYgeLkl5XBacbGcOQZqD14N5BRzdOpbbPJts1b8TL5px4WBNHHMyFPLVWe4TmLUcG5C29PpukX1NqIUd2lflSjDcEaMVrIDPMXGMd455eO9prsFmL3ddUi/m0VNXrplil1KuZY6bEsFssBWBDRfwQYIEfeto29+dJonw6Zb2z5FlyHBAxz9wmInCCigCojG6vXxGi4vYKVpFKdmyQcxm9P0Tgyas16Q8VhnVeFFf0fa6gDZJW/+utmvTPNQ8up22qD+rWhIvWnS+/NOms1jMw1YWL9GChZDk80xFRssJcB77zcb3291KBD6xbNavTI91ESJmqvSJXIe61+TDqVHe9t/HbbipigR7wcCkZCmHEtCkMwIL4pkn+jLiKRZ5b6CETZG90XrFyVm76pJQ6EXKXBv+YZjY2hf1CXnMVXzXkj9cx+FqEwWZ05CM9EEh1GGFKXmyvtlj9MX8v2MPi6JIXtwwdtFXnb6rjXi2rakWCClPmMjJHcAHKnVZvNT3T0GKSIOSAk/2FG+91Ex3naHk8OtadAkAZmEKvgjlVDPnobo2AFxI7hJvuntrRtouRjFHBMRIfE0YRkeSdegj8+4YtWoPqEKPlZkWDeO8dDLZeM6HNSUwYSAxvnOXcrM61VIFw== jay@XANA-tampa"))

(define-public xana-tampa-key (plain-file "xana-tampa-signing-key.pub" "
(public-key 
 (ecc 
  (curve Ed25519)
  (q #D9EDE5BAC5368F74330E3ACFB7E4B72B2FBDAB3F9827A221190833FD7CD9C99A#)
  )
 )
"))

(define-public nonguix-key (plain-file "nonguix-signing-key.pub" "
(public-key 
 (ecc 
  (curve Ed25519)
  (q #C1FD53E5D4CE971933EC50C9F307AE2171A2D3B52C804642A7A35F84F3A4EA98#)
  )
 )
"))

(define-public bordeaux-inria-key (plain-file "nonguix-signing-key.pub" "
(public-key
 (ecc
  (curve Ed25519)
  (q #89FBA276A976A8DE2A69774771A92C8C879E0F24614AAAAE23119608707B3F06#)))"))
