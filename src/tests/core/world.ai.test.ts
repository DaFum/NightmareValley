import { tickWorld } from '../../game/world/world.tick';
import { WorldState } from '../../game/world/world.types';
import { MapTile } from '../../game/core/game.types';

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
  return {
    tick: 0,
    ageOfTeeth: 0,
    seed: 7,
    lastDeltaSec: 0,
    players: {
      p1: {
        id: 'p1',
        name: 'AI Settlement',
        stock: { marrowGrain: 20 },
        buildings: [],
        workers: [],
        territoryTileIds: ['owned'],
        populationLimit: 20,
        doctrine: 'industry',
        dread: 0,
        holinessDebt: 0,
      },
    },
    buildings: {},
    workers: {},
    territory: {
      tiles: {
        owned: tile('owned', 0, 0, 'p1'),
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
  it('persists AI state and applies validated expansion actions', () => {
    const next = tickWorld(makeAiWorld(), 1);

    expect(next.ai?.state.tick).toBe(1);
    expect(next.ai?.lastActions.some((action) => action.type === 'expand')).toBe(true);
    expect(next.ai?.appliedActions.some((action) => action.type === 'expand')).toBe(true);
    expect(next.territory.tiles.frontier.ownerId).toBe('p1');
    expect(next.players.p1.territoryTileIds).toContain('frontier');
    expect(next.territory.tiles.distant.ownerId).toBeUndefined();
  });

  it('continues AI state across ticks', () => {
    const first = tickWorld(makeAiWorld(), 1);
    const second = tickWorld(first, 1);

    expect(second.ai?.state.tick).toBe(2);
  });

  it('translates affordable build actions through building placement', () => {
    const world = makeAiWorld();
    world.players.p1.stock = { toothPlanks: 10, sepulcherStone: 10, marrowGrain: 0 };

    const next = tickWorld(world, 1);

    expect(next.ai?.lastActions.some((action) => action.type === 'build')).toBe(true);
    expect(next.ai?.appliedActions.some((action) => action.type === 'build')).toBe(true);
    expect(Object.values(next.buildings).some((building) => building.type === 'fieldOfMouths')).toBe(true);
    expect(next.territory.tiles.owned.buildingId).toBeDefined();
  });
});
