(define-module (djeis packages lazygit)
  #:use-module ((guix licenses) #:prefix license:)
  #:use-module (guix build-system go)
  #:use-module (guix git-download)
  #:use-module (guix packages)
  #:use-module (guix gexp)
  #:use-module (gnu packages terminals)
  #:use-module (gnu packages golang)
  #:use-module (gnu packages golang-crypto)
  #:use-module (gnu packages golang-build)
  #:use-module (gnu packages golang-check)
  #:use-module (gnu packages golang-xyz))

;; (define-public go-gopkg-in-ozeidan-fuzzy-patricia-v3
;;   (package
;;     (name "go-gopkg-in-ozeidan-fuzzy-patricia-v3")
;;     (version "3.0.0")
;;     (source
;;      (origin
;;        (method git-fetch)
;;        (uri (git-reference
;;              (url "https://gopkg.in/ozeidan/fuzzy-patricia.v3")
;;              (commit (string-append "v" version))))
;;        (file-name (git-file-name name version))
;;        (sha256
;;         (base32 "0wn6fq1g7f6djrj407r8nimm5fyp7lji22ng7a4rg8pf7ihrqzrp"))))
;;     (build-system go-build-system)
;;     (arguments
;;      (list
;;       #:import-path "gopkg.in/ozeidan/fuzzy-patricia.v3/patricia"
;;       #:unpack-path "gopkg.in/ozeidan/fuzzy-patricia.v3"))
;;     (home-page "https://gopkg.in/ozeidan/fuzzy-patricia.v3")
;;     (synopsis "go-patricia")
;;     (description
;;      "@@strong{Documentation}:
;; @@url{http://godoc.org/github.com/tchap/go-patricia/patricia,@code{GoDoc}}
;; @@strong{Test Coverage}: @@url{https://coveralls.io/r/tchap/go-patricia,(img (@@
;; (src https://coveralls.io/repos/tchap/go-patricia/badge.png) (alt Coverage
;; Status)))}.")
;;     (license license:expat)))

;; (define-public go-github-com-stefanhaller-git-todo-parser
;;   (package
;;     (name "go-github-com-stefanhaller-git-todo-parser")
;;     (version "0.0.7-0.20240406123903-fd957137b6e2")
;;     (source
;;      (origin
;;        (method git-fetch)
;;        (uri (git-reference
;;              (url "https://github.com/stefanhaller/git-todo-parser")
;;              (commit (go-version->git-ref version))))
;;        (file-name (git-file-name name version))
;;        (sha256
;;         (base32 "003256c3fkmlz6zmgzwnic284xb6vbnqf5sakjz13d38gz5mj3ax"))))
;;     (build-system go-build-system)
;;     (arguments
;;      (list
;;       #:import-path "github.com/stefanhaller/git-todo-parser/todo"
;;       #:unpack-path "github.com/stefanhaller/git-todo-parser"))
;;     (propagated-inputs `(,go-github-com-stretchr-testify))
;;     (home-page "https://github.com/stefanhaller/git-todo-parser")
;;     (synopsis #f)
;;     (description #f)
;;     (license license:expat)))

;; (define-public go-github-com-spkg-bom
;;   (package
;;     (name "go-github-com-spkg-bom")
;;     (version "0.0.0-20160624110644-59b7046e48ad")
;;     (source
;;      (origin
;;        (method git-fetch)
;;        (uri (git-reference
;;              (url "https://github.com/spkg/bom")
;;              (commit (go-version->git-ref version))))
;;        (file-name (git-file-name name version))
;;        (sha256
;;         (base32 "0q5017ndgqbd1iv032ic5gchzla7dw7nppbmyg9szrgpxbrc09qy"))))
;;     (build-system go-build-system)
;;     (arguments
;;      (list
;;       #:tests? #f
;;       #:import-path "github.com/spkg/bom"))
;;     (home-page "https://github.com/spkg/bom")
;;     (synopsis "bom")
;;     (description "Package bom is used to clean up UTF-8 Byte Order Marks.")
;;     (license license:expat)))

;; (define-public go-github-com-sanity-io-litter
;;   (package
;;     (name "go-github-com-sanity-io-litter")
;;     (version "1.5.2")
;;     (source
;;      (origin
;;        (method git-fetch)
;;        (uri (git-reference
;;              (url "https://github.com/sanity-io/litter")
;;              (commit (string-append "v" version))))
;;        (file-name (git-file-name name version))
;;        (sha256
;;         (base32 "0lp8cdwh1nd822rh68fs5dvjpd2g7s20hdpisgfjmbqizrn5x8f4"))))
;;     (build-system go-build-system)
;;     (arguments
;;      (list
;;       #:import-path "github.com/sanity-io/litter"))
;;     (propagated-inputs `(,go-github-com-stretchr-testify))
;;     (home-page "https://github.com/sanity-io/litter")
;;     (synopsis "Litter")
;;     (description "Litter is provided by.")
;;     (license license:expat)))

;; (define-public go-github-com-thoas-go-funk
;;   (package
;;     (name "go-github-com-thoas-go-funk")
;;     (version "0.9.1")
;;     (source
;;      (origin
;;        (method git-fetch)
;;        (uri (git-reference
;;              (url "https://github.com/thoas/go-funk")
;;              (commit (string-append "v" version))))
;;        (file-name (git-file-name name version))
;;        (sha256
;;         (base32 "1vxdilnbyr10zfsqw3bqgxdxcz8vsizc0rhvfp1lrlcfa8574cqk"))))
;;     (build-system go-build-system)
;;     (arguments
;;      (list
;;       #:import-path "github.com/thoas/go-funk"))
;;     (propagated-inputs `(,go-github-com-stretchr-testify))
;;     (home-page "https://github.com/thoas/go-funk")
;;     (synopsis #f)
;;     (description #f)
;;     (license license:expat)))

;; (define-public go-github-com-samber-lo
;;   (package
;;     (name "go-github-com-samber-lo")
;;     (version "1.31.0")
;;     (source
;;      (origin
;;        (method git-fetch)
;;        (uri (git-reference
;;              (url "https://github.com/samber/lo")
;;              (commit (string-append "v" version))))
;;        (file-name (git-file-name name version))
;;        (sha256
;;         (base32 "08nj5kdgf53bdgyl2l52zqdc4xg8q7papqjrgrigpn8qnamzrnci"))))
;;     (build-system go-build-system)
;;     (arguments
;;      (list
;;       #:import-path "github.com/samber/lo"))
;;     (propagated-inputs `(,go-golang-org-x-exp
;;                          ,go-github-com-thoas-go-funk
;;                          ,go-github-com-stretchr-testify))
;;     (home-page "https://github.com/samber/lo")
;;     (synopsis "lo - Iterate over slices, maps, channels...")
;;     (description "✨.")
;;     (license license:expat)))

;; (define-public go-github-com-sahilm-fuzzy
;;   (package
;;     (name "go-github-com-sahilm-fuzzy")
;;     (version "0.1.0")
;;     (source
;;      (origin
;;        (method git-fetch)
;;        (uri (git-reference
;;              (url "https://github.com/sahilm/fuzzy")
;;              (commit (string-append "v" version))))
;;        (file-name (git-file-name name version))
;;        (sha256
;;         (base32 "1x6wrlbqgjkhr1wdvw7vzn6h8nx0p60540slkzfnrvghvbxr7lgb"))))
;;     (build-system go-build-system)
;;     (arguments
;;      (list
;;       #:tests? #f
;;       #:import-path "github.com/sahilm/fuzzy"))
;;     (home-page "https://github.com/sahilm/fuzzy")
;;     (synopsis "fuzzy")
;;     (description
;;      "Package fuzzy provides fuzzy string matching optimized for filenames and code
;; symbols in the style of Sublime Text, VSCode, @code{IntelliJ} IDEA et al.")
;;     (license license:expat)))

;; (define-public go-github-com-mitchellh-go-ps
;;   (package
;;     (name "go-github-com-mitchellh-go-ps")
;;     (version "1.0.0")
;;     (source
;;      (origin
;;        (method git-fetch)
;;        (uri (git-reference
;;              (url "https://github.com/mitchellh/go-ps")
;;              (commit (string-append "v" version))))
;;        (file-name (git-file-name name version))
;;        (sha256
;;         (base32 "0ipcbz66x7q8xczi7cyfq06y7n7v0syvkp730vn9jrn7s8f5ag0z"))))
;;     (build-system go-build-system)
;;     (arguments
;;      (list
;;       #:import-path "github.com/mitchellh/go-ps"))
;;     (home-page "https://github.com/mitchellh/go-ps")
;;     (synopsis "Process List Library for Go")
;;     (description
;;      "ps provides an API for finding and listing processes in a platform-agnostic way.")
;;     (license license:expat)))

;; (define-public go-github-com-mgutz-str
;;   (package
;;     (name "go-github-com-mgutz-str")
;;     (version "1.2.0")
;;     (source
;;      (origin
;;        (method git-fetch)
;;        (uri (git-reference
;;              (url "https://github.com/mgutz/str")
;;              (commit (string-append "v" version))))
;;        (file-name (git-file-name name version))
;;        (sha256
;;         (base32 "1g3dq618mcnpfyw7q6m32dy08wjzkyvlbd0f2nvwvck682749i1j"))))
;;     (build-system go-build-system)
;;     (arguments
;;      (list
;;       #:import-path "github.com/mgutz/str"))
;;     (home-page "https://github.com/mgutz/str")
;;     (synopsis "str")
;;     (description
;;      "Package str is a comprehensive set of string functions to build more Go
;; awesomeness.  Str complements Go's standard packages and does not duplicate
;; functionality found in `strings` or `strconv`.")
;;     (license license:expat)))

;; (define-public go-github-com-kyokomi-emoji-v2
;;   (package
;;     (name "go-github-com-kyokomi-emoji-v2")
;;     (version "2.2.8")
;;     (source
;;      (origin
;;        (method git-fetch)
;;        (uri (git-reference
;;              (url "https://github.com/kyokomi/emoji")
;;              (commit (string-append "v" version))))
;;        (file-name (git-file-name name version))
;;        (sha256
;;         (base32 "11wriagjwkrrnjsv264hwdbp4wiwmclvj67kybf6rhfx5ly74n31"))))
;;     (build-system go-build-system)
;;     (arguments
;;      (list
;;       #:import-path "github.com/kyokomi/emoji/v2"))
;;     (home-page "https://github.com/kyokomi/emoji")
;;     (synopsis "Emoji")
;;     (description "Package emoji terminal output.")
;;     (license license:expat)))

;; (define-public go-github-com-mailru-easyjson
;;   (package
;;     (name "go-github-com-mailru-easyjson")
;;     (version "0.7.7")
;;     (source
;;      (origin
;;        (method git-fetch)
;;        (uri (git-reference
;;              (url "https://github.com/mailru/easyjson")
;;              (commit (string-append "v" version))))
;;        (file-name (git-file-name name version))
;;        (sha256
;;         (base32 "0clifkvvy8f45rv3cdyv58dglzagyvfcqb63wl6rij30c5j2pzc1"))))
;;     (build-system go-build-system)
;;     (arguments
;;      (list
;;       #:import-path "github.com/mailru/easyjson"))
;;     (propagated-inputs `(,go-github-com-josharian-intern))
;;     (home-page "https://github.com/mailru/easyjson")
;;     (synopsis "easyjson")
;;     (description
;;      "Package easyjson contains marshaler/unmarshaler interfaces and helper functions.")
;;     (license license:expat)))

;; (define-public go-github-com-buger-jsonparser
;;   (package
;;     (name "go-github-com-buger-jsonparser")
;;     (version "1.1.1")
;;     (source
;;      (origin
;;        (method git-fetch)
;;        (uri (git-reference
;;              (url "https://github.com/buger/jsonparser")
;;              (commit (string-append "v" version))))
;;        (file-name (git-file-name name version))
;;        (sha256
;;         (base32 "0qv2lsh2biwxn927941gqiv5pqg7n4v58j0i536pjp7pr17pq7dp"))))
;;     (build-system go-build-system)
;;     (arguments
;;      (list
;;       #:import-path "github.com/buger/jsonparser"))
;;     (home-page "https://github.com/buger/jsonparser")
;;     (synopsis
;;      "Alternative JSON parser for Go (10x times faster standard library)")
;;     (description
;;      "It does not require you to know the structure of the payload (eg.  create
;; structs), and allows accessing fields by providing the path to them.  It is up
;; to @@strong{10 times faster} than standard @@code{encoding/json} package
;; (depending on payload size and usage), @@strong{allocates no memory}.  See
;; benchmarks below.")
;;     (license license:expat)))

;; (define-public go-github-com-bahlo-generic-list-go
;;   (package
;;     (name "go-github-com-bahlo-generic-list-go")
;;     (version "0.2.0")
;;     (source
;;      (origin
;;        (method git-fetch)
;;        (uri (git-reference
;;              (url "https://github.com/bahlo/generic-list-go")
;;              (commit (string-append "v" version))))
;;        (file-name (git-file-name name version))
;;        (sha256
;;         (base32 "1nif01xg2y7ihhik65xkx74kszamgvz9ykknj81p71mmdv0fm304"))))
;;     (build-system go-build-system)
;;     (arguments
;;      (list
;;       #:import-path "github.com/bahlo/generic-list-go"))
;;     (home-page "https://github.com/bahlo/generic-list-go")
;;     (synopsis "generic-list-go")
;;     (description "Package list implements a doubly linked list.")
;;     (license license:bsd-3)))

;; (define-public go-github-com-wk8-go-ordered-map-v2
;;   (package
;;     (name "go-github-com-wk8-go-ordered-map-v2")
;;     (version "2.1.8")
;;     (source
;;      (origin
;;        (method git-fetch)
;;        (uri (git-reference
;;              (url "https://github.com/wk8/go-ordered-map")
;;              (commit (string-append "v" version))))
;;        (file-name (git-file-name name version))
;;        (sha256
;;         (base32 "0vzl2j6m9pz8ckikf9z2da9zxdbi7fwhcwq8rmzpmf34zl8cjn1g"))))
;;     (build-system go-build-system)
;;     (arguments
;;      (list
;;       #:import-path "github.com/wk8/go-ordered-map/v2"))
;;     (propagated-inputs `(,go-gopkg-in-yaml-v3
;;                          ,go-github-com-stretchr-testify
;;                          ,go-github-com-mailru-easyjson
;;                          ,go-github-com-buger-jsonparser
;;                          ,go-github-com-bahlo-generic-list-go))
;;     (home-page "https://github.com/wk8/go-ordered-map")
;;     (synopsis "Golang Ordered Maps")
;;     (description
;;      "Package orderedmap implements an ordered map, i.e.  a map that also keeps track
;; of the order in which keys were inserted.")
;;     (license license:asl2.0)))

;; (define-public go-github-com-karimkhaleel-jsonschema
;;   (package
;;     (name "go-github-com-karimkhaleel-jsonschema")
;;     (version "0.0.0-20231001195015-d933f0d94ea3")
;;     (source
;;      (origin
;;        (method git-fetch)
;;        (uri (git-reference
;;              (url "https://github.com/karimkhaleel/jsonschema")
;;              (commit (go-version->git-ref version))))
;;        (file-name (git-file-name name version))
;;        (sha256
;;         (base32 "0qvksn2vcrnqpcdv0wi3nkisnxyz0qrikg03ipa3mfcii014c0cq"))))
;;     (build-system go-build-system)
;;     (arguments
;;      (list
;;       #:tests? #f
;;       #:import-path "github.com/karimkhaleel/jsonschema"))
;;     (propagated-inputs `(,go-github-com-wk8-go-ordered-map-v2
;;                          ,go-github-com-stretchr-testify))
;;     (home-page "https://github.com/karimkhaleel/jsonschema")
;;     (synopsis "Go JSON Schema Reflection")
;;     (description
;;      "Package jsonschema uses reflection to generate JSON Schemas from Go types [1].")
;;     (license license:expat)))

;; (define-public go-github-com-jesseduffield-minimal-gitignore
;;   (package
;;     (name "go-github-com-jesseduffield-minimal-gitignore")
;;     (version "0.3.3-0.20211018110810-9cde264e6b1e")
;;     (source
;;      (origin
;;        (method git-fetch)
;;        (uri (git-reference
;;              (url "https://github.com/jesseduffield/minimal")
;;              (commit (go-version->git-ref version))))
;;        (file-name (git-file-name name version))
;;        (sha256
;;         (base32 "1n5i3g1b6jzd6szcjr8cm330n1nhpailg2xn1vfiri0mwd714cwk"))))
;;     (build-system go-build-system)
;;     (arguments
;;      (list
;;       #:import-path "github.com/jesseduffield/minimal/gitignore"
;;       #:unpack-path "github.com/jesseduffield/minimal"))
;;     (propagated-inputs `(,go-github-com-gobwas-glob))
;;     (home-page "https://github.com/jesseduffield/minimal")
;;     (synopsis #f)
;;     (description
;;      "Package gitignore can be used to parse .gitignore-style files into lists of
;; globs that can be used to test against paths or selectively walk a file tree.
;; Gobwas's glob package is used for matching because it is faster than using
;; regexp, which is overkill, and supports globstars (**), unlike filepath.Match.")
;;     (license license:bsd-3)))

;; (define-public go-github-com-jesseduffield-kill
;;   (package
;;     (name "go-github-com-jesseduffield-kill")
;;     (version "0.0.0-20220618033138-bfbe04675d10")
;;     (source
;;      (origin
;;        (method git-fetch)
;;        (uri (git-reference
;;              (url "https://github.com/jesseduffield/kill")
;;              (commit (go-version->git-ref version))))
;;        (file-name (git-file-name name version))
;;        (sha256
;;         (base32 "1snks1bd86b3clxp9d4mf1dcwwpyfvsqm7ncdm02r2iy2lq9381i"))))
;;     (build-system go-build-system)
;;     (arguments
;;      (list
;;       #:import-path "github.com/jesseduffield/kill"))
;;     (home-page "https://github.com/jesseduffield/kill")
;;     (synopsis "Kill")
;;     (description
;;      "Go package for killing processes across different platforms.  Handles killing
;; children of processes as well as the process itself.")
;;     (license license:expat)))

;; (define-public go-github-com-jesseduffield-gocui
;;   (package
;;     (name "go-github-com-jesseduffield-gocui")
;;     (version "0.3.0")
;;     (source
;;      (origin
;;        (method git-fetch)
;;        (uri (git-reference
;;              (url "https://github.com/jesseduffield/gocui")
;;              (commit (string-append "v" version))))
;;        (file-name (git-file-name name version))
;;        (sha256
;;         (base32 "01xac0my3jkiykbqylfldx7yj1xcwjqhxm1d9fqy1gmy3bwwzvkg"))))
;;     (build-system go-build-system)
;;     (arguments
;;      (list
;;       #:import-path "github.com/jesseduffield/gocui"))
;;     (propagated-inputs `(,go-github.com-nsf-termbox-go))
;;     (home-page "https://github.com/jesseduffield/gocui")
;;     (synopsis "GOCUI - Go Console User Interface")
;;     (description "Package gocui allows to create console user interfaces.")
;;     (license license:bsd-3)))

;; (define-public go-github-com-atotto-clipboard
;;   (package
;;     (name "go-github-com-atotto-clipboard")
;;     (version "0.1.4")
;;     (source
;;      (origin
;;        (method git-fetch)
;;        (uri (git-reference
;;              (url "https://github.com/atotto/clipboard")
;;              (commit (string-append "v" version))))
;;        (file-name (git-file-name name version))
;;        (sha256
;;         (base32 "0ycd8zkgsq9iil9svhlwvhcqwcd7vik73nf8rnyfnn10gpjx97k5"))))
;;     (build-system go-build-system)
;;     (arguments
;;      (list
;;       #:tests? #f
;;       #:import-path "github.com/atotto/clipboard"))
;;     (home-page "https://github.com/atotto/clipboard")
;;     (synopsis "Clipboard for Go")
;;     (description "Package clipboard read/write on clipboard.")
;;     (license license:bsd-3)))

;; (define-public go-github-com-aybabtme-rgbterm
;;   (package
;;     (name "go-github-com-aybabtme-rgbterm")
;;     (version "0.0.0-20170906152045-cc83f3b3ce59")
;;     (source
;;      (origin
;;        (method git-fetch)
;;        (uri (git-reference
;;              (url "https://github.com/aybabtme/rgbterm")
;;              (commit (go-version->git-ref version))))
;;        (file-name (git-file-name name version))
;;        (sha256
;;         (base32 "0wvmxvjn64968ikvnxrflb1x8rlcwzpfl53fzbxff2axbx9lq50q"))))
;;     (build-system go-build-system)
;;     (arguments
;;      (list
;;       #:import-path "github.com/aybabtme/rgbterm"))
;;     (home-page "https://github.com/aybabtme/rgbterm")
;;     (synopsis "RGB terminal")
;;     (description
;;      "Package rgbterm colorizes bytes and strings using RGB colors, for a full range
;; of pretty terminal strings.")
;;     (license license:expat)))

;; (define-public go-github-com-bufbuild-connect-go
;;   (package
;;     (name "go-github-com-bufbuild-connect-go")
;;     (version "1.10.0")
;;     (source
;;      (origin
;;        (method git-fetch)
;;        (uri (git-reference
;;              (url "https://github.com/bufbuild/connect-go")
;;              (commit (string-append "v" version))))
;;        (file-name (git-file-name name version))
;;        (sha256
;;         (base32 "04j1k1fdz5jp45349km65x9smhcb5vp6hy5dn72jafn4yc0xxkbi"))))
;;     (build-system go-build-system)
;;     (arguments
;;      (list
;;       #:import-path "github.com/bufbuild/connect-go"))
;;     (propagated-inputs `(,go-google-golang-org-protobuf
;;                          ,go-github-com-google-go-cmp))
;;     (home-page "https://github.com/bufbuild/connect-go")
;;     (synopsis "Connect")
;;     (description
;;      "Package connect is a slim RPC framework built on Protocol Buffers and
;; @@url{/net/http,net/http}.  In addition to supporting its own protocol, Connect
;; handlers and clients are wire-compatible with @code{gRPC} and @code{gRPC-Web},
;; including streaming.")
;;     (license license:asl2.0)))

;; (define-public go-github-com-humanlogio-api-go
;;   (package
;;     (name "go-github-com-humanlogio-api-go")
;;     (version "0.0.0-20231208063410-e088b7d026d1")
;;     (source
;;      (origin
;;        (method git-fetch)
;;        (uri (git-reference
;;              (url "https://github.com/humanlogio/api")
;;              (commit (go-version->git-ref version))))
;;        (file-name (git-file-name name version))
;;        (sha256
;;         (base32 "1xnx06ygs2bhcks9zxmhhipmlxq2cn2m6vcci4d402dkbhb1v25p"))))
;;     (build-system go-build-system)
;;     (arguments
;;      (list
;;       #:import-path "github.com/humanlogio/api/go"
;;       #:unpack-path "github.com/humanlogio/api"
;;       #:tests? #f
;;       #:phases
;;       #~(modify-phases %standard-phases
;;           (delete 'build))))
;;     (propagated-inputs `(,go-google-golang-org-protobuf
;;                          ,go-github-com-stretchr-testify
;;                          ,go-github-com-bufbuild-connect-go
;;                          ,go-github-com-blang-semver))
;;     (home-page "https://github.com/humanlogio/api")
;;     (synopsis #f)
;;     (description #f)
;;     (license #f)))

;; (define-public go-github-com-kr-logfmt
;;   (package
;;     (name "go-github-com-kr-logfmt")
;;     (version "0.0.0-20210122060352-19f9bcb100e6")
;;     (source
;;      (origin
;;        (method git-fetch)
;;        (uri (git-reference
;;              (url "https://github.com/kr/logfmt")
;;              (commit (go-version->git-ref version))))
;;        (file-name (git-file-name name version))
;;        (sha256
;;         (base32 "1l6322amgy092n30l6br0wzszf3l2a3dkylck3pzpvzr4lqfcyhb"))))
;;     (build-system go-build-system)
;;     (arguments
;;      (list
;;       #:import-path "github.com/kr/logfmt"))
;;     (home-page "https://github.com/kr/logfmt")
;;     (synopsis #f)
;;     (description "Package implements the decoding of logfmt key-value pairs.")
;;     (license license:expat)))

;; (define-public go-github-com-humanlogio-humanlog
;;   (package
;;     (name "go-github-com-humanlogio-humanlog")
;;     (version "0.7.6")
;;     (source
;;      (origin
;;        (method git-fetch)
;;        (uri (git-reference
;;              (url "https://github.com/humanlogio/humanlog")
;;              (commit (string-append "v" version))))
;;        (file-name (git-file-name name version))
;;        (sha256
;;         (base32 "14x8pfhh1dq6zqchgwdxbcx1p7iizzxpqzhlczw47skxbd706hpp"))))
;;     (build-system go-build-system)
;;     (arguments
;;      (list
;;       #:import-path "github.com/humanlogio/humanlog"))
;;     (propagated-inputs `(,go-github-com-urfave-cli
;;                          ,go-github-com-stretchr-testify
;;                          ,go-github-com-mattn-go-isatty
;;                          ,go-github-com-mattn-go-colorable
;;                          ,go-github-com-kr-logfmt
;;                          ,go-github-com-humanlogio-api-go
;;                          ,go-github-com-go-logfmt-logfmt
;;                          ,go-github-com-fatih-color
;;                          ,go-github-com-cli-safeexec
;;                          ,go-github-com-bufbuild-connect-go
;;                          ,go-github-com-blang-semver
;;                          ,go-github-com-aybabtme-rgbterm))
;;     (home-page "https://github.com/humanlogio/humanlog")
;;     (synopsis "humanlog")
;;     (description
;;      "Read logs from @@code{stdin} and prints them back to @@code{stdout}, but
;; prettier.")
;;     (license license:asl2.0)))

;; (define-public go-github-com-cloudfoundry-jibber-jabber
;;   (package
;;     (name "go-github-com-cloudfoundry-jibber-jabber")
;;     (version "0.0.0-20151120183258-bcc4c8345a21")
;;     (source
;;      (origin
;;        (method git-fetch)
;;        (uri (git-reference
;;              (url "https://github.com/cloudfoundry-attic/jibber_jabber")
;;              (commit (go-version->git-ref version))))
;;        (file-name (git-file-name name version))
;;        (sha256
;;         (base32 "0q31q03sxfwrdgbv559bgm9gr5cmyzp1al0zli9nlkwa2v9hw5fi"))))
;;     (build-system go-build-system)
;;     (arguments
;;      (list
;;       #:tests? #f
;;       #:import-path "github.com/cloudfoundry/jibber_jabber"))
;;     (home-page "https://github.com/cloudfoundry/jibber_jabber")
;;     (synopsis "Jibber Jabber")
;;     (description
;;      "Jibber Jabber is a @code{GoLang} Library that can be used to detect an operating
;; system's current language.")
;;     (license license:asl2.0)))

;; (define-public go-github-com-gdamore-tcell-v2
;;   (package
;;     (name "go-github-com-gdamore-tcell-v2")
;;     (version "2.7.4")
;;     (source
;;      (origin
;;        (method git-fetch)
;;        (uri (git-reference
;;              (url "https://github.com/gdamore/tcell")
;;              (commit (string-append "v" version))))
;;        (file-name (git-file-name name version))
;;        (sha256
;;         (base32 "05b22sgyf8lnwjddxlfvlj7i8b67gnidhbnz86vvx8fddggpa5nd"))))
;;     (build-system go-build-system)
;;     (arguments
;;      (list
;;       #:import-path "github.com/gdamore/tcell/v2"))
;;     (propagated-inputs `(,go-golang-org-x-text
;;                          ,go-golang-org-x-term
;;                          ,go-golang-org-x-sys
;;                          ,go-github-com-mattn-go-runewidth
;;                          ,go-github-com-lucasb-eyer-go-colorful
;;                          ,go-github-com-gdamore-encoding))
;;     (home-page "https://github.com/gdamore/tcell")
;;     (synopsis "Tcell")
;;     (description
;;      "Package tcell provides a lower-level, portable API for building programs that
;; interact with terminals or consoles.  It works with both common (and many
;; uncommon!) terminals or terminal emulators, and Windows console implementations.")
;;     (license license:asl2.0)))

;; (define-public go-github-com-go-errors-errors
;;   (package
;;     (name "go-github-com-go-errors-errors")
;;     (version "1.5.1")
;;     (source
;;      (origin
;;        (method git-fetch)
;;        (uri (git-reference
;;              (url "https://github.com/go-errors/errors")
;;              (commit (string-append "v" version))))
;;        (file-name (git-file-name name version))
;;        (sha256
;;         (base32 "1ydwx20al9x99xnki0srb9iy96y638inw05xx5jb16dn8rz09wib"))))
;;     (build-system go-build-system)
;;     (arguments
;;      (list
;;       #:import-path "github.com/go-errors/errors"))
;;     (home-page "https://github.com/go-errors/errors")
;;     (synopsis "go-errors/errors")
;;     (description "Package errors provides errors that have stack-traces.")
;;     (license license:expat)))

;; (define-public go-github-com-iancoleman-orderedmap
;;   (package
;;     (name "go-github-com-iancoleman-orderedmap")
;;     (version "0.3.0")
;;     (source
;;      (origin
;;        (method git-fetch)
;;        (uri (git-reference
;;              (url "https://github.com/iancoleman/orderedmap")
;;              (commit (string-append "v" version))))
;;        (file-name (git-file-name name version))
;;        (sha256
;;         (base32 "1rkahhb86ngvzjmdlrpw9rx24a0b1yshq2add1ry2ii6nkx0xbfs"))))
;;     (build-system go-build-system)
;;     (arguments
;;      (list
;;       #:import-path "github.com/iancoleman/orderedmap"))
;;     (home-page "https://github.com/iancoleman/orderedmap")
;;     (synopsis "orderedmap")
;;     (description
;;      "This package provides a golang data type equivalent to python's
;; collections.@code{OrderedDict}.")
;;     (license license:expat)))

;; (define-public go-github-com-integrii-flaggy
;;   (package
;;     (name "go-github-com-integrii-flaggy")
;;     (version "1.5.2")
;;     (source
;;      (origin
;;        (method git-fetch)
;;        (uri (git-reference
;;              (url "https://github.com/integrii/flaggy")
;;              (commit (string-append "v" version))))
;;        (file-name (git-file-name name version))
;;        (sha256
;;         (base32 "0qn55pn0c75bd4gm1fd2in0qp9fllfabwzn0qs994frd32cfz7h3"))))
;;     (build-system go-build-system)
;;     (arguments
;;      (list
;;       #:import-path "github.com/integrii/flaggy"))
;;     (propagated-inputs `(,go-github-com-google-go-cmp))
;;     (home-page "https://github.com/integrii/flaggy")
;;     (synopsis "Installation")
;;     (description
;;      "Package flaggy is a input flag parsing package that supports recursive
;; subcommands, positional values, and any-position flags without unnecessary
;; complexeties.")
;;     (license license:unlicense)))

;; (define-public go-github-com-jesseduffield-generics
;;   (package
;;     (name "go-github-com-jesseduffield-generics")
;;     (version "0.0.0-20220320043834-727e535cbe68")
;;     (source
;;      (origin
;;        (method git-fetch)
;;        (uri (git-reference
;;              (url "https://github.com/jesseduffield/generics")
;;              (commit (go-version->git-ref version))))
;;        (file-name (git-file-name name version))
;;        (sha256
;;         (base32 "182wdkvc57lnwli8wpyykd1jyywnlq1m6vx8l7pi2wwjp0msq1wx"))))
;;     (build-system go-build-system)
;;     (arguments
;;      (list
;;       #:import-path "github.com/jesseduffield/generics"
;;       #:tests? #f
;;       #:phases
;;       #~(modify-phases %standard-phases
;;           (delete 'build))))
;;     (propagated-inputs `(,go-golang-org-x-exp))
;;     (home-page "https://github.com/jesseduffield/generics")
;;     (synopsis "Generics")
;;     (description
;;      "This is a repo for some helper methods/structs that involve generics (added in
;; Go 1.18).")
;;     (license license:expat)))

;; (define-public go-github-com-armon-go-socks5
;;   (package
;;     (name "go-github-com-armon-go-socks5")
;;     (version "0.0.0-20160902184237-e75332964ef5")
;;     (source
;;      (origin
;;        (method git-fetch)
;;        (uri (git-reference
;;              (url "https://github.com/armon/go-socks5")
;;              (commit (go-version->git-ref version))))
;;        (file-name (git-file-name name version))
;;        (sha256
;;         (base32 "104w10jf0wlxyxi35hf6frndgf0ybz21h54xjmnkivpb6slycpyq"))))
;;     (build-system go-build-system)
;;     (arguments
;;      (list
;;       #:import-path "github.com/armon/go-socks5"))
;;     (propagated-inputs `(,go-golang-org-x-net))
;;     (home-page "https://github.com/armon/go-socks5")
;;     (synopsis "go-socks5")
;;     (description
;;      "This package provides the @@code{socks5} package that implements a
;; @@url{http://en.wikipedia.org/wiki/SOCKS,SOCKS5 server}.  SOCKS (Secure Sockets)
;; is used to route traffic between a client and server through an intermediate
;; proxy layer.  This can be used to bypass firewalls or NATs.")
;;     (license license:expat)))

;; (define-public go-github-com-gliderlabs-ssh
;;   (package
;;     (name "go-github-com-gliderlabs-ssh")
;;     (version "0.3.7")
;;     (source
;;      (origin
;;        (method git-fetch)
;;        (uri (git-reference
;;              (url "https://github.com/gliderlabs/ssh")
;;              (commit (string-append "v" version))))
;;        (file-name (git-file-name name version))
;;        (sha256
;;         (base32 "162r7i4lhdbxa6m5i2n1fw444ka2q8xx26l491qqik8s5cwmyzbx"))))
;;     (build-system go-build-system)
;;     (arguments
;;      (list
;;       #:import-path "github.com/gliderlabs/ssh"))
;;     (propagated-inputs `(,go-golang-org-x-crypto
;;                          ,go-github-com-anmitsu-go-shlex))
;;     (home-page "https://github.com/gliderlabs/ssh")
;;     (synopsis "gliderlabs/ssh")
;;     (description
;;      "Package ssh wraps the crypto/ssh package with a higher-level API for building
;; SSH servers.  The goal of the API was to make it as simple as using net/http, so
;; the API is very similar.")
;;     (license license:bsd-3)))

;; (define-public go-github-com-cyphar-filepath-securejoin
;;   (package
;;     (name "go-github-com-cyphar-filepath-securejoin")
;;     (version "0.3.2")
;;     (source
;;      (origin
;;        (method git-fetch)
;;        (uri (git-reference
;;              (url "https://github.com/cyphar/filepath-securejoin")
;;              (commit (string-append "v" version))))
;;        (file-name (git-file-name name version))
;;        (sha256
;;         (base32 "10clm1hfzndwhi7lwz5ph72apxwbxr3vg4nln5xsrrx26j6qv6v2"))))
;;     (build-system go-build-system)
;;     (arguments
;;      (list
;;       #:import-path "github.com/cyphar/filepath-securejoin"))
;;     (propagated-inputs `(,go-golang-org-x-sys
;;                          ,go-github-com-stretchr-testify))
;;     (home-page "https://github.com/cyphar/filepath-securejoin")
;;     (synopsis #f)
;;     (description
;;      "Package securejoin is an implementation of the hopefully-soon-to-be-included
;; @code{SecureJoin} helper that is meant to be part of the \"path/filepath\"
;; package.  The purpose of this project is to provide a @code{PoC} implementation
;; to make the @code{SecureJoin} proposal
;; (@@url{https://github.com/golang/go/issues/20126,https://github.com/golang/go/issues/20126})
;; more tangible.")
;;     (license license:bsd-3)))

;; (define-public go-github-com-go-git-go-billy-v5
;;   (package
;;     (name "go-github-com-go-git-go-billy-v5")
;;     (version "5.5.0")
;;     (source
;;      (origin
;;        (method git-fetch)
;;        (uri (git-reference
;;              (url "https://github.com/go-git/go-billy")
;;              (commit (string-append "v" version))))
;;        (file-name (git-file-name name version))
;;        (sha256
;;         (base32 "1r7hfwc6lqnb7jhbbmicdlb3yipjyazq3pndpffw026fcq7jhxg1"))))
;;     (build-system go-build-system)
;;     (arguments
;;      (list
;;       #:import-path "github.com/go-git/go-billy/v5"))
;;     (propagated-inputs `(,go-gopkg-in-check-v1
;;                          ,go-golang-org-x-sys
;;                          ,go-github-com-onsi-gomega
;;                          ,go-github-com-cyphar-filepath-securejoin))
;;     (home-page "https://github.com/go-git/go-billy")
;;     (synopsis "go-billy")
;;     (description
;;      "The missing interface filesystem abstraction for Go.  Billy implements an
;; interface based on the @@code{os} standard library, allowing to develop
;; applications without dependency on the underlying storage.  Makes it virtually
;; free to implement mocks and testing over filesystem operations.")
;;     (license license:asl2.0)))

;; (define-public go-github-com-go-git-go-git-fixtures-v4
;;   (package
;;     (name "go-github-com-go-git-go-git-fixtures-v4")
;;     (version "4.3.1")
;;     (source
;;      (origin
;;        (method git-fetch)
;;        (uri (git-reference
;;              (url "https://github.com/go-git/go-git-fixtures")
;;              (commit (string-append "v" version))))
;;        (file-name (git-file-name name version))
;;        (sha256
;;         (base32 "1d6qs2mzbhz95aflpjh6ijywvb4ys73jvk2v30mickax3gmm2vlw"))))
;;     (build-system go-build-system)
;;     (arguments
;;      (list
;;       #:import-path "github.com/go-git/go-git-fixtures/v4"))
;;     (propagated-inputs `(,go-gopkg-in-check-v1
;;                          ,go-github-com-stretchr-testify
;;                          ,go-github-com-go-git-go-billy-v5))
;;     (home-page "https://github.com/go-git/go-git-fixtures")
;;     (synopsis "go-git-fixtures")
;;     (description
;;      "git repository fixtures used by @@url{https://github.com/go-git/go-git,go-git}.")
;;     (license license:asl2.0)))

;; (define-public go-github-com-jesseduffield-go-git-v5
;;   (package
;;     (name "go-github-com-jesseduffield-go-git-v5")
;;     (version "5.1.1")
;;     (source
;;      (origin
;;        (method git-fetch)
;;        (uri (git-reference
;;              (url "https://github.com/jesseduffield/go-git")
;;              (commit (string-append "v" version))))
;;        (file-name (git-file-name name version))
;;        (sha256
;;         (base32 "0ks3x4qbjcg4nqgc3zg8l6b71mkg6xgs9s0rldbxrkbrf3sh36ar"))))
;;     (build-system go-build-system)
;;     (arguments
;;      (list
;;       #:import-path "github.com/jesseduffield/go-git/v5"
;;       #:tests? #f))
;;     (propagated-inputs `(,go-gopkg-in-check-v1
;;                          ,go-golang-org-x-text
;;                          ,go-golang-org-x-net
;;                          ,go-golang-org-x-crypto
;;                          ,go-github-com-xanzy-ssh-agent
;;                          ,go-github-com-sergi-go-diff
;;                          ,go-github-com-mitchellh-go-homedir
;;                          ,go-github-com-kevinburke-ssh-config
;;                          ,go-github-com-jessevdk-go-flags
;;                          ,go-github-com-jbenet-go-context
;;                          ,go-github-com-imdario-mergo
;;                          ,go-github-com-google-go-cmp
;;                          ,go-github-com-go-git-go-git-fixtures-v4
;;                          ,go-github-com-go-git-go-billy-v5
;;                          ,go-github-com-go-git-gcfg
;;                          ,go-github-com-gliderlabs-ssh
;;                          ,go-github-com-emirpasic-gods
;;                          ,go-github-com-armon-go-socks5
;;                          ,go-gopkg-in-warnings))
;;     (home-page "https://github.com/jesseduffield/go-git")
;;     (synopsis "Project Status")
;;     (description
;;      "This package provides a highly extensible git implementation in pure Go.")
;;     (license license:asl2.0)))

;; (define-public go-github-com-jesseduffield-lazycore
;;   (package
;;     (name "go-github-com-jesseduffield-lazycore")
;;     (version "0.0.0-20221023210126-718a4caea996")
;;     (source
;;      (origin
;;        (method git-fetch)
;;        (uri (git-reference
;;              (url "https://github.com/jesseduffield/lazycore")
;;              (commit (go-version->git-ref version))))
;;        (file-name (git-file-name name version))
;;        (sha256
;;         (base32 "05x45q86yf033npddc4bk110j9p1l3qikgjilsqb4wjd3mxfrh52"))))
;;     (build-system go-build-system)
;;     (arguments
;;      (list
;;       #:import-path "github.com/jesseduffield/lazycore"
;;       #:tests? #f
;;       #:phases
;;       #~(modify-phases %standard-phases
;;           ;; Source only package.
;;           (delete 'build))))
;;     (propagated-inputs `(,go-github-com-stretchr-testify
;;                          ,go-github-com-samber-lo))
;;     (home-page "https://github.com/jesseduffield/lazycore")
;;     (synopsis "lazycore")
;;     (description "Shared functionality for lazygit, lazydocker, etc.")
;;     (license license:expat)))

;; (define-public go-github-com-jesseduffield-lazygit
;;   (package
;;     (name "go-github-com-jesseduffield-lazygit")
;;     (version "0.44.1")
;;     (source
;;      (origin
;;        (method git-fetch)
;;        (uri (git-reference
;;              (url "https://github.com/jesseduffield/lazygit")
;;              (commit (string-append "v" version))))
;;        (file-name (git-file-name name version))
;;        (sha256
;;         (base32 "0p9w00rnhdmig3qkv1j4sm7izy6ljxkas0s6p75v3w3a0hr4zzh4"))))
;;     (build-system go-build-system)
;;     (arguments
;;      (list
;;       #:import-path "github.com/jesseduffield/lazygit"))
;;     (propagated-inputs `(,go-gopkg-in-yaml-v3
;;                          ,go-gopkg-in-ozeidan-fuzzy-patricia-v3
;;                          ,go-golang-org-x-sync
;;                          ,go-golang-org-x-exp
;;                          ,go-github-com-xo-terminfo
;;                          ,go-github-com-stretchr-testify
;;                          ,go-github-com-stefanhaller-git-todo-parser
;;                          ,go-github-com-spkg-bom
;;                          ,go-github-com-spf13-afero
;;                          ,go-github-com-sirupsen-logrus
;;                          ,go-github-com-sasha-s-go-deadlock
;;                          ,go-github-com-sanity-io-litter
;;                          ,go-github-com-samber-lo
;;                          ,go-github-com-sahilm-fuzzy
;;                          ,go-github-com-mitchellh-go-ps
;;                          ,go-github-com-mgutz-str
;;                          ,go-github-com-mattn-go-runewidth
;;                          ,go-github-com-lucasb-eyer-go-colorful
;;                          ,go-github-com-kyokomi-emoji-v2
;;                          ,go-github-com-karimkhaleel-jsonschema
;;                          ,go-github-com-kardianos-osext
;;                          ,go-github-com-jesseduffield-minimal-gitignore
;;                          ,go-github-com-jesseduffield-lazycore
;;                          ,go-github-com-jesseduffield-kill
;;                          ,go-github-com-jesseduffield-gocui
;;                          ,go-github-com-jesseduffield-go-git-v5
;;                          ,go-github-com-jesseduffield-generics
;;                          ,go-github-com-integrii-flaggy
;;                          ,go-github-com-imdario-mergo
;;                          ,go-github-com-iancoleman-orderedmap
;;                          ,go-github-com-gookit-color
;;                          ,go-github-com-go-errors-errors
;;                          ,go-github-com-gdamore-tcell-v2
;;                          ,go-github-com-creack-pty
;;                          ,go-github-com-cloudfoundry-jibber-jabber
;;                          ,go-github-com-humanlogio-humanlog
;;                          ,go-github-com-atotto-clipboard
;;                          ,go-github-com-adrg-xdg))
;;     (home-page "https://github.com/jesseduffield/lazygit")
;;     (synopsis "simple terminal UI for git commands")
;;     (description "")
;;     (license license:expat)))
