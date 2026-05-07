import { canAffordBuildingForPlayer, canAffordUpgradeForBuilding, canPlaceBuildingForPlayerAtTile, getInventoryForCostChecks } from '../../store/simulation.selectors';
import { useGameStore } from '../../store/game.store';

describe('simulation selectors', () => {
  it('aggregates vault output buffers for cost checks', () => {
    const world = structuredClone(useGameStore.getState().gameState);
    const [playerId] = Object.keys(world.players);
    const player = world.players[playerId];
    const vaultId = player.buildings.find((id) => world.buildings[id]?.type === 'vaultOfDigestiveStone');
    expect(vaultId).toBeDefined();

    if (!vaultId) return;

    const vault = world.buildings[vaultId];
    vault.outputBuffer = { toothPlanks: 12, sepulcherStone: 7 };
    player.stock = { toothPlanks: 1, sepulcherStone: 1 } as typeof player.stock;

    const inventory = getInventoryForCostChecks(world, playerId);
    expect(inventory.toothPlanks).toBe(12);
    expect(inventory.sepulcherStone).toBe(7);
  });

  it('wraps simulation truth for afford/upgrade/place checks', () => {
    const world = structuredClone(useGameStore.getState().gameState);
    const [playerId] = Object.keys(world.players);
    const player = world.players[playerId];

    const placeableTile = Object.values(world.territory.tiles).find((tile) => tile.ownerId === playerId && !tile.buildingId);
    expect(placeableTile).toBeDefined();

    const firstBuildingId = player.buildings[0];
    expect(canPlaceBuildingForPlayerAtTile(world, playerId, placeableTile!.id, 'organHarvester')).toBe(true);
    expect(canAffordBuildingForPlayer(world, playerId, 'organHarvester')).toBe(true);
    expect(canAffordUpgradeForBuilding(world, firstBuildingId)).toBe(true);
  });
});
