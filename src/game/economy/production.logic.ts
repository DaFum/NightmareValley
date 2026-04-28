import { BuildingInstance } from "../core/game.types";
import { isConstructed } from '../entities/buildings/building.types';
import { BuildingType, BuildingCost, ResourceType, ResourceInventory, BuildingDefinition, WorkerType } from "../core/economy.types";
import { BUILDING_DEFINITIONS, WORKER_DEFINITIONS } from "../core/economy.data";
import { hasEnoughResources, removeResource, getResourceAmount, addResource } from "./stockpile.logic";
import { EconomySimulationState, clamp, requiresRoad, hasAssignedWorkersForBuilding } from "../core/economy.simulation";
import { SimulationConfig } from "./balancing.constants";
import { ProductionRecipe } from "./recipes.types";
import { RECIPES } from "./recipes.data";

export function canAffordBuilding(
  inventory: ResourceInventory,
  buildingType: BuildingType
): boolean {
  const def = BUILDING_DEFINITIONS[buildingType];
  return hasEnoughResources(inventory, def.buildCost.resources);
}

export function getWorkerHireCost(workerType: WorkerType): BuildingCost {
  return WORKER_DEFINITIONS[workerType]?.hireCost ?? { resources: {} };
}

export function canAffordWorker(
  inventory: ResourceInventory,
  workerType: WorkerType
): boolean {
  return hasEnoughResources(inventory, getWorkerHireCost(workerType).resources);
}

export function canUpgradeBuilding(building: BuildingInstance): boolean {
  const def = BUILDING_DEFINITIONS[building.type];
  return building.level < def.maxLevel;
}

export function getUpgradeCost(
  building: BuildingInstance,
  toLevel: number
): BuildingCost | null {
  const def = BUILDING_DEFINITIONS[building.type];
  if (!def) return null;
  if (toLevel < 1) return null;
  if (toLevel <= building.level) return null;
  if (def.maxLevel !== undefined && toLevel > def.maxLevel) return null;

  const idx = toLevel - 2;
  if (!def.upgradeCosts || idx >= def.upgradeCosts.length || idx < 0) return null;

  return def.upgradeCosts[idx] ?? null;
}

export function canAffordUpgrade(
  inventory: ResourceInventory,
  building: BuildingInstance
): boolean {
  const cost = getUpgradeCost(building, building.level + 1);
  if (!cost) return false;
  return hasEnoughResources(inventory, cost.resources);
}

export function processProduction(
  state: EconomySimulationState,
  deltaSec: number,
  config: SimulationConfig
): EconomySimulationState {
  for (const building of Object.values(state.buildings)) {
    if (!building.isActive) continue;
    if (!isConstructed(building)) continue;
    if (!building.connectedToRoad && requiresRoad(building.type)) continue;

    const def = BUILDING_DEFINITIONS[building.type];
    if (!def.recipeIds?.length) continue;
    if (!hasAssignedWorkersForBuilding(state, building)) continue;

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
    if (!Number.isFinite(cycleTime) || cycleTime <= 0) {
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
      building.corruption = clamp((building.corruption ?? 0) + 0.15, 0, 100);
    }
  }

  return state;
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
