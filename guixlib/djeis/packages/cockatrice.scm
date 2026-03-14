(define-module (djeis packages cockatrice)
  #:use-module ((guix licenses) #:prefix license:)
  #:use-module (guix packages)
  #:use-module (guix git-download)
  #:use-module (guix gexp)
  #:use-module (guix build-system qt)
  #:use-module (gnu packages)
  #:use-module (guix utils)
  #:use-module (gnu packages qt)
  #:use-module (gnu packages protobuf)
  #:use-module (ice-9 match)
  #:use-module (srfi srfi-1))

(define-public cockatrice-beta
  (package
    (name "cockatrice-beta")
    (version "2.11.0-beta.50")
    (source
     (origin
       (method git-fetch)
       (uri (git-reference
              (url "https://github.com/Cockatrice/Cockatrice")
              (commit "2026-02-19-Development-2.11.0-beta.50")))
       (file-name (git-file-name name version))
       (sha256
        (base32
         "099z357ylysrq8687dj8p0s9j1f3a1pgfri31vnhqcb2wgqjicfv"))))
    (build-system qt-build-system)
    (arguments
     `(#:tests? #f)) ; Add if there are no tests or they fail
    (native-inputs
     (list qttools))
    (inputs
     (list qtbase
           qtmultimedia
           qtwebsockets
           protobuf)) ; Guix uses protobuf-3.21 for protobuf_21
    (home-page "https://github.com/Cockatrice/Cockatrice")
    (synopsis "Cross-platform virtual tabletop for multiplayer card games")
    (description
     "Cockatrice is a cross-platform virtual tabletop for multiplayer card
games over a network.  It is focused on Magic: The Gathering but can be used
for other card games as well.")
    (license license:gpl2+)))
