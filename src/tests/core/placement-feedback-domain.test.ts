import { getBuildingPlacementToolFeedback, getRoadToolFeedback } from '../../store/placementFeedbackDomain';
import { player1Id } from '../../store/game.store';
import type { WorldState } from '../../game/world/world.types';

describe('placementFeedbackDomain', () => {
  it('explains hovered building placement validity before the player clicks', () => {
    const occupiedTile = {
      id: 'tile-occupied',
      ownerId: player1Id,
      buildingId: 'building-1',
      terrain: 'scarredEarth',
      tier: 'grass',
      position: { x: 4, y: 4 },
    };
    const validTile = {
      id: 'tile-valid',
      ownerId: player1Id,
      terrain: 'scarredEarth',
      tier: 'grass',
      position: { x: 6, y: 6 },
    };
    const world = {
      players: { [player1Id]: { buildings: ['building-1'], stock: { toothPlanks: 99, sepulcherStone: 99 } } },
      buildings: {
        'building-1': {
          id: 'building-1',
          ownerId: player1Id,
          type: 'vaultOfDigestiveStone',
          outputBuffer: { toothPlanks: 99, sepulcherStone: 99 },
        },
      },
      territory: { tiles: { [occupiedTile.id]: occupiedTile, [validTile.id]: validTile } },
    } as unknown as WorldState;

    const blocked = getBuildingPlacementToolFeedback(world, player1Id, 'organHarvester', occupiedTile.position);
    expect(blocked).toEqual(expect.objectContaining({
      tone: 'warn',
      label: 'Cannot place Organ Harvester',
      detail: 'Clear the existing structure before building here.',
    }));

    const ready = getBuildingPlacementToolFeedback(world, player1Id, 'organHarvester', validTile.position);
    expect(ready).toEqual(expect.objectContaining({
      tone: 'active',
      label: 'Ready to place Organ Harvester',
    }));
    expect(ready.detail).toContain('vault');
  });

  it('explains road placement and removal hover states before the player clicks', () => {
    const unownedTile = {
      id: 'tile-unowned',
      ownerId: 'enemy-player',
      terrain: 'scarredEarth',
      tier: 'grass',
      position: { x: 8, y: 8 },
    };
    const roadTile = {
      id: 'tile-road',
      ownerId: player1Id,
      terrain: 'scarPath',
      tier: 'dirt',
      position: { x: 9, y: 9 },
    };
    const world = {
      territory: { tiles: { [unownedTile.id]: unownedTile, [roadTile.id]: roadTile } },
    } as unknown as WorldState;

    const blockedRoad = getRoadToolFeedback(world.territory, player1Id, 'place', unownedTile.position);
    expect(blockedRoad).toEqual(expect.objectContaining({
      tone: 'warn',
      label: 'Road blocked',
      detail: 'Claim this tile before building a road here.',
    }));

    const removableRoad = getRoadToolFeedback(world.territory, player1Id, 'remove', roadTile.position);
    expect(removableRoad).toEqual(expect.objectContaining({
      tone: 'active',
      label: 'Ready to clear scar path',
    }));
  });
});
