# Copilot Agent Instructions — NightmareValley

Scope & Purpose
---------------
Provide repository-wide guidance for AI assistants (Copilot) when editing code, assets, or documentation in this repository. These instructions apply repository-wide and are enforced as best-practice rules.

Scope
-----
Apply these rules repository-wide. Primary focus areas: rendering, Pixi, asset loading, game logic, stores, and the `src/assets` tree.

Enforcement
-----------
Follow best-practice: items marked **Required** must be followed by the agent; items marked **Preferred** are recommendations. When deviating from a Required rule, document the justification, include repro steps, and add tests or safeguards in the PR.

Key conventions (high level)
---------------------------
- Stack: React + TypeScript + Vite; rendering uses Pixi.js via `@pixi/react`.
- Key directories: src/pixi, src/game, src/assets/spritesheets, src/store, lib.

Enforced rules
--------------
- **Required:** Use `src/pixi/utils/vite-asset-loader.ts` (uses `import.meta.glob(..., ?url)`) for Vite-resolvable asset imports.
- **Required:** Register spritesheets with `src/pixi/utils/spritesheetLoader.ts` and update `src/assets/spritesheets/manifest.json` when adding or renaming assets.
- **Required:** Verify new assets load in both dev and build: run `npm run dev` and `npm run build:vite`; confirm textures via `useTextures()`.
- **Required:** Do not silently ignore loader failures — surface errors, include console logs, and add reproduction steps in the PR.
- **Required:** Use `src/pixi/utils/textureRegistry.ts` and the `useTextures()` hook to access textures.
- **Required:** Replace deprecated `.interactive` usages with `eventMode` on Pixi display objects.
- **Required:** Prefer `renderer.events` accessors over `renderer.plugins.interaction` for Pixi v7+ compatibility.
- **Preferred:** Use the `apply_patch` workflow for agent edits and include a short explanation for each change.

Targets
-------
Apply these rules to source and asset files, including but not limited to: `*.ts`, `*.tsx`, `*.json`, `*.tmx`, and image assets (`.png`, `.jpg`, `.webp`) under `src/assets/**` and the Pixi code under `src/pixi/**`.

Assets & spritesheets
----------------------
- Use the asset loader and manifest flow (`src/pixi/utils/vite-asset-loader.ts` + `spritesheetLoader.ts`) so Vite can resolve files.
- Use the asset loader and manifest flow (`src/pixi/utils/vite-asset-loader.ts` + `spritesheetLoader.ts`) so Vite can resolve files.
- **Required:** Ensure new asset files are discoverable by `import.meta.glob` (see [src/pixi/utils/vite-asset-loader.ts](src/pixi/utils/vite-asset-loader.ts#L1)) and update `manifest.json`.
- Update `src/assets/spritesheets/manifest.json` for any new or renamed spritesheets.
- **Test:** Mock `vite-asset-loader` in Node tests or add a lightweight adapter in test setup to avoid Vite-only APIs leaking into Jest.

Texture handling
----------------
- Use `src/pixi/utils/textureRegistry.ts` and `useTextures()`.
- The loader adds a 1x1 fallback texture on load error; always surface loader errors and include reproduction steps and console output in the PR.

Pixi conventions
----------------
- Use `eventMode` instead of `.interactive`.
- Use `renderer.events` accessors rather than `renderer.plugins.interaction`.

Global error handling
---------------------
- See `src/main.tsx` for `unhandledrejection` and `error` listeners. When making runtime changes, include exact reproduction steps and console logs.

Edit / PR guidance & checklist
-----------------------------
Before opening a PR, ensure:
- Updated manifest entries for added/renamed assets.
- Ran `npm run dev` and `npm run build:vite` and confirmed no loader/runtime errors.
- Included reproduction steps and console logs for any runtime fixes.
- Keep changes small and focused; add tests when changing core simulation logic.
- In the PR description, list changed files and why rules were followed or, if not, why an exception was necessary.

Run / Test commands
-------------------
- `npm install`
- `npm run dev`
- `npm run build:vite`

Agent behavior & tooling
------------------------
- Start multi-step work with a short plan using `manage_todo_list`.
- For codebase exploration, prefer the "Explore" subagent with a thoroughness hint.
- When modifying assets or loaders, always update `src/assets/spritesheets/manifest.json` and verify textures via `useTextures()`.
- For Pixi deprecations, make small, targeted fixes and validate the dev build.

Examples — sample prompts you can ask the agent
-----------------------------------------------
- "Add a new spritesheet called 'forest' and wire it into the loader and manifest."
- "Find and fix `.interactive` usages across `src/pixi` and replace them with `eventMode`."
- "Refactor texture loading to surface loader errors in console and include repro steps."

Exceptions
----------
If a change must deviate from Required rules (performance reasons, third-party constraints, etc.), document the technical rationale in the PR, include tests or mitigations, and request an explicit review.

Status
------
Finalized: repository-wide, enforced as best-practice (2026-04-23). Will iterate further if you ask for stricter enforcement or additional skills.

Quick Examples
--------------

1) Add a spritesheet to `manifest.json` (example entry):

```json
"my-sheet": {
	"file": "spritesheets/my-sheet.png",
	"frames": 12,
	"license": "TBD",
	"source": "https://example.com/origin"
}
```

2) Replace deprecated `.interactive` with `eventMode` in Pixi components (before → after):

Before:
```tsx
<Sprite interactive pointerdown={onClick} />
```

After:
```tsx
<Sprite eventMode="static" pointerdown={onClick} />
```

