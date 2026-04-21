import { PlayerState, BuildingInstance } from "../core/game.types";
import { BuildingType, BuildingCost, ResourceType, ResourceInventory, BuildingDefinition } from "../core/economy.types";
import { BUILDING_DEFINITIONS } from "../core/economy.data";
import { hasEnoughResources, removeResource, getResourceAmount, addResource } from "./stockpile.logic";
import { EconomySimulationState, cloneState, requiresRoad, hasAssignedWorkersForBuilding } from "../core/economy.simulation";
import { SimulationConfig } from "./balancing.constants";
import { ProductionRecipe } from "./recipes.types";
import { RECIPES } from "./recipes.data";

export function canAffordBuilding(
  player: PlayerState,
  buildingType: BuildingType
): boolean {
  const def = BUILDING_DEFINITIONS[buildingType];
  return hasEnoughResources(player.stock, def.buildCost.resources);
}

export function payBuildingCost(
  player: PlayerState,
  buildingType: BuildingType
): PlayerState {
  const def = BUILDING_DEFINITIONS[buildingType];

  if (!hasEnoughResources(player.stock, def.buildCost.resources)) {
    throw new Error(`Cannot erect ${buildingType}: the liturgy lacks matter.`);
  }

  let updatedStock = { ...player.stock };

  for (const [resource, amount] of Object.entries(def.buildCost.resources)) {
    updatedStock = removeResource(
      updatedStock,
      resource as ResourceType,
      amount ?? 0
    );
  }

  return {
    ...player,
    stock: updatedStock,
  };
}

export function canUpgradeBuilding(building: BuildingInstance): boolean {
  const def = BUILDING_DEFINITIONS[building.type];
  return building.level < def.maxLevel;
}

export function getUpgradeCost(
  building: BuildingInstance
): BuildingCost | null {
  const def = BUILDING_DEFINITIONS[building.type];
  if (building.level >= def.maxLevel) return null;
  return def.upgradeCosts[building.level - 1] ?? null;
}

export function canAffordUpgrade(
  player: PlayerState,
  building: BuildingInstance
): boolean {
  const cost = getUpgradeCost(building);
  if (!cost) return false;
  return hasEnoughResources(player.stock, cost.resources);
}

export function processProduction(
  state: EconomySimulationState,
  deltaSec: number,
  config: SimulationConfig
): EconomySimulationState {
  const next = cloneState(state);

  for (const building of Object.values(next.buildings)) {
    if (!building.isActive) continue;
    if (!building.connectedToRoad && requiresRoad(building.type)) continue;

    const def = BUILDING_DEFINITIONS[building.type];
    if (!def.recipeIds?.length) continue;
    if (!hasAssignedWorkersForBuilding(next, building)) continue;

    const recipe = chooseRecipeForBuilding(building, def);
    if (!recipe) continue;

    building.currentRecipeId = recipe.id;

    if (!hasEnoughResources(building.inputBuffer, recipe.inputs)) {
      building.progressSec = 0;
      continue;
    }

    if (!canStoreRecipeOutputs(building.outputBuffer, recipe, config)) {
      continue;
    }

    const cycleTime = getRecipeCycleTime(building, recipe, config);
    if (cycleTime <= 0) {
      building.progressSec = 0;
      continue;
    }

    building.progressSec += deltaSec;

    while (building.progressSec >= cycleTime) {
      if (!hasEnoughResources(building.inputBuffer, recipe.inputs)) {
        building.progressSec = 0;
        break;
      }

      if (!canStoreRecipeOutputs(building.outputBuffer, recipe, config)) {
        break;
      }

      building.progressSec -= cycleTime;
      building.inputBuffer = subtractRecipeInputs(building.inputBuffer, recipe);
      building.outputBuffer = addRecipeOutputs(building.outputBuffer, recipe);
      building.corruption = (building.corruption ?? 0) + 0.15;
    }
  }

  return next;
}

export function chooseRecipeForBuilding(
  building: BuildingInstance,
  def: BuildingDefinition
): ProductionRecipe | null {
  if (!def.recipeIds?.length) return null;

  if (building.currentRecipeId && def.recipeIds.includes(building.currentRecipeId)) {
    const existing = RECIPES[building.currentRecipeId];
    if (existing) return existing;
  }

  for (const recipeId of def.recipeIds) {
    const recipe = RECIPES[recipeId];
    if (recipe) return recipe;
  }

  return null;
}

export function getRecipeCycleTime(
  building: BuildingInstance,
  recipe: ProductionRecipe,
  config: SimulationConfig
): number {
  const speedMultiplier =
    1 + (building.level - 1) * config.recipeLevelSpeedBonus;

  return recipe.workTimeSec / speedMultiplier;
}

export function subtractRecipeInputs(
  inventory: ResourceInventory,
  recipe: ProductionRecipe
): ResourceInventory {
  let next = { ...inventory };

  for (const [resource, amount] of Object.entries(recipe.inputs)) {
    next = removeResource(next, resource as ResourceType, amount ?? 0);
  }

  return next;
}

export function addRecipeOutputs(
  inventory: ResourceInventory,
  recipe: ProductionRecipe
): ResourceInventory {
  let next = { ...inventory };

  for (const [resource, amount] of Object.entries(recipe.outputs)) {
    next = addResource(next, resource as ResourceType, amount ?? 0);
  }

  return next;
}

export function canStoreRecipeOutputs(
  outputBuffer: ResourceInventory,
  recipe: ProductionRecipe,
  config: SimulationConfig
): boolean {
  for (const [resource, amount] of Object.entries(recipe.outputs)) {
    const current = getResourceAmount(outputBuffer, resource as ResourceType);
    if (current + (amount ?? 0) > config.buildingOutputBufferLimit) {
      return false;
    }
  }
  return true;
}
