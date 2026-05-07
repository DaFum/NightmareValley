# Playable Defense Slice Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Add the missing opponent, territory visualization, military pressure, and defense UI so the existing economy game is a complete playable vertical slice.

**Architecture:** Add a small deterministic `src/game/military` domain that reads `WorldState`, updates military pressure, writes event log entries, and leaves economy/transport invariants untouched. Render territory by extending tile render data with ownership, then add a Pixi overlay layer that consumes render data only.

**Tech Stack:** React, TypeScript, Vite, Zustand, Pixi.js, Jest.

---

## File Responsibility Map

- `src/game/military/military.types.ts`: Military state, raid, metrics, and difficulty types.
- `src/game/military/military.logic.ts`: Pure soldier counting, defense scoring, raid spawning, combat resolution, and event-log helpers.
- `src/game/military/index.ts`: Stable exports.
- `src/game/world/world.types.ts`: Add optional military runtime state.
- `src/game/world/world.tick.ts`: Run military tick after AI actions and before scheduled events.
- `src/store/game.store.ts`: Add hostile faction, initial hostile territory, military defaults, scenario reset handling, and soldier recruit action.
- `src/game/render/render.types.ts`: Add tile ownership and terrain fields for overlays.
- `src/game/render/render.adapter.ts`: Project tile ownership/terrain into render data.
- `src/pixi/layers/IsoTerritoryLayer.tsx`: Draw player/enemy/neutral territory tint diamonds.
- `src/pixi/GameStage.tsx`: Mount territory layer below roads/buildings.
- `src/ui/panels/MilitaryPanel.tsx`: Show soldiers, defense strength, raid status, enemy pressure, and recruit controls.
- `src/app/layout/GameLayout.tsx`: Add military panel to the normal bottom dock.
- `src/ui/hud/TopHud.tsx`: Use 1x/2x/4x speed controls.
- `src/app/routes/DebugRoute.tsx`: Report seed, metrics, transport, AI, pathing, and military state.
- `README.md` and `Architektur.md`: Document the playable loop and new military slice.
- `src/tests/core/military.logic.test.ts`: Unit coverage for military derivation and combat.
- `src/tests/core/world.ai.test.ts`: Coverage for `aiOwnerId` action routing.
- `src/tests/render/render.adapter.test.ts`: Coverage for ownership render projection.

## Execution Checklist

- [ ] Write failing Jest tests for military derivation, combat, AI ownership, and render ownership projection.
- [ ] Implement `src/game/military` domain until focused tests pass.
- [ ] Wire military state through `WorldState`, `tickWorld`, and starter store state.
- [ ] Add hostile faction territory/buildings and scenario difficulty mapping.
- [ ] Add territory render projection and Pixi territory layer.
- [ ] Replace the stub `MilitaryPanel` and mount it in the bottom dock.
- [ ] Update speed controls, settings copy, debug route, README, and architecture notes.
- [ ] Run focused tests, then full `npm test -- --runInBand`, `npm run build`, and `npm run build:vite`.
- [ ] Start a local Vite server and run a browser smoke/playtest.
- [ ] Commit in logical steps: docs/tests, domain/world, render/UI/docs, verification fixes.

## Verification Commands

```bash
npm test -- --runInBand src/tests/core/military.logic.test.ts src/tests/core/world.ai.test.ts src/tests/render/render.adapter.test.ts
npm test -- --runInBand
npm run build
npm run build:vite
```

## Self-Review

The plan covers the missing acceptance criteria without replacing working economy, transport, or construction systems. It avoids protected assets and keeps new visuals as Pixi primitives. It preserves the warehouse-first affordability contract by using existing worker hiring and vault storage APIs.
