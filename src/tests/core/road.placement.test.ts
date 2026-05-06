import { EconomySimulationState } from '../../game/core/economy.simulation';
import { MapTile } from '../../game/core/game.types';
import { areBuildingsRoadConnected, placeRoadTile, removeRoadTile } from '../../game/entities/roads/road.logic';
import { isRemovableRoadTile } from '../../game/entities/roads/road.validation';

function makeTile(id: string, x: number, y: number, overrides: Partial<MapTile> = {}): MapTile {
  return {
    id,
    position: { x, y },
    terrain: 'scarredEarth',
    ownerId: 'p1',
    footfall: 0,
    tier: 'grass',
    ...overrides,
  };
}

function makeState(tiles: Record<string, MapTile>): EconomySimulationState {
  return {
    tick: 0,
    ageOfTeeth: 0,
    players: {
      p1: { id: 'p1', stock: {}, buildings: ['b1'], workers: [], territoryTileIds: Object.keys(tiles) } as any,
    },
    buildings: {
      b1: {
        id: 'b1',
        type: 'millOfGnashing',
        ownerId: 'p1',
        level: 1,
        integrity: 100,
        position: { x: 1, y: 0 },
        connectedToRoad: false,
        inputBuffer: {},
        outputBuffer: {},
        internalStorage: {},
        assignedWorkers: [],
        progressSec: 0,
        isActive: true,
      },
    },
    workers: {},
    territory: {
      tiles,
      tileIndex: Object.fromEntries(Object.values(tiles).map((tile) => [`${tile.position.x},${tile.position.y}`, tile.id])),
    },
    transport: { jobs: {}, activeCarrierTasks: {}, networkStress: 0, averageLatencySec: 0, queuedJobCount: 0 },
    worldPulse: 0,
  };
}

describe('placeRoadTile', () => {
  it('stamps an owned buildable tile as a dirt scar path', () => {
    const state = makeState({ t1: makeTile('t1', 0, 0) });

    const next = placeRoadTile(state, 'p1', 't1');

    expect(next.territory.tiles.t1.terrain).toBe('scarPath');
    expect(next.territory.tiles.t1.tier).toBe('dirt');
    expect(state.territory.tiles.t1.terrain).toBe('scarredEarth');
  });

  it('connects an adjacent owned building to the road network', () => {
    const state = makeState({ t1: makeTile('t1', 0, 0) });

    const next = placeRoadTile(state, 'p1', 't1');

    expect(next.buildings.b1.connectedToRoad).toBe(true);
  });

  it('rejects unowned, occupied, and invalid terrain tiles', () => {
    expect(() => placeRoadTile(makeState({ t1: makeTile('t1', 0, 0, { ownerId: 'p2' }) }), 'p1', 't1')).toThrow(
      /unowned/
    );
    expect(() => placeRoadTile(makeState({ t1: makeTile('t1', 0, 0, { buildingId: 'b2' }) }), 'p1', 't1')).toThrow(
      /occupied/
    );
    expect(() => placeRoadTile(makeState({ t1: makeTile('t1', 0, 0, { terrain: 'placentaLake' }) }), 'p1', 't1')).toThrow(
      /invalid_terrain/
    );
  });
});

describe('removeRoadTile', () => {
  it('restores a removable owned road tile to scarred earth', () => {
    const state = makeState({ t1: makeTile('t1', 0, 0, { terrain: 'scarPath', tier: 'dirt' }) });

    const next = removeRoadTile(state, 'p1', 't1');

    expect(next.territory.tiles.t1.terrain).toBe('scarredEarth');
    expect(next.territory.tiles.t1.tier).toBe('grass');
  });

  it('rejects unowned and non-road tiles', () => {
    expect(() => removeRoadTile(makeState({ t1: makeTile('t1', 0, 0, { terrain: 'scarPath', tier: 'dirt', ownerId: 'p2' }) }), 'p1', 't1')).toThrow(
      /unowned/
    );
    expect(() => removeRoadTile(makeState({ t1: makeTile('t1', 0, 0) }), 'p1', 't1')).toThrow(
      /not a removable road/
    );
  });

  it('rejects tiles that only partially match the removable road marker', () => {
    expect(() => removeRoadTile(makeState({ t1: makeTile('t1', 0, 0, { terrain: 'weepingForest', tier: 'dirt' }) }), 'p1', 't1')).toThrow(
      /not a removable road/
    );
    expect(() => removeRoadTile(makeState({ t1: makeTile('t1', 0, 0, { terrain: 'scarPath', tier: 'cobble' }) }), 'p1', 't1')).toThrow(
      /not a removable road/
    );
  });

  it('uses one removable-road predicate for logic and preview validation', () => {
    expect(isRemovableRoadTile(makeTile('road', 0, 0, { terrain: 'scarPath', tier: 'dirt' }))).toBe(true);
    expect(isRemovableRoadTile(makeTile('forestDirt', 0, 0, { terrain: 'weepingForest', tier: 'dirt' }))).toBe(false);
    expect(isRemovableRoadTile(makeTile('upgradedRoad', 0, 0, { terrain: 'scarPath', tier: 'cobble' }))).toBe(false);
  });
});

describe('areBuildingsRoadConnected', () => {
  it('returns true when building entrances share a connected road component', () => {
    const state = makeState({
      left: makeTile('left', 0, 0, { terrain: 'scarPath', tier: 'dirt' }),
      mid: makeTile('mid', 1, 0, { terrain: 'scarPath', tier: 'dirt' }),
      right: makeTile('right', 2, 0, { terrain: 'scarPath', tier: 'dirt' }),
    });
    state.buildings.a = { ...state.buildings.b1, id: 'a', position: { x: -1, y: 0 }, connectedToRoad: true } as any;
    state.buildings.b = { ...state.buildings.b1, id: 'b', position: { x: 3, y: 0 }, connectedToRoad: true } as any;

    expect(areBuildingsRoadConnected(state, state.buildings.a, state.buildings.b)).toBe(true);
  });

  it('returns false when road components are disconnected', () => {
    const state = makeState({
      left: makeTile('left', 0, 0, { terrain: 'scarPath', tier: 'dirt' }),
      right: makeTile('right', 4, 0, { terrain: 'scarPath', tier: 'dirt' }),
    });
    state.buildings.a = { ...state.buildings.b1, id: 'a', position: { x: -1, y: 0 }, connectedToRoad: true } as any;
    state.buildings.b = { ...state.buildings.b1, id: 'b', position: { x: 5, y: 0 }, connectedToRoad: true } as any;

    expect(areBuildingsRoadConnected(state, state.buildings.a, state.buildings.b)).toBe(false);
  });
});
