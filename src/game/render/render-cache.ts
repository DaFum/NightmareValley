import type { ResourceInventory } from '../core/economy.types';
import type { TerritoryState } from '../core/game.types';

function resourceKey(deposit: ResourceInventory | undefined): string {
  if (!deposit) return '';
  return Object.entries(deposit)
    .filter(([, amount]) => (amount ?? 0) > 0)
    .sort(([left], [right]) => left.localeCompare(right))
    .map(([resource, amount]) => `${resource}:${amount}`)
    .join(',');
}

export function createTerrainRenderCacheKey(territory: TerritoryState): string {
  return Object.values(territory.tiles)
    .map((tile) => [
      tile.id,
      tile.position.x,
      tile.position.y,
      tile.terrain,
      tile.ownerId ?? '',
      tile.buildingId ?? '',
      tile.tier,
      resourceKey(tile.resourceDeposit),
    ].join(':'))
    .sort()
    .join('|');
}
