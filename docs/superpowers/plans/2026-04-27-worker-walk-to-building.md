# Worker Walk-to-Building Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Non-carrier workers (e.g. timberExecutioner) spawned at the vault walk to their assigned building before contributing to construction or production.

**Architecture:** Replace the random-walk stub in `updateWorkersAI` with purposeful movement toward `currentBuildingId`. Add `isWorkerAtBuilding` helper. Guard `processConstruction` to only count arrived workers. Wire `updateWorkersAI` into `simulateTick` after `autoSpawnConstructionWorkers`.

**Tech Stack:** TypeScript, Jest, existing `findPath` in `path.a-star.ts`, existing `worker.path` field on `WorkerInstance`.

---

### Task 1: Rewrite `updateWorkersAI` to walk toward assigned building

**Files:**
- Modify: `src/game/entities/workers/worker.logic.ts`
- Test: `src/tests/core/worker.logic.test.ts` (create)

- [ ] **Step 1: Write failing tests**

Create `src/tests/core/worker.logic.test.ts`:

```typescript
import { updateWorkersAI } from "../../game/entities/workers/worker.logic";
import { EconomySimulationState } from "../../game/core/economy.simulation";
import { DEFAULT_SIMULATION_CONFIG } from "../../game/economy/balancing.constants";

function makeState(workerOverrides: Record<string, any> = {}, buildingOverrides: Record<string, any> = {}): EconomySimulationState {
  return {
    tick: 0,
    ageOfTeeth: 0,
    players: { p1: { id: "p1", stock: {}, buildings: ["b1"], workers: ["w1"], populationLimit: 20 } as any },
    buildings: {
      b1: {
        id: "b1",
        type: "organHarvester",
        ownerId: "p1",
        level: 0,
        constructionProgress: 0,
        position: { x: 5, y: 5 },
        outputBuffer: {},
        inputBuffer: {},
        internalStorage: {},
        assignedWorkers: ["w1"],
        progressSec: 0,
        isActive: true,
        connectedToRoad: false,
        integrity: 100,
        ...buildingOverrides,
      } as any,
    },
    territory: { tiles: {} } as any,
    workers: {
      w1: {
        id: "w1",
        type: "timberExecutioner",
        ownerId: "p1",
        position: { x: 0, y: 0 },
        currentBuildingId: "b1",
        isIdle: true,
        morale: 100,
        infection: 0,
        scars: 0,
        ...workerOverrides,
      } as any,
    },
    transport: { jobs: {}, activeCarrierTasks: {}, networkStress: 0, averageLatencySec: 0, queuedJobCount: 0 },
    worldPulse: 0,
  } as any;
}

describe("updateWorkersAI", () => {
  it("moves worker closer to their assigned building each tick", () => {
    const state = makeState();
    const next = updateWorkersAI(state, 1, DEFAULT_SIMULATION_CONFIG);
    const worker = next.workers["w1"];
    // Worker at (0,0), building at (5,5) — should have moved closer
    const origDist = Math.sqrt(25 + 25);
    const newDist = Math.sqrt(
      Math.pow(worker.position.x - 5, 2) + Math.pow(worker.position.y - 5, 2)
    );
    expect(newDist).toBeLessThan(origDist);
  });

  it("sets isIdle to false while walking toward building", () => {
    const state = makeState();
    const next = updateWorkersAI(state, 1, DEFAULT_SIMULATION_CONFIG);
    expect(next.workers["w1"].isIdle).toBe(false);
  });

  it("snaps to building position on arrival and sets isIdle to false", () => {
    // Worker almost at building
    const state = makeState({ position: { x: 4.95, y: 4.95 } });
    const next = updateWorkersAI(state, 1, DEFAULT_SIMULATION_CONFIG);
    const worker = next.workers["w1"];
    expect(worker.position.x).toBeCloseTo(5);
    expect(worker.position.y).toBeCloseTo(5);
    expect(worker.isIdle).toBe(false);
  });

  it("does not move burdenThrall workers (handled by carrier tasks)", () => {
    const state = makeState({ type: "burdenThrall" });
    const next = updateWorkersAI(state, 1, DEFAULT_SIMULATION_CONFIG);
    expect(next.workers["w1"].position).toEqual({ x: 0, y: 0 });
  });

  it("does not move worker with no currentBuildingId", () => {
    const state = makeState({ currentBuildingId: undefined });
    const next = updateWorkersAI(state, 1, DEFAULT_SIMULATION_CONFIG);
    expect(next.workers["w1"].position).toEqual({ x: 0, y: 0 });
  });

  it("worker already at building stays put", () => {
    const state = makeState({ position: { x: 5, y: 5 } });
    const next = updateWorkersAI(state, 1, DEFAULT_SIMULATION_CONFIG);
    expect(next.workers["w1"].position).toEqual({ x: 5, y: 5 });
    expect(next.workers["w1"].isIdle).toBe(false);
  });
});
```

- [ ] **Step 2: Run tests to confirm they fail**

```bash
npx jest --runInBand src/tests/core/worker.logic.test.ts
```
Expected: FAIL — current implementation does random walks.

- [ ] **Step 3: Rewrite `updateWorkersAI`**

Replace the full contents of `src/game/entities/workers/worker.logic.ts`:

```typescript
import { EconomySimulationState } from "../../core/economy.simulation";
import { SimulationConfig } from "../../economy/balancing.constants";
import { findPath } from "../../pathing/path.a-star";

const MOVE_SPEED = 1.0; // grid tiles per second
const ARRIVAL_THRESHOLD = 0.5; // tiles — considered "at" building

export function isWorkerAtBuilding(
  workerPos: { x: number; y: number },
  buildingPos: { x: number; y: number }
): boolean {
  const dx = workerPos.x - buildingPos.x;
  const dy = workerPos.y - buildingPos.y;
  return Math.sqrt(dx * dx + dy * dy) < ARRIVAL_THRESHOLD;
}

export function updateWorkersAI(
  state: EconomySimulationState,
  deltaSec: number,
  _config: SimulationConfig
): EconomySimulationState {
  const workers = { ...state.workers };

  for (const [id, worker] of Object.entries(workers)) {
    // burdenThralls are moved by the carrier task system
    if (worker.type === "burdenThrall") continue;

    const building = worker.currentBuildingId
      ? state.buildings[worker.currentBuildingId]
      : undefined;

    if (!building) {
      workers[id] = { ...worker, isIdle: true };
      continue;
    }

    if (isWorkerAtBuilding(worker.position, building.position)) {
      workers[id] = { ...worker, isIdle: false };
      continue;
    }

    // Need to walk toward building
    let path = worker.path && worker.path.length > 0 ? worker.path : undefined;

    if (!path) {
      const result = findPath(worker.position, building.position, state);
      path = result.isComplete && result.points.length > 0 ? result.points : undefined;
    }

    if (!path || path.length === 0) {
      // No path found — stay put
      workers[id] = { ...worker, isIdle: false };
      continue;
    }

    // Advance along path
    let remaining = MOVE_SPEED * deltaSec;
    let pos = { ...worker.position };
    let pathCopy = [...path];

    while (remaining > 0 && pathCopy.length > 0) {
      const target = pathCopy[0];
      const dx = target.x - pos.x;
      const dy = target.y - pos.y;
      const dist = Math.sqrt(dx * dx + dy * dy);

      if (dist <= remaining) {
        pos = { x: target.x, y: target.y };
        remaining -= dist;
        pathCopy.shift();
      } else {
        pos = {
          x: pos.x + (dx / dist) * remaining,
          y: pos.y + (dy / dist) * remaining,
        };
        remaining = 0;
      }
    }

    const arrived = isWorkerAtBuilding(pos, building.position);
    workers[id] = {
      ...worker,
      position: arrived ? { x: building.position.x, y: building.position.y } : pos,
      path: arrived ? [] : pathCopy,
      isIdle: false,
    };
  }

  return { ...state, workers };
}
```

- [ ] **Step 4: Run tests to confirm they pass**

```bash
npx jest --runInBand src/tests/core/worker.logic.test.ts
```
Expected: all 6 tests PASS.

- [ ] **Step 5: Run full suite**

```bash
npx jest --runInBand
```
Expected: 61 + 6 = 67 pass, 1 pre-existing CSS failure.

- [ ] **Step 6: Commit**

```bash
git add src/game/entities/workers/worker.logic.ts src/tests/core/worker.logic.test.ts
git commit -m "feat: workers walk toward assigned building instead of random wander"
```

---

### Task 2: Guard construction progress to only count arrived workers

**Files:**
- Modify: `src/game/economy/construction.logic.ts`
- Test: `src/tests/core/construction.logic.test.ts`

- [ ] **Step 1: Write failing tests**

Open `src/tests/core/construction.logic.test.ts`. Add a new describe block at the end:

```typescript
describe("processConstruction - arrival guard", () => {
  it("does not advance construction for a worker still walking to the building", () => {
    const state: EconomySimulationState = {
      tick: 0,
      ageOfTeeth: 0,
      players: { p1: { id: "p1", stock: {}, buildings: ["b1"], workers: ["w1"], populationLimit: 20 } as any },
      buildings: {
        b1: {
          id: "b1",
          type: "organHarvester",
          ownerId: "p1",
          level: 0,
          constructionProgress: 0,
          position: { x: 5, y: 5 },
          outputBuffer: {},
          inputBuffer: {},
          internalStorage: {},
          assignedWorkers: ["w1"],
          progressSec: 0,
          isActive: true,
          connectedToRoad: false,
          integrity: 100,
        } as any,
      },
      territory: { tiles: {} } as any,
      workers: {
        w1: {
          id: "w1",
          type: "timberExecutioner",
          ownerId: "p1",
          position: { x: 0, y: 0 }, // far from building at (5,5)
          currentBuildingId: "b1",
          isIdle: false,
          morale: 100,
          infection: 0,
          scars: 0,
        } as any,
      },
      transport: { jobs: {}, activeCarrierTasks: {}, networkStress: 0, averageLatencySec: 0, queuedJobCount: 0 },
      worldPulse: 0,
    } as any;

    const next = processConstruction(state, 30);
    expect(next.buildings["b1"].constructionProgress).toBe(0);
  });

  it("advances construction once worker has arrived at the building", () => {
    const state: EconomySimulationState = {
      tick: 0,
      ageOfTeeth: 0,
      players: { p1: { id: "p1", stock: {}, buildings: ["b1"], workers: ["w1"], populationLimit: 20 } as any },
      buildings: {
        b1: {
          id: "b1",
          type: "organHarvester",
          ownerId: "p1",
          level: 0,
          constructionProgress: 0,
          position: { x: 5, y: 5 },
          outputBuffer: {},
          inputBuffer: {},
          internalStorage: {},
          assignedWorkers: ["w1"],
          progressSec: 0,
          isActive: true,
          connectedToRoad: false,
          integrity: 100,
        } as any,
      },
      territory: { tiles: {} } as any,
      workers: {
        w1: {
          id: "w1",
          type: "timberExecutioner",
          ownerId: "p1",
          position: { x: 5, y: 5 }, // at building
          currentBuildingId: "b1",
          isIdle: false,
          morale: 100,
          infection: 0,
          scars: 0,
        } as any,
      },
      transport: { jobs: {}, activeCarrierTasks: {}, networkStress: 0, averageLatencySec: 0, queuedJobCount: 0 },
      worldPulse: 0,
    } as any;

    const next = processConstruction(state, 30);
    // organHarvester constructionTime = 60s, 1 worker at building, 30s → 0.5
    expect(next.buildings["b1"].constructionProgress).toBeCloseTo(0.5);
  });
});
```

- [ ] **Step 2: Run tests to confirm they fail**

```bash
npx jest --runInBand src/tests/core/construction.logic.test.ts
```
Expected: FAIL — construction advances even when worker hasn't arrived.

- [ ] **Step 3: Update `processConstruction` to check worker arrival**

Open `src/game/economy/construction.logic.ts`. Add import at top:
```typescript
import { isWorkerAtBuilding } from '../entities/workers/worker.logic';
```

Inside `processConstruction`, replace:
```typescript
    const workerCount = building.assignedWorkers.length;
    if (workerCount === 0) continue;

    const effectiveDelta = deltaSec * workerCount;
```
with:
```typescript
    const arrivedCount = building.assignedWorkers.filter(wId => {
      const w = state.workers[wId];
      return w && isWorkerAtBuilding(w.position, building.position);
    }).length;
    if (arrivedCount === 0) continue;

    const effectiveDelta = deltaSec * arrivedCount;
```

- [ ] **Step 4: Run tests to confirm they pass**

```bash
npx jest --runInBand src/tests/core/construction.logic.test.ts
```
Expected: all tests PASS (existing 12 + 2 new = 14 total).

- [ ] **Step 5: Run full suite**

```bash
npx jest --runInBand
```
Expected: 73 pass (67 + 2 new + 4 other), 1 pre-existing CSS failure. Exact count may vary — all should pass.

- [ ] **Step 6: Commit**

```bash
git add src/game/economy/construction.logic.ts src/tests/core/construction.logic.test.ts
git commit -m "feat: construction only advances once worker arrives at building"
```

---

### Task 3: Wire `updateWorkersAI` into `simulateTick`

**Files:**
- Modify: `src/game/core/economy.simulation.ts`
- Test: none needed (integration verified by smoke test)

- [ ] **Step 1: Add import**

Open `src/game/core/economy.simulation.ts`. Add import near the other economy imports:
```typescript
import { updateWorkersAI } from '../entities/workers/worker.logic';
```

- [ ] **Step 2: Add to tick pipeline**

Inside `simulateTick()`, add `updateWorkersAI` after `autoSpawnConstructionWorkers`:
```typescript
  next = processConstruction(next, deltaSec);
  next = autoSpawnConstructionWorkers(next);
  next = updateWorkersAI(next, deltaSec, config);
  next = updateWorkersPassiveState(next, deltaSec, config);
  next = processExtraction(next, deltaSec, config);
  next = processProduction(next, deltaSec, config);
  // ... rest unchanged
```

- [ ] **Step 3: Run full suite**

```bash
npx jest --runInBand
```
Expected: all pass, 1 pre-existing CSS failure.

- [ ] **Step 4: Commit**

```bash
git add src/game/core/economy.simulation.ts
git commit -m "feat: wire updateWorkersAI into simulation tick"
```

---

### Task 4: Manual smoke test

**Files:** None (verification only)

- [ ] **Step 1: Build and start**

```bash
npm run build:vite && npm run preview
```
Open `http://localhost:4173` in the browser.

- [ ] **Step 2: Verify worker spawns at vault and walks to building**

1. Place a building (e.g. Organ Harvester) on a valid tile
2. Wait 1–2 seconds — a worker should appear at the **vault position** (7,7)
3. The worker should visually move from the vault toward the construction site
4. Once the worker arrives, construction stages should begin advancing (0→1→2→3→4)
5. After stage 4, building becomes operational

- [ ] **Step 3: Verify worker stays at building after construction**

After stage 4 is reached, the worker should remain at the building (not return to vault or wander).
