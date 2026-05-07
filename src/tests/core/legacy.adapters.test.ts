import { canPlaceBuilding as legacyCanPlaceBuilding } from '../../game/entities/buildings/building.placement';
import { getUpgradeCost as legacyGetUpgradeCost } from '../../game/entities/buildings/building.upgrades';
import { getUpgradeCost as authoritativeGetUpgradeCost } from '../../game/economy/production.logic';
import { TerritoryState } from '../../game/core/game.types';

describe('legacy adapter parity', () => {
  it('building placement legacy adapter enforces owner checks on footprint tiles', () => {
    const territory: TerritoryState = {
      tiles: {
        t1: { id: 't1', position: { x: 0, y: 0 }, terrain: 'scarredEarth', ownerId: 'p1' } as any,
        t2: { id: 't2', position: { x: 1, y: 0 }, terrain: 'scarredEarth', ownerId: 'p1' } as any,
      },
    } as any;

    expect(legacyCanPlaceBuilding(territory, 'p1', 0, 0, 2, 1)).toEqual({ ok: true, tileId: 't1' });
    expect(legacyCanPlaceBuilding(territory, 'enemy', 0, 0, 2, 1)).toEqual({ ok: false, reason: 'not_owner' });
  });

  it('upgrade cost legacy adapter matches production logic output', () => {
    const building = {
      id: 'b1',
      type: 'organHarvester',
      level: 1,
    } as any;

    expect(legacyGetUpgradeCost(building, 2)).toEqual(authoritativeGetUpgradeCost(building, 2));
    expect(legacyGetUpgradeCost(building, 99)).toEqual(authoritativeGetUpgradeCost(building, 99));
  });
});
