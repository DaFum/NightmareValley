# AGENTS — `src/game/map`

Applies to `src/game/map/**`.

This layer bridges tiled/procedural map data into runtime world state.

## Local gotchas

- Keep generator/loader output deterministic for explicit seeds to preserve replayability and test stability.
- Prefer canonical math helpers from `src/lib` for bounds/clamping instead of repeating inline formulas.
- Preserve map contract fields (`width`, `height`, `tilewidth`, `tileheight`, `layers`, `tilesets`) when evolving loader or generator logic.
