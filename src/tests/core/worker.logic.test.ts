import { updateWorkersAI } from "../../game/entities/workers/worker.logic";
import { EconomySimulationState } from "../../game/core/economy.simulation";
import { DEFAULT_SIMULATION_CONFIG } from "../../game/economy/balancing.constants";

function makeState(workerOverrides: Record<string, any> = {}): EconomySimulationState {
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
    const state = makeState({ position: { x: 4.95, y: 4.95 } });
    const next = updateWorkersAI(state, 1, DEFAULT_SIMULATION_CONFIG);
    const worker = next.workers["w1"];
    expect(worker.position.x).toBeCloseTo(5);
    expect(worker.position.y).toBeCloseTo(5);
    expect(worker.isIdle).toBe(false);
  });

  it("transitions burdenThrall back to idle when building finishes construction", () => {
    const state = makeState({ type: "burdenThrall", isIdle: false });
    state.buildings["b1"].constructionProgress = undefined; // Fully constructed
    state.buildings["b1"].level = 1;

    const next = updateWorkersAI(state, 1, DEFAULT_SIMULATION_CONFIG);
    const worker = next.workers["w1"];
    expect(worker.isIdle).toBe(true);
    expect(worker.currentBuildingId).toBeUndefined();
    expect(worker.position).toEqual({ x: 0, y: 0 });
  });

  it("does not mark burdenThrall idle while it has an active transport task", () => {
    const state = makeState({ type: "burdenThrall", isIdle: false, currentBuildingId: undefined });
    state.transport.activeCarrierTasks["w1"] = {
      workerId: "w1",
      jobId: "job1",
      pickupBuildingId: "b1",
      dropoffBuildingId: "b2",
      resourceType: "sinewTimber",
      amount: 1,
      phase: "toDropoff",
      path: [{ x: 0, y: 0 }, { x: 1, y: 0 }],
      pathIndex: 0,
      stepProgress: 0.25,
    };

    const next = updateWorkersAI(state, 1, DEFAULT_SIMULATION_CONFIG);
    const worker = next.workers["w1"];
    expect(worker.isIdle).toBe(false);
    expect(worker.currentBuildingId).toBeUndefined();
    expect(state.transport.activeCarrierTasks["w1"]).toBeDefined();
  });

  it("does not move burdenThrall workers assigned to constructed buildings", () => {
    const state = makeState({ type: "burdenThrall" });
    state.buildings["b1"].constructionProgress = undefined; // Fully constructed
    state.buildings["b1"].level = 1;
    const next = updateWorkersAI(state, 1, DEFAULT_SIMULATION_CONFIG);
    expect(next.workers["w1"].position).toEqual({ x: 0, y: 0 });
  });

  it("does not move worker with no currentBuildingId", () => {
    const state = makeState({ currentBuildingId: undefined });
    const next = updateWorkersAI(state, 1, DEFAULT_SIMULATION_CONFIG);
    expect(next.workers["w1"].position).toEqual({ x: 0, y: 0 });
  });

  it("worker already at building stays put with isIdle false", () => {
    const state = makeState({ position: { x: 5, y: 5 } });
    const next = updateWorkersAI(state, 1, DEFAULT_SIMULATION_CONFIG);
    expect(next.workers["w1"].position).toEqual({ x: 5, y: 5 });
    expect(next.workers["w1"].isIdle).toBe(false);
  });

  it("limits movement per tick to moveSpeed * deltaSec", () => {
    // "w1" is at 0,0 and target is at 5,5
    const state = makeState();
    // Simulate with a small delta so they don't arrive immediately
    const deltaSec = 0.5;
    const next = updateWorkersAI(state, deltaSec, DEFAULT_SIMULATION_CONFIG);
    const worker = next.workers["w1"];

    // Timber Executioner moveSpeed is 1
    const dx = worker.position.x - 0;
    const dy = worker.position.y - 0;
    const distanceMoved = Math.sqrt(dx * dx + dy * dy);

    expect(distanceMoved).toBeCloseTo(1.0 * deltaSec);
  });
});
