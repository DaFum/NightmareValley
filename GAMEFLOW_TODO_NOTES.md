# Gameflow & Code Improvement Notes (Actionable TODO Backlog)

This note consolidates opportunities spotted while reviewing runtime wiring, simulation stepping, layout responsiveness, and HUD/gameplay loops.

## 1) Simulation Loop & Determinism

- **Adaptive catch-up budget** (`src/pixi/hooks/useGameLoop.ts`):
  - Replace static `MAX_STEPS_PER_FRAME` with an adaptive budget based on recent frame time.
  - Track sustained debt and optionally auto-slow simulation speed to avoid stutter spirals.
- **Replay/debug traces** (`src/store/game-simulation.utils.ts`):
  - Add optional trace callback with tick id, step count, and important state hashes.
  - Use this for deterministic replay checks and bug repro snapshots.
- **Delta segmentation** (`src/store/game-simulation.utils.ts`):
  - Support configurable sub-step profiles per subsystem (transport/economy/pathing) for better stability under high tick rates.

## 2) Store Ergonomics & Safety

- **Serializable runtime errors** (`src/store/game.store.ts`):
  - Normalize `lastError` to a serializable structure (`code`, `message`, `context`, `tick`).
- **Multi-profile starts** (`src/store/game.store.ts`):
  - Extract initial state seeding into scenario templates (easy/challenging/sandbox).
- **Debug command bus** (`src/store/game.store.ts`):
  - Replace ad-hoc debug actions with reusable commands + payload schemas to improve testability.

## 3) Economy Readability & Player Decisions

- **Resource trend signals** (`src/ui/hud/ResourceBar.tsx`):
  - Add per-resource production/consumption deltas (e.g. `+2.1/min`).
  - Color-code trends to indicate shortages before stockouts happen.
- **Actionable tooltips** (`src/ui/hud/ResourceBar.tsx`):
  - Show top source buildings, top consumers, and transport queue pressure per resource.

## 4) Rendering Performance

- **Tile culling acceleration** (`src/pixi/GameStage.tsx`):
  - Move from array filter culling to chunk-indexed culling + cached visible sets.
- **Camera-aware LOD** (`src/pixi/GameStage.tsx`, layer files):
  - Introduce level-of-detail thresholds for overlays at far zoom (icons/labels/heatmaps).
- **Telemetry thresholds** (`src/store/render.store.ts`, `src/store/debug.store.ts`):
  - Add warnings for sustained high visible object counts and frame debt.

## 5) Layout/UX Flow

- **Shared responsive hook** (`src/app/layout/GameLayout.tsx`, `src/app/layout/HudLayout.tsx`):
  - Centralize viewport + media-query logic into one hook.
- **Mobile panel prioritization** (`src/app/layout/HudLayout.tsx`):
  - Prioritize context-critical panels (alerts > inspector > economy) rather than static slot stacking.

## 6) World Tick Configurability

- **Scenario-aware simulation config** (`src/game/world/world.tick.ts`):
  - Feed simulation constants from world/campaign settings and biome modifiers.
- **Temporal events** (`src/game/world/world.tick.ts` + event systems):
  - Add periodic world pulses/events that temporarily modify transport or production efficiencies.

## 7) Suggested Next Milestones

1. Implement **resource trend HUD** + quick alerts for critical shortages.
2. Add **adaptive simulation debt management** with visible debug indicator.
3. Introduce **chunk-cached culling** in `GameStage`.
4. Add **scenario template loader** for initial game state presets.
5. Add **deterministic replay trace mode** for simulation regression tests.

