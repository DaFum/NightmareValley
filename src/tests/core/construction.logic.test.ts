import { processConstruction } from "../../game/economy/construction.logic";
import { EconomySimulationState } from "../../game/core/economy.simulation";

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
