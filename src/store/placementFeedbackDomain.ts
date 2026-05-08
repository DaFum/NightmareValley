import type { PlacementFeedback } from './ui.store';
import type { BuildingType, ResourceType } from '../game/core/economy.types';
import type { Position, TerritoryState } from '../game/core/game.types';
import type { WorldState } from '../game/world/world.types';
import { BUILDING_DEFINITIONS } from '../game/core/economy.data';
import { getTileAt } from '../game/map/map.query';
import { canPlaceRoadForPlayer, isRemovableRoadTile, type RoadPlacementReason } from '../game/entities/roads/road.api';
import { getBuildingAffordability } from './buildingDomain';
import { resourceLabel } from './economy.utils';
import { getPlacementValidation } from './simulation.selectors';

function formatMissingResources(missing: Array<{ resource: ResourceType; required: number; available: number }>): string {
  return missing
    .map(({ resource, required, available }) => `${resourceLabel(resource)} ${available}/${required}`)
    .join(', ');
}

export function getRoadPlacementReasonMessage(reason: RoadPlacementReason): string {
  switch (reason) {
    case 'out_of_bounds':
      return 'Move the cursor back over known ground.';
    case 'occupied':
      return 'Roads need an empty tile.';
    case 'dirt_path':
    case 'already_road':
      return 'This tile is already part of the road network.';
    case 'invalid_terrain':
      return 'Roads can be built on scarred earth, forest, or ash bog terrain.';
    case 'unowned':
      return 'Claim this tile before building a road here.';
    default: {
      const _exhaustive: never = reason;
      return 'This tile cannot accept a road.';
    }
  }
}

export function getBuildingPlacementToolFeedback(
  state: WorldState,
  ownerId: string,
  buildingType: BuildingType,
  hoverTile?: Position | null,
): PlacementFeedback {
  const definition = BUILDING_DEFINITIONS[buildingType];
  const name = definition?.name ?? buildingType;
  const affordability = getBuildingAffordability(state, ownerId, buildingType);

  if (!affordability.canAfford) {
    return {
      tone: 'warn',
      label: `Cannot afford ${name}`,
      detail: `Vault stock is short: ${formatMissingResources(affordability.missing)}.`,
    };
  }

  if (!hoverTile) {
    return {
      tone: 'active',
      label: `Placing ${name}`,
      detail: 'Move over owned valid terrain, click to build, or press Esc to cancel.',
    };
  }

  const validation = getPlacementValidation(state, ownerId, buildingType, hoverTile.x, hoverTile.y);
  if (!validation.ok) {
    return {
      tone: 'warn',
      label: `Cannot place ${name}`,
      detail: validation.message,
    };
  }

  return {
    tone: 'active',
    label: `Ready to place ${name}`,
    detail: 'Click to build here. Costs will be deducted from vault output storage.',
  };
}

export function getRoadToolFeedback(
  territory: TerritoryState,
  ownerId: string,
  mode: 'place' | 'remove',
  hoverTile?: Position | null,
): PlacementFeedback {
  if (!hoverTile) {
    return mode === 'place'
      ? {
        tone: 'active',
        label: 'Road tool active',
        detail: 'Move over owned empty ground, click to place scar paths, or press Esc to cancel.',
      }
      : {
        tone: 'warn',
        label: 'Road removal active',
        detail: 'Move over an owned scar path, click to clear it, or press Esc to cancel.',
      };
  }

  if (mode === 'place') {
    const validation = canPlaceRoadForPlayer(territory, hoverTile.x, hoverTile.y, ownerId);
    if (!validation.ok) {
      return {
        tone: 'warn',
        label: 'Road blocked',
        detail: getRoadPlacementReasonMessage(validation.reason),
      };
    }

    return {
      tone: 'active',
      label: 'Ready to place scar path',
      detail: 'Click to extend the logistics network between vaults and workplaces.',
    };
  }

  const tile = getTileAt(territory, hoverTile.x, hoverTile.y);

  if (!tile || tile.ownerId !== ownerId) {
    return {
      tone: 'warn',
      label: 'Cannot clear road',
      detail: 'Only owned road tiles can be removed.',
    };
  }

  if (tile.buildingId) {
    return {
      tone: 'warn',
      label: 'Cannot clear road',
      detail: 'Roads under buildings cannot be cleared.',
    };
  }

  if (!isRemovableRoadTile(tile)) {
    return {
      tone: 'warn',
      label: 'Cannot clear road',
      detail: 'Choose an owned dirt scar path tile. Empty ground is not removable road.',
    };
  }

  return {
    tone: 'active',
    label: 'Ready to clear scar path',
    detail: 'Click to remove this road tile. Disconnected buildings stop receiving deliveries.',
  };
}
