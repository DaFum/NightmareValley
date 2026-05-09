import { WorldState } from '../game/world/world.types';
import { BuildingDefinition, BuildingType, ResourceInventory, TerrainType } from '../game/core/economy.types';
import { canAffordBuilding, canAffordUpgrade } from '../game/economy/production.logic';
import { canPlaceBuildingFootprint, isTileBuildableForPlayer } from '../game/core/economy.simulation';
import { BUILDING_DEFINITIONS } from '../game/core/economy.data';
import { TileId } from '../game/core/entity.ids';

export type PlacementValidationReason =
  | 'invalid_footprint'
  | 'out_of_bounds'
  | 'not_owner'
  | 'occupied'
  | 'terrain_blocked';

export type PlacementValidationResult = {
  ok: boolean;
  message: string;
  width: number;
  height: number;
  allowedTerrain: TerrainType[];
  tileId?: TileId;
  reasonCode?: PlacementValidationReason;
  nearestVaultDistance?: number | null;
  logisticsHint?: string;
};

const TERRAIN_LABELS: Record<TerrainType, string> = {
  scarredEarth: 'Scarred earth',
  weepingForest: 'Forest',
  ribMountain: 'Rib mountain',
  placentaLake: 'Placenta lake',
  scarPath: 'Scar path',
  occupiedScar: 'Occupied scar',
  ashBog: 'Ash bog',
  cathedralRock: 'Cathedral rock',
};

function formatTerrainSentence(terrain: TerrainType[]): string {
  const labels = terrain.map((entry) => TERRAIN_LABELS[entry] ?? entry);
  if (labels.length <= 1) return labels[0] ?? 'valid terrain';
  if (labels.length === 2) return `${labels[0]} or ${labels[1]}`;
  return `${labels.slice(0, -1).join(', ')}, or ${labels[labels.length - 1]}`;
}

function placementReasonMessage(
  reason: PlacementValidationReason,
  allowedTerrain: TerrainType[],
  buildingName: string,
  blockingTerrain?: TerrainType,
): string {
  switch (reason) {
    case 'invalid_footprint':
      return 'Placement footprint is invalid.';
    case 'out_of_bounds':
      return 'Move the cursor back over known ground.';
    case 'not_owner':
      return 'Claim this tile with a Spire of Jurisdiction before building here.';
    case 'occupied':
      return 'Clear the existing structure before building here.';
    case 'terrain_blocked':
      if (blockingTerrain) {
        return `This footprint includes ${TERRAIN_LABELS[blockingTerrain] ?? blockingTerrain}. ${buildingName} needs ${formatTerrainSentence(allowedTerrain)}.`;
      }
      return `${buildingName} needs ${formatTerrainSentence(allowedTerrain)}.`;
    default:
      return 'This tile cannot accept the selected building.';
  }
}

function getNearestVaultDistance(state: WorldState, ownerId: string, originX: number, originY: number): number | null {
  let best: number | null = null;
  const player = state.players[ownerId];
  if (!player) return null;

  for (const buildingId of player.buildings ?? []) {
    const building = state.buildings[buildingId];
    if (building?.type !== 'vaultOfDigestiveStone') continue;
    if (!building.position) continue;
    const distance = Math.abs(building.position.x - originX) + Math.abs(building.position.y - originY);
    if (best == null || distance < best) best = distance;
  }

  return best;
}

function formatPlacementLogisticsHint(
  definition: BuildingDefinition | undefined,
  distance: number | null,
): string {
  const distanceLabel = distance == null
    ? 'Distance to nearest vault: unavailable'
    : `Distance to nearest vault: ${distance} tile${distance === 1 ? '' : 's'}`;
  const roadLabel = definition?.requiresRoadConnection ? 'road required after build' : 'road optional';
  const distanceWarning = distance != null && distance >= 18
    ? 'Delivery time will be high at this distance.'
    : 'Expected logistics cost is low to moderate.';
  return `${distanceLabel}; ${roadLabel}; ${distanceWarning}`;
}

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

export function getPlacementValidation(
  state: WorldState,
  ownerId: string,
  buildingType: BuildingType,
  originX: number,
  originY: number,
): PlacementValidationResult {
  const definition = BUILDING_DEFINITIONS[buildingType];
  const width = definition?.widthTiles ?? 1;
  const height = definition?.heightTiles ?? 1;
  const allowedTerrain = definition?.allowedTerrain ?? [];

  if (!definition) {
    return {
      ok: false,
      reasonCode: 'invalid_footprint',
      message: 'Placement footprint is invalid.',
      width,
      height,
      allowedTerrain,
    };
  }

  const result = canPlaceBuildingFootprint(
    state.territory,
    ownerId,
    originX,
    originY,
    buildingType,
    width,
    height,
  );

  if (result.ok) {
    const nearestVaultDistance = getNearestVaultDistance(state, ownerId, originX, originY);
    return {
      ok: true,
      tileId: result.tileId,
      message: 'Ready to build.',
      width,
      height,
      allowedTerrain,
      nearestVaultDistance,
      logisticsHint: formatPlacementLogisticsHint(definition, nearestVaultDistance),
    };
  }

  return {
    ok: false,
    reasonCode: result.reason,
    message: placementReasonMessage(
      result.reason,
      allowedTerrain,
      definition.name,
      result.reason === 'terrain_blocked' ? result.blockingTerrain : undefined,
    ),
    width,
    height,
    allowedTerrain,
  };
}
