import { getBuildingPlacementToolFeedback, getRoadToolFeedback } from '../../store/placementFeedbackDomain';
import { useGameStore, player1Id } from '../../store/game.store';

describe('placementFeedbackDomain', () => {
  it('explains hovered building placement validity before the player clicks', () => {
    const world = structuredClone(useGameStore.getState().gameState);
    const occupiedTile = Object.values(world.territory.tiles).find((tile) => tile.ownerId === player1Id && tile.buildingId);
    const validTile = Object.values(world.territory.tiles).find(
      (tile) => tile.ownerId === player1Id && !tile.buildingId && tile.terrain === 'scarredEarth',
    );

    expect(occupiedTile).toBeDefined();
    expect(validTile).toBeDefined();

    const blocked = getBuildingPlacementToolFeedback(world, player1Id, 'organHarvester', occupiedTile!.position);
    expect(blocked).toEqual(expect.objectContaining({
      tone: 'warn',
      label: 'Cannot place Organ Harvester',
      detail: 'Clear the existing structure before building here.',
    }));

    const ready = getBuildingPlacementToolFeedback(world, player1Id, 'organHarvester', validTile!.position);
    expect(ready).toEqual(expect.objectContaining({
      tone: 'active',
      label: 'Ready to place Organ Harvester',
    }));
    expect(ready.detail).toContain('vault');
  });

  it('explains road placement and removal hover states before the player clicks', () => {
    const world = structuredClone(useGameStore.getState().gameState);
    const unownedTile = Object.values(world.territory.tiles).find(
      (tile) => tile.ownerId !== player1Id && !tile.buildingId && tile.terrain === 'scarredEarth',
    );
    const roadTile = Object.values(world.territory.tiles).find(
      (tile) => tile.ownerId === player1Id && !tile.buildingId,
    );
    if (roadTile) {
      roadTile.terrain = 'scarPath';
      roadTile.tier = 'dirt';
    }

    expect(unownedTile).toBeDefined();
    expect(roadTile).toBeDefined();

    const blockedRoad = getRoadToolFeedback(world.territory, player1Id, 'place', unownedTile!.position);
    expect(blockedRoad).toEqual(expect.objectContaining({
      tone: 'warn',
      label: 'Road blocked',
      detail: 'Claim this tile before building a road here.',
    }));

    const removableRoad = getRoadToolFeedback(world.territory, player1Id, 'remove', roadTile!.position);
    expect(removableRoad).toEqual(expect.objectContaining({
      tone: 'active',
      label: 'Ready to clear scar path',
    }));
  });
});
