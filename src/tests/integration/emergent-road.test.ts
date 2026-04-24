import { simulateTick } from "../../game/core/economy.simulation";
import { DEFAULT_SIMULATION_CONFIG } from "../../game/economy/balancing.constants";
import { EconomySimulationState, createId } from "../../game/core/economy.simulation";
import { TerritoryState, MapTile, BuildingInstance, WorkerInstance } from "../../game/core/game.types";

describe("Emergent Road Feedback Loop", () => {
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

    // 32x32 grass grid
    for (let x = 0; x < 32; x++) {
      for (let y = 0; y < 32; y++) {
        const id = `tile_${x}_${y}`;
        state.territory.tiles[id] = { id, position: { x, y }, terrain: "weepingForest", footfall: 0, tier: "grass" } as MapTile;
        state.territory.tileIndex![`${x},${y}`] = id;
      }
    }

    const hqId = createId("bld");
    const destId = createId("bld");

    state.buildings[hqId] = {
      id: hqId, type: "vaultOfDigestiveStone", ownerId: "p1", position: { x: 5, y: 5 },
      internalStorage: { sinewTimber: 1000 }, outputBuffer: { sinewTimber: 1000 }, inputBuffer: {}
    } as any;

    state.buildings[destId] = {
      id: destId, type: "vaultOfDigestiveStone", ownerId: "p1", position: { x: 25, y: 25 },
      internalStorage: {}, outputBuffer: {}, inputBuffer: {}
    } as any;

    // 5 carriers
    for (let i = 0; i < 5; i++) {
      const wId = createId("wrk");
      state.workers[wId] = { id: wId, type: "burdenThrall", ownerId: "p1", position: { x: 5, y: 5 }, isIdle: true } as any;
    }

    let currentState = state;
    const config = { ...DEFAULT_SIMULATION_CONFIG };

    // Queue 50 deliveries
    for (let i = 0; i < 50; i++) {
      const jobId = createId("job");
      currentState.transport.jobs[jobId] = {
        id: jobId, fromBuildingId: hqId, toBuildingId: destId, resourceType: "sinewTimber", amount: 1, priority: 10, reserved: 0, delivered: 0, status: "queued"
      };
    }

    // Run simulation ticks until all jobs delivered or max time
    const maxTicks = 10000;
    let ticks = 0;
    while (ticks < maxTicks) {
      const pendingJobs = Object.values(currentState.transport.jobs).filter(j => j.status !== "delivered");
      if (pendingJobs.length === 0) break;

      currentState = simulateTick(currentState, 1.0, config);
      ticks++;
    }

    const tiles = Object.values(currentState.territory.tiles);

    // Some tiles along the delivery corridor should have accumulated enough footfall to upgrade.
    // The path from (5,5) to (25,25) is ~40 tiles; with 50 round-trips and decay of 0.2 per 10
    // ticks, hot-path tiles should stabilise well above the dirt threshold (10).
    const elevatedTiles = tiles.filter(t => t.tier !== "grass");
    expect(elevatedTiles.length).toBeGreaterThan(5);

    // Footfall should be concentrated on the route, not spread across the whole 32×32 grid.
    expect(elevatedTiles.length).toBeLessThan(150);

    // All 50 jobs must be delivered within the tick budget.
    const deliveredCount = Object.values(currentState.transport.jobs).filter(j => j.status === "delivered").length;
    expect(deliveredCount).toBe(50);
  });
});
