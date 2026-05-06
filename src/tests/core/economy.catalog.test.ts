import { BUILDING_DEFINITIONS, WORKER_DEFINITIONS } from "../../game/core/economy.data";
import { RECIPES } from "../../game/economy/recipes.data";
import { BuildingType, ResourceType, WorkerType } from "../../game/core/economy.types";

const STRATEGIC_BUILDINGS_WITHOUT_DIRECT_ECONOMY = new Set<BuildingType>([
  "pitOfWarBirth",
]);

describe("economy catalog integration", () => {
  it("all building worker slots reference defined workers", () => {
    for (const [buildingType, definition] of Object.entries(BUILDING_DEFINITIONS) as [BuildingType, typeof BUILDING_DEFINITIONS[BuildingType]][]) {
      for (const workerType of Object.keys(definition.workerSlots) as WorkerType[]) {
        expect(WORKER_DEFINITIONS[workerType]).toBeDefined();
        expect(definition.workerSlots[workerType]).toBeGreaterThan(0);
      }

      expect(definition.type).toBe(buildingType);
    }
  });

  it("all production recipe references exist and align with building IO priorities", () => {
    for (const definition of Object.values(BUILDING_DEFINITIONS)) {
      for (const recipeId of definition.recipeIds ?? []) {
        const recipe = RECIPES[recipeId];
        expect(recipe).toBeDefined();

        for (const resource of Object.keys(recipe.inputs) as ResourceType[]) {
          expect(definition.inputPriority ?? []).toContain(resource);
        }

        for (const resource of Object.keys(recipe.outputs) as ResourceType[]) {
          expect(definition.outputPriority ?? []).toContain(resource);
        }
      }
    }
  });

  it("available non-strategic buildings have an integrated gameplay role", () => {
    for (const [buildingType, definition] of Object.entries(BUILDING_DEFINITIONS) as [BuildingType, typeof BUILDING_DEFINITIONS[BuildingType]][]) {
      const hasGameplayRole =
        !!definition.extraction ||
        !!definition.recipeIds?.length ||
        definition.type === "vaultOfDigestiveStone" ||
        (definition.territoryInfluence ?? 0) > 0 ||
        STRATEGIC_BUILDINGS_WITHOUT_DIRECT_ECONOMY.has(buildingType);

      expect(hasGameplayRole).toBe(true);
    }
  });
});
