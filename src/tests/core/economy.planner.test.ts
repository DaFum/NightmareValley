import { getBottleneckAction, getEconomyBottlenecks, getEconomyPlanSnapshot, getEconomyRecommendation } from '../../game/economy/economy.planner';
import { EconomySimulationState } from '../../game/core/economy.simulation';
import { BuildingType, ResourceInventory } from '../../game/core/economy.types';

function building(
  id: string,
  type: BuildingType,
  overrides: Record<string, unknown> = {}
) {
  return {
    id,
    type,
    ownerId: 'p1',
    level: 1,
    constructionProgress: 1,
    integrity: 100,
    position: { x: 0, y: 0 },
    connectedToRoad: true,
    inputBuffer: {},
    outputBuffer: {},
    internalStorage: {},
    assignedWorkers: [],
    progressSec: 0,
    isActive: true,
    corruption: 0,
    ...overrides,
  } as any;
}

function makeState(buildings: Record<string, any>, stock: ResourceInventory = {}): EconomySimulationState {
  return {
    tick: 0,
    ageOfTeeth: 0,
    players: {
      p1: {
        id: 'p1',
        stock,
        buildings: Object.keys(buildings),
        workers: [],
      } as any,
    },
    buildings,
    workers: {},
    territory: { tiles: {}, tileIndex: {} } as any,
    transport: {
      jobs: {},
      activeCarrierTasks: {},
      networkStress: 0,
      averageLatencySec: 0,
      queuedJobCount: 0,
    },
    worldPulse: 0,
  };
}

describe('economy planner', () => {
  it('recommends the first missing campaign building', () => {
    const state = makeState({
      vault: building('vault', 'vaultOfDigestiveStone', {
        outputBuffer: { toothPlanks: 80, sepulcherStone: 55 },
      }),
    });

    const recommendation = getEconomyRecommendation(state as any, 'p1');

    expect(recommendation.buildingType).toBe('sepulcherQuarry');
    expect(recommendation.label).toBe('Build Sepulcher Quarry');
  });

  it('recommends upstream production before waiting for stored bread', () => {
    const state = makeState({
      vault: building('vault', 'vaultOfDigestiveStone', {
        outputBuffer: { funeralLoaf: 0 },
      }),
      quarry: building('quarry', 'sepulcherQuarry'),
      well: building('well', 'wombWell'),
      hooks: building('hooks', 'shoreOfHooks'),
      salt: building('salt', 'refectoryOfSalt'),
      field: building('field', 'fieldOfMouths'),
      mill: building('mill', 'dustCathedralMill'),
      oven: building('oven', 'ovenOfLastBread'),
      coal: building('coal', 'coalWound'),
      iron: building('iron', 'ironVeinPit'),
      smeltery: building('smeltery', 'bloodSmeltery'),
      crucible: building('crucible', 'instrumentCrucible'),
    });

    const recommendation = getEconomyRecommendation(state as any, 'p1');

    expect(recommendation.resourceType).toBe('funeralLoaf');
    expect(recommendation.label).toBe('Store 10 more Funeral Loaf');
  });

  it('reports production bottlenecks that explain stalled buildings', () => {
    const state = makeState({
      mill: building('mill', 'millOfGnashing', {
        assignedWorkers: [],
        inputBuffer: {},
        outputBuffer: { toothPlanks: 6 },
      }),
      oven: building('oven', 'ovenOfLastBread', {
        assignedWorkers: ['worker-1'],
        inputBuffer: { boneDust: 1 },
      }),
    });

    const bottlenecks = getEconomyBottlenecks(state as any, 'p1');

    expect(bottlenecks).toEqual(
      expect.arrayContaining([
        expect.objectContaining({ buildingId: 'mill', kind: 'missingWorker' }),
        expect.objectContaining({ buildingId: 'mill', kind: 'outputFull', resourceType: 'toothPlanks' }),
        expect.objectContaining({ buildingId: 'oven', kind: 'missingInput', resourceType: 'amnioticWater' }),
      ])
    );
  });

  it('combines next objective, recommendation, and bottlenecks into one snapshot', () => {
    const state = makeState({
      vault: building('vault', 'vaultOfDigestiveStone', {
        outputBuffer: { toothPlanks: 80, sepulcherStone: 55 },
      }),
    });

    const snapshot = getEconomyPlanSnapshot(state as any, 'p1');

    expect(snapshot.nextObjective?.id).toBe('secureStone');
    expect(snapshot.recommendation.buildingType).toBe('sepulcherQuarry');
    expect(Array.isArray(snapshot.bottlenecks)).toBe(true);
  });

  it('returns actionable copy for road and worker blockers', () => {
    expect(getBottleneckAction({
      buildingId: 'mill',
      buildingType: 'millOfGnashing',
      buildingName: 'Mill of Gnashing',
      kind: 'roadDisconnected',
      label: 'Mill of Gnashing is disconnected from roads',
    })).toContain('Road tool');

    expect(getBottleneckAction({
      buildingId: 'quarry',
      buildingType: 'sepulcherQuarry',
      buildingName: 'Sepulcher Quarry',
      kind: 'missingWorker',
      label: 'Sepulcher Quarry needs workers',
    })).toContain('hire');
  });
});
