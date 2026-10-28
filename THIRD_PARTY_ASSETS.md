# Asset sources

Pokémon species data and normal/shiny front/back sprites are imported from PokéAPI
and its sprite repository. Pokémon characters and original game art belong to
Nintendo / Game Freak / The Pokémon Company.

The small PNG effects in `public/assets/fx/` are sourced from Pokémon Showdown's
public effect directory: https://play.pokemonshowdown.com/fx/. The exact source URLs
and SHA-256 hashes are recorded in `public/assets/fx/sources.json` and can be
refreshed with `npm run import:effects`. Credit to Pokémon Showdown and its artists.
No Showdown client animation code is bundled; the React/SVG/CSS animation code in
this project was written for Verdant.

Reference sources:
- PokéAPI move and sprite schema: https://pokeapi.co/docs/v2/
- Pokémon Showdown effect directory: https://play.pokemonshowdown.com/fx/
- Upstream client and notices: https://github.com/smogon/pokemon-showdown-client
- Upstream sprite ownership notice: https://github.com/smogon/sprites#license

This records provenance for the local fan-game prototype. Asset ownership and
permissions are separate from the licenses of the respective software projects;
public availability does not grant a general redistribution license.

## Pixelify Sans

The current game lettering uses the variable Pixelify Sans font from
https://github.com/google/fonts/tree/main/ofl/pixelifysans, under SIL Open Font
License 1.1. The font, complete license and source record are bundled in
`public/fonts/`. No remote font service is used during play.

## Item sprites

Potion, HP Up, Poké Ball, berries, revive and charm illustrations are cached from
https://github.com/PokeAPI/sprites/tree/master/sprites/items. The exact source URLs
and SHA-256 hashes are recorded in `public/assets/items/sources.json`.
Run `npm run import:items` to refresh the cached assets. These are the existing
Pokémon item illustrations, not newly generated artwork.
