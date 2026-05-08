import { getTileAt } from '../map/map.query';
import type { ResourceType } from '../core/economy.types';
import type { BuildingInstance } from '../core/game.types';
import type { EconomySimulationState } from '../core/economy.simulation';
import type { WorldState } from '../world/world.types';

export const RENEWABLE_EXTRACTION_RESOURCES = new Set<ResourceType>(['pigFleshMass']);
export const EXTRACTION_SEARCH_RADIUS = 2;

export function extractionNeedsDeposit(resourceType: ResourceType, renewable?: boolean): boolean {
  return !renewable && !RENEWABLE_EXTRACTION_RESOURCES.has(resourceType);
}

export function hasNearbyExtractionDeposit(
  state: Pick<WorldState, 'territory'> | EconomySimulationState,
  building: Pick<BuildingInstance, 'position'>,
  resourceType: ResourceType,
): boolean {
  if (!state.territory?.tiles) return false;

  for (let dy = -EXTRACTION_SEARCH_RADIUS; dy <= EXTRACTION_SEARCH_RADIUS; dy++) {
    for (let dx = -EXTRACTION_SEARCH_RADIUS; dx <= EXTRACTION_SEARCH_RADIUS; dx++) {
      const tile = getTileAt(state.territory, building.position.x + dx, building.position.y + dy);
      if ((tile?.resourceDeposit?.[resourceType] ?? 0) > 0) return true;
    }
  }

  return false;
}
