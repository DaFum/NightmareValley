import { BuildingType, ResourceInventory, ResourceType } from '../game/core/economy.types';
import { EconomySimulationState, isTileBuildableForPlayer } from '../game/core/economy.simulation';
import { WorldState } from '../game/world/world.types';
import { listBuildings } from '../game/entities/buildings/building.data';
import { calcFootprint } from '../game/entities/buildings/building.footprints';
import { canPlaceBuilding } from '../game/entities/buildings/building.placement';
import { getTileAt } from '../game/map/map.query';
import { deriveBuildingStatus, deriveProductionBuildingStatus, getProductionStatus } from '../game/entities/buildings/building.status';
import { getUpgradeCost } from '../game/economy/production.logic';
import { getInventoryForCostChecks } from './simulation.selectors';
import { canAffordBuilding } from '../game/economy/production.logic';
import { BUILDING_DEFINITIONS } from '../game/core/economy.data';

export function listBuildingDomainEntries() {
  return listBuildings();
}

export function canPreviewPlaceBuilding(
  state: EconomySimulationState,
  ownerId: string,
  buildingType: BuildingType,
  originX: number,
  originY: number,
): boolean {
  const def = BUILDING_DEFINITIONS[buildingType];
  if (!def) return false;

  const footprint = calcFootprint(def, originX, originY);
  const basePlacement = canPlaceBuilding(state.territory, originX, originY, def.widthTiles ?? 1, def.heightTiles ?? 1);
  if (!basePlacement.ok) return false;

  return footprint.every(({ x, y }) => {
    const tile = getTileAt(state.territory, x, y);
    return !!tile && isTileBuildableForPlayer(tile, ownerId, buildingType);
  });
}

export function getBuildingPanelStatus(state: EconomySimulationState, buildingId: string) {
  const building = state.buildings[buildingId];
  if (!building) return null;

  return {
    baseStatus: deriveBuildingStatus(building),
    productionStatus: getProductionStatus(state, building),
    productionState: deriveProductionBuildingStatus(state, building),
    upgradeCost: getUpgradeCost(building, building.level + 1),
  };
}


export function getBuildingAffordabilityFromInventory(
  inventory: ResourceInventory,
  buildingType: BuildingType,
): { canAfford: boolean; missing: Array<{ resource: ResourceType; required: number; available: number }> } {
  const def = BUILDING_DEFINITIONS[buildingType];
  const missing = Object.entries(def.buildCost.resources)
    .filter(([resource, amount]) => (inventory[resource as ResourceType] ?? 0) < (amount ?? 0))
    .map(([resource, amount]) => ({
      resource: resource as ResourceType,
      required: amount ?? 0,
      available: inventory[resource as ResourceType] ?? 0,
    }));

  return { canAfford: canAffordBuilding(inventory, buildingType), missing };
}

export function getBuildingAffordability(
  state: WorldState,
  ownerId: string,
  buildingType: BuildingType,
): { canAfford: boolean; inventory: ResourceInventory; missing: Array<{ resource: ResourceType; required: number; available: number }> } {
  const inventory = getInventoryForCostChecks(state, ownerId);
  const affordability = getBuildingAffordabilityFromInventory(inventory, buildingType);

  return {
    canAfford: affordability.canAfford,
    inventory,
    missing: affordability.missing,
  };
}
