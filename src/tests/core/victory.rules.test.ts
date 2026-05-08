import { evaluateGameOutcome } from '../../game/core/victory.rules';
import { WorldState } from '../../game/world/world.types';

function makeState(overrides: Partial<WorldState> = {}): WorldState {
  const base: WorldState = {
    tick: 0,
    ageOfTeeth: 0,
    seed: 1,
    lastDeltaSec: 0,
    players: {
      p1: {
        id: 'p1',
        name: 'p1',
        stock: {},
        buildings: ['vault', 'quarry', 'well', 'shore', 'refectory', 'field', 'dustMill', 'oven', 'coal', 'iron', 'smeltery', 'crucible', 'warPit', 'spire'],
        workers: ['worker', 'soldier'],
        territoryTileIds: Array.from({ length: 400 }, (_, index) => `tile_${index}`),
        populationLimit: 20,
        doctrine: 'industry',
        dread: 0,
        holinessDebt: 0,
      },
    },
    buildings: {
      vault: {
        id: 'vault',
        type: 'vaultOfDigestiveStone',
        ownerId: 'p1',
        level: 1,
        integrity: 100,
        position: { x: 0, y: 0 },
        connectedToRoad: true,
        inputBuffer: {},
        outputBuffer: {},
        internalStorage: {},
        assignedWorkers: [],
        progressSec: 0,
        isActive: true,
      },
      quarry: {
        id: 'quarry',
        type: 'sepulcherQuarry',
        ownerId: 'p1',
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
      well: {
        id: 'well',
        type: 'wombWell',
        ownerId: 'p1',
        level: 1,
        integrity: 100,
        position: { x: 2, y: 0 },
        connectedToRoad: true,
        inputBuffer: {},
        outputBuffer: {},
        internalStorage: {},
        assignedWorkers: [],
        progressSec: 0,
        isActive: true,
      },
      field: {
        id: 'field',
        type: 'fieldOfMouths',
        ownerId: 'p1',
        level: 1,
        integrity: 100,
        position: { x: 3, y: 0 },
        connectedToRoad: true,
        inputBuffer: {},
        outputBuffer: {},
        internalStorage: {},
        assignedWorkers: [],
        progressSec: 0,
        isActive: true,
      },
      shore: {
        id: 'shore',
        type: 'shoreOfHooks',
        ownerId: 'p1',
        level: 1,
        integrity: 100,
        position: { x: 4, y: 0 },
        connectedToRoad: true,
        inputBuffer: {},
        outputBuffer: {},
        internalStorage: {},
        assignedWorkers: [],
        progressSec: 0,
        isActive: true,
      },
      refectory: {
        id: 'refectory',
        type: 'refectoryOfSalt',
        ownerId: 'p1',
        level: 1,
        integrity: 100,
        position: { x: 5, y: 0 },
        connectedToRoad: true,
        inputBuffer: {},
        outputBuffer: {},
        internalStorage: {},
        assignedWorkers: [],
        progressSec: 0,
        isActive: true,
      },
      dustMill: {
        id: 'dustMill',
        type: 'dustCathedralMill',
        ownerId: 'p1',
        level: 1,
        integrity: 100,
        position: { x: 6, y: 0 },
        connectedToRoad: true,
        inputBuffer: {},
        outputBuffer: {},
        internalStorage: {},
        assignedWorkers: [],
        progressSec: 0,
        isActive: true,
      },
      oven: {
        id: 'oven',
        type: 'ovenOfLastBread',
        ownerId: 'p1',
        level: 1,
        integrity: 100,
        position: { x: 7, y: 0 },
        connectedToRoad: true,
        inputBuffer: {},
        outputBuffer: {},
        internalStorage: {},
        assignedWorkers: [],
        progressSec: 0,
        isActive: true,
      },
      coal: {
        id: 'coal',
        type: 'coalWound',
        ownerId: 'p1',
        level: 1,
        integrity: 100,
        position: { x: 8, y: 0 },
        connectedToRoad: true,
        inputBuffer: {},
        outputBuffer: {},
        internalStorage: {},
        assignedWorkers: [],
        progressSec: 0,
        isActive: true,
      },
      iron: {
        id: 'iron',
        type: 'ironVeinPit',
        ownerId: 'p1',
        level: 1,
        integrity: 100,
        position: { x: 9, y: 0 },
        connectedToRoad: true,
        inputBuffer: {},
        outputBuffer: {},
        internalStorage: {},
        assignedWorkers: [],
        progressSec: 0,
        isActive: true,
      },
      smeltery: {
        id: 'smeltery',
        type: 'bloodSmeltery',
        ownerId: 'p1',
        level: 1,
        integrity: 100,
        position: { x: 10, y: 0 },
        connectedToRoad: true,
        inputBuffer: {},
        outputBuffer: {},
        internalStorage: {},
        assignedWorkers: [],
        progressSec: 0,
        isActive: true,
      },
      crucible: {
        id: 'crucible',
        type: 'instrumentCrucible',
        ownerId: 'p1',
        level: 1,
        integrity: 100,
        position: { x: 11, y: 0 },
        connectedToRoad: true,
        inputBuffer: {},
        outputBuffer: {},
        internalStorage: {},
        assignedWorkers: [],
        progressSec: 0,
        isActive: true,
      },
      warPit: {
        id: 'warPit',
        type: 'pitOfWarBirth',
        ownerId: 'p1',
        level: 1,
        integrity: 100,
        position: { x: 12, y: 0 },
        connectedToRoad: true,
        inputBuffer: {},
        outputBuffer: {},
        internalStorage: {},
        assignedWorkers: [],
        progressSec: 0,
        isActive: true,
      },
      spire: {
        id: 'spire',
        type: 'spireOfJurisdiction',
        ownerId: 'p1',
        level: 2,
        integrity: 100,
        position: { x: 13, y: 0 },
        connectedToRoad: true,
        inputBuffer: {},
        outputBuffer: {},
        internalStorage: {},
        assignedWorkers: ['soldier'],
        progressSec: 0,
        isActive: true,
      },
    },
    workers: {
      worker: {
        id: 'worker',
        type: 'burdenThrall',
        ownerId: 'p1',
        position: { x: 0, y: 0 },
        isIdle: true,
        morale: 100,
        infection: 0,
        scars: 0,
      },
      soldier: {
        id: 'soldier',
        type: 'warInfant',
        ownerId: 'p1',
        homeBuildingId: 'spire',
        currentBuildingId: 'spire',
        position: { x: 13, y: 0 },
        isIdle: false,
        morale: 100,
        infection: 0,
        scars: 0,
      },
    },
    territory: {
      tiles: Object.fromEntries(
        Array.from({ length: 400 }, (_, index) => [
          `tile_${index}`,
          {
            id: `tile_${index}`,
            position: { x: index % 20, y: Math.floor(index / 20) },
            terrain: 'scarredEarth',
            ownerId: 'p1',
            footfall: 0,
            tier: 'grass',
          },
        ])
      ),
    },
    transport: { jobs: {}, activeCarrierTasks: {}, networkStress: 0, averageLatencySec: 0, queuedJobCount: 0 },
    military: {
      difficulty: 'medium',
      enemyPressure: 20,
      nextAttackAge: 600,
      raidsRepelled: 1,
    },
    worldPulse: 0,
  };

  return { ...base, ...overrides };
}

describe('victory rules', () => {
  it('keeps the campaign in progress until endgame resources are stored', () => {
    const outcome = evaluateGameOutcome(makeState(), 'p1');
    expect(outcome.kind).toBe('in-progress');
    expect(outcome.objectives.some((objective) => !objective.complete)).toBe(true);
  });

  it('requires expansion and raid survival before victory', () => {
    const state = makeState();
    state.buildings.vault.outputBuffer = { funeralLoaf: 10, tormentInstrument: 3 };
    state.players.p1.territoryTileIds = ['tile_0'];
    state.military = { difficulty: 'medium', enemyPressure: 20, nextAttackAge: 600, raidsRepelled: 0 };

    const outcome = evaluateGameOutcome(state, 'p1');

    expect(outcome.kind).toBe('in-progress');
    expect(outcome.objectives).toEqual(
      expect.arrayContaining([
        expect.objectContaining({ id: 'holdTerritory', complete: false }),
        expect.objectContaining({ id: 'repelFirstRaid', complete: false }),
      ])
    );
  });

  it('requires the hostile pressure to be broken before victory', () => {
    const state = makeState();
    state.buildings.vault.outputBuffer = { funeralLoaf: 10, tormentInstrument: 3 };
    state.military = { difficulty: 'medium', enemyPressure: 25, nextAttackAge: 600, raidsRepelled: 1 };

    const outcome = evaluateGameOutcome(state, 'p1');

    expect(outcome.kind).toBe('in-progress');
    expect(outcome.objectives).toEqual(
      expect.arrayContaining([
        expect.objectContaining({
          id: 'breakHostileChoir',
          complete: false,
          current: 0,
          target: 1,
        }),
      ])
    );
  });

  it('declares victory when all campaign objectives are complete', () => {
    const state = makeState();
    state.buildings.vault.outputBuffer = { funeralLoaf: 10, tormentInstrument: 3 };
    state.military = { difficulty: 'medium', enemyPressure: 5, nextAttackAge: 600, raidsRepelled: 2 };
    state.ageOfTeeth = 300;
    const outcome = evaluateGameOutcome(state, 'p1');
    expect(outcome.kind).toBe('victory');
    expect(outcome.title).toBe('Hostile Choir Defeated');
    expect(outcome.score?.total).toBeGreaterThan(0);
    expect(outcome.objectives.every((objective) => objective.complete)).toBe(true);
  });

  it('exposes the full playable production chain as objectives', () => {
    const outcome = evaluateGameOutcome(makeState(), 'p1');
    expect(outcome.objectives.map((objective) => objective.id)).toEqual([
      'secureStone',
      'secureWater',
      'hookFish',
      'refineSalt',
      'growGrain',
      'grindBoneDust',
      'bakeBread',
      'mineCoal',
      'mineIron',
      'smeltIron',
      'forgeCrucible',
      'bakeRations',
      'raiseWarPit',
      'raiseSpire',
      'holdTerritory',
      'musterDefense',
      'repelFirstRaid',
      'breakHostileChoir',
      'forgeInstruments',
    ]);
    expect(outcome.objectives.map((objective) => objective.chapter)).toContain('Fortification');
    expect(outcome.objectives.map((objective) => objective.chapter)).toContain('Expansion');
    expect(outcome.objectives.map((objective) => objective.chapter)).toContain('Survival / Victory');
    expect(outcome.objectives.every((objective) => objective.reward.length > 0)).toBe(true);
  });

  it('declares defeat when no viable workforce remains', () => {
    const state = makeState();
    state.players.p1.workers = [];
    state.workers = {};
    const outcome = evaluateGameOutcome(state, 'p1');
    expect(outcome.kind).toBe('defeat');
  });
});
