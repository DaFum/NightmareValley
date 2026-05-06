export {}

import { BUILDING_DEFINITIONS } from '../core/economy.data';
import { EconomySimulationState } from '../core/economy.simulation';
import { OwnerId } from '../core/entity.ids';
import { BuildingInstance, MapTile } from '../core/game.types';
import { isConstructed } from '../entities/buildings/building.types';

const VAULT_TERRITORY_INFLUENCE = 6;

function influenceRadius(building: BuildingInstance): number {
  if (!isConstructed(building)) return 0;
  const definition = BUILDING_DEFINITIONS[building.type];
  if (building.type === 'vaultOfDigestiveStone') return VAULT_TERRITORY_INFLUENCE + Math.max(0, building.level - 1);
  return definition.territoryInfluence ?? 0;
}

function manhattan(a: { x: number; y: number }, b: { x: number; y: number }): number {
  return Math.abs(a.x - b.x) + Math.abs(a.y - b.y);
}

export function calculateTerritoryForOwner(state: EconomySimulationState, ownerId: OwnerId): Set<string> {
  const owned = new Set<string>();
  const influencers = Object.values(state.buildings).filter(
    (building) => building.ownerId === ownerId && influenceRadius(building) > 0
  );

  for (const tile of Object.values(state.territory.tiles)) {
    for (const building of influencers) {
      if (manhattan(tile.position, building.position) <= influenceRadius(building)) {
        owned.add(tile.id);
        break;
      }
    }
  }

  return owned;
}

export function expandTerritoryFromInfluence(state: EconomySimulationState): EconomySimulationState {
  const tiles: Record<string, MapTile> = { ...state.territory.tiles };
  const players = { ...state.players };
  let changed = false;

  for (const player of Object.values(state.players)) {
    const owned = calculateTerritoryForOwner(state, player.id);
    const nextTerritoryIds = new Set(player.territoryTileIds ?? []);

    for (const tileId of owned) {
      const tile = tiles[tileId];
      if (!tile) continue;
      nextTerritoryIds.add(tileId);
      if (tile.ownerId !== player.id) {
        tiles[tileId] = { ...tile, ownerId: player.id };
        changed = true;
      }
    }

    const territoryTileIds = Array.from(nextTerritoryIds);
    if (territoryTileIds.length !== (player.territoryTileIds?.length ?? 0)) {
      players[player.id] = { ...player, territoryTileIds };
      changed = true;
    }
  }

  if (!changed) return state;

  return {
    ...state,
    players,
    territory: {
      ...state.territory,
      tiles,
    },
  };
}
