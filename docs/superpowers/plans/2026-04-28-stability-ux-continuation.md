# Stability UX Continuation Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Stabilize the current performance branch, close review risks, and continue UI polish without regressing the playable economy loop.

**Architecture:** Fix deterministic simulation risks first, then improve render cache invalidation and player-facing surfaces in small slices. Keep simulation logic in `src/game`, React HUD in `src/ui`, and browser QA in scripts/screenshots.

**Tech Stack:** React, TypeScript, Vite, Zustand, Pixi.js, Jest, Playwright/CDP screenshots.

---

## Design Direction

- **Fantasy:** oppressive isometric settlement-builder with readable operational controls.
- **HUD rule:** keep permanent chrome compact; deep state lives behind drawers.
- **Performance rule:** cache heavy derived world data with correct invalidation, not stale count-only checks.
- **Simulation rule:** preflight affordability/slot validity before mutating cloned hiring state.

## File Responsibility Map

- `src/game/core/economy.simulation.ts`: auto-hire preflight and worker spawn consistency.
- `src/tests/core/economy.simulation.test.ts`: regression tests for partial auto-hire affordability and assignment safety.
- `src/game/render/render-cache.ts`: stable cache-key helpers for terrain-derived render data.
- `src/tests/render/render-cache.test.ts`: deterministic cache-key coverage.
- `src/pixi/hooks/useRenderWorld.ts`: use robust cache signatures instead of tile count.
- `src/pixi/hooks/useGameLoop.ts`: document the 0.2s fixed-step performance decision.
- `src/ui/panels/TacticalMapPanel.tsx`: continue compact map UX after stability checks.
- `src/styles/ui.css`: responsive HUD/drawer refinements.

## Extended ToDo List

### Phase 1: Review Risk Closure

- [x] Add a regression test proving auto-hire only hires workers it can afford and never leaves partial assignment/cost state after a failed slot validation.
- [x] Add preflight worker home-slot validation before `spawnWorker` charges hire cost.
- [x] Add a cheap affordability precheck in `processAutoHireWorkers` before each charged spawn.
- [x] Add a render cache-key helper that changes when tile identity/terrain/position/ownership/resource/tier changes, even if tile count stays identical.
- [x] Wire `useRenderWorld` to the robust terrain cache key.
- [x] Document why `SIMULATION_STEP_SEC` is 0.2 for the performance branch.
- [x] Run focused tests for economy simulation and render cache behavior.

### Phase 2: HUD Drawer Polish

- [x] Keep the tactical map accessible without being pushed outside the viewport by the bottom dock.
- [x] Add a mobile rule that anchors the map drawer below the top HUD and limits width to `calc(100vw - 24px)`.
- [x] Verify the guide state hides tactical map chrome so first-run help remains clean.
- [x] Capture a production-preview screenshot with the tactical map open.

### Phase 3: Next Playability Content

- [x] Add a compact “next chain” row to the tactical map drawer using existing economy planner recommendations.
- [x] Add missing status copy for map markers: building, road, active carrier.
- [x] Add deterministic tests for marker counts and chain copy selection.
- [x] Run full Jest, TypeScript, Vite build, and browser visual QA.

### Phase 4: Runtime QA Error Cleanup

- [x] Reproduce the remaining browser `Unhandled promise rejection` with pre-app instrumentation.
- [x] Trace the rejection to the exact render path and asset key.
- [x] Remove pseudo-texture URL fallbacks that cause browser image requests for non-files.
- [x] Add a regression test that guards against pseudo-key `image` fallbacks in building rendering.
- [x] Verify browser QA no longer reports unhandled promise rejections.

### Phase 5: Building Overlay Asset Finish

- [x] Generate real PNG overlay assets for building shadow, selected ring, and hover ring.
- [x] Register UI overlay assets through `manifest.json` with exact runtime texture keys.
- [x] Update the spritesheet loader so `ui` entries register without a group prefix.
- [x] Verify manifest files and TypeScript build after the asset change.

## Execution Order

1. Close review comments with tests and targeted code changes.
2. Re-run full builds/tests to stabilize the branch.
3. Polish tactical map mobile/guide behavior.
4. Add planner-driven next-chain content.
5. Run final browser QA and record screenshots.

## Verification Commands

```bash
npm test -- --runInBand src/tests/core/economy.simulation.test.ts src/tests/render/render-cache.test.ts
npm run build
npm run build:vite
npm test -- --runInBand
```

## Plan Self-Review

- The plan starts with concrete review risks before adding new UI content.
- No phase violates vault-first storage or affordability rules.
- Render cache fixes preserve performance intent while removing stale count-only invalidation.
- UI work stays compact and drawer-based to protect the playfield.
