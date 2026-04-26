import {
  placeBuilding,
  upgradeBuilding,
  syncStockFromVaults,
  createBuildingInstance,
  EconomySimulationState,
} from "../../game/core/economy.simulation";
import { TerritoryState } from "../../game/core/game.types";

function makeState(overrides: Partial<EconomySimulationState> = {}): EconomySimulationState {
  return {
    tick: 0,
    ageOfTeeth: 0,
    players: {},
    buildings: {},
    workers: {},
    territory: { tiles: {}, tileIndex: {} } as TerritoryState,
    transport: {
      jobs: {},
      activeCarrierTasks: {},
      networkStress: 0,
      averageLatencySec: 0,
      queuedJobCount: 0,
    },
    worldPulse: 0,
    ...overrides,
  };
}

describe("syncStockFromVaults", () => {
  it("aggregates all vault outputBuffers into player.stock", () => {
    const state = makeState({
      players: {
        p1: {
          id: "p1",
          stock: {},
          buildings: ["v1", "v2"],
          workers: [],
        } as any,
      },
      buildings: {
        v1: {
          id: "v1",
          ownerId: "p1",
          type: "vaultOfDigestiveStone",
          outputBuffer: { toothPlanks: 10, sepulcherStone: 5 },
        } as any,
        v2: {
          id: "v2",
          ownerId: "p1",
          type: "vaultOfDigestiveStone",
          outputBuffer: { toothPlanks: 20, marrowGrain: 3 },
        } as any,
      },
    });

    const result = syncStockFromVaults(state);
    expect(result.players.p1.stock).toEqual({ toothPlanks: 30, sepulcherStone: 5, marrowGrain: 3 });
  });

  it("preserves existing stock when player has no vaults", () => {
    const state = makeState({
      players: {
        p1: {
          id: "p1",
          stock: { toothPlanks: 50 },
          buildings: ["b1"],
          workers: [],
        } as any,
      },
      buildings: {
        b1: {
          id: "b1",
          ownerId: "p1",
          type: "organHarvester",
          outputBuffer: { sinewTimber: 3 },
        } as any,
      },
    });

    const result = syncStockFromVaults(state);
    expect(result.players.p1.stock).toEqual({ toothPlanks: 50 });
  });
});

describe("placeBuilding vault deduction", () => {
  it("deducts build cost from vault outputBuffer when vault exists", () => {
    const tile = {
      id: "tile_0_0",
      position: { x: 0, y: 0 },
      terrain: "scarredEarth",
      ownerId: "p1",
      footfall: 0,
      tier: "grass",
    };
    const state = makeState({
      players: {
        p1: {
          id: "p1",
          // organHarvester costs {toothPlanks:2, sepulcherStone:1}
          stock: { toothPlanks: 20, sepulcherStone: 10 },
          buildings: ["v1"],
          workers: [],
        } as any,
      },
      buildings: {
        v1: {
          id: "v1",
          ownerId: "p1",
          type: "vaultOfDigestiveStone",
          outputBuffer: { toothPlanks: 20, sepulcherStone: 10 },
          inputBuffer: {},
          internalStorage: {},
          level: 1,
          integrity: 100,
          position: { x: 5, y: 5 },
          connectedToRoad: true,
          assignedWorkers: [],
          progressSec: 0,
          isActive: true,
          corruption: 0,
        } as any,
      },
      territory: {
        tiles: { "tile_0_0": tile as any },
        tileIndex: { "0,0": "tile_0_0" },
      } as any,
    });

    const result = placeBuilding(state, "p1", "organHarvester", "tile_0_0");
    const vault = result.buildings["v1"];
    // organHarvester costs {toothPlanks:2, sepulcherStone:1}
    expect(vault.outputBuffer.toothPlanks).toBe(18);
    expect(vault.outputBuffer.sepulcherStone).toBe(9);
  });

  it("falls back to player.stock when no vault exists", () => {
    const tile = {
      id: "tile_1_0",
      position: { x: 1, y: 0 },
      terrain: "scarredEarth",
      ownerId: "p1",
      footfall: 0,
      tier: "grass",
    };
    const state = makeState({
      players: {
        p1: {
          id: "p1",
          stock: { toothPlanks: 20, sepulcherStone: 10 },
          buildings: [],
          workers: [],
        } as any,
      },
      territory: {
        tiles: { "tile_1_0": tile as any },
        tileIndex: { "1,0": "tile_1_0" },
      } as any,
    });

    const result = placeBuilding(state, "p1", "organHarvester", "tile_1_0");
    // Deducted from player.stock since no vault
    expect(result.players.p1.stock.toothPlanks).toBe(18);
    expect(result.players.p1.stock.sepulcherStone).toBe(9);
  });
});

describe("upgradeBuilding vault deduction", () => {
  it("deducts upgrade cost from vault outputBuffer", () => {
    // organHarvester upgrade from L1→L2 costs {toothPlanks:2, sepulcherStone:1}
    const state = makeState({
      players: {
        p1: {
          id: "p1",
          stock: { toothPlanks: 20, sepulcherStone: 10 },
          buildings: ["v1", "b1"],
          workers: [],
        } as any,
      },
      buildings: {
        v1: {
          id: "v1",
          ownerId: "p1",
          type: "vaultOfDigestiveStone",
          outputBuffer: { toothPlanks: 20, sepulcherStone: 10 },
          inputBuffer: {},
          internalStorage: {},
          level: 1,
          integrity: 100,
          position: { x: 5, y: 5 },
          connectedToRoad: true,
          assignedWorkers: [],
          progressSec: 0,
          isActive: true,
          corruption: 0,
        } as any,
        b1: {
          id: "b1",
          ownerId: "p1",
          type: "organHarvester",
          level: 1,
          integrity: 100,
          position: { x: 0, y: 0 },
          connectedToRoad: true,
          assignedWorkers: [],
          outputBuffer: {},
          inputBuffer: {},
          internalStorage: {},
          progressSec: 0,
          isActive: true,
          corruption: 0,
        } as any,
      },
      territory: { tiles: {}, tileIndex: {} } as any,
    });

    const result = upgradeBuilding(state, "p1", "b1");
    const vault = result.buildings["v1"];
    // organHarvester upgrade from L1→L2 costs {toothPlanks: 1, sepulcherStone: 1}
    expect(vault.outputBuffer.toothPlanks).toBe(19);
    expect(vault.outputBuffer.sepulcherStone).toBe(9);
    expect(result.buildings.b1.level).toBe(2);
  });
});
