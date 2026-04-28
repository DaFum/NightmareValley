import { BuildingType, ResourceInventory, ResourceType } from './economy.types';
import { WorldState } from '../world/world.types';

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
  | 'forgeInstruments';

export type CampaignChapter = 'Founding' | 'Food' | 'Preservation' | 'Industry' | 'Tools' | 'Fortification';

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
  forgeInstruments: 3,
};

function countBuildings(state: WorldState, buildingType: BuildingType, ownerId?: string): number {
  return Object.values(state.buildings).filter((building) => {
    if (ownerId && building.ownerId !== ownerId) return false;
    return building.type === buildingType;
  }).length;
}

function objective(
  state: WorldState,
  ownerId: string | undefined,
  id: ObjectiveId,
  label: string,
  chapter: CampaignChapter,
  reward: string,
  target: number,
  source: { buildingType?: BuildingType; resourceType?: ResourceType }
): GameObjective {
  const current = source.buildingType
    ? countBuildings(state, source.buildingType, ownerId)
    : aggregateVaultInventory(state, ownerId)[source.resourceType!] ?? 0;
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
    objective(state, ownerId, 'secureStone', 'Build a Sepulcher Quarry', 'Founding', 'Stone construction unlocked', OBJECTIVE_TARGETS.secureStone, { buildingType: 'sepulcherQuarry' }),
    objective(state, ownerId, 'secureWater', 'Build a Womb Well', 'Founding', 'Water supply stabilized', OBJECTIVE_TARGETS.secureWater, { buildingType: 'wombWell' }),
    objective(state, ownerId, 'hookFish', 'Build a Shore of Hooks', 'Food', 'Fish chain unlocked', OBJECTIVE_TARGETS.hookFish, { buildingType: 'shoreOfHooks' }),
    objective(state, ownerId, 'refineSalt', 'Build a Refectory of Salt', 'Preservation', 'Preservation chain unlocked', OBJECTIVE_TARGETS.refineSalt, { buildingType: 'refectoryOfSalt' }),
    objective(state, ownerId, 'growGrain', 'Build a Field of Mouths', 'Food', 'Grain economy unlocked', OBJECTIVE_TARGETS.growGrain, { buildingType: 'fieldOfMouths' }),
    objective(state, ownerId, 'grindBoneDust', 'Build a Dust Cathedral Mill', 'Food', 'Bone dust processing unlocked', OBJECTIVE_TARGETS.grindBoneDust, { buildingType: 'dustCathedralMill' }),
    objective(state, ownerId, 'bakeBread', 'Build an Oven of Last Bread', 'Food', 'Ration production unlocked', OBJECTIVE_TARGETS.bakeBread, { buildingType: 'ovenOfLastBread' }),
    objective(state, ownerId, 'mineCoal', 'Open a Coal Wound', 'Industry', 'Fuel industry unlocked', OBJECTIVE_TARGETS.mineCoal, { buildingType: 'coalWound' }),
    objective(state, ownerId, 'mineIron', 'Open an Iron Vein Pit', 'Industry', 'Ore industry unlocked', OBJECTIVE_TARGETS.mineIron, { buildingType: 'ironVeinPit' }),
    objective(state, ownerId, 'smeltIron', 'Build a Blood Smeltery', 'Industry', 'Iron bars unlocked', OBJECTIVE_TARGETS.smeltIron, { buildingType: 'bloodSmeltery' }),
    objective(state, ownerId, 'forgeCrucible', 'Build an Instrument Crucible', 'Tools', 'Tool forging unlocked', OBJECTIVE_TARGETS.forgeCrucible, { buildingType: 'instrumentCrucible' }),
    objective(state, ownerId, 'bakeRations', 'Store Funeral Loaf', 'Fortification', 'Food reserve secured', OBJECTIVE_TARGETS.bakeRations, { resourceType: 'funeralLoaf' }),
    objective(state, ownerId, 'forgeInstruments', 'Store Torment Instruments', 'Fortification', 'Endgame authority secured', OBJECTIVE_TARGETS.forgeInstruments, { resourceType: 'tormentInstrument' }),
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

export function evaluateGameOutcome(state: WorldState, ownerId?: string): GameOutcome {
  const objectives = getCampaignObjectives(state, ownerId);
  const allComplete = objectives.every((objective) => objective.complete);

  if (allComplete) {
    return {
      kind: 'victory',
      title: 'Valley Subdued',
      summary: 'The settlement can feed itself, quarry stone, and forge instruments of rule.',
      objectives,
      score: calculateGameScore(state, ownerId),
    };
  }

  const player = ownerId ? state.players[ownerId] : Object.values(state.players)[0];
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

