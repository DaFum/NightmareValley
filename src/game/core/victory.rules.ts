import { BuildingType, ResourceInventory, ResourceType } from './economy.types';
import { WorldState } from '../world/world.types';
import { getMilitaryMetrics } from '../military';

export type GameOutcomeKind = 'in-progress' | 'victory' | 'defeat';

export type ObjectiveId =
  | 'secureStone'
  | 'secureWater'
  | 'hookFish'
  | 'refineSalt'
  | 'growGrain'
  | 'grindBoneDust'
  | 'bakeBread'
  | 'mineCoal'
  | 'mineIron'
  | 'smeltIron'
  | 'forgeCrucible'
  | 'bakeRations'
  | 'raiseWarPit'
  | 'raiseSpire'
  | 'holdTerritory'
  | 'musterDefense'
  | 'repelFirstRaid'
  | 'breakHostileChoir'
  | 'forgeInstruments';

export type CampaignChapter =
  | 'Founding'
  | 'Food'
  | 'Preservation'
  | 'Industry'
  | 'Tools'
  | 'Fortification'
  | 'Expansion'
  | 'Survival / Victory';

export type CampaignObjectiveMetric = 'controlledTiles' | 'defenseStrength' | 'raidsRepelled' | 'hostileDefeated';

export type GameObjective = {
  id: ObjectiveId;
  label: string;
  current: number;
  target: number;
  complete: boolean;
  chapter: CampaignChapter;
  reward: string;
  buildingType?: BuildingType;
  resourceType?: ResourceType;
  metricType?: CampaignObjectiveMetric;
};

export type GameScore = {
  completionTimeSec: number;
  workerSurvival: number;
  logisticsEfficiency: number;
  stockReserveScore: number;
  total: number;
};

export type GameOutcome = {
  kind: GameOutcomeKind;
  title: string;
  summary: string;
  objectives: GameObjective[];
  score?: GameScore;
};

export type ScoreSnapshot = {
  tick: number;
  ageOfTeeth: number;
  score: GameScore;
};

const OBJECTIVE_TARGETS: Record<ObjectiveId, number> = {
  secureStone: 1,
  secureWater: 1,
  hookFish: 1,
  refineSalt: 1,
  growGrain: 1,
  grindBoneDust: 1,
  bakeBread: 1,
  mineCoal: 1,
  mineIron: 1,
  smeltIron: 1,
  forgeCrucible: 1,
  bakeRations: 10,
  raiseWarPit: 1,
  raiseSpire: 1,
  holdTerritory: 400,
  musterDefense: 18,
  repelFirstRaid: 1,
  breakHostileChoir: 1,
  forgeInstruments: 3,
};

const HOSTILE_CHOIR_RAIDS_REQUIRED = 2;
const HOSTILE_CHOIR_PRESSURE_TARGET = 10;

function countBuildings(state: WorldState, buildingType: BuildingType, ownerId?: string): number {
  return Object.values(state.buildings).filter((building) => {
    if (ownerId && building.ownerId !== ownerId) return false;
    return building.type === buildingType;
  }).length;
}

function baseObjective(
  id: ObjectiveId,
  label: string,
  chapter: CampaignChapter,
  reward: string,
  target: number,
  current: number,
  source: { buildingType?: BuildingType; resourceType?: ResourceType; metricType?: CampaignObjectiveMetric }
): GameObjective {
  return {
    id,
    label,
    chapter,
    reward,
    current,
    target,
    complete: current >= target,
    ...source,
  };
}

function buildingObjective(
  state: WorldState,
  ownerId: string | undefined,
  id: ObjectiveId,
  label: string,
  chapter: CampaignChapter,
  reward: string,
  target: number,
  buildingType: BuildingType
): GameObjective {
  return baseObjective(id, label, chapter, reward, target, countBuildings(state, buildingType, ownerId), { buildingType });
}

function resourceObjective(
  state: WorldState,
  ownerId: string | undefined,
  id: ObjectiveId,
  label: string,
  chapter: CampaignChapter,
  reward: string,
  target: number,
  resourceType: ResourceType
): GameObjective {
  return baseObjective(id, label, chapter, reward, target, aggregateVaultInventory(state, ownerId)[resourceType] ?? 0, { resourceType });
}

function getCampaignMetricValue(state: WorldState, ownerId: string | undefined, metricType: CampaignObjectiveMetric): number {
  const players = state.players ?? {};
  const player = ownerId ? players[ownerId] : Object.values(players)[0];
  if (!player) return 0;

  switch (metricType) {
    case 'controlledTiles':
      return player.territoryTileIds?.length ?? 0;
    case 'defenseStrength':
      return getMilitaryMetrics(state, player.id).defenseStrength;
    case 'raidsRepelled':
      return state.military?.raidsRepelled ?? 0;
    case 'hostileDefeated':
      return (state.military?.raidsRepelled ?? 0) >= HOSTILE_CHOIR_RAIDS_REQUIRED
        && (state.military?.enemyPressure ?? Number.POSITIVE_INFINITY) <= HOSTILE_CHOIR_PRESSURE_TARGET
        ? 1
        : 0;
    default:
      return 0;
  }
}

function metricObjective(
  state: WorldState,
  ownerId: string | undefined,
  id: ObjectiveId,
  label: string,
  chapter: CampaignChapter,
  reward: string,
  target: number,
  metricType: CampaignObjectiveMetric
): GameObjective {
  return baseObjective(
    id,
    label,
    chapter,
    reward,
    target,
    getCampaignMetricValue(state, ownerId, metricType),
    { metricType }
  );
}

export function aggregateVaultInventory(state: WorldState, ownerId?: string): ResourceInventory {
  const inventory: ResourceInventory = {};
  for (const building of Object.values(state.buildings)) {
    if (building.type !== 'vaultOfDigestiveStone') continue;
    if (ownerId && building.ownerId !== ownerId) continue;
    for (const [resource, amount] of Object.entries(building.outputBuffer)) {
      const key = resource as ResourceType;
      inventory[key] = (inventory[key] ?? 0) + (amount ?? 0);
    }
  }
  return inventory;
}

export function getCampaignObjectives(state: WorldState, ownerId?: string): GameObjective[] {
  const objectives: GameObjective[] = [
    buildingObjective(state, ownerId, 'secureStone', 'Build a Sepulcher Quarry', 'Founding', 'Stone construction unlocked', OBJECTIVE_TARGETS.secureStone, 'sepulcherQuarry'),
    buildingObjective(state, ownerId, 'secureWater', 'Build a Womb Well', 'Founding', 'Water supply stabilized', OBJECTIVE_TARGETS.secureWater, 'wombWell'),
    buildingObjective(state, ownerId, 'hookFish', 'Build a Shore of Hooks', 'Food', 'Fish chain unlocked', OBJECTIVE_TARGETS.hookFish, 'shoreOfHooks'),
    buildingObjective(state, ownerId, 'refineSalt', 'Build a Refectory of Salt', 'Preservation', 'Preservation chain unlocked', OBJECTIVE_TARGETS.refineSalt, 'refectoryOfSalt'),
    buildingObjective(state, ownerId, 'growGrain', 'Build a Field of Mouths', 'Food', 'Grain economy unlocked', OBJECTIVE_TARGETS.growGrain, 'fieldOfMouths'),
    buildingObjective(state, ownerId, 'grindBoneDust', 'Build a Dust Cathedral Mill', 'Food', 'Bone dust processing unlocked', OBJECTIVE_TARGETS.grindBoneDust, 'dustCathedralMill'),
    buildingObjective(state, ownerId, 'bakeBread', 'Build an Oven of Last Bread', 'Food', 'Ration production unlocked', OBJECTIVE_TARGETS.bakeBread, 'ovenOfLastBread'),
    buildingObjective(state, ownerId, 'mineCoal', 'Open a Coal Wound', 'Industry', 'Fuel industry unlocked', OBJECTIVE_TARGETS.mineCoal, 'coalWound'),
    buildingObjective(state, ownerId, 'mineIron', 'Open an Iron Vein Pit', 'Industry', 'Ore industry unlocked', OBJECTIVE_TARGETS.mineIron, 'ironVeinPit'),
    buildingObjective(state, ownerId, 'smeltIron', 'Build a Blood Smeltery', 'Industry', 'Iron bars unlocked', OBJECTIVE_TARGETS.smeltIron, 'bloodSmeltery'),
    buildingObjective(state, ownerId, 'forgeCrucible', 'Build an Instrument Crucible', 'Tools', 'Tool forging unlocked', OBJECTIVE_TARGETS.forgeCrucible, 'instrumentCrucible'),
    resourceObjective(state, ownerId, 'bakeRations', 'Store Funeral Loaf', 'Fortification', 'Food reserve secured', OBJECTIVE_TARGETS.bakeRations, 'funeralLoaf'),
    buildingObjective(state, ownerId, 'raiseWarPit', 'Build a Pit of War Birth', 'Fortification', 'Soldier recruitment unlocked', OBJECTIVE_TARGETS.raiseWarPit, 'pitOfWarBirth'),
    buildingObjective(state, ownerId, 'raiseSpire', 'Build a Spire of Jurisdiction', 'Expansion', 'Border authority established', OBJECTIVE_TARGETS.raiseSpire, 'spireOfJurisdiction'),
    metricObjective(state, ownerId, 'holdTerritory', 'Expand controlled territory', 'Expansion', 'Buildable frontier secured', OBJECTIVE_TARGETS.holdTerritory, 'controlledTiles'),
    metricObjective(state, ownerId, 'musterDefense', 'Muster border defense', 'Survival / Victory', 'Defense can withstand the first wave', OBJECTIVE_TARGETS.musterDefense, 'defenseStrength'),
    metricObjective(state, ownerId, 'repelFirstRaid', 'Repel an attack wave', 'Survival / Victory', 'Settlement survival proven', OBJECTIVE_TARGETS.repelFirstRaid, 'raidsRepelled'),
    metricObjective(state, ownerId, 'breakHostileChoir', 'Break the Hostile Choir', 'Survival / Victory', 'Enemy pressure broken', OBJECTIVE_TARGETS.breakHostileChoir, 'hostileDefeated'),
    resourceObjective(state, ownerId, 'forgeInstruments', 'Store Torment Instruments', 'Survival / Victory', 'Endgame authority secured', OBJECTIVE_TARGETS.forgeInstruments, 'tormentInstrument'),
  ];

  return objectives;
}

export function calculateGameScore(state: WorldState, ownerId?: string): GameScore {
  const inventory = aggregateVaultInventory(state, ownerId);
  const workers = Object.values(state.workers).filter((worker) => !ownerId || worker.ownerId === ownerId);
  const completionTimeSec = Math.round(state.ageOfTeeth);
  const timeScore = Math.max(0, 4000 - completionTimeSec);
  const workerSurvival = workers.reduce((sum, worker) => sum + Math.max(0, 100 - worker.infection), 0);
  const logisticsEfficiency = Math.max(0, 1000 - Math.round((state.transport.averageLatencySec ?? 0) * 20) - (state.transport.queuedJobCount ?? 0) * 10);
  const stockReserveScore = Object.values(inventory).reduce((sum, amount) => sum + Math.min(50, amount ?? 0), 0);
  return {
    completionTimeSec,
    workerSurvival,
    logisticsEfficiency,
    stockReserveScore,
    total: Math.round(timeScore + workerSurvival + logisticsEfficiency + stockReserveScore),
  };
}

export function calculateScoreSnapshot(state: WorldState, ownerId?: string): ScoreSnapshot {
  return {
    tick: state.tick,
    ageOfTeeth: state.ageOfTeeth,
    score: calculateGameScore(state, ownerId),
  };
}

export function evaluateGameOutcome(state: WorldState, ownerId?: string): GameOutcome {
  const objectives = getCampaignObjectives(state, ownerId);
  const player = ownerId ? state.players[ownerId] : Object.values(state.players)[0];
  const primaryVault = player?.buildings
    .map((id) => state.buildings[id])
    .find((building) => building?.type === 'vaultOfDigestiveStone');

  if (state.military?.defeatReason === 'vaultDestroyed' || (primaryVault && primaryVault.integrity <= 0)) {
    return {
      kind: 'defeat',
      title: 'Vault Devoured',
      summary: 'The central vault has fallen and the settlement can no longer command its territory.',
      objectives,
    };
  }

  const allComplete = objectives.every((objective) => objective.complete);
  if (allComplete) {
    return {
      kind: 'victory',
      title: 'Hostile Choir Defeated',
      summary: 'The settlement can feed itself, expand its jurisdiction, repel hostile waves, break enemy pressure, and forge instruments of rule.',
      objectives,
      score: calculateGameScore(state, ownerId),
    };
  }

  const hasBuildings = player ? player.buildings.some((id) => !!state.buildings[id]) : Object.keys(state.buildings).length > 0;
  const hasWorkers = player ? player.workers.some((id) => !!state.workers[id]) : Object.keys(state.workers).length > 0;

  if (!hasBuildings || !hasWorkers) {
    return {
      kind: 'defeat',
      title: 'Settlement Lost',
      summary: 'No viable workforce or command structure remains.',
      objectives,
    };
  }

  return {
    kind: 'in-progress',
    title: 'Campaign in Progress',
    summary: 'Complete the production chain and store the required endgame resources.',
    objectives,
  };
}
