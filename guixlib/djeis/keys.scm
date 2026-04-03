(define-module (djeis keys)
  #:use-module (guix gexp))

(define-public elijah-key (plain-file "emalaby.pub" "sk-ssh-ed25519@openssh.com AAAAGnNrLXNzaC1lZDI1NTE5QG9wZW5zc2guY29tAAAAIKSDXsJnNN2Z3Kughn2/GsJdXuJaSaJO+uONqmKcoWK4AAAABHNzaDo= elijah@malaby.dev yubikey"))

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
  (q #C1FD53E5D4CE971933EC50C9F307AE2171A2D3B52C804642A7A35F84F3A4EA98#)
  )
 )
"))
