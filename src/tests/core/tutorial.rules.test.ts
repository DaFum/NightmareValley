import { getTutorialStep } from '../../game/tutorial/tutorial.rules';
import { EconomySimulationState } from '../../game/core/economy.simulation';
import { BuildingType, ResourceInventory, WorkerType } from '../../game/core/economy.types';

const ownerId = 'p1';

function building(id: string, type: BuildingType, outputBuffer: ResourceInventory = {}) {
  return {
    id,
    type,
    ownerId,
    level: 1,
    integrity: 100,
    position: { x: 0, y: 0 },
    connectedToRoad: true,
    inputBuffer: {},
    outputBuffer,
    internalStorage: {},
    assignedWorkers: [`w_${id}`],
    constructionProgress: 1,
    progressSec: 0,
    isActive: true,
  } as any;
}

function worker(id: string, type: WorkerType) {
  return {
    id,
    type,
    ownerId,
    position: { x: 0, y: 0 },
    isIdle: false,
    morale: 100,
    infection: 0,
    scars: 0,
  } as any;
}

function makeState(overrides: Partial<EconomySimulationState> = {}): EconomySimulationState {
  return {
    tick: 0,
    ageOfTeeth: 0,
    players: {
      [ownerId]: {
        id: ownerId,
        name: 'Player',
        stock: {},
        buildings: [],
        workers: [],
        territoryTileIds: [],
        populationLimit: 20,
        doctrine: 'industry',
        dread: 0,
        holinessDebt: 0,
      },
    },
    buildings: {},
    workers: {},
    territory: { tiles: {}, tileIndex: {} },
    transport: { jobs: {}, activeCarrierTasks: {}, networkStress: 0, averageLatencySec: 0, queuedJobCount: 0 },
    worldPulse: 0,
    ...overrides,
  };
}

describe('tutorial rules', () => {
  it('starts by asking the player to build a quarry', () => {
    const state = makeState();

    expect(getTutorialStep(state, ownerId).id).toBe('buildQuarry');
  });

  it('asks for a well after the quarry exists', () => {
    const state = makeState({
      buildings: {
        quarry: building('quarry', 'sepulcherQuarry'),
      },
    });

    expect(getTutorialStep(state, ownerId).id).toBe('buildWell');
  });

  it('asks for roads after quarry and well exist', () => {
    const state = makeState({
      buildings: {
        quarry: building('quarry', 'sepulcherQuarry'),
        well: building('well', 'wombWell'),
      },
    });

    expect(getTutorialStep(state, ownerId).id).toBe('placeRoads');
  });

  it('detects missing staff before food and tools goals', () => {
    const state = makeState({
      buildings: {
        quarry: { ...building('quarry', 'sepulcherQuarry'), assignedWorkers: [] },
        well: building('well', 'wombWell'),
      },
      territory: {
        tiles: {
          r1: { id: 'r1', ownerId, terrain: 'scarPath', position: { x: 0, y: 1 }, footfall: 0, tier: 'dirt' },
          r2: { id: 'r2', ownerId, terrain: 'scarPath', position: { x: 1, y: 1 }, footfall: 0, tier: 'dirt' },
          r3: { id: 'r3', ownerId, terrain: 'scarPath', position: { x: 2, y: 1 }, footfall: 0, tier: 'dirt' },
        },
        tileIndex: {},
      },
    } as any);

    const step = getTutorialStep(state, ownerId);

    expect(step.id).toBe('staffWorkers');
    expect(step.buildingType).toBe('sepulcherQuarry');
  });

  it('asks for food before tools, then completes once vault reserves are stocked', () => {
    const stockedBuildings = {
      vault: building('vault', 'vaultOfDigestiveStone', { funeralLoaf: 10, tormentInstrument: 3 }),
      quarry: building('quarry', 'sepulcherQuarry'),
      well: building('well', 'wombWell'),
    };
    const workers = {
      w_vault: worker('w_vault', 'burdenThrall'),
      w_quarry: worker('w_quarry', 'graveToothBreaker'),
      w_well: worker('w_well', 'wellSupplicant'),
    };
    const base = makeState({
      buildings: stockedBuildings,
      workers,
      territory: {
        tiles: {
          r1: { id: 'r1', ownerId, terrain: 'scarPath', position: { x: 0, y: 1 }, footfall: 0, tier: 'dirt' },
          r2: { id: 'r2', ownerId, terrain: 'scarPath', position: { x: 1, y: 1 }, footfall: 0, tier: 'dirt' },
          r3: { id: 'r3', ownerId, terrain: 'scarPath', position: { x: 2, y: 1 }, footfall: 0, tier: 'dirt' },
        },
        tileIndex: {},
      },
    } as any);

    expect(getTutorialStep({
      ...base,
      buildings: {
        ...base.buildings,
        vault: building('vault', 'vaultOfDigestiveStone', { funeralLoaf: 9, tormentInstrument: 0 }),
      },
    }, ownerId).id).toBe('produceFood');

    expect(getTutorialStep({
      ...base,
      buildings: {
        ...base.buildings,
        vault: building('vault', 'vaultOfDigestiveStone', { funeralLoaf: 10, tormentInstrument: 2 }),
      },
    }, ownerId).id).toBe('produceTools');

    expect(getTutorialStep(base, ownerId).id).toBe('complete');
  });
});
