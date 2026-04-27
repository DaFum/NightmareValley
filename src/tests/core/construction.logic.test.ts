import { processConstruction, autoSpawnConstructionWorkers } from "../../game/economy/construction.logic";
import { EconomySimulationState } from "../../game/core/economy.simulation";
import { BUILDING_DEFINITIONS } from "../../game/core/economy.data";

function makeState(overrides: Record<string, any> = {}): EconomySimulationState {
  return {
    tick: 0,
    ageOfTeeth: 0,
    players: { p1: { id: "p1", stock: {}, buildings: ["b1"] } as any },
    buildings: {
      b1: {
        id: "b1",
        type: "organHarvester",
        ownerId: "p1",
        level: 0,
        constructionProgress: 0,
        position: { x: 0, y: 0 },
        outputBuffer: {},
        inputBuffer: {},
        internalStorage: {},
        assignedWorkers: [],
        progressSec: 0,
        isActive: true,
        connectedToRoad: false,
        integrity: 100,
        ...overrides,
      } as any,
    },
    territory: { tiles: {} } as any,
    workers: {},
    transport: { jobs: {}, activeCarrierTasks: {}, networkStress: 0, averageLatencySec: 0, queuedJobCount: 0 },
    worldPulse: 0,
  } as any;
}

function makeSpawnState(buildingOverrides: Record<string, any> = {}, playerOverrides: Record<string, any> = {}): EconomySimulationState {
  const vaultId = "vault1";
  const buildingId = "b1";
  return {
    tick: 0,
    ageOfTeeth: 0,
    players: {
      p1: {
        id: "p1",
        stock: {},
        buildings: [vaultId, buildingId],
        workers: [],
        populationLimit: 20,
        ...playerOverrides,
      } as any,
    },
    buildings: {
      [vaultId]: {
        id: vaultId,
        type: "vaultOfDigestiveStone",
        ownerId: "p1",
        level: 1,
        position: { x: 7, y: 7 },
        outputBuffer: {},
        inputBuffer: {},
        internalStorage: {},
        assignedWorkers: [],
        progressSec: 0,
        isActive: true,
        connectedToRoad: true,
        integrity: 100,
      } as any,
      [buildingId]: {
        id: buildingId,
        type: "organHarvester",
        ownerId: "p1",
        level: 0,
        constructionProgress: 0,
        position: { x: 5, y: 7 },
        outputBuffer: {},
        inputBuffer: {},
        internalStorage: {},
        assignedWorkers: [],
        progressSec: 0,
        isActive: true,
        connectedToRoad: false,
        integrity: 100,
        ...buildingOverrides,
      } as any,
    },
    territory: { tiles: {} } as any,
    workers: {},
    transport: { jobs: {}, activeCarrierTasks: {}, networkStress: 0, averageLatencySec: 0, queuedJobCount: 0 },
    worldPulse: 0,
  } as any;
}

describe("processConstruction", () => {
  it("does not advance progress when no workers are assigned", () => {
    const state = makeState({ assignedWorkers: [] });
    const next = processConstruction(state, 10);
    expect(next.buildings["b1"].constructionProgress).toBe(0);
  });

  it("advances progress proportional to worker count", () => {
    // organHarvester constructionTime = 60s, 1 worker, 30s delta → 0.5 progress
    const state = makeState({ assignedWorkers: ["w1"] });
    const next = processConstruction(state, 30);
    expect(next.buildings["b1"].constructionProgress).toBeCloseTo(0.5);
  });

  it("advances progress faster with more workers", () => {
    // 2 workers, 30s delta → 1.0 progress (complete) → constructionProgress deleted
    const state = makeState({ assignedWorkers: ["w1", "w2"] });
    const next = processConstruction(state, 30);
    expect(next.buildings["b1"].constructionProgress).toBeUndefined();
  });

  it("sets level to 1 when construction completes", () => {
    const state = makeState({ assignedWorkers: ["w1", "w2"] });
    const next = processConstruction(state, 30);
    expect(next.buildings["b1"].level).toBe(1);
  });

  it("does not touch buildings that are already constructed", () => {
    const state = makeState({ level: 1, constructionProgress: undefined, assignedWorkers: ["w1"] });
    const next = processConstruction(state, 30);
    expect(next.buildings["b1"].level).toBe(1);
    expect(next.buildings["b1"].constructionProgress).toBeUndefined();
  });

  it("does not advance progress for inactive buildings", () => {
    const state = makeState({ assignedWorkers: ["w1"], isActive: false });
    const next = processConstruction(state, 30);
    expect(next.buildings["b1"].constructionProgress).toBe(0);
  });
});

describe("autoSpawnConstructionWorkers", () => {
  it("spawns a worker at the vault and assigns them to the construction building", () => {
    const state = makeSpawnState();
    const next = autoSpawnConstructionWorkers(state);
    const workers = Object.values(next.workers);
    expect(workers.length).toBe(1);
    const validTypes = Object.keys(BUILDING_DEFINITIONS["organHarvester"].workerSlots);
    expect(validTypes).toContain(workers[0].type);
    expect(next.buildings["b1"].assignedWorkers).toContain(workers[0].id);
  });

  it("spawns the worker at the vault position", () => {
    const state = makeSpawnState();
    const next = autoSpawnConstructionWorkers(state);
    const workers = Object.values(next.workers);
    expect(workers[0].position).toEqual({ x: 7, y: 7 });
  });

  it("does not spawn a worker if building already has one assigned", () => {
    const state = makeSpawnState({ assignedWorkers: ["existing_worker"] });
    const next = autoSpawnConstructionWorkers(state);
    expect(Object.values(next.workers).length).toBe(0);
  });

  it("does not spawn a worker if building is already constructed", () => {
    const state = makeSpawnState({ constructionProgress: undefined, level: 1 });
    const next = autoSpawnConstructionWorkers(state);
    expect(Object.values(next.workers).length).toBe(0);
  });

  it("does not spawn a worker if population limit is reached", () => {
    const workerIds = Array.from({ length: 20 }, (_, i) => `w${i}`);
    const state = makeSpawnState({}, { workers: workerIds, populationLimit: 20 });
    const next = autoSpawnConstructionWorkers(state);
    expect(Object.values(next.workers).length).toBe(0);
  });

  it("does not spawn a worker if player has no vault", () => {
    const state = makeSpawnState();
    const noVaultState = {
      ...state,
      buildings: { b1: state.buildings["b1"] },
      players: {
        p1: { ...(state.players as any)["p1"], buildings: ["b1"] },
      },
    } as any;
    const next = autoSpawnConstructionWorkers(noVaultState);
    expect(Object.values(next.workers).length).toBe(0);
  });
});
