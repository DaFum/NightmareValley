import { WorldState } from '../game/world/world.types';
import { BuildingType, ResourceInventory } from '../game/core/economy.types';
import { canAffordBuilding, canAffordUpgrade } from '../game/economy/production.logic';
import { canPlaceBuildingFootprint, isTileBuildableForPlayer } from '../game/core/economy.simulation';
import { BUILDING_DEFINITIONS } from '../game/core/economy.data';

export function getInventoryForCostChecks(state: WorldState, ownerId: string): ResourceInventory {
  const player = state.players[ownerId];
  if (!player) return {} as ResourceInventory;

  const merged: Record<string, number> = {};
  let hasVault = false;

  for (const buildingId of player.buildings) {
    const building = state.buildings[buildingId];
    if (building?.type !== 'vaultOfDigestiveStone') continue;
    hasVault = true;
    for (const [resource, amount] of Object.entries(building.outputBuffer)) {
      merged[resource] = (merged[resource] ?? 0) + (amount ?? 0);
    }
  }

  const stockEntries = Object.entries(player.stock ?? {});
  if (
    hasVault &&
    stockEntries.length === Object.keys(merged).length &&
    stockEntries.every(([resource, amount]) => (merged[resource] ?? 0) === (amount ?? 0))
  ) {
    return player.stock;
  }

  // Warehouse-first contract: use vault buffers whenever any vault exists.
  return hasVault ? (merged as ResourceInventory) : player.stock;
}

/** Canonical selector for warehouse-authoritative affordability checks. */
export const selectAuthoritativeInventory = getInventoryForCostChecks;

export function canAffordBuildingForPlayer(state: WorldState, ownerId: string, buildingType: BuildingType): boolean {
  return canAffordBuilding(getInventoryForCostChecks(state, ownerId), buildingType);
}

export function canAffordUpgradeForBuilding(state: WorldState, buildingId: string): boolean {
  const building = state.buildings[buildingId];
  if (!building) return false;
  return canAffordUpgrade(getInventoryForCostChecks(state, building.ownerId), building);
}

export function canPlaceBuildingForPlayerAtTile(
  state: WorldState,
  ownerId: string,
  tileId: string,
  buildingType: BuildingType,
): boolean {
  const tile = state.territory.tiles[tileId];
  if (!tile) return false;
  return isTileBuildableForPlayer(tile, ownerId, buildingType);
}

export function canPlaceBuildingForPlayerFootprint(
  state: WorldState,
  ownerId: string,
  buildingType: BuildingType,
  originX: number,
  originY: number,
): boolean {
  const definition = BUILDING_DEFINITIONS[buildingType];
  if (!definition) return false;
  const width = definition.widthTiles ?? 1;
  const height = definition.heightTiles ?? 1;
  return canPlaceBuildingFootprint(state.territory, ownerId, originX, originY, buildingType, width, height).ok;
}
