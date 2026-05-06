import { EconomySimulationState } from '../../game/core/economy.simulation';
import { MapTile } from '../../game/core/game.types';
import { expandTerritoryFromInfluence } from '../../game/map/map.territory';

function makeTile(id: string, x: number, y: number, ownerId?: string): MapTile {
  return {
    id,
    position: { x, y },
    terrain: 'scarredEarth',
    ownerId,
    footfall: 0,
    tier: 'grass',
  };
}

function makeState(): EconomySimulationState {
  const tiles: Record<string, MapTile> = {};
  const tileIndex: Record<string, string> = {};
  for (let x = 0; x <= 8; x++) {
    for (let y = 0; y <= 8; y++) {
      const id = `t_${x}_${y}`;
      tiles[id] = makeTile(id, x, y);
      tileIndex[`${x},${y}`] = id;
    }
  }

  return {
    tick: 0,
    ageOfTeeth: 0,
    players: {
      p1: {
        id: 'p1',
        name: 'Player 1',
        stock: {},
        buildings: ['spire'],
        workers: [],
        territoryTileIds: [],
        populationLimit: 20,
        doctrine: 'industry',
        dread: 0,
        holinessDebt: 0,
      },
    },
    buildings: {
      spire: {
        id: 'spire',
        type: 'spireOfJurisdiction',
        ownerId: 'p1',
        level: 1,
        integrity: 100,
        position: { x: 4, y: 4 },
        connectedToRoad: true,
        inputBuffer: {},
        outputBuffer: {},
        internalStorage: {},
        assignedWorkers: [],
        progressSec: 0,
        isActive: true,
      },
    },
    workers: {},
    territory: { tiles, tileIndex },
    transport: { jobs: {}, activeCarrierTasks: {}, networkStress: 0, averageLatencySec: 0, queuedJobCount: 0 },
    worldPulse: 0,
  };
}

describe('expandTerritoryFromInfluence', () => {
  it('claims tiles inside constructed spire influence radius', () => {
    const next = expandTerritoryFromInfluence(makeState());

    expect(next.territory.tiles.t_4_4.ownerId).toBe('p1');
    expect(next.territory.tiles.t_8_4.ownerId).toBe('p1');
    expect(next.players.p1.territoryTileIds).toContain('t_8_4');
  });

  it('does not claim tiles beyond influence radius', () => {
    const next = expandTerritoryFromInfluence(makeState());

    expect(next.territory.tiles.t_8_8.ownerId).toBeUndefined();
    expect(next.players.p1.territoryTileIds).not.toContain('t_8_8');
  });

  it('does not claim territory from unconstructed influence buildings', () => {
    const state = makeState();
    state.buildings.spire = { ...state.buildings.spire, level: 0, constructionProgress: 0.5 };

    const next = expandTerritoryFromInfluence(state);

    expect(next.territory.tiles.t_4_4.ownerId).toBeUndefined();
    expect(next.players.p1.territoryTileIds).toEqual([]);
  });
});
