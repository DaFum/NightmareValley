import { processMilitaryTick, getMilitaryMetrics, getMilitaryDifficultyForScenario } from '../../game/military';
import { WorldState } from '../../game/world/world.types';
import { BuildingInstance, MapTile, PlayerState, WorkerInstance } from '../../game/core/game.types';

const PLAYER_ID = 'player';
const AI_ID = 'enemy';

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

function player(id: string, buildingIds: string[], workerIds: string[], territoryTileIds: string[]): PlayerState {
  return {
    id,
    name: id,
    stock: {},
    buildings: buildingIds,
    workers: workerIds,
    territoryTileIds,
    populationLimit: 20,
    doctrine: id === PLAYER_ID ? 'industry' : 'war',
    dread: 0,
    holinessDebt: 0,
  };
}

function building(id: string, ownerId: string, type: BuildingInstance['type'], x: number, y: number, level = 1): BuildingInstance {
  return {
    id,
    type,
    ownerId,
    level,
    integrity: 100,
    position: { x, y },
    connectedToRoad: true,
    inputBuffer: {},
    outputBuffer: {},
    internalStorage: {},
    assignedWorkers: [],
    progressSec: 0,
    isActive: true,
  };
}

function worker(id: string, ownerId: string, type: WorkerInstance['type']): WorkerInstance {
  return {
    id,
    type,
    ownerId,
    position: { x: 0, y: 0 },
    isIdle: true,
    morale: 100,
    infection: 0,
    scars: 0,
  };
}

function makeWorld(overrides: Partial<WorldState> = {}): WorldState {
  const vault = building('vault', PLAYER_ID, 'vaultOfDigestiveStone', 0, 0);
  const spire = building('spire', PLAYER_ID, 'spireOfJurisdiction', 1, 0, 2);
  const enemyVault = building('enemyVault', AI_ID, 'vaultOfDigestiveStone', 8, 8);
  const enemySpire = building('enemySpire', AI_ID, 'spireOfJurisdiction', 7, 8);
  return {
    tick: 0,
    ageOfTeeth: 0,
    seed: 11,
    lastDeltaSec: 0,
    aiOwnerId: AI_ID,
    scenarioProfile: 'challenging',
    players: {
      [PLAYER_ID]: player(PLAYER_ID, ['vault', 'spire'], ['soldier1', 'carrier'], ['p0', 'p1']),
      [AI_ID]: player(AI_ID, ['enemyVault', 'enemySpire'], [], ['e0', 'e1']),
    },
    buildings: {
      vault,
      spire,
      enemyVault,
      enemySpire,
    },
    workers: {
      soldier1: worker('soldier1', PLAYER_ID, 'warInfant'),
      carrier: worker('carrier', PLAYER_ID, 'burdenThrall'),
    },
    territory: {
      tiles: {
        p0: tile('p0', 0, 0, PLAYER_ID),
        p1: tile('p1', 1, 0, PLAYER_ID),
        e0: tile('e0', 8, 8, AI_ID),
        e1: tile('e1', 7, 8, AI_ID),
        n0: tile('n0', 4, 4),
      },
      tileIndex: {
        '0,0': 'p0',
        '1,0': 'p1',
        '8,8': 'e0',
        '7,8': 'e1',
        '4,4': 'n0',
      },
    },
    transport: { jobs: {}, activeCarrierTasks: {}, networkStress: 0, averageLatencySec: 0, queuedJobCount: 0 },
    worldPulse: 0,
    ...overrides,
  };
}

describe('military logic', () => {
  it('maps scenario profiles to military difficulty', () => {
    expect(getMilitaryDifficultyForScenario('sandbox')).toBe('easy');
    expect(getMilitaryDifficultyForScenario('challenging')).toBe('medium');
    expect(getMilitaryDifficultyForScenario('hardcore')).toBe('hard');
  });

  it('counts war infants as soldiers and spires as defensive strength', () => {
    const metrics = getMilitaryMetrics(makeWorld(), PLAYER_ID);

    expect(metrics.soldiers).toBe(1);
    expect(metrics.spires).toBe(1);
    expect(metrics.defenseStrength).toBeGreaterThan(10);
    expect(metrics.enemyTerritoryTiles).toBe(2);
  });

  it('spawns deterministic raids once the attack age is reached', () => {
    const world = makeWorld({
      ageOfTeeth: 300,
      military: {
        difficulty: 'medium',
        enemyPressure: 35,
        nextAttackAge: 250,
      },
    });

    const next = processMilitaryTick(world, PLAYER_ID, 1);

    expect(next.military?.activeRaid).toBeDefined();
    expect(next.events?.log[0]?.title).toContain('Attack');
  });

  it('resolves an active raid when defense overwhelms enemy health', () => {
    const world = makeWorld({
      ageOfTeeth: 360,
      military: {
        difficulty: 'easy',
        enemyPressure: 20,
        nextAttackAge: 600,
        activeRaid: {
          id: 'raid_1',
          strength: 4,
          health: 3,
          startedAtAge: 350,
        },
      },
    });

    const next = processMilitaryTick(world, PLAYER_ID, 1);

    expect(next.military?.activeRaid).toBeUndefined();
    expect(next.events?.log[0]?.title).toContain('Repelled');
    expect(next.buildings.vault.integrity).toBe(100);
  });

  it('damages the vault and marks defeat risk when defense collapses', () => {
    const world = makeWorld({
      ageOfTeeth: 420,
      workers: {},
      buildings: {
        vault: { ...building('vault', PLAYER_ID, 'vaultOfDigestiveStone', 0, 0), integrity: 4 },
        enemyVault: building('enemyVault', AI_ID, 'vaultOfDigestiveStone', 8, 8),
      },
      players: {
        [PLAYER_ID]: player(PLAYER_ID, ['vault'], [], ['p0']),
        [AI_ID]: player(AI_ID, ['enemyVault'], [], ['e0']),
      },
      military: {
        difficulty: 'hard',
        enemyPressure: 80,
        nextAttackAge: 600,
        activeRaid: {
          id: 'raid_2',
          strength: 20,
          health: 80,
          startedAtAge: 400,
        },
      },
    });

    const next = processMilitaryTick(world, PLAYER_ID, 2);

    expect(next.buildings.vault.integrity).toBe(0);
    expect(next.military?.defeatReason).toBe('vaultDestroyed');
    expect(next.events?.log[0]?.severity).toBe('danger');
  });
});
