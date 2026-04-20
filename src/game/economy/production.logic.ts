import { PlayerState, BuildingInstance } from "../core/game.types";
import { BuildingType, BuildingCost, ResourceType } from "../core/economy.types";
import { BUILDING_DEFINITIONS } from "../core/economy.data";
import { hasEnoughResources, removeResource } from "./stockpile.logic";

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
