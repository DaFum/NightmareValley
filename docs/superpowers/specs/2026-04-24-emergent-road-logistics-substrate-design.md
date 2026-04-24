# Emergent Road Logistics Substrate — Design Spec

Date: 2026-04-24
Status: Design approved, implementation plan pending
Scope: Sub-project #1 of a multi-step effort to make NightmareValley a playable colony-simulation game.

---

## 1. Background and direction

The game currently has a large, mostly-unimplemented skeleton inspired by Settlers 2. The original request was "make everything work like Settlers 2," but during brainstorming the player design was explicitly changed: **roads are no longer player-built and flag-based. Instead, roads emerge from foot traffic.** The design moves away from Settlers 2 toward a Banished / Manor Lords style where worn paths appear under heavy foot traffic.

Logistics are still performed by a dedicated courier pool (not per-building haulers). Couriers live at a warehouse, pick up delivery jobs, and walk freely across the map. Tiles accumulate footfall each time a courier steps on them. Above thresholds, tiles visually upgrade through tiers (grass → dirt → cobble → paved) and grant speed bonuses. Weighted A\* causes new couriers to prefer existing higher-tier tiles, creating the positive-feedback loop that concentrates traffic into visible roads. Unused tiles slowly decay back toward grass.

This spec covers only the substrate: couriers, free-movement, footfall accumulation, tier upgrades/decay, weighted routing, and a minimum visible demo. Construction, production chains, military, and AI opponents are out of scope and will be built on top in later sub-projects.

---

## 2. Demo success criterion

Running the game after this spec is implemented should produce:

1. A single HQ warehouse is pre-placed at a fixed position, stocked with ~100 of a log-like resource (e.g. `sinewTimber`).
2. A dev-only HUD button `Spawn warehouse at cursor` lets the player place a second, empty warehouse anywhere on the map.
3. Couriers (3 `burdenThrall` at start) automatically pick up delivery jobs from the auto-generator: pick up resources at HQ, walk to the destination warehouse, drop them, go idle at drop location.
4. As couriers walk the same tiles repeatedly, those tiles visibly upgrade through grass → dirt → cobble → paved, each with a speed boost.
5. New couriers prefer higher-tier tiles (weighted A\*). This concentrates traffic and deepens worn paths.
6. Unused tiles slowly fade (decay) so abandoned routes revert toward grass over time.
7. Visual verification: spawn a warehouse far away, watch the first courier blaze a wobbly grass path, watch the 20th courier walk a crisp cobble or paved road along the worn route.

### Explicit non-goals

- No construction, builders, or material-delivery-to-build-sites.
- No building types beyond warehouse. No production, extraction, or recipes.
- No flags, no explicit road graph, no road-building UI.
- No combat, military, territory expansion beyond what already exists for placement.
- No AI opponent. No multiplayer.

---

## 3. Data model changes

### 3.1 `MapTile` — add two fields

File: `src/game/core/game.types.ts` (at the `export interface MapTile` declaration near line 56).

- `footfall: number` — accumulated wear score. Starts at 0. Incremented by +1 each time a courier enters this tile. Decays slowly each tick.
- `tier: 'grass' | 'dirt' | 'cobble' | 'paved'` — stored for fast render lookup. Derived from `footfall` but cached. Recomputed whenever footfall crosses a threshold, in either direction.

### 3.2 `CarrierTask` — replace `progress` with a real movement state

File: `src/game/economy/transport.logic.ts`.

- Remove: `progress: number` (the current 0..1 scalar).
- Add: `phase: 'toPickup' | 'toDropoff'`.
- Add: `path: TileId[]` — the A\* tile path for the current phase.
- Add: `pathIndex: number` — index of the tile the courier is currently *on*.
- Add: `stepProgress: number` — 0..1 interpolation toward `path[pathIndex + 1]`. Used by simulation (advancement) and rendering (smooth interpolation).

When the courier reaches the end of the `toPickup` path, phase flips to `toDropoff`, a fresh A\* path is computed from the pickup tile to the dropoff tile, and `pathIndex = 0, stepProgress = 0`.

### 3.3 `WorkerInstance` — unchanged

Canonical `position` remains an integer tile coordinate. Rendering reads the associated `CarrierTask` (if one exists in `state.transport.activeCarrierTasks[worker.id]`) for smooth interpolation; otherwise renders at `worker.position`.

### 3.4 `TransportState` — simplify

File: `src/game/economy/transport.logic.ts`.

- Delete: `roadNodes: Record<string, RoadNode>`.
- Delete: the `RoadNode` interface entirely.
- Keep: `jobs`, `activeCarrierTasks`, `networkStress`, `averageLatencySec`.

### 3.5 `MapTile.roadNodeId` — delete

The field and any seed code that writes to it.

### 3.6 Starter state

File: `src/store/game.store.ts`.

- Delete `createStarterRoadPositions`, `createStarterRoadNodes`, and all references to them.
- Delete all hardcoded starter building IDs and worker IDs except the HQ (`vaultOfDigestiveStone`) and three couriers (`burdenThrall`).
- Keep 1 HQ building at a fixed position, pre-stocked with `outputBuffer: { sinewTimber: 100 }`.
- Keep 3 couriers positioned at or near HQ, all `isIdle: true`.
- Initialize every map tile with `footfall: 0, tier: 'grass'`.
- Empty `transport.jobs` and `transport.activeCarrierTasks`.
- No `roadNodes`.

---

## 4. Simulation changes

### 4.1 Tick pipeline

File: `src/game/core/economy.simulation.ts`, function `simulateTick`.

New order:

```
simulateTick:
  updateWorkersPassiveState        (unchanged)
  generateTransportJobs            (minor tweak)
  assignCarrierTasks               (changed — precompute path)
  advanceCarrierMovement           (NEW — replaces moveCarrierTasks + deliverCarrierTasks)
  decayFootfall                    (NEW — every 10 sim ticks)
  updateTransportMetrics           (unchanged)
  updateWorldPulse                 (unchanged)
```

Removed from the pipeline for this slice: `processExtraction`, `processProduction`, `updateWorkersAI`. They do nothing useful without buildings/workers beyond couriers and can introduce noise during testing. They remain defined in their files; they're simply not called.

### 4.2 `assignCarrierTasks` — precompute path

When a job is claimed, compute `path = aStar(carrier.tile, pickup.tile)` using the weighted cost function (§4.5). If no path exists, leave the job queued and log a warning. Store the path on the task with `phase: 'toPickup', pathIndex: 0, stepProgress: 0`.

### 4.3 `advanceCarrierMovement` — new

Replaces `moveCarrierTasks` + `deliverCarrierTasks`. For each active `CarrierTask` each tick:

1. Look up the courier's current tile: `currentTile = path[pathIndex]`.
2. Compute step speed: `step = courierBaseSpeed * tierSpeedMultipliers[currentTile.tier] * deltaSec`.
3. Advance `stepProgress += step`.
4. While `stepProgress >= 1` and `pathIndex + 1 < path.length`:
   - `stepProgress -= 1`.
   - `pathIndex += 1`.
   - `worker.position = path[pathIndex]`.
   - Credit `+1` footfall to `path[pathIndex]`.
   - If the new footfall crosses an upward tier threshold, update `tile.tier`.
5. If `pathIndex` has reached the end of `path`:
   - If `phase === 'toPickup'`: remove goods from source's `outputBuffer` at this moment (the task's existing `resourceType` + `amount` fields act as the courier's pocket for the rest of the trip). Flip `phase = 'toDropoff'`, recompute path from current tile to dropoff tile, reset `pathIndex = 0, stepProgress = 0`.
   - If `phase === 'toDropoff'`: deposit goods into destination's `inputBuffer` (or `internalStorage` for warehouse), mark job `delivered`, clear the task from `activeCarrierTasks`, set courier `isIdle = true`. Courier stays at the dropoff tile.

Note: this is a behavioral change from the current `deliverCarrierTasks`, which transfers goods only at delivery. In the new model the source's outputBuffer is decremented at pickup, not at delivery, so destroying a carrier mid-trip permanently loses the carried goods (the job transitions to `lost`).

Edge cases:

- Source building gone mid-trip → job transitions to `lost`, courier becomes idle at current tile.
- Dropoff building gone mid-trip → job transitions to `lost`, courier becomes idle at current tile.
- Path recomputation fails between phases → job transitions to `lost`, courier becomes idle at current tile.

### 4.4 `decayFootfall` — new

Runs every 10 sim ticks (not every tick). Iterate all tiles in `state.territory.tiles`:

```
tile.footfall = max(0, tile.footfall - footfallDecayPerTenTicks)
```

If the new footfall crosses a downward tier threshold, update `tile.tier`.

Performance: 64×64 map = 4096 tiles × every-10-ticks = negligible.

### 4.5 Weighted A\* cost function

File: `src/game/pathing/path.a-star.ts`.

Extend A\* to accept an optional `tileCost(tileId) => number` function. For couriers the cost function returns `1 / tierSpeedMultipliers[tile.tier]`:

- grass → 1.0
- dirt → 1/1.2 ≈ 0.83
- cobble → 1/1.5 ≈ 0.67
- paved → 1/2.0 = 0.5

Untraversable terrain (water, impassable mountain) returns `Infinity` — same as today.

Existing callers that do not pass `tileCost` continue to use uniform cost 1.0 for backward compatibility.

### 4.6 Balancing constants — add to `src/game/economy/balancing.constants.ts`

- `footfallTierThresholds = { dirt: 10, cobble: 50, paved: 200 }`
- `tierSpeedMultipliers = { grass: 1.0, dirt: 1.2, cobble: 1.5, paved: 2.0 }`
- `footfallDecayPerTenTicks = 0.1`
- `courierBaseSpeed = 1.0` (tiles/sec on grass)

All four are starting values intended to be tuned in playtest.

---

## 5. Rendering changes

### 5.1 `IsoRoadLayer` → `IsoFootfallLayer`

File: rename `src/pixi/layers/IsoRoadLayer.tsx` to `IsoFootfallLayer.tsx`.

Delete existing contents. New behavior: iterate visible tiles and draw a tier overlay on each non-grass tile. Grass tiles render nothing extra (terrain layer draws grass underneath). Update `GameStage.tsx` import accordingly.

### 5.2 Tier sprites / placeholders

If dedicated sprites (`dirt.png`, `cobble.png`, `paved.png`) are not yet available in `src/assets/tiles/terrain/`, ship solid color tints as placeholders:

- grass: no overlay
- dirt: `#8a6a3a`, alpha 0.45
- cobble: `#9a9a8a`, alpha 0.55
- paved: `#6a6a6a`, alpha 0.65

Real art is a polish pass, not a blocker.

### 5.3 `IsoWorkerLayer` — smooth courier interpolation

For each worker, if an active `CarrierTask` exists in `state.transport.activeCarrierTasks[worker.id]`, compute rendered screen position by linear interpolation between `path[pathIndex]` and `path[pathIndex + 1]` using `stepProgress`. Workers without an active task render at `worker.position` as before. Depth sort unchanged — the interpolated screen position feeds into the same footpoint/y sort.

### 5.4 Dev HUD panel — `DebugLogisticsPanel.tsx` (new)

File: `src/ui/panels/DebugLogisticsPanel.tsx`. Rendered only when `import.meta.env.DEV`.

Displays:

- Current number of active carrier tasks.
- Current number of queued jobs.
- Total footfall across the map.
- Toggle: `Show footfall heatmap` — renders an overlay layer with translucent red per tile, intensity proportional to footfall (diagnostic).

Actions (buttons):

- `Spawn warehouse at cursor` — enters a placement mode; next left-click on the map spawns a second `vaultOfDigestiveStone` at the clicked tile. Escape cancels.
- `Dispatch 10 logs to nearest warehouse` — directly queues 10 transport jobs from HQ to the nearest other warehouse. Bypasses the auto-job-generator for stress testing.
- `Reset footfall` — zeros every tile's footfall and resets tier to grass.

### 5.5 Removed from rendering

- Any consumer of `state.transport.roadNodes`.
- Any reference to `tile.roadNodeId`.
- The current road-segment drawing logic in the old `IsoRoadLayer`.

---

## 6. UI / input changes

### 6.1 Building-placement click handler — strip from `GameStage.tsx`

`handlePointerDown` currently calls `placeBuildingAt(...)` based on `selectedBuildingToPlace`. Remove that branch from this file for this slice. Left-click becomes selection-only by default.

`BuildingMenu` and `selectedBuildingToPlace` state remain in the codebase to avoid churn, but this slice does not wire new placement flows through them. Hide or disable `BuildingMenu` to avoid misleading affordances.

The debug `Spawn warehouse at cursor` action (§5.4) uses its *own* dedicated placement-mode flag (e.g. `isDebugSpawningWarehouse` in `ui.store.ts`), not `selectedBuildingToPlace`. The GameStage click handler checks this debug flag when present and calls `placeBuildingAt(playerId, 'vaultOfDigestiveStone', tileId)` directly, then clears the flag. Keeping the debug placement on a separate state flag ensures the production-facing generic placement code stays stripped.

### 6.2 Auto-job generation — keep, unchanged

`generateTransportJobs` already handles warehouse→warehouse routing via its `def.type === 'vaultOfDigestiveStone'` special case. With the leaner starter state (HQ + one debug-spawned warehouse), jobs auto-generate when HQ has stock and the second warehouse is placed. No new job-generation code is needed.

### 6.3 Existing selection, camera, and HUD input — unchanged

Tile-click selection, camera pan/zoom, FPS counter, inspector panel all stay as they are.

---

## 7. Testing

### 7.1 New unit tests

**`src/tests/core/transport.movement.test.ts`** (new):

- `advanceCarrierMovement` advances one tile per simulated second on grass at `courierBaseSpeed = 1.0`.
- Crossing onto dirt visibly increases traversal speed (fewer sim ticks for the same path).
- On tile entry, `+1` footfall is credited to the correct tile.
- Phase transition: completing `toPickup` flips phase to `toDropoff`, recomputes path, resets `pathIndex` and `stepProgress`.
- Completing `toDropoff` deposits goods, marks job `delivered`, clears the task, sets courier `isIdle`.
- Source building gone mid-trip → job `lost`, courier idle at current tile.
- Dropoff building gone mid-trip → job `lost`, courier idle at current tile.

**`src/tests/core/footfall.test.ts`** (new):

- Tier recomputes upward when footfall crosses 10, 50, 200.
- Tier recomputes downward when decay brings footfall below each threshold.
- `decayFootfall` never lets footfall go below 0.
- Decay runs every 10 ticks, not every tick.

### 7.2 Updates to existing tests

**`src/tests/core/pathfinding.test.ts`**:

- Add: A\* with weighted `tileCost` prefers higher-tier tiles. Setup: two equal-length paths between A and B, one entirely dirt, one entirely grass — the dirt path wins.
- Add: A\* returns empty/null (per existing convention) when no path exists.

**`src/tests/core/transport.logic.test.ts`**:

- Remove or rewrite any assertions that mention `roadNodes`, `RoadNode`, or `tile.roadNodeId`.
- Verify `assignCarrierTasks` attaches a computed `path` to each CarrierTask and initializes `phase = 'toPickup', pathIndex = 0, stepProgress = 0`.

### 7.3 Integration test

**`src/tests/integration/emergent-road.test.ts`** (new):

Setup: 32×32 grass map. HQ at (4, 4) stocked with 100 logs. Second warehouse at (28, 28). 5 couriers idle at HQ. Run the sim until ~50 deliveries complete.

Assertions:

1. At least one tile along a straight-ish line between the two warehouses has reached tier `cobble` or higher.
2. Off-path tiles (tiles far from any likely route) have `footfall < 10`.
3. The average path length traveled by the 40th delivery is strictly less than the 1st (because a worn route exists).

This is the test that proves the whole feedback loop works end-to-end.

### 7.4 Manual QA checklist

Implementer should eyeball in the browser before calling the spec done:

- Spawn a second warehouse far from HQ; watch the first courier zig-zag.
- Watch the 10th courier walk a visible dirt path.
- Watch the 25th courier walk a cobble or paved path.
- Toggle the heatmap overlay — intensity visibly concentrates along the route.
- Click `Reset footfall`; map returns to all grass instantly.
- No console errors during any of the above.

### 7.5 Breaking-test audit

Any existing test referencing `roadNodes`, `connectedNodeIds`, `tile.roadNodeId`, or `task.progress` will break. The implementation plan must include an audit-and-update pass over existing tests.

---

## 8. Deletion and migration

### 8.1 Delete outright

- `RoadNode` interface in `src/game/economy/transport.logic.ts`.
- `TransportState.roadNodes` field.
- `MapTile.roadNodeId` field.
- `createStarterRoadPositions()` and `createStarterRoadNodes()` in `src/store/game.store.ts`.
- All hardcoded starter buildings and workers except HQ + 3 couriers.
- `progress: number` field on `CarrierTask`.
- Functions `moveCarrierTasks` and `deliverCarrierTasks`.

### 8.2 Keep but rewrite

- `IsoRoadLayer.tsx` — renamed and reimplemented as `IsoFootfallLayer.tsx`.
- `assignCarrierTasks` — extended to precompute path and initialize new CarrierTask fields.
- `generateTransportJobs` — unchanged in logic, exercised against leaner starter state.

### 8.3 Keep as-is

- `path.a-star.ts` — extended with optional `tileCost` parameter; existing callers unaffected.
- Terrain, camera, selection, HUD infrastructure outside the files listed above.

### 8.4 Migration

No save format exists pre-release. Not applicable.

### 8.5 Known tradeoff

Once this slice ships, sub-project #2 (construction + warehouse-based worker spawning) must reintroduce additional workers and buildings on top of this bare starter state. This is expected; the leanness is deliberate.

---

## 9. Follow-on sub-projects (out of scope for this spec)

For context only. Each will get its own spec.

1. **Construction + warehouse-based worker spawning.** Player places a building footprint; a builder comes out of a warehouse, materials (logs/stone) delivered by couriers to the site, building completes, a worker of the right type emerges from a warehouse and moves in.
2. **Production chain polish.** Woodcutter → sawmill → warehouse, with tuned recipes, extraction deposits, and the pre-existing `processExtraction` / `processProduction` code re-enabled on the tick pipeline.
3. **Military and territory.** Watchtowers, soldiers, expansion of `map.territory.ts`.
4. **Economy breadth.** More buildings, tool production, distribution priorities, statistics UI.
5. **AI opponents and combat.**

---

## 10. Open questions deferred to the implementation plan

- Exact tile-to-tile step timing when `stepProgress` carries residual fraction across multi-tile steps in one tick (current design in §4.3 handles this with a `while` loop; implementation plan should confirm no off-by-one).
- Whether to cap footfall at a max value to prevent integer overflow over very long sessions (likely unnecessary given decay, but worth verifying).
- Whether `Reset footfall` should also cancel active carrier tasks in-flight or let them complete (cosmetic; default: let them complete).

Everything else is pinned.
