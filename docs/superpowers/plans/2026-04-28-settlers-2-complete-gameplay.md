# Settlers 2 Complete Gameplay Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Turn NightmareValley into a complete playable Settlers-2-style economy game with warehouse-first logistics, readable production chains, roads, workers, territory, objectives, and end-state flow.

**Architecture:** Keep `src/game/core/economy.simulation.ts` as the deterministic tick orchestrator and improve gameplay through focused systems under `src/game/economy`, `src/game/entities`, `src/game/map`, `src/game/events`, and `src/ui`. The authoritative economy remains vault-first: vault `outputBuffer`s store player inventory, production buildings use small input/output buffers, and carriers move goods with explicit jobs.

**Tech Stack:** React, TypeScript, Vite, Zustand, Pixi.js, Jest.

---

## Current State Snapshot

- Warehouse-first storage exists and `player.stock` is a derived view.
- Production, extraction, transport jobs, carrier movement, construction, placement, settings, victory dialogs, and economy HUD exist.
- Major missing depth: resource-chain planner, production demand diagnostics, worker hiring economy, road placement/connection UX, territory expansion gameplay, campaign chapter pacing, AI/opponent pressure, events, and richer endgame.
- Immediate risk area: transport and production are functional but player feedback is still too opaque for a Settlers-style loop.

## File Responsibility Map

- `src/game/economy/economy.planner.ts`: Create production-chain dependency graph, resource deficits, and next-build recommendations.
- `src/game/economy/economy.snapshot.ts`: Extend/debug economy snapshots with chain health and bottlenecks.
- `src/game/economy/production.logic.ts`: Improve recipe selection and production blocking reasons.
- `src/game/economy/transport.logic.ts`: Continue reservation-safe transport, carrier assignment, and delivery edge cases.
- `src/game/entities/workers/worker.logic.ts`: Improve worker idle/assignment states and auto-hiring interactions.
- `src/game/entities/roads/road.logic.ts`: Expand road network editing, adjacency, and connection behavior.
- `src/game/map/map.territory.ts`: Add territory expansion from jurisdiction buildings and vault influence.
- `src/game/events/events.logic.ts`: Implement timed economic events and warnings.
- `src/game/core/victory.rules.ts`: Add chapter objectives and scenario-specific win/loss rules.
- `src/store/game.store.ts`: Wire new actions for road placement, worker hiring, event handling, and scenario resets.
- `src/ui/panels/SettlementBriefPanel.tsx`: Show current goal, bottleneck, and recommended next build.
- `src/ui/panels/EconomyPanel.tsx`: Show production chain health and transport bottlenecks.
- `src/ui/panels/BuildingMenu.tsx`: Show unlocks, missing inputs, and recommended buildings.
- `src/ui/dialogs/VictoryDialog.tsx`: Show scenario outcome, score, and restart/continue flow.
- `src/tests/core/*.test.ts`: Regression tests for deterministic logic.
- `src/tests/integration/*.test.ts`: End-to-end simulation tests for full chain completion.

---

## Extended ToDo List

### Phase 1: Economy Understanding and Guidance

- [x] Add `economy.planner.ts` with resource-chain definitions derived from building and recipe data.
- [x] Add chain diagnostics: missing source building, missing processor building, input deficit, output blocked, no carrier capacity, no vault capacity.
- [x] Add next-build recommendation based on the first incomplete campaign objective.
- [x] Show next-build recommendation in `SettlementBriefPanel`.
- [x] Show top bottlenecks in `EconomyPanel`.
- [x] Add tests for recommendations from early, mid, and late campaign states.

### Phase 2: Production Completeness

- [x] Add recipe switching rules for multi-recipe buildings.
- [x] Add explicit production status reasons: `missingWorker`, `missingInput`, `outputFull`, `roadDisconnected`, `underConstruction`, `paused`, `working`.
- [x] Persist selected recipe in building inspector where buildings support multiple recipes.
- [x] Add tests for each production status reason.
- [x] Add integration test for full chain: timber -> planks -> quarry/well/fish/farm -> salt/bread -> iron/tools.

### Phase 3: Transport and Roads

- [x] Add player road placement mode with valid ghost preview.
- [x] Connect adjacent road segments and building entrances.
- [x] Require connected road network for transport jobs when road-required buildings are used.
- [x] Add route diagnostics when source and target are disconnected.
- [x] Add tests for road segment adjacency, connection removal, and building connectivity.
- [x] Add UI controls to place and remove roads.

### Phase 4: Workers and Hiring

- [x] Add worker hiring costs and unlock requirements.
- [x] Add auto-hire toggle per building role.
- [x] Add worker shortage panel state: needed worker type and suggested building/action.
- [x] Add population pressure: housing/population cap strategy or vault-based worker cap upgrades.
- [x] Add tests for worker assignment, population cap, and auto-hiring.

### Phase 5: Territory and Expansion

- [x] Add territory influence from `spireOfJurisdiction` and vaults.
- [x] Add ownership expansion on construction completion.
- [x] Update ghost placement so new territory becomes buildable immediately.
- [x] Add tests for expansion radius, ownership checks, and invalid enemy/unowned placement.

### Phase 6: Events and Scenario Pressure

- [x] Implement deterministic timed events: resource drought, road congestion warning, morale shock, production blessing.
- [x] Add event log panel with severity and timestamps.
- [x] Add event effects to world pulse and worker morale.
- [x] Add tests for event scheduling and deterministic seed behavior.

### Phase 7: Campaign and Endgame

- [x] Split campaign into chapters: Founding, Food, Preservation, Industry, Tools, Fortification.
- [x] Add objective rewards and unlock messages.
- [x] Add score calculation: completion time, worker survival, logistics efficiency, stock reserves.
- [x] Add victory/defeat summaries by scenario.
- [x] Add integration test for victory from a seeded complete chain.

### Phase 8: UI/UX Polish and Browser QA

- [x] Add a production-chain panel with resource icons, arrows, and blocked nodes.
- [x] Add road tool button and selected tool state.
- [x] Add compact mobile layout for build/road/economy controls.
- [x] Add tooltip explanations for every resource, worker, building, and blocked state.
- [x] Run Playwright screenshot workflow for overview, heatmap, and mobile.

### Phase 9: Performance and Scale

- [x] Reduce broad Zustand subscriptions in economy panels.
- [x] Cache production-chain graph at module level.
- [x] Avoid repeated `Object.values` scans in hot tick loops where index maps are stable.
- [x] Add benchmark-style regression test for job generation with many buildings.
- [x] Consider Vite code splitting for debug routes and large non-critical UI surfaces.

---

## Execution Order

1. Build economy planner and recommendation tests.
2. Wire planner into settlement/economy panels.
3. Add production status reasons.
4. Add full-chain integration test.
5. Implement road tool and connectivity.
6. Implement worker hiring depth.
7. Implement territory expansion.
8. Implement events and campaign pacing.
9. Run full browser QA and performance pass.

## Verification Commands

```bash
npm run build
npm test -- --runInBand src/tests/core/economy.planner.test.ts
npm test -- --runInBand src/tests/core/transport.logic.test.ts src/tests/core/transport.movement.test.ts src/tests/core/economy.simulation.test.ts
npm test -- --runInBand
npm run build:vite
```

## Plan Self-Review

- No placeholder task is intentionally deferred without a concrete owning phase.
- The first implementation slice is self-contained: planner logic, tests, and UI display.
- Economy invariants are preserved: vault storage remains authoritative, affordability reads vault buffers, and no vault-to-vault routing is introduced.
- The plan is intentionally phased because a full Settlers-2 clone spans multiple subsystems; each phase produces playable, testable progress.
