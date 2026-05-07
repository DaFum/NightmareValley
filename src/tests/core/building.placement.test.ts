import { canPlaceBuildingFootprint, cancelConstruction, placeBuilding, EconomySimulationState } from "../../game/core/economy.simulation";
import { BuildingInstance } from "../../game/core/game.types";
import { isConstructed } from "../../game/entities/buildings/building.types";

describe("placeBuilding", () => {
  it("rejects non-integer footprint origins", () => {
    const result = canPlaceBuildingFootprint(
      {
        tiles: {
          tile_0_0: {
            id: "tile_0_0",
            position: { x: 0, y: 0 },
            terrain: "scarredEarth",
            ownerId: "p1",
          },
        },
        tileIndex: { "0,0": "tile_0_0" },
      } as any,
      "p1",
      0.5,
      0,
    );

    expect(result).toEqual({ ok: false, reason: "invalid_footprint" });
  });

  it("returns the first blocking terrain when a footprint is terrain-blocked", () => {
    const result = canPlaceBuildingFootprint(
      {
        tiles: {
          tile_0_0: {
            id: "tile_0_0",
            position: { x: 0, y: 0 },
            terrain: "scarredEarth",
            ownerId: "p1",
          },
          tile_1_0: {
            id: "tile_1_0",
            position: { x: 1, y: 0 },
            terrain: "placentaLake",
            ownerId: "p1",
          },
        },
        tileIndex: { "0,0": "tile_0_0", "1,0": "tile_1_0" },
      } as any,
      "p1",
      0,
      0,
      "organHarvester",
      2,
      1,
    );

    expect(result).toEqual({
      ok: false,
      reason: "terrain_blocked",
      blockingTerrain: "placentaLake",
      blockingTileId: "tile_1_0",
    });
  });

  it("newly placed building starts with level 0 and constructionProgress 0", () => {
    const tileId = "tile_0_0";
    const state: EconomySimulationState = {
    tick: 0,
    ageOfTeeth: 0,
    players: {
      p1: {
        id: "p1",
        stock: { toothPlanks: 10, sepulcherStone: 10 },
        buildings: ["vault1"],
      } as any,
    },
    buildings: {
      vault1: {
        id: "vault1",
        type: "vaultOfDigestiveStone",
        ownerId: "p1",
        level: 1,
        position: { x: 0, y: 1 },
        outputBuffer: { toothPlanks: 10, sepulcherStone: 10 },
        inputBuffer: {},
        internalStorage: {},
        assignedWorkers: [],
        progressSec: 0,
        isActive: true,
        connectedToRoad: true,
        integrity: 100,
      } as any,
    },
    territory: {
      tiles: {
        [tileId]: {
          id: tileId,
          position: { x: 0, y: 0 },
          terrain: "scarredEarth",
          ownerId: "p1",
          buildingId: undefined,
          roadLevel: 1,
        } as any,
      },
    } as any,
    workers: {},
    transport: {
      jobs: {},
      activeCarrierTasks: {},
      networkStress: 0,
      averageLatencySec: 0,
      queuedJobCount: 0,
    } as any,
    worldPulse: 0,
  } as any;

    const next = placeBuilding(state, "p1", "organHarvester", tileId);
    const placed = Object.values(next.buildings).find(b => b.type === "organHarvester")!;

    expect(placed.level).toBe(0);
    expect(placed.constructionProgress).toBe(0);
  });

  it("can cancel an unfinished building, frees the tile, and refunds to a vault", () => {
    const tileId = "tile_0_0";
    const state: EconomySimulationState = {
      tick: 0,
      ageOfTeeth: 0,
      players: {
        p1: {
          id: "p1",
          stock: { toothPlanks: 10, sepulcherStone: 10 },
          buildings: ["vault1"],
        } as any,
      },
      buildings: {
        vault1: {
          id: "vault1",
          type: "vaultOfDigestiveStone",
          ownerId: "p1",
          level: 1,
          position: { x: 0, y: 1 },
          outputBuffer: { toothPlanks: 10, sepulcherStone: 10 },
          inputBuffer: {},
          internalStorage: {},
          assignedWorkers: [],
          progressSec: 0,
          isActive: true,
          connectedToRoad: true,
          integrity: 100,
        } as any,
      },
      territory: {
        tiles: {
          [tileId]: {
            id: tileId,
            position: { x: 0, y: 0 },
            terrain: "scarredEarth",
            ownerId: "p1",
            buildingId: undefined,
            roadLevel: 1,
          } as any,
        },
      } as any,
      workers: {},
      transport: {
        jobs: {},
        activeCarrierTasks: {},
        networkStress: 0,
        averageLatencySec: 0,
        queuedJobCount: 0,
      } as any,
      worldPulse: 0,
    } as any;

    const placedState = placeBuilding(state, "p1", "organHarvester", tileId);
    const placed = Object.values(placedState.buildings).find(b => b.type === "organHarvester")!;
    const cancelled = cancelConstruction(placedState, "p1", placed.id);

    expect(cancelled.buildings[placed.id]).toBeUndefined();
    expect(cancelled.territory.tiles[tileId].buildingId).toBeUndefined();
    expect(cancelled.players.p1.buildings).not.toContain(placed.id);
    expect(cancelled.buildings.vault1.outputBuffer.toothPlanks).toBe(9);
    expect(cancelled.buildings.vault1.outputBuffer.sepulcherStone).toBe(9);
  });

  it("newly placed building is not operational (isConstructed returns false)", () => {
    const building: Partial<BuildingInstance> = { level: 0, constructionProgress: 0 };
    expect(isConstructed(building as BuildingInstance)).toBe(false);
  });
});
