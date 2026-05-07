import { WorldEventLogEntry, WorldState } from '../world/world.types';
import { BuildingInstance } from '../core/game.types';
import { isConstructed } from '../entities/buildings/building.types';
import { MilitaryDifficulty, MilitaryMetrics, MilitaryRuntimeState } from './military.types';

type DifficultyConfig = {
  initialAttackAge: number;
  attackIntervalSec: number;
  pressurePerSec: number;
  baseRaidStrength: number;
};

const MAX_EVENT_LOG = 10;
const SOLDIER_DEFENSE = 6;
const SPIRE_BASE_DEFENSE = 8;
const SPIRE_LEVEL_DEFENSE = 4;
const RAID_WARNING_LEAD_SEC = 45;

const DIFFICULTY_CONFIG: Record<MilitaryDifficulty, DifficultyConfig> = {
  easy: {
    initialAttackAge: 420,
    attackIntervalSec: 360,
    pressurePerSec: 0.035,
    baseRaidStrength: 6,
  },
  medium: {
    initialAttackAge: 270,
    attackIntervalSec: 270,
    pressurePerSec: 0.055,
    baseRaidStrength: 10,
  },
  hard: {
    initialAttackAge: 190,
    attackIntervalSec: 210,
    pressurePerSec: 0.08,
    baseRaidStrength: 14,
  },
};

export function getMilitaryDifficultyForScenario(profile: WorldState['scenarioProfile']): MilitaryDifficulty {
  if (profile === 'sandbox') return 'easy';
  if (profile === 'hardcore') return 'hard';
  return 'medium';
}

export function createInitialMilitaryState(profile: WorldState['scenarioProfile']): MilitaryRuntimeState {
  const difficulty = getMilitaryDifficultyForScenario(profile);
  return {
    difficulty,
    enemyPressure: 15,
    nextAttackAge: DIFFICULTY_CONFIG[difficulty].initialAttackAge,
  };
}

function getEnemyOwnerId(state: WorldState, playerId: string): string | undefined {
  if (state.aiOwnerId && state.aiOwnerId !== playerId && state.players[state.aiOwnerId]) {
    return state.aiOwnerId;
  }
  return Object.keys(state.players).find((id) => id !== playerId);
}

function getPlayerBuildings(state: WorldState, playerId: string): BuildingInstance[] {
  const player = state.players[playerId];
  if (!player) return [];
  return player.buildings
    .map((id) => state.buildings[id])
    .filter((building): building is BuildingInstance => Boolean(building));
}

function getPrimaryVault(state: WorldState, playerId: string): BuildingInstance | undefined {
  return getPlayerBuildings(state, playerId).find((building) => building.type === 'vaultOfDigestiveStone');
}

export function getMilitaryMetrics(state: WorldState, playerId: string): MilitaryMetrics {
  const totalTiles = Math.max(1, Object.keys(state.territory.tiles).length);
  const player = state.players[playerId];
  const enemyOwnerId = getEnemyOwnerId(state, playerId);
  const soldiers = player?.workers.filter((id) => state.workers[id]?.type === 'warInfant').length ?? 0;
  const spires = getPlayerBuildings(state, playerId).filter(
    (building) => building.type === 'spireOfJurisdiction' && building.isActive && isConstructed(building)
  );
  const controlledTiles = player?.territoryTileIds.length ?? 0;
  const enemyTerritoryTiles = enemyOwnerId
    ? state.players[enemyOwnerId]?.territoryTileIds.length ?? 0
    : Object.values(state.players)
      .filter((candidate) => candidate.id !== playerId)
      .reduce((sum, candidate) => sum + candidate.territoryTileIds.length, 0);
  const spireDefense = spires.reduce(
    (sum, spire) => sum + SPIRE_BASE_DEFENSE + Math.max(0, spire.level - 1) * SPIRE_LEVEL_DEFENSE,
    0
  );
  const vaultIntegrity = getPrimaryVault(state, playerId)?.integrity ?? 0;

  return {
    soldiers,
    spires: spires.length,
    defenseStrength: soldiers * SOLDIER_DEFENSE + spireDefense,
    controlledTiles,
    enemyTerritoryTiles,
    controlledRatio: controlledTiles / totalTiles,
    activeCombats: state.military?.activeRaid ? 1 : 0,
    vaultIntegrity,
  };
}

function appendMilitaryEvent(
  state: WorldState,
  title: string,
  description: string,
  severity: WorldEventLogEntry['severity']
): WorldState {
  const previous = state.events ?? { lastEventStep: Math.floor(state.ageOfTeeth / 120), log: [] };
  const entry: WorldEventLogEntry = {
    id: `military_${state.tick}_${Math.floor(state.ageOfTeeth)}_${previous.log.length}`,
    age: state.ageOfTeeth,
    title,
    description,
    severity,
  };
  return {
    ...state,
    events: {
      lastEventStep: previous.lastEventStep,
      log: [entry, ...previous.log].slice(0, MAX_EVENT_LOG),
    },
  };
}

function spawnRaid(state: WorldState, military: MilitaryRuntimeState, config: DifficultyConfig): WorldState {
  const pressureBonus = Math.floor(military.enemyPressure / 10);
  const strength = config.baseRaidStrength + pressureBonus;
  const activeRaid = {
    id: `raid_${state.seed}_${Math.floor(state.ageOfTeeth)}`,
    strength,
    health: strength * 3,
    startedAtAge: state.ageOfTeeth,
  };
  const next: WorldState = {
    ...state,
    military: {
      ...military,
      activeRaid,
      nextAttackAge: state.ageOfTeeth + config.attackIntervalSec,
      lastWarningAttackAge: undefined,
    },
  };
  return appendMilitaryEvent(
    next,
    'Attack Wave Sighted',
    `A hostile wave with strength ${strength} is pressing toward the vault.`,
    'danger'
  );
}

function damagePrimaryVault(state: WorldState, playerId: string, amount: number): WorldState {
  const vault = getPrimaryVault(state, playerId);
  if (!vault || amount <= 0) return state;
  const nextIntegrity = Math.max(0, vault.integrity - amount);
  return {
    ...state,
    buildings: {
      ...state.buildings,
      [vault.id]: {
        ...vault,
        integrity: nextIntegrity,
      },
    },
  };
}

function resolveActiveRaid(state: WorldState, playerId: string, deltaSec: number, military: MilitaryRuntimeState): WorldState {
  const raid = military.activeRaid;
  if (!raid) return { ...state, military };

  const metrics = getMilitaryMetrics(state, playerId);
  const nextHealth = raid.health - metrics.defenseStrength * deltaSec;
  if (nextHealth <= 0) {
    const next: WorldState = {
      ...state,
      military: {
        ...military,
        enemyPressure: Math.max(0, military.enemyPressure - 15),
        activeRaid: undefined,
      },
    };
    return appendMilitaryEvent(
      next,
      'Raid Repelled',
      `Defenders broke the attack with ${metrics.defenseStrength} defense strength.`,
      'info'
    );
  }

  let next: WorldState = {
    ...state,
    military: {
      ...military,
      activeRaid: {
        ...raid,
        health: nextHealth,
      },
    },
  };

  if (metrics.defenseStrength < raid.strength) {
    const damage = Math.ceil((raid.strength - metrics.defenseStrength) * 0.4 * deltaSec);
    next = damagePrimaryVault(next, playerId, damage);
    const vaultIntegrity = getPrimaryVault(next, playerId)?.integrity ?? 0;
    if (vaultIntegrity <= 0) {
      next = {
        ...next,
        military: {
          ...next.military!,
          defeatReason: 'vaultDestroyed',
        },
      };
      return appendMilitaryEvent(
        next,
        'Vault Breached',
        'The central vault has been destroyed by hostile pressure.',
        'danger'
      );
    }
  }

  return next;
}

export function processMilitaryTick(state: WorldState, playerId: string, deltaSec: number): WorldState {
  if (!Number.isFinite(deltaSec) || deltaSec <= 0 || !state.players[playerId]) return state;

  const baseMilitary = state.military ?? createInitialMilitaryState(state.scenarioProfile);
  const difficulty = baseMilitary.difficulty ?? getMilitaryDifficultyForScenario(state.scenarioProfile);
  const config = DIFFICULTY_CONFIG[difficulty];
  const metrics = getMilitaryMetrics(state, playerId);
  const territoryPressure = Math.min(0.035, metrics.enemyTerritoryTiles * 0.0005);
  const military: MilitaryRuntimeState = {
    ...baseMilitary,
    difficulty,
    enemyPressure: Math.min(100, baseMilitary.enemyPressure + (config.pressurePerSec + territoryPressure) * deltaSec),
  };

  let next: WorldState = { ...state, military };

  if (!military.activeRaid) {
    const warningAge = military.nextAttackAge - RAID_WARNING_LEAD_SEC;
    const warningAlreadyShown = military.lastWarningAttackAge === military.nextAttackAge;
    if (state.ageOfTeeth >= warningAge && state.ageOfTeeth < military.nextAttackAge && !warningAlreadyShown) {
      next = appendMilitaryEvent(
        {
          ...next,
          military: {
            ...military,
            lastWarningAttackAge: military.nextAttackAge,
          },
        },
        'Attack Warning',
        'Hostile movement gathers near the border. Staff spires or recruit war infants.',
        'warning'
      );
      return next;
    }

    if (state.ageOfTeeth >= military.nextAttackAge) {
      return spawnRaid(next, military, config);
    }

    return next;
  }

  return resolveActiveRaid(next, playerId, deltaSec, military);
}
