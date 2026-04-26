# AGENTS — Guidance for AI coding assistants

Purpose: provide concise, actionable guidance to an AI agent working in this repository.

## Quick start

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
npx jest --runInBand src/tests/core/transport.logic.test.ts
```

## Playwright screenshots (quick usage)

- Install browser deps if needed: `npx playwright install chromium` (and on fresh Linux environments, `npx playwright install-deps chromium`).
- Start the app locally on the expected host/port: `npm run dev -- --host 127.0.0.1 --port 4173 --strictPort`.
- Use the dev server on **port 4173** (not `npm run preview`): the heatmap screenshot depends on development-only UI/flags.
- Capture screenshots with: `npm run screenshot:playwright`.
- Output files are written to `screenshots/`.

## High-signal workflow for agents

1. **Read before editing:** open `README.md`, `Architektur.md`, and the nearest nested `AGENTS.md`.
2. **Change narrowly:** prefer small, isolated edits over broad refactors.
3. **Validate appropriately:**
   - logic changes: `npm test -- --runInBand`
   - rendering/asset changes: `npm run build:vite` (+ dev sanity check)
4. **Report clearly:** include exact commands run, outcomes, and any known limitations.

## What the agent should know

- **Stack:** React + TypeScript + Vite; rendering uses Pixi.js via `@pixi/react`.
- **Key areas:** `src/pixi` (render, stage, textures), `src/game` (game logic & AI), `src/assets/spritesheets` (images + `manifest.json`), `src/store` (zustand stores), `lib` (utilities).
- **Asset loading:** spritesheets are resolved by `src/pixi/utils/vite-asset-loader.ts` (uses `import.meta.glob(..., ?url)`) and registered by `src/pixi/utils/spritesheetLoader.ts`. When changing assets, update `src/assets/spritesheets` and the manifest; ensure files are discoverable by Vite.
- **Update & verify manifest:** after adding or renaming sprites, update `src/assets/spritesheets/manifest.json` and run the manifest tests `tests/manifest/manifest_files_exist.test.ts`.
- **CI checks for assets:** include `npm test` and `npm run build:vite` in CI so Vite can validate that assets are resolvable during the build step.
- **Texture handling:** `src/pixi/utils/textureRegistry.ts` wraps the loader and exposes `useTextures()`; the loader adds a 1×1 fallback texture on load error — do not let failures go silent; `console.warn` when a texture is missing.
- **Pixi conventions:** prefer `eventMode` (over `interactive`) and `renderer.events` (over `renderer.plugins.interaction`) for Pixi v7+ compatibility.
- **Global error handling:** `src/main.tsx` installs `unhandledrejection` and `error` listeners for debugging; include concise reproduction steps in PRs if making runtime changes.

## Economy system (Settlers 2-style warehouse model)

The economy uses a warehouse-first logistics model. Read this before touching any economy, transport, UI affordability, or ghost-placement code.

### Vault as authoritative storage

- `vaultOfDigestiveStone` buildings hold the player's resources in their `outputBuffer`.
- `player.stock` is a **derived read-only view** synced by `syncStockFromVaults()`, which runs at the end of every `simulateTick` and immediately after `placeBuilding`/`upgradeBuilding` in `game.store.ts`.
- **Never read `player.stock` for affordability decisions.** Aggregate vault `outputBuffer`s directly (see `BuildingMenu.tsx`, `BuildingInspector.tsx`).

### Affordability API

- `canAffordBuilding(inventory: ResourceInventory, buildingType)` — accepts a `ResourceInventory`, not a `PlayerState`.
- `canAffordUpgrade(inventory: ResourceInventory, building)` — same; accepts `ResourceInventory` directly.
- Callers must compute `inventory` by aggregating vault outputBuffers before calling these functions.

### Transport routing invariants

- Production output → nearest vault (preferred). Vault → production buildings needing the resource.
- Full vaults (`getBuildingResourceNeed == 0`) are excluded from preferred targets; falls back to direct production-to-production delivery.
- **Vault → vault routing is forbidden.** `findTargetBuildingsForResource` enforces this.
- Delivery priority (1–5, default 3) and per-resource `pausedInputs` are respected; hidden in UI for vaults.

### player1Id

- `player1Id` is exported from `src/store/game.store.ts`.
- Used in ghost placement validity (`tile.ownerId === player1Id`) and WarehousePanel ownership filtering.
- Import it from `game.store.ts`, never hardcode a player ID string.

### Buffer limits

| Buffer | Limit |
|--------|-------|
| Production building inputBuffer | 4 units |
| Production building outputBuffer | 6 units |
| Vault outputBuffer (warehouseStorageLimit) | 9999 units |

## CSS / Styling

Economy/warehouse UI colors are defined as CSS custom properties in `src/styles/ui.css` under `:root`:
- `--econ-success` (#7ee787), `--econ-warn` (#f0a500), `--econ-idle` (#8b949e)
- `--econ-success-bg/border`, `--econ-warn-bg/border`, `--econ-idle-bg/border`
- `--econ-buffer-in` (#4d9de0), `--econ-stone` (#b7b1a5)

Do not add hardcoded hex colors to economy/warehouse panels — extend the custom property set instead.
Layout dock: `.game-layout__bottom-dock` (flex column, 0.5rem gap, flex-start) — do not use inline styles for this slot.

## Ghost placement validity

`IsoGhostPlacementLayer` renders a preview when a building type is selected. Validity is computed in `GameStage.isGhostValid` via `useMemo`. A tile is valid only if ALL of:
1. Tile exists in territory
2. `tile.buildingId` is absent
3. `tile.ownerId === player1Id`
4. Terrain type is allowed

Never omit the ownership check — it prevents a misleading green ghost on unowned tiles.
Use `ISO_TILE_WIDTH` / `ISO_TILE_HEIGHT` / `HALF_TILE_HEIGHT` from `iso.constants.ts` — do not define local tile-size constants.

## Files to inspect first

- [README.md](README.md)
- [Architektur.md](Architektur.md)
- [src/main.tsx](src/main.tsx)
- [src/store/game.store.ts](src/store/game.store.ts)
- [src/pixi/GameStage.tsx](src/pixi/GameStage.tsx)
- [src/pixi/PixiAppProvider.tsx](src/pixi/PixiAppProvider.tsx)
- [src/pixi/utils/spritesheetLoader.ts](src/pixi/utils/spritesheetLoader.ts)
- [src/pixi/utils/textureRegistry.ts](src/pixi/utils/textureRegistry.ts)
- [src/assets/spritesheets/manifest.json](src/assets/spritesheets/manifest.json)

## Agent customization files

- Nested AGENTS files are used for high-churn folders (economy logic, Pixi layers, and core tests). When editing under those folders, read the closest `AGENTS.md` first and treat it as the authoritative local contract.

## Scope map for nested AGENTS

- `src/game/economy/AGENTS.md` — economy simulation, transport, balancing, stockpile, delivery controls
- `src/pixi/layers/AGENTS.md` — visual layer components, ghost placement, overlay rendering
- `src/tests/core/AGENTS.md` — core simulation tests, regression test patterns

## Common pitfalls to avoid

- Running screenshot capture against `npm run preview` instead of dev server port 4173.
- Using `npm install` instead of `npm ci` — always use `ci` for reproducible installs.
- Reading `player.stock` for affordability — it is a stale derived view; aggregate vault outputBuffers directly.
- Adding vault-to-vault transport routes — creates circular transport loops.
- Redefining `GHOST_TILE_WIDTH`/`GHOST_TILE_HEIGHT` locally — use `ISO_TILE_WIDTH`/`ISO_TILE_HEIGHT` from `iso.constants.ts`.
- Skipping the `Number.isFinite` guard in `setDeliveryPriority` — `Math.max(1, Math.min(5, NaN))` silently returns `NaN`.
- Calling full A* pathfinding inside `.sort()` comparators — use Manhattan distance heuristics.
- Omitting the ownership check (`tile.ownerId === player1Id`) from ghost placement validity.
- Hardcoding player IDs as strings — import `player1Id` from `game.store.ts`.
- Leaving generated screenshots tracked in git.

## When to open an issue

- Missing assets referenced by `manifest.json`.
- Repeated runtime `Unhandled promise rejection` originating from the texture loader.
- Broad refactors touching rendering or game loop — discuss via issue before implementation.
