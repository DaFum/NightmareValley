import { createTerrainRenderCacheKey } from '../../game/render/render-cache';
import type { TerritoryState } from '../../game/core/game.types';

function territory(overrides: Partial<TerritoryState['tiles'][string]> = {}): TerritoryState {
  return {
    tiles: {
      tile_a: {
        id: 'tile_a',
        position: { x: 0, y: 0 },
        terrain: 'scarredEarth',
        ownerId: 'p1',
        footfall: 0,
        tier: 'grass',
        ...overrides,
      },
      tile_b: {
        id: 'tile_b',
        position: { x: 1, y: 0 },
        terrain: 'weepingForest',
        footfall: 0,
        tier: 'grass',
      },
    },
  };
}

describe('createTerrainRenderCacheKey', () => {
  it('changes when terrain changes without tile count changing', () => {
    const before = createTerrainRenderCacheKey(territory());
    const after = createTerrainRenderCacheKey(territory({ terrain: 'placentaLake' }));

    expect(after).not.toBe(before);
  });

  it('changes when resources or road tier change without tile count changing', () => {
    const before = createTerrainRenderCacheKey(territory());
    const after = createTerrainRenderCacheKey(territory({
      resourceDeposit: { sepulcherStone: 3 },
      tier: 'cobble',
    }));

    expect(after).not.toBe(before);
  });
});
