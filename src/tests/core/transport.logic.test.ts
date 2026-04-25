import { DEFAULT_SIMULATION_CONFIG } from "../../game/economy/balancing.constants";
import { findBestJobForCarrier, findTargetBuildingsForResource, gridManhattanDistance, updateTransportMetrics } from "../../game/economy/transport.logic";
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

    updateTransportMetrics(
      state,
      { ...DEFAULT_SIMULATION_CONFIG, carrierBaseSpeed: 2 }
    );
    expect(gridManhattanDistance({ x: 0, y: 0 }, { x: 3, y: 4 })).toBe(7);
    expect(state.transport.averageLatencySec).toBe(3.5);
  });

  it("treats queued sibling jobs as pending demand when selecting best carrier job", () => {
    const state: EconomySimulationState = {
      tick: 0,
      ageOfTeeth: 0,
      players: {},
      buildings: {
        src: { id: "src", ownerId: "p1", type: "organHarvester", position: { x: 0, y: 0 }, outputBuffer: { sinewTimber: 1 } } as any,
        tgtA: { id: "tgtA", ownerId: "p1", type: "vaultOfDigestiveStone", position: { x: 1, y: 0 }, inputBuffer: {}, internalStorage: {} } as any,
        tgtB: { id: "tgtB", ownerId: "p1", type: "vaultOfDigestiveStone", position: { x: 2, y: 0 }, inputBuffer: {}, internalStorage: {} } as any,
      },
      workers: {
        wrk: { id: "wrk", ownerId: "p1", type: "burdenThrall", position: { x: 0, y: 0 }, isIdle: true } as any
      },
      territory: { tiles: {}, tileIndex: {} } as any,
      transport: {
        jobs: {
          queuedSibling: {
            id: "queuedSibling",
            fromBuildingId: "src",
            toBuildingId: "tgtA",
            resourceType: "sinewTimber",
            amount: 1,
            priority: 50,
            reserved: 0,
            delivered: 0,
            status: "queued"
          } as any
        },
        activeCarrierTasks: {},
        networkStress: 0,
        averageLatencySec: 0,
        queuedJobCount: 1
      },
      worldPulse: 0
    };

    const candidate = {
      id: "candidate",
      fromBuildingId: "src",
      toBuildingId: "tgtB",
      resourceType: "sinewTimber",
      amount: 1,
      priority: 100,
      reserved: 0,
      delivered: 0,
      status: "queued"
    } as any;

    const best = findBestJobForCarrier(
      state,
      state.workers.wrk as any,
      [candidate],
      DEFAULT_SIMULATION_CONFIG
    );

    expect(best).toBeNull();
  });
});
