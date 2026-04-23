Scan Report — Pixi & Asset Rules
Date: 2026-04-23

Overview
--------
This report summarizes a repository scan for deprecated Pixi APIs, asset/loader usage, texture access patterns, and spritesheet manifest practices.

Findings
--------
- `.interactive`: no occurrences found in `src/**`.
- `renderer.plugins.interaction`: no occurrences found in `src/**`.
- `eventMode`: present (example: `src/pixi/GameStage.tsx` uses `eventMode={"static"}`).
- `useTextures()` / `textureRegistry`: used in these files:
  - `src/pixi/PixiAppProvider.tsx`
  - `src/pixi/entities/terrain/IsoTileSprite.tsx`
  - `src/pixi/layers/IsoWorkerLayer.tsx`
  - `src/pixi/layers/IsoTerrainLayer.tsx`
  - `src/pixi/layers/IsoBuildingLayer.tsx`
  - `src/pixi/utils/textureRegistry.ts`
- Asset loader: `src/pixi/utils/vite-asset-loader.ts` uses `import.meta.glob(...)` — correct pattern for Vite.
- Spritesheet loader: `src/pixi/utils/spritesheetLoader.ts` uses `PIXI.BaseTexture.from(...)` in multiple code paths (canvas, HTMLImageElement, and URL). This is functional but worth a brief review to ensure errors are surfaced and the scaleMode/use of fallback is correct.

Notes / Risks
-----------
- No immediate refactors required for deprecated interaction APIs — the code already uses `eventMode` and `renderer.events` is not present.
- The loader path uses a 1x1 fallback texture on errors (by design). Ensure PRs that touch loader code include reproduction steps and console logs (we enforce this in the agent instructions).

