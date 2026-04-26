# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Commands

```bash
npm ci               # Install dependencies (use ci, not install)
npm run dev          # Vite dev server (HMR, port 5173)
npm test             # Jest unit tests
npm run build        # TypeScript compilation (tsc)
npm run build:vite   # Vite production bundle
npm run preview      # Preview the Vite build locally
```

Requires Node 18+. There is no configured linter.

To run a single test file:
```bash
npx jest src/tests/core/transport.logic.test.ts --runInBand
```

## Architecture

NightmareValley is an isometric economy simulation game. The codebase has three cleanly separated layers:

### 1. Game Simulation (`src/game/`)
Pure TypeScript — no React, no Pixi. Contains:
- `core/` — tick orchestration, building placement, type definitions, recipe/cost data, entity IDs
- `world/` — world state creation, world tick, world metrics, world generator
- `map/` — terrain, occupancy grid, chunk system, territory management, Tiled map loading
- `iso/` — isometric projection math (screen↔world coordinate transforms, depth sorting, hit testing)
- `economy/` — production chains, stockpiles, resource flow, transport jobs, delivery controls, balancing constants
- `pathing/` — A* pathfinding, flowfields, path caching
- `entities/` — building, worker, road logic
- `ai/` — expansion, economy, military decision-making
- `events/` — random events and disasters

### 2. Rendering (`src/pixi/`)
Pixi.js v7 via `@pixi/react`. Reads from Zustand stores and renders game state each frame:
- `GameCanvas.tsx` / `GameStage.tsx` — Pixi app init and render tree root
- `PixiAppProvider.tsx` — texture loading and Pixi context
- `layers/` — layered rendering: terrain → buildings → workers → overlays → debug
- `hooks/` — game loop, camera, pointer input, selection
- `systems/` — texture, animation, culling, depth sorting
- `utils/` — asset loading infrastructure (see Asset Loading below)

### 3. UI (`src/ui/`)
React components for HUD, panels, and dialogs — reads from Zustand stores.

### State Management (`src/store/`)
Seven Zustand stores with clear ownership:
- `game.store.ts` — world state, simulation tick, building/worker operations; exports `player1Id`
- `camera.store.ts` — pan/zoom
- `selection.store.ts` — hover, selected entity, placement mode
- `ui.store.ts` — open panels, dialogs, `selectedBuildingToPlace`
- `render.store.ts` — render cache, visible tile/building/worker counts, LOD level
- `debug.store.ts` — debug flags, loop stats
- `runtime-issue.ts` — error serialization helper (not a store, used by `game.store`)

**Data flow:** User input → selection/game stores → simulation tick → store update → Pixi re-render with interpolation.

## Economy System (Settlers 2-style Warehouse Model)

The economy is built on a warehouse-first logistics model. Understanding this is critical before touching any economy, transport, or UI code.

### Vault as Authoritative Storage
- `vaultOfDigestiveStone` buildings hold the player's resources in their `outputBuffer`.
- `player.stock` is a **derived read-only view** — it is synced from all vault `outputBuffer`s by `syncStockFromVaults()`, which runs at the end of every `simulateTick` and immediately after `placeBuilding`/`upgradeBuilding` in the store.
- **Never deduct from or read `player.stock` for affordability checks.** Use vault `outputBuffer`s directly, or the pre-aggregated inventory computed in the UI (see BuildingMenu, BuildingInspector).

### Buffer Limits (from `balancing.constants.ts`)
| Buffer | Limit |
|--------|-------|
| Production building inputBuffer | 4 units |
| Production building outputBuffer | 6 units |
| Vault outputBuffer (warehouseStorageLimit) | 9999 units |

### Transport Routing (warehouse-first)
- Production buildings deliver output → nearest vault (preferred).
- Vault distributes → production buildings that need the resource (preferred).
- Full vaults (need = 0) are excluded from preferred targets; production falls back to direct delivery.
- Vault → vault routing is never allowed (prevents circular transport).
- `deliveryPriority` (1–5, default 3) and `pausedInputs` (per-resource) are respected by transport.
- Delivery priority is hidden in the UI for vault buildings (they always have fixed +15 priority bonus).

### Key functions
- `syncStockFromVaults(state)` — aggregates all vault outputBuffers into player.stock
- `findTargetBuildingsForResource(state, source, resource, config)` — warehouse-first sorted target list
- `buildingAcceptsResource(building, resource)` — checks pausedInputs + recipe/vault acceptance
- `getBuildingResourceNeed(building, resource, config)` — returns remaining capacity
- `canAffordBuilding(inventory, type)` — checks ResourceInventory against build cost
- `canAffordUpgrade(inventory, building)` — checks ResourceInventory against upgrade cost

### Delivery Controls (BuildingInstance)
```typescript
deliveryPriority?: number   // 1–5, default 3; clamped+validated in setDeliveryPriority
pausedInputs?: Partial<Record<ResourceType, boolean>>  // suspend per-resource delivery
```
- `setDeliveryPriority(buildingId, priority)` — validates `Number.isFinite`, clamps to 1–5
- `togglePausedInput(buildingId, resourceType)` — toggles per-resource pause
- Vault buildings never show delivery controls in the UI (`DeliveryControlsSection` returns `null` for vaults)

## Ghost Placement

Ghost building preview is rendered by `IsoGhostPlacementLayer` when a building type is selected:
- Validity is computed in `GameStage.isGhostValid` via `useMemo`
- Valid tile criteria: `tile exists AND no buildingId AND tile.ownerId === player1Id AND terrain allowed`
- `player1Id` is exported from `game.store.ts`
- Uses `ISO_TILE_WIDTH` / `ISO_TILE_HEIGHT` / `HALF_TILE_HEIGHT` from `iso.constants.ts` — do not redefine local tile dimensions

## Asset Loading (Required Rules)

Assets are loaded through a specific pipeline — do not bypass it:

1. **Discovery:** `src/pixi/utils/vite-asset-loader.ts` uses `import.meta.glob(..., { as: 'url' })` to make files resolvable by Vite.
2. **Registration:** `src/pixi/utils/spritesheetLoader.ts` registers spritesheets with Pixi's loader.
3. **Manifest:** `src/assets/spritesheets/manifest.json` is the source of truth for all sprite metadata.
4. **Access:** Always use `src/pixi/utils/textureRegistry.ts` and the `useTextures()` hook to access textures — never load textures directly.

When adding or renaming any asset:
- Update `manifest.json`
- Verify the file is reachable by `import.meta.glob` (i.e., under `src/assets/`)
- Run `npm test` (manifest test) and `npm run build:vite` (Vite resolution check)

The loader inserts a 1×1 fallback texture on error — do not let loader failures go silent. Surface errors in the console and document them.

## Pixi v7 Conventions

- Use `eventMode="static"` (or other valid values) instead of the deprecated `.interactive = true`
- Use `renderer.events` instead of `renderer.plugins.interaction`
- When searching for deprecation issues: grep for `.interactive`, `renderer.plugins.interaction`

## CSS / Styling

- Economy/warehouse UI colors are defined as CSS custom properties in `src/styles/ui.css` under `:root`:
  - `--econ-success` (#7ee787), `--econ-warn` (#f0a500), `--econ-idle` (#8b949e)
  - `--econ-success-bg/border`, `--econ-warn-bg/border`, `--econ-idle-bg/border`
  - `--econ-buffer-in` (#4d9de0), `--econ-stone` (#b7b1a5)
- Do not add new hardcoded hex colors to economy/warehouse panels — extend the custom property set instead.
- Layout dock class: `.game-layout__bottom-dock` (flex column, 0.5rem gap, flex-start) — do not use inline styles for this slot.

## Testing

Tests live in both `src/tests/` and `tests/` (root). Key suites:

| File | What it tests |
|------|--------------|
| `tests/manifest/manifest_files_exist.test.ts` | Every manifest entry has a real asset file |
| `tests/app/app.smoke.test.ts` | React component smoke tests |
| `tests/pixi/textureRegistry.test.ts` | Texture loader |
| `tests/compile/tsc.test.ts` | TypeScript compilation |
| `src/tests/core/economy.simulation.test.ts` | placeBuilding/upgradeBuilding vault deduction, syncStockFromVaults |
| `src/tests/core/transport.logic.test.ts` | Routing (vault-first, full-vault fallback, no vault-to-vault), distance tiebreaker, job batching |
| `src/tests/core/transport.movement.test.ts` | Carrier movement, speed tiers, arrival detection |
| `src/tests/core/building.placement.test.ts` | Tile validation, ownership, terrain |
| `src/tests/core/footfall.test.ts` | Footfall decay and tier thresholds |
| `src/tests/core/pathfinding.test.ts` | A* correctness |

When writing tests that touch asset loading, mock `vite-asset-loader` (it uses Vite-only APIs not available in Jest).

### Test command shortcuts
```bash
npx jest --runInBand                                               # Full suite
npx jest --runInBand src/tests/core/transport.logic.test.ts       # Transport logic only
npx jest --runInBand src/tests/core/economy.simulation.test.ts    # Economy simulation only
```

## Common Pitfalls

- Do **not** use `player.stock` for affordability checks — aggregate vault `outputBuffer`s instead.
- Do **not** add vault-to-vault transport routes — this creates circular transport.
- Do **not** redefine `GHOST_TILE_WIDTH`/`GHOST_TILE_HEIGHT` locally — use `ISO_TILE_WIDTH`/`ISO_TILE_HEIGHT` from `iso.constants.ts`.
- Do **not** skip the `Number.isFinite` guard in `setDeliveryPriority` — `Math.max(1, Math.min(5, NaN))` returns NaN.
- Do **not** call full A* pathfinding inside `.sort()` comparators — use Manhattan distance heuristics.
- Do **not** omit the ownership check (`tile.ownerId === player1Id`) from ghost placement validity.
- Running screenshot capture against `npm run preview` instead of dev server port 4173.
- Leaving generated screenshots tracked in git.
