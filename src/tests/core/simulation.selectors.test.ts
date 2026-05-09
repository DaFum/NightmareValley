import { canAffordBuildingForPlayer, canAffordUpgradeForBuilding, canPlaceBuildingForPlayerAtTile, getInventoryForCostChecks, getPlacementValidation } from '../../store/simulation.selectors';
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

  it('returns player-facing placement reasons for unowned, occupied, and terrain-blocked tiles', () => {
    const world = structuredClone(useGameStore.getState().gameState);
    const [playerId] = Object.keys(world.players);
    const occupiedTile = Object.values(world.territory.tiles).find((tile) => tile.ownerId === playerId && tile.buildingId);

    world.territory.tiles.unowned_test = {
      id: 'unowned_test',
      position: { x: 99, y: 98 },
      terrain: 'scarredEarth',
      ownerId: 'enemy',
      footfall: 0,
      tier: 'grass',
    };
    world.territory.tiles.terrain_test = {
      id: 'terrain_test',
      position: { x: 99, y: 99 },
      terrain: 'ribMountain',
      ownerId: playerId,
      footfall: 0,
      tier: 'grass',
    };
    world.territory.tileIndex = {
      ...world.territory.tileIndex,
      '99,98': 'unowned_test',
      '99,99': 'terrain_test',
    };

    const unownedTile = world.territory.tiles.unowned_test;
    const wrongTerrainTile = world.territory.tiles.terrain_test;

    expect(occupiedTile).toBeDefined();

    const occupied = getPlacementValidation(world, playerId, 'organHarvester', occupiedTile!.position.x, occupiedTile!.position.y);
    const unowned = getPlacementValidation(world, playerId, 'organHarvester', unownedTile.position.x, unownedTile.position.y);
    const terrainBlocked = getPlacementValidation(world, playerId, 'organHarvester', wrongTerrainTile.position.x, wrongTerrainTile.position.y);

    expect(occupied).toEqual(expect.objectContaining({
      ok: false,
      reasonCode: 'occupied',
      message: 'Clear the existing structure before building here.',
    }));
    expect(unowned).toEqual(expect.objectContaining({
      ok: false,
      reasonCode: 'not_owner',
      message: 'Claim this tile with a Spire of Jurisdiction before building here.',
    }));
    expect(terrainBlocked).toEqual(expect.objectContaining({
      ok: false,
      reasonCode: 'terrain_blocked',
      message: 'This footprint includes Rib mountain. Organ Harvester needs Scarred earth or Forest.',
    }));
  });

  it('returns logistics distance details for valid building placement', () => {
    const playerId = 'p1';
    const world = {
      players: {
        [playerId]: { id: playerId, buildings: ['vault_1'] },
      },
      buildings: {
        'vault_1': { id: 'vault_1', type: 'vaultOfDigestiveStone', ownerId: playerId, position: { x: 0, y: 0 }, isConstructed: true },
      },
      territory: {
        tiles: {
          'tile_1': { id: 'tile_1', ownerId: playerId, position: { x: 5, y: 5 }, terrain: 'scarredEarth' }
        },
        tileIndex: {
          '5,5': 'tile_1',
        }
      }
    } as any;
    const placeableTile = world.territory.tiles['tile_1'];

    expect(placeableTile).toBeDefined();

    const validation = getPlacementValidation(world, playerId, 'organHarvester', placeableTile!.position.x, placeableTile!.position.y);

    expect(validation.ok).toBe(true);
    expect(Number.isFinite(validation.nearestVaultDistance)).toBe(true);
    expect(validation.logisticsHint).toContain('nearest vault');
  });
});
