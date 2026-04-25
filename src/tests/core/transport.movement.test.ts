import { advanceCarrierMovement } from "../../game/economy/transport.logic";
import { EconomySimulationState, createId } from "../../game/core/economy.simulation";
import { DEFAULT_SIMULATION_CONFIG } from "../../game/economy/balancing.constants";
import { WORKER_DEFINITIONS } from "../../game/core/economy.data";
import { WorkerInstance, BuildingInstance, TerritoryState, MapTile } from "../../game/core/game.types";

describe("transport.movement", () => {
  let state: EconomySimulationState;

  beforeEach(() => {
    state = {
      tick: 0,
      ageOfTeeth: 0,
      players: {},
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
  });

  const createTile = (x: number, y: number, tier: "grass" | "dirt" | "cobble" | "paved" = "grass"): MapTile => {
    const tile: MapTile = {
      id: `tile_${x}_${y}`,
      position: { x, y },
      terrain: "weepingForest",
      footfall: 0,
      tier
    };
    state.territory.tiles[tile.id] = tile;
    state.territory.tileIndex![`${x},${y}`] = tile.id;
    return tile;
  };

  it("advances stepProgress by config speed on grass", () => {
    const carrierId = createId("wrk");
    const srcId = createId("bld");
    const tgtId = createId("bld");
    const jobId = createId("job");

    createTile(0, 0, "grass");
    createTile(1, 0, "grass");

    state.buildings[srcId] = { id: srcId, position: { x: 0, y: 0 } } as BuildingInstance;
    state.buildings[tgtId] = { id: tgtId, position: { x: 1, y: 0 } } as BuildingInstance;
    state.workers[carrierId] = { id: carrierId, position: { x: 0, y: 0 } } as WorkerInstance;
    state.transport.jobs[jobId] = { id: jobId, status: "claimed", amount: 1 } as any;

    state.transport.activeCarrierTasks[carrierId] = {
      workerId: carrierId,
      jobId,
      pickupBuildingId: srcId,
      dropoffBuildingId: tgtId,
      resourceType: "sinewTimber",
      amount: 1,
      phase: "toPickup",
      path: [{ x: 0, y: 0 }, { x: 1, y: 0 }],
      pathIndex: 0,
      stepProgress: 0
    };

    const config = {
      ...DEFAULT_SIMULATION_CONFIG,
      carrierBaseSpeed: 1,
      carrierEncumbrancePenalty: 0,
      tierSpeedMultipliers: { grass: 1, dirt: 1.2, cobble: 1.5, paved: 2.0 }
    };
    advanceCarrierMovement(state, 0.5, config);

    const task = state.transport.activeCarrierTasks[carrierId];
    expect(task.stepProgress).toBeCloseTo(0.5); // 1 * 1 * 0.5
    expect(task.pathIndex).toBe(0);
  });

  it("steps and increments footfall when progress >= 1", () => {
    const carrierId = createId("wrk");
    const srcId = createId("bld");
    const tgtId = createId("bld");
    const jobId = createId("job");

    createTile(0, 0, "dirt"); // speed mult 1.2
    const t1 = createTile(1, 0, "grass");

    createTile(2, 0, "grass");
    state.buildings[srcId] = { id: srcId, position: { x: 0, y: 0 } } as BuildingInstance;
    state.buildings[tgtId] = { id: tgtId, position: { x: 2, y: 0 } } as BuildingInstance;
    state.workers[carrierId] = { id: carrierId, position: { x: 0, y: 0 } } as WorkerInstance;
    state.transport.jobs[jobId] = { id: jobId, status: "claimed", amount: 1 } as any;

    state.transport.activeCarrierTasks[carrierId] = {
      workerId: carrierId,
      jobId,
      pickupBuildingId: srcId,
      dropoffBuildingId: tgtId,
      resourceType: "sinewTimber",
      amount: 1,
      phase: "toPickup",
      path: [{ x: 0, y: 0 }, { x: 1, y: 0 }, { x: 2, y: 0 }],
      pathIndex: 0,
      stepProgress: 0.8
    };

    const config = { ...DEFAULT_SIMULATION_CONFIG, carrierBaseSpeed: 1, tierSpeedMultipliers: { grass: 1, dirt: 1.2, cobble: 1.5, paved: 2 } };
    // Destination tile (1,0) is grass (mult=1.0): step = 1 * 1.0 * 0.5 = 0.5. Total = 0.8 + 0.5 = 1.3.
    advanceCarrierMovement(state, 0.5, config);

    const task = state.transport.activeCarrierTasks[carrierId];
    expect(task.pathIndex).toBe(1);
    expect(task.stepProgress).toBeCloseTo(0.3);
    expect(state.workers[carrierId].position).toEqual({ x: 1, y: 0 });
    expect(state.territory.tiles[t1.id].footfall).toBe(1);
  });

  it("handles phase transition toDropoff and delivery completion", () => {
    const carrierId = createId("wrk");
    const srcId = createId("bld");
    const tgtId = createId("bld");
    const jobId = createId("job");

    createTile(0, 0);
    createTile(1, 0);

    state.buildings[srcId] = {
      id: srcId, position: { x: 1, y: 0 }, outputBuffer: { sinewTimber: 1 }
    } as any;
    state.buildings[tgtId] = {
      id: tgtId, position: { x: 0, y: 0 }, inputBuffer: {}
    } as any;
    state.workers[carrierId] = { id: carrierId, position: { x: 1, y: 0 } } as WorkerInstance;
    state.transport.jobs[jobId] = { id: jobId, status: "claimed", amount: 1, delivered: 0, reserved: 1 } as any;

    state.transport.activeCarrierTasks[carrierId] = {
      workerId: carrierId,
      jobId,
      pickupBuildingId: srcId,
      dropoffBuildingId: tgtId,
      resourceType: "sinewTimber",
      amount: 1,
      phase: "toPickup",
      path: [{ x: 0, y: 0 }, { x: 1, y: 0 }],
      pathIndex: 1,
      stepProgress: 1.0 // Trigger arrival
    };

    const config = { ...DEFAULT_SIMULATION_CONFIG };
    advanceCarrierMovement(state, 0.1, config);

    const taskAfterPickup = state.transport.activeCarrierTasks[carrierId];
    expect(taskAfterPickup.phase).toBe("toDropoff");
    expect(state.buildings[srcId].outputBuffer.sinewTimber).toBe(0);

    // Force arrive at dropoff
    expect(taskAfterPickup.path[taskAfterPickup.path.length - 1]).toEqual({ x: 0, y: 0 });
    taskAfterPickup.pathIndex = taskAfterPickup.path.length - 1;
    taskAfterPickup.stepProgress = 1.0;

    advanceCarrierMovement(state, 0.1, config);

    expect(state.transport.activeCarrierTasks[carrierId]).toBeUndefined();
    expect(state.transport.jobs[jobId].status).toBe("delivered");
    expect(state.buildings[tgtId].inputBuffer.sinewTimber).toBe(1);
    expect(state.workers[carrierId].isIdle).toBe(true);
  });

  it("applies worker moveSpeed to carrier movement progress", () => {
    const carrierId = createId("wrk");
    const srcId = createId("bld");
    const tgtId = createId("bld");
    const jobId = createId("job");
    const originalMoveSpeed = WORKER_DEFINITIONS.burdenThrall.moveSpeed;

    try {
      WORKER_DEFINITIONS.burdenThrall.moveSpeed = 2;
      createTile(0, 0, "grass");
      createTile(1, 0, "grass");

      state.buildings[srcId] = { id: srcId, position: { x: 0, y: 0 } } as BuildingInstance;
      state.buildings[tgtId] = { id: tgtId, position: { x: 1, y: 0 } } as BuildingInstance;
      state.workers[carrierId] = { id: carrierId, type: "burdenThrall", position: { x: 0, y: 0 } } as WorkerInstance;
      state.transport.jobs[jobId] = { id: jobId, status: "claimed", amount: 1 } as any;

      state.transport.activeCarrierTasks[carrierId] = {
        workerId: carrierId,
        jobId,
        pickupBuildingId: srcId,
        dropoffBuildingId: tgtId,
        resourceType: "sinewTimber",
        amount: 1,
        phase: "toPickup",
        path: [{ x: 0, y: 0 }, { x: 1, y: 0 }],
        pathIndex: 0,
        stepProgress: 0
      };

      advanceCarrierMovement(state, 0.25, { ...DEFAULT_SIMULATION_CONFIG, carrierBaseSpeed: 1, carrierEncumbrancePenalty: 0 });

      const task = state.transport.activeCarrierTasks[carrierId];
      expect(task.pathIndex).toBe(0);
      expect(task.stepProgress).toBeCloseTo(0.5);
    } finally {
      WORKER_DEFINITIONS.burdenThrall.moveSpeed = originalMoveSpeed;
    }
  });

  it("rescales carry-over progress correctly after crossing into a slower tile", () => {
    const carrierId = createId("wrk");
    const srcId = createId("bld");
    const tgtId = createId("bld");
    const jobId = createId("job");

    createTile(0, 0, "grass");
    createTile(1, 0, "paved");
    createTile(2, 0, "grass");

    state.buildings[srcId] = { id: srcId, position: { x: 0, y: 0 } } as BuildingInstance;
    state.buildings[tgtId] = { id: tgtId, position: { x: 2, y: 0 } } as BuildingInstance;
    state.workers[carrierId] = { id: carrierId, type: "burdenThrall", position: { x: 0, y: 0 } } as WorkerInstance;
    state.transport.jobs[jobId] = { id: jobId, status: "claimed", amount: 1 } as any;

    state.transport.activeCarrierTasks[carrierId] = {
      workerId: carrierId,
      jobId,
      pickupBuildingId: srcId,
      dropoffBuildingId: tgtId,
      resourceType: "sinewTimber",
      amount: 1,
      phase: "toPickup",
      path: [{ x: 0, y: 0 }, { x: 1, y: 0 }, { x: 2, y: 0 }],
      pathIndex: 0,
      stepProgress: 0.9
    };

    const config = {
      ...DEFAULT_SIMULATION_CONFIG,
      carrierBaseSpeed: 1,
      tierSpeedMultipliers: { grass: 1, dirt: 1.2, cobble: 1.5, paved: 2 }
    };

    advanceCarrierMovement(state, 0.1, config);

    const task = state.transport.activeCarrierTasks[carrierId];
    expect(task.pathIndex).toBe(1);
    // 0.05s remain after crossing into tile (1,0); on grass that becomes 0.05 progress.
    expect(task.stepProgress).toBeCloseTo(0.05);
  });

  it("does not trigger single-point arrival when deltaSec is zero", () => {
    const carrierId = createId("wrk");
    const srcId = createId("bld");
    const tgtId = createId("bld");
    const jobId = createId("job");

    createTile(0, 0, "grass");
    state.buildings[srcId] = { id: srcId, position: { x: 0, y: 0 }, outputBuffer: { sinewTimber: 1 } } as any;
    state.buildings[tgtId] = { id: tgtId, position: { x: 0, y: 0 }, inputBuffer: {} } as any;
    state.workers[carrierId] = { id: carrierId, type: "burdenThrall", position: { x: 0, y: 0 } } as WorkerInstance;
    state.transport.jobs[jobId] = { id: jobId, status: "claimed", amount: 1, delivered: 0, reserved: 1 } as any;

    state.transport.activeCarrierTasks[carrierId] = {
      workerId: carrierId,
      jobId,
      pickupBuildingId: srcId,
      dropoffBuildingId: tgtId,
      resourceType: "sinewTimber",
      amount: 1,
      phase: "toPickup",
      path: [{ x: 0, y: 0 }],
      pathIndex: 0,
      stepProgress: 0
    };

    advanceCarrierMovement(state, 0, DEFAULT_SIMULATION_CONFIG);

    expect(state.transport.activeCarrierTasks[carrierId]).toBeDefined();
    expect(state.transport.jobs[jobId].status).toBe("claimed");
    expect(state.transport.activeCarrierTasks[carrierId].stepProgress).toBe(0);
  });
});
