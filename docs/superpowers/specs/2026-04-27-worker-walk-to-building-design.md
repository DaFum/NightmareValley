# Worker Walk-to-Building Design

**Date:** 2026-04-27

## Overview

When a worker is spawned at a vault and assigned to a construction building (or any building), they should visually walk to that building before starting work. The existing `worker.path` field and `updateWorkersAI` stub provide the foundation — we replace the random-walk stub with purposeful pathfinding toward `currentBuildingId`.

## Requirements

- After a worker is assigned to a building (`currentBuildingId` set), they pathfind to `building.position` if not already there
- Worker moves along the path each tick at `moveSpeed = 1.0` tiles/sec (existing constant)
- Worker does not count toward construction progress (`assignedWorkers` contributes) until they arrive — BUT for simplicity, construction only advances once the worker is within 1 tile of the building (arrival check)
- Once arrived, `worker.position` snaps to `building.position` and `worker.isIdle = false`
- If worker already at building position (within 0.5 tiles), no path needed
- `worker.path` is cleared on arrival
- Workers do not wander randomly — remove the random destination logic from `updateWorkersAI`
- Render adapter already shows `worker.position` for non-carrier workers — smooth interpolation is not required (tile-snapping is acceptable for now)

## Arrival Definition

Worker is "at" their building when:
```
distance(worker.position, building.position) < 0.5
```

## `updateWorkersAI` Rewrite

Replace the random-walk stub. For each worker:

1. Skip `burdenThrall` workers (they use carrier tasks for movement)
2. If `currentBuildingId` is set and worker is not at building position:
   - If `worker.path` is empty or undefined: compute path via `findPathAStar(grid, worker.position, building.position)`
   - Advance along path by `moveSpeed * deltaSec`
   - On arrival: snap to building position, clear `worker.path`, set `worker.isIdle = false`
3. If `currentBuildingId` is not set: worker stays idle (`worker.isIdle = true`)

## Construction Progress Guard

`processConstruction` currently advances progress for any building where `assignedWorkers.length > 0`. We need to additionally check that the assigned worker has arrived at the building.

Add helper: `isWorkerAtBuilding(worker, building): boolean` — returns true when `distance < 0.5`.

`processConstruction` counts only arrived workers:
```typescript
const arrivedWorkers = building.assignedWorkers.filter(id => {
  const w = state.workers[id];
  return w && isWorkerAtBuilding(w, building);
});
if (arrivedWorkers.length === 0) continue;
const effectiveDelta = deltaSec * arrivedWorkers.length;
```

## Simulation Tick Order

```
processConstruction()          — advances progress (only arrived workers)
autoSpawnConstructionWorkers() — spawns worker from vault if needed
updateWorkersAI()              — moves non-carrier workers toward buildings  ← ADDED TO TICK
updateWorkersPassiveState()
processExtraction()
processProduction()
...
```

`updateWorkersAI` runs after `autoSpawnConstructionWorkers` so a newly spawned worker gets their path computed in the same tick.

## Grid Size

`createGridFromTerritory` takes `(territory, width, height)`. Use `state.territory` with reasonable bounds. Check territory dimensions from `territory.tiles` — use max tile coordinate + 1 or a fixed `32` as safe upper bound.

## Out of Scope

- Smooth sub-tile interpolation in the render adapter (worker snaps between tiles)
- Workers returning to vault after building completes
- Re-pathing when building is destroyed mid-construction
- Multiple workers walking simultaneously to different buildings (works automatically since each worker has their own `path`)
