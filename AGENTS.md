# AGENTS — Guidance for AI coding assistants

Purpose: provide concise, actionable guidance to an AI agent working in this repository.

## Quick start

Run locally:

```bash
npm install
npm run dev
# build (vite)
npm run build:vite
```

Ensure you use Node 18+ when running the project locally.

## How to run the agent locally

- Install dependencies: `npm ci`
- Start dev server: `npm run dev`
- Run tests: `npm test`
- Build for production (Vite): `npm run build:vite`

## Scripts to update when changing agents

When modifying or replacing agent automation, update these `package.json` scripts if needed:

- `dev` — development server (Vite)
- `build:vite` — Vite production build
- `build` — TypeScript compilation (`tsc`)
- `test` — unit tests (`jest`)
- `preview` — Vite preview for build verification

## What the agent should know

- **Stack:** React + TypeScript + Vite; rendering uses Pixi.js via `@pixi/react`.
- **Key areas:** `src/pixi` (render, stage, textures), `src/game` (game logic & AI), `src/assets/spritesheets` (images + `manifest.json`), `src/store` (zustand stores), `lib` (utilities).
- **Asset loading:** spritesheets are resolved by `src/pixi/utils/vite-asset-loader.ts` (uses `import.meta.glob(..., ?url)`) and registered by `src/pixi/utils/spritesheetLoader.ts`. When changing assets, update `src/assets/spritesheets` and the manifest; ensure files are discoverable by Vite.
- **Update & verify manifest:** after adding or renaming sprites, update [src/assets/spritesheets/manifest.json](src/assets/spritesheets/manifest.json#L1) and run the manifest tests [tests/manifest/manifest_files_exist.test.ts](tests/manifest/manifest_files_exist.test.ts#L1).
- **CI checks for assets:** include `npm test` and `npm run build:vite` in CI so Vite can validate that assets are resolvable during the build step.
- **Texture handling:** `src/pixi/utils/textureRegistry.ts` wraps the loader and exposes `useTextures()`; the loader adds a 1x1 fallback texture on load error — avoid leaving silent failures.
- **Pixi conventions:** prefer `eventMode` (over `interactive`) and `renderer.events` (over `renderer.plugins.interaction`) for Pixi v7+ compatibility. Search for `.interactive`, `eventMode`, or `renderer.plugins.interaction` when editing Pixi code.
- **Global error handling:** `src/main.tsx` installs `unhandledrejection` and `error` listeners for debugging; include concise reproduction steps in PRs if making runtime changes.

## Files to inspect first

- [README.md](README.md)
- [Architektur.md](Architektur.md)
- [src/main.tsx](src/main.tsx)
- [src/pixi/PixiAppProvider.tsx](src/pixi/PixiAppProvider.tsx)
- [src/pixi/utils/spritesheetLoader.ts](src/pixi/utils/spritesheetLoader.ts)
- [src/pixi/utils/vite-asset-loader.ts](src/pixi/utils/vite-asset-loader.ts)
- [src/pixi/utils/textureRegistry.ts](src/pixi/utils/textureRegistry.ts)
- [src/pixi/GameStage.tsx](src/pixi/GameStage.tsx)
- [src/assets/spritesheets/manifest.json](src/assets/spritesheets/manifest.json)

## Agent customization files

- [copilot-instructions.md](copilot-instructions.md) — Repository-wide Copilot instructions (Required rules for assets, Pixi conventions, texture handling, and a PR checklist). Agents should consult this before making edits.

## Conventions & PR guidance

- Make small, focused changes. Run the dev server and include exact reproduction steps and console logs for runtime issues.
- For Pixi-related fixes, prefer small targeted changes: replace `.interactive` usage with `eventMode` and prefer `renderer.events` accessors.
- Do not copy large sections of existing docs into this file; link to them instead.

## When to open an issue

- Missing assets referenced by `manifest.json`.
- Repeated runtime `Unhandled promise rejection` originating from the texture loader.
- Broad refactors that touch rendering or game loop — discuss via issue before implementation.

## Suggested next customizations

- Add small skills for the common flows: `run-dev`, `fix-pixi-deprecations`, `add-spritesheet`.

---
Generated/updated by AI assistant to help future automated edits and PRs.

