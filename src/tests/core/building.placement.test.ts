import { placeBuilding, EconomySimulationState } from "../../game/core/economy.simulation";
import { BuildingInstance } from "../../game/core/game.types";
import { isConstructed } from "../../game/entities/buildings/building.logic";

test("dummy", () => { expect(1).toBe(1); });

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
    transportJobs: [],
    carriers: {},
    worldPulse: 0,
  } as any;

  const next = placeBuilding(state, "p1", "organHarvester", tileId);
  const placed = Object.values(next.buildings).find(b => b.type === "organHarvester")!;

  expect(placed.level).toBe(0);
  expect(placed.constructionProgress).toBe(0);
});

it("newly placed building is not operational (isConstructed returns false)", () => {
  const building: Partial<BuildingInstance> = { level: 0, constructionProgress: 0 };
  expect(isConstructed(building as BuildingInstance)).toBe(false);
});
