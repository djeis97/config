{
  description = "My odds and ends nix packages";

  inputs = {
    nixpkgs.url = "github:nixos/nixpkgs?ref=nixos-unstable";
    flake-utils.url = "github:numtide/flake-utils";
  };

  outputs = { self, nixpkgs }: {

    #   packages.x86-64.cockatrice = nixpkgs.

  };
}
