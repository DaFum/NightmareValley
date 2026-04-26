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

## Playwright screenshots

Two scripts exist under `scripts/`:

| Script | npm alias | What it captures |
|--------|-----------|-----------------|
| `scripts/playwright-screenshots.mjs` | `npm run screenshot:playwright` | `game-overview.png`, `game-footfall-heatmap.png` (dev only), `debug-route.png` (dev only) |
| `scripts/screenshot-map.mjs` | _(run directly)_ | `map-overview.png`, `map-zoomed.png` |

Output is written to `screenshots/` (gitignored — do **not** commit generated screenshots).

### Step-by-step

```bash
# 1 — Install browser binaries (first time or after playwright version bump)
npx playwright install chromium
npx playwright install-deps chromium   # Linux only: system libs for Chromium

# 2a — Basic screenshots (map + UI, no debug panels)
npm run build:vite        # build production bundle
npm run preview &         # serves on http://127.0.0.1:4173
npm run screenshot:playwright

# 2b — Full screenshots including heatmap and /debug route (requires __DEV__=true)
npm run dev &             # serves on http://127.0.0.1:5173 — edit PORT in the script if needed
node scripts/playwright-screenshots.mjs
```

### What the scripts capture

The game renders in two layers that must both appear in the screenshot:

1. **Pixi canvas** — the isometric map drawn via WebGL (`<canvas>` element)
2. **React UI overlays** — HUD, resource bar, panels, buttons (regular HTML on top of the canvas)

`canvas.toDataURL()` only reads the WebGL framebuffer — it misses all React UI. `page.screenshot()` captures both, but hangs in headless Chrome because the game's `requestAnimationFrame` loop keeps the main thread continuously busy. The scripts therefore use a direct CDP call:

```js
const client = await page.context().newCDPSession(page);
const { data } = await client.send('Page.captureScreenshot', {
  format: 'png', fromSurface: true, captureBeyondViewport: false,
});
```

This bypasses Playwright's internal wait logic and returns immediately.

### Required Chromium flags

```
--no-sandbox             # required in most CI / container environments
--disable-dev-shm-usage  # prevents crashes when /dev/shm is small (Docker default)
--disable-gpu            # avoids GPU compositor hangs in headless mode
--disable-web-security   # allows cross-origin canvas reads if needed
--ignore-certificate-errors
```

**Do not use `--use-gl=swiftshader`** — it causes the CDP screenshot pipeline to hang indefinitely.

`preserveDrawingBuffer` on the Pixi Stage is only required for `canvas.toDataURL()`. The CDP approach does not need it, so the `?preserve-canvas` query param is no longer added to the URL.

### DEV-gated features

These features only render when the app is served with `__DEV__ = true` (the Vite dev server):

| Feature | Guard | Required for |
|---------|-------|--------------|
| `DebugLogisticsPanel` (footfall heatmap toggle) | `IS_DEV = __DEV__` in `GameLayout.tsx` | `game-footfall-heatmap.png` |
| `/debug` route | `DEBUG_ROUTE_ENABLED = __DEV__` in `App.tsx` | `debug-route.png` |

When running against the production preview (`npm run preview`), the scripts skip these screenshots with a console warning rather than failing.

### Common failure modes

| Symptom | Cause | Fix |
|---------|-------|-----|
| `page.screenshot: Timeout 30000ms exceeded` | Game RAF loop keeps CDP busy | Use `Page.captureScreenshot` via CDP session (already done) |
| `page.waitForFunction Timeout` for canvas | Missing `--no-sandbox` / `--disable-dev-shm-usage`; Pixi WebGL init failed | Add flags; check `[page error]` lines in output |
| Canvas present but shows only dark background | `--use-gl=swiftshader` caused GPU hang before first paint | Remove `--use-gl=swiftshader` |
| Heatmap / debug screenshots skipped | Running against `npm run preview` (production, `__DEV__=false`) | Run against `npm run dev` on port 5173 |
| Screenshots show only the canvas, no UI panels | Old `captureCanvasToFile` using `canvas.toDataURL()` | Use the CDP approach — `page.screenshot()` or direct CDP capture |
| `net::ERR_CERT_AUTHORITY_INVALID` in console | Self-signed cert | Already handled by `--ignore-certificate-errors` and `--disable-web-security` |

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

- Using `canvas.toDataURL()` for screenshots — misses React UI overlays; use the CDP session approach in `scripts/playwright-screenshots.mjs`.
- Using `page.screenshot()` in screenshot scripts — the game RAF loop causes a 30 s timeout; use `Page.captureScreenshot` via CDP session.
- Adding `--use-gl=swiftshader` to Chromium launch args — hangs the CDP screenshot pipeline; use `--disable-gpu` + `--disable-dev-shm-usage` instead.
- Capturing heatmap/debug screenshots against `npm run preview` — those panels require `__DEV__=true`; run against `npm run dev` (port 5173).
- Leaving generated screenshots tracked in git — `screenshots/` is gitignored.
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
