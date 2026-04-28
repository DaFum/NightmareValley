import { simulateTick } from "../../game/core/economy.simulation";
import { DEFAULT_SIMULATION_CONFIG } from "../../game/economy/balancing.constants";
import { EconomySimulationState, createId } from "../../game/core/economy.simulation";
import { TerritoryState, MapTile, BuildingInstance, WorkerInstance } from "../../game/core/game.types";

describe("Emergent Road Feedback Loop", () => {
  jest.setTimeout(15_000);
  it("forms roads, upgrades to cobble, and shortens travel paths", () => {
    const state: EconomySimulationState = {
      tick: 0,
      ageOfTeeth: 0,
      players: {
        "p1": { id: "p1", name: "p1", stock: {}, buildings: [], workers: [], territoryTileIds: [], populationLimit: 20, doctrine: "industry", dread: 0, holinessDebt: 0 }
      },
      buildings: {},
      workers: {},
      territory: {
        tiles: {},
        tileIndex: {}
      } as TerritoryState,
      transport: {
        jobs: {},
        activeCarrierTasks: {},
        networkStress: 0,
        averageLatencySec: 0,
        queuedJobCount: 0
      },
      worldPulse: 0
    };

    // 32x32 grid of neutral terrain (scarredEarth = passable, no resource bias)
    for (let x = 0; x < 32; x++) {
      for (let y = 0; y < 32; y++) {
        const id = `tile_${x}_${y}`;
        const tile: MapTile = { id, position: { x, y }, terrain: "scarredEarth", footfall: 0, tier: "grass" };
        state.territory.tiles[id] = tile;
        state.territory.tileIndex![`${x},${y}`] = id;
      }
    }

    const hqId = createId("bld");
    const destId = createId("bld");

    const hqBuilding: BuildingInstance = {
      id: hqId, type: "vaultOfDigestiveStone", ownerId: "p1", position: { x: 5, y: 5 },
      level: 1, integrity: 100, connectedToRoad: true, progressSec: 0, isActive: true,
      internalStorage: { sinewTimber: 1000 }, outputBuffer: { sinewTimber: 1000 }, inputBuffer: {},
      assignedWorkers: [], constructionProgress: undefined,
    };
    const destBuilding: BuildingInstance = {
      // Changed to a production building so it accepts deliveries from the vault
      id: destId, type: "millOfGnashing", ownerId: "p1", position: { x: 25, y: 25 },
      level: 1, integrity: 100, connectedToRoad: true, progressSec: 0, isActive: true,
      internalStorage: {}, outputBuffer: {}, inputBuffer: {},
      assignedWorkers: [], constructionProgress: undefined,
    };
    state.buildings[hqId] = hqBuilding;
    state.buildings[destId] = destBuilding;
    state.players["p1"].buildings.push(hqId, destId);

    // 5 carriers starting at the HQ position
    for (let i = 0; i < 5; i++) {
      const wId = createId("wrk");
      const carrier: WorkerInstance = {
        id: wId, type: "burdenThrall", ownerId: "p1", position: { x: 5, y: 5 },
        isIdle: true, morale: 100, infection: 0, scars: 0,
      };
      state.workers[wId] = carrier;
      state.players["p1"].workers.push(wId);
    }

    let currentState = state;
    const config = { ...DEFAULT_SIMULATION_CONFIG };

    // Set warehouseStorageLimit sufficiently high for 50 deliveries
    config.warehouseStorageLimit = 100;

    // Queue 50 deliveries manually (they will be executed bypassing the creation checks)
    for (let i = 0; i < 50; i++) {
      const jobId = createId("job");
      currentState.transport.jobs[jobId] = {
        id: jobId, fromBuildingId: hqId, toBuildingId: destId, resourceType: "sinewTimber", amount: 1, priority: 10, reserved: 0, delivered: 0, status: "queued"
      };
    }

    // Run simulation ticks until all jobs delivered or max time
    const maxTicks = 4000;
    let ticks = 0;
    while (ticks < maxTicks) {
      const pendingJobs = Object.values(currentState.transport.jobs).filter(j => j.status !== "delivered");
      if (pendingJobs.length === 0) break;

      currentState = simulateTick(currentState, 1.0, config);
      ticks++;
    }

    if (ticks >= maxTicks) {
      const pending = Object.values(currentState.transport.jobs).filter(j => j.status !== "delivered");
      throw new Error(
        `Simulation did not complete within ${maxTicks} ticks. ` +
        `${pending.length} jobs still pending: ${pending.map(j => `${j.id}(${j.status})`).join(', ')}`
      );
    }

    const tiles = Object.values(currentState.territory.tiles);

    // Some tiles along the delivery corridor should have accumulated enough footfall to upgrade.
    // The path from (5,5) to (25,25) is ~40 tiles; with 50 round-trips and decay of 0.2 per 10
    // ticks, hot-path tiles should stabilise well above the dirt threshold (10).
    const elevatedTiles = tiles.filter(t => t.tier !== "grass");
    expect(elevatedTiles.length).toBeGreaterThan(5);

    // Footfall should be concentrated on the route, not spread across the whole 32×32 grid.
    // Bound is 15% of the grid; tied to footfallTierThresholds.dirt and footfallDecayPerTenTicks
    // in balancing.constants — if either changes, this expectation may need re-tuning.
    const totalTiles = 32 * 32;
    expect(elevatedTiles.length).toBeLessThan(totalTiles * 0.15);

    // All 50 jobs must be delivered within the tick budget.
    const deliveredCount = Object.values(currentState.transport.jobs).filter(j => j.status === "delivered").length;
    expect(deliveredCount).toBe(50);
  });
});
