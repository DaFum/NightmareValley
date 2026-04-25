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
npx jest tests/manifest/manifest_files_exist.test.ts
```

## Architecture

NightmareValley is an isometric economy simulation game. The codebase has three cleanly separated layers:

### 1. Game Simulation (`src/game/`)
Pure TypeScript — no React, no Pixi. Contains:
- `core/` — tick orchestration, building placement, type definitions, recipe/cost data
- `world/` — world state creation and structure
- `map/` — terrain, occupancy grid, Tiled map loading
- `iso/` — isometric projection math (screen↔world coordinate transforms, depth sorting)
- `economy/` — production chains, stockpiles, resource flow
- `pathing/` — A* and flowfields
- `entities/` — building, worker, road logic
- `transport/` — carrier job system
- `ai/` — expansion and economy decision-making
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
Six Zustand stores with clear ownership:
- `game.store.ts` — world state, simulation tick, building/worker operations
- `camera.store.ts` — pan/zoom
- `selection.store.ts` — hover, selected entity, placement mode
- `ui.store.ts` — open panels, dialogs
- `render.store.ts` — render cache
- `debug.store.ts` — debug flags

**Data flow:** User input → selection/game stores → simulation tick → store update → Pixi re-render with interpolation.

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

## Testing

Tests live in both `src/tests/` and `tests/` (root). Key suites:
- `tests/manifest/manifest_files_exist.test.ts` — validates every manifest entry has a real file
- `tests/app/app.smoke.test.ts` — React component smoke tests
- `tests/pixi/textureRegistry.test.ts` — texture loader tests
- `tests/compile/tsc.test.ts` — TypeScript compilation check

When writing tests that touch asset loading, mock `vite-asset-loader` (it uses Vite-only APIs not available in Jest).
