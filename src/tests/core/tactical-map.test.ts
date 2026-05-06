import { createTacticalMapBrief, createTacticalMapSummary, projectTacticalPoint } from '../../game/map/tactical-map';
import type { WorldState } from '../../game/world/world.types';

function stateFixture(): WorldState {
  return {
    tick: 0,
    ageOfTeeth: 0,
    seed: 1,
    lastDeltaSec: 0,
    players: {
      player_one: {
        id: 'player_one',
        name: 'Player',
        stock: {},
        buildings: ['vault'],
        workers: ['carrier'],
        territoryTileIds: ['tile_0_0', 'tile_1_0'],
        populationLimit: 10,
        doctrine: 'industry',
        dread: 0,
        holinessDebt: 0,
      },
    },
    buildings: {
      vault: {
        id: 'vault',
        type: 'vaultOfDigestiveStone',
        ownerId: 'player_one',
        level: 1,
        integrity: 100,
        position: { x: 1, y: 0 },
        connectedToRoad: true,
        inputBuffer: {},
        outputBuffer: {},
        internalStorage: {},
        assignedWorkers: [],
        progressSec: 0,
        isActive: true,
      },
    },
    workers: {
      carrier: {
        id: 'carrier',
        type: 'burdenThrall',
        ownerId: 'player_one',
        position: { x: 0, y: 1 },
        isIdle: false,
        morale: 100,
        infection: 0,
        scars: 0,
        path: [{ x: 1, y: 1 }],
      },
    },
    territory: {
      tiles: {
        tile_0_0: { id: 'tile_0_0', position: { x: 0, y: 0 }, terrain: 'scarredEarth', ownerId: 'player_one', footfall: 0, tier: 'grass' },
        tile_1_0: { id: 'tile_1_0', position: { x: 1, y: 0 }, terrain: 'scarPath', ownerId: 'player_one', buildingId: 'vault', footfall: 0, tier: 'cobble' },
        tile_0_1: { id: 'tile_0_1', position: { x: 0, y: 1 }, terrain: 'placentaLake', footfall: 0, tier: 'grass' },
      },
    },
    transport: { jobs: {}, activeCarrierTasks: {}, networkStress: 0, averageLatencySec: 0, queuedJobCount: 0 },
    worldPulse: 0,
  };
}

describe('tactical map summary', () => {
  it('summarizes owned terrain, roads, buildings, and moving workers', () => {
    const summary = createTacticalMapSummary(stateFixture(), 'player_one');

    expect(summary.bounds).toEqual({ minX: 0, minY: 0, maxX: 1, maxY: 1, width: 2, height: 2 });
    expect(summary.counts).toEqual({ ownedTiles: 2, buildings: 1, roads: 1, workers: 1, activeCarriers: 1 });
    expect(summary.points.map((point) => point.kind).sort()).toEqual(['building', 'road', 'worker']);
  });

  it('projects world positions into the requested minimap dimensions', () => {
    const summary = createTacticalMapSummary(stateFixture(), 'player_one');

    expect(projectTacticalPoint(0, 0, summary, 100, 80)).toEqual({ x: 0, y: 0 });
    expect(projectTacticalPoint(1, 1, summary, 100, 80)).toEqual({ x: 50, y: 40 });
  });

  it('creates compact next-chain copy from map markers and economy recommendations', () => {
    const brief = createTacticalMapBrief(stateFixture(), 'player_one');

    expect(brief.nextLabel).toMatch(/Build|Store|Campaign/);
    expect(brief.markerCopy).toBe('1 buildings, 1 roads, 1 active carriers');
  });
});
