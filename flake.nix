{
  description = "A Nix-flake-based Node.js development environment";

  inputs = {
    nixpkgs.url = "github:NixOS/nixpkgs/master";
    flake-utils.url = "github:numtide/flake-utils";
  };

  outputs =
    { self
    , nixpkgs
    , flake-utils
    }:

    flake-utils.lib.eachDefaultSystem (system:
    let
      overlays = [
        (self: super: rec {
          nodejs = super.nodejs_20;
        })
      ];
      pkgs = import nixpkgs { inherit overlays system; };
    in
    {
      devShell = pkgs.mkShell {
        packages = with pkgs; [ nodejs gh ];

        shellHook = ''
          echo "node `${pkgs.nodejs}/bin/node --version`"
        '';
      };
    });
}
