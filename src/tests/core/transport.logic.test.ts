import { DEFAULT_SIMULATION_CONFIG } from "../../game/economy/balancing.constants";
import { findTargetBuildingsForResource, gridManhattanDistance, updateTransportMetrics } from "../../game/economy/transport.logic";
import { EconomySimulationState } from "../../game/core/economy.simulation";

describe("transport.logic", () => {
  it("uses Manhattan distance as tiebreaker for equal-need targets", () => {
    const state: EconomySimulationState = {
      tick: 0,
      ageOfTeeth: 0,
      players: {},
      buildings: {
        source: {
          id: "source",
          ownerId: "p1",
          type: "organHarvester",
          position: { x: 0, y: 0 },
          outputBuffer: { sinewTimber: 2 },
          inputBuffer: {},
          internalStorage: {}
        } as any,
        near: {
          id: "near",
          ownerId: "p1",
          type: "vaultOfDigestiveStone",
          position: { x: 1, y: 0 },
          inputBuffer: {},
          internalStorage: {}
        } as any,
        far: {
          id: "far",
          ownerId: "p1",
          type: "vaultOfDigestiveStone",
          position: { x: 6, y: 0 },
          inputBuffer: {},
          internalStorage: {}
        } as any,
      },
      workers: {},
      territory: { tiles: {}, tileIndex: {} } as any,
      transport: {
        jobs: {},
        activeCarrierTasks: {},
        networkStress: 0,
        averageLatencySec: 0,
        queuedJobCount: 0
      },
      worldPulse: 0
    };

    const source = state.buildings.source as any;
    const sorted = findTargetBuildingsForResource(
      state,
      source,
      "sinewTimber",
      DEFAULT_SIMULATION_CONFIG
    );

    expect(sorted.map((b) => b.id)).toEqual(["near", "far"]);
  });

  it("uses Manhattan distance consistently for transport latency metrics", () => {
    const state: EconomySimulationState = {
      tick: 0,
      ageOfTeeth: 0,
      players: {},
      buildings: {
        a: { id: "a", ownerId: "p1", type: "organHarvester", position: { x: 0, y: 0 } } as any,
        b: { id: "b", ownerId: "p1", type: "vaultOfDigestiveStone", position: { x: 3, y: 4 } } as any,
      },
      workers: {},
      territory: { tiles: {}, tileIndex: {} } as any,
      transport: {
        jobs: {
          j1: {
            id: "j1",
            fromBuildingId: "a",
            toBuildingId: "b",
            resourceType: "sinewTimber",
            amount: 1,
            priority: 1,
            reserved: 0,
            delivered: 0,
            status: "queued",
          } as any,
        },
        activeCarrierTasks: {},
        networkStress: 0,
        averageLatencySec: 0,
        queuedJobCount: 1
      },
      worldPulse: 0
    };

    updateTransportMetrics(state, DEFAULT_SIMULATION_CONFIG);
    expect(gridManhattanDistance({ x: 0, y: 0 }, { x: 3, y: 4 })).toBe(7);
    expect(state.transport.averageLatencySec).toBe(7);
  });
});
