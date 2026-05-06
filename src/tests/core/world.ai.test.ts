import { tickWorld } from '../../game/world/world.tick';
import { WorldState } from '../../game/world/world.types';
import { BuildingInstance, MapTile } from '../../game/core/game.types';
import { player1Id } from '../../store/game.store';

function tile(id: string, x: number, y: number, ownerId?: string): MapTile {
  return {
    id,
    position: { x, y },
    terrain: 'scarredEarth',
    ownerId,
    footfall: 0,
    tier: 'grass',
  };
}

function makeAiWorld(): WorldState {
  const makeVault = (overrides: Partial<BuildingInstance> = {}): BuildingInstance => ({
    id: 'vault1',
    type: 'vaultOfDigestiveStone',
    ownerId: player1Id,
    level: 1,
    position: { x: 0, y: 0 },
    outputBuffer: {},
    inputBuffer: {},
    internalStorage: {},
    assignedWorkers: [],
    progressSec: 0,
    isActive: true,
    connectedToRoad: true,
    integrity: 100,
    ...overrides,
  });
  return {
    tick: 0,
    ageOfTeeth: 0,
    seed: 7,
    lastDeltaSec: 0,
    players: {
      [player1Id]: {
        id: player1Id,
        name: 'AI Settlement',
        stock: { marrowGrain: 20 },
        buildings: ['vault1'],
        workers: [],
        territoryTileIds: ['owned'],
        populationLimit: 20,
        doctrine: 'industry',
        dread: 0,
        holinessDebt: 0,
      },
    },
    buildings: {
      vault1: makeVault(),
    },
    workers: {},
    territory: {
      tiles: {
        owned: tile('owned', 0, 0, player1Id),
        frontier: tile('frontier', 1, 0),
        distant: tile('distant', 3, 0),
      },
      tileIndex: {
        '0,0': 'owned',
        '1,0': 'frontier',
        '3,0': 'distant',
      },
    },
    transport: { jobs: {}, activeCarrierTasks: {}, networkStress: 0, averageLatencySec: 0, queuedJobCount: 0 },
    worldPulse: 0,
  };
}

describe('tickWorld AI integration', () => {
  it('persists AI state', () => {
    const next = tickWorld(makeAiWorld(), 1);

    expect(next.ai?.state.tick).toBe(1);
    expect((next.ai?.lastActions.length ?? 0)).toBeGreaterThan(0);
  });

  it('applies validated expansion actions when AI issues expand', () => {
    let next = makeAiWorld();
    let sawExpand = false;
    for (let i = 0; i < 12; i++) {
      next = tickWorld(next, 1);
      if (next.ai?.appliedActions.some((action) => action.type === 'expand')) {
        sawExpand = true;
        break;
      }
    }

    if (sawExpand) {
      expect(next.territory.tiles.frontier.ownerId).toBe(player1Id);
      expect(next.players[player1Id].territoryTileIds).toContain('frontier');
      return;
    }

    expect(next.ai?.state.tick).toBeGreaterThan(0);
  });

  it('continues AI state across ticks', () => {
    const first = tickWorld(makeAiWorld(), 1);
    const second = tickWorld(first, 1);

    expect(second.ai?.state.tick).toBe(2);
  });

  it('translates affordable build actions through building placement', () => {
    const world = makeAiWorld();
    world.buildings.vault1.outputBuffer = { toothPlanks: 10, sepulcherStone: 10, marrowGrain: 0 };

    const next = tickWorld(world, 1);

    expect(next.ai?.lastActions.some((action) => action.type === 'build')).toBe(true);
    expect(next.ai?.appliedActions.some((action) => action.type === 'build')).toBe(true);
    expect(Object.values(next.buildings).some((building) => building.type === 'fieldOfMouths')).toBe(true);
    expect(next.territory.tiles.owned.buildingId).toBeDefined();
  });
});
