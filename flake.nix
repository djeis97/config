{
  description = "My odds and ends nix packages";

  inputs = {
    nixpkgs.url = "github:nixos/nixpkgs?ref=nixos-unstable";
    flake-utils.url = "github:numtide/flake-utils";
  };

  outputs = { self, nixpkgs, flake-utils }: 
    flake-utils.lib.eachDefaultSystem (
      localSystem:
      let pkgs = nixpkgs.legacyPackages.${localSystem};
      in {
        packages.cockatrice = pkgs.callPackage ({cockatrice, fetchFromGitHub}:
          let version = "2026-02-22-Release-2.10.3";
          in
            cockatrice.overrideAttrs {
              inherit version;
              src = fetchFromGitHub {
                owner = "Cockatrice";
                repo = "Cockatrice";
                rev = version;
                sha256 = "sha256-GQVdn6vUW0B9vSk7ZvSDqMNhLNe86C+/gE1n6wfQIMw=";
              };
            }) {};
      }
    )

;
}
