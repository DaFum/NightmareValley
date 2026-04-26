# AGENTS — `src/pixi/layers`

This file applies to everything under `src/pixi/layers/**`.

## Intent

Keep layer rendering predictable in Pixi v7+, with explicit draw intent and low per-frame overhead.

## Required local rules

- Prefer `eventMode` and avoid deprecated interactive APIs (no `.interactive = true`, no `renderer.plugins.interaction`).
- When filling repeated tile shapes, ensure each shape is a closed path (e.g., `drawPolygon([...])`) to avoid fill artifacts.
- Minimize state changes in draw callbacks (`beginFill`, `lineStyle`, etc.) by batching where possible.
- Keep layer z-index semantics stable; if changed, document visible impact.
- **Do not define local tile-size constants.** Import `ISO_TILE_WIDTH`, `ISO_TILE_HEIGHT`, and `HALF_TILE_HEIGHT` from `src/game/iso/iso.constants.ts`. Never introduce `GHOST_TILE_WIDTH`, `GHOST_TILE_HEIGHT`, or similar local duplicates.
- **Log missing textures.** Call `console.warn` when an expected texture is absent rather than silently skipping or rendering nothing. The 1×1 fallback texture from the loader must not hide failures silently.

## Ghost placement layer (`IsoGhostPlacementLayer`)

- Validity is computed externally in `GameStage.isGhostValid` (not inside the layer itself).
- Ghost is valid only when ALL of: tile exists, no `buildingId`, `tile.ownerId === player1Id`, terrain allowed.
- `player1Id` is exported from `src/store/game.store.ts` — import it; never hardcode `"player_1"` or similar.
- Use `GHOST_Z_INDEX_BIAS = 1000` for ghost sprite z-ordering to ensure it renders above the building layer.
- `y` anchor offset must use `HALF_TILE_HEIGHT` from `iso.constants.ts`, not a bare `16`.

## Performance notes

- Draw functions run frequently; avoid allocations inside deep loops when easy to avoid.
- Group by bucket/color/alpha when possible to reduce draw calls.
- Do not call pathfinding or expensive scoring inside render/update loops — precompute in game logic.

## Layer-edit checklist

- Confirm layer ordering (`zIndex`, render order) still matches intended visual stacking.
- Verify pointer interaction scope is minimal (only interactive display objects get `eventMode`).
- Use shared constants from `iso.constants.ts` for tile geometry/depth — never hardcode numbers.
- If adding debug visuals, ensure they can be toggled via `debug.store.ts` flags and do not run expensive logic in production paths.
- Ghost placement: ownership check (`tile.ownerId === player1Id`) must be present in `isGhostValid`.

## Validation

- For visual logic updates, verify in dev (`npm run dev`) and include a screenshot when tooling is available.
- For logic-only layer changes, run related tests plus `npm run build:vite`.
