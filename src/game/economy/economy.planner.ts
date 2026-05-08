import { BUILDING_DEFINITIONS } from '../core/economy.data';
import { BuildingType, ResourceType } from '../core/economy.types';
import { aggregateVaultInventory, CampaignObjectiveMetric, GameObjective, getCampaignObjectives } from '../core/victory.rules';
import { getMilitaryMetrics } from '../military';
import { getTileAt } from '../map/map.query';
import { WorldState } from '../world/world.types';
import {
  DEFAULT_SIMULATION_CONFIG,
  ENEMY_PRESSURE_WARNING_THRESHOLD,
  NEXT_ATTACK_WARNING_SEC,
  TRANSPORT_AVERAGE_LATENCY_WARNING_SEC,
  TRANSPORT_NETWORK_STRESS_WARNING,
  TRANSPORT_QUEUE_CARRIER_BACKLOG_MULTIPLIER,
  TRANSPORT_QUEUE_MIN_BACKLOG_WARNING,
  VAULT_CRITICAL_INTEGRITY_PERCENT,
} from './balancing.constants';
import { RECIPES } from './recipes.data';

export type EconomyBottleneckKind =
  | 'missingWorker'
  | 'missingDeposit'
  | 'missingInput'
  | 'outputFull'
  | 'roadDisconnected'
  | 'underConstruction'
  | 'paused';

export type EconomyBottleneck = {
  buildingId: string;
  buildingType: BuildingType;
  buildingName: string;
  kind: EconomyBottleneckKind;
  label: string;
  resourceType?: ResourceType;
};

export type EconomyRecommendation = {
  label: string;
  reason: string;
  buildingType?: BuildingType;
  resourceType?: ResourceType;
  objective?: GameObjective;
};

const ECONOMY_ACTION_UTILITY = {
  default: 1,
  buildMatch: 1.35,
  resourceMatch: 1.2,
} as const;

const ECONOMY_BOTTLENECK_DISPLAY_LIMIT = 8;

export function getEconomyRecommendationUtilityBonus(
  recommendation: EconomyRecommendation,
  actionTags: string[]
): number {
  if (!actionTags.length) return ECONOMY_ACTION_UTILITY.default;

  if (recommendation.buildingType && actionTags.includes(`build:${recommendation.buildingType}`)) {
    return ECONOMY_ACTION_UTILITY.buildMatch;
  }

  if (recommendation.resourceType && actionTags.includes(`resource:${recommendation.resourceType}`)) {
    return ECONOMY_ACTION_UTILITY.resourceMatch;
  }

  return ECONOMY_ACTION_UTILITY.default;
}

export type EconomyPlanSnapshot = {
  nextObjective?: GameObjective;
  recommendation: EconomyRecommendation;
  bottlenecks: EconomyBottleneck[];
};

export type SettlementSituationTone = 'good' | 'idle' | 'warn' | 'danger';

export type SettlementSituationIssueKind = 'economy' | 'transport' | 'military' | 'objective';

export type SettlementSituationIssue = {
  kind: SettlementSituationIssueKind;
  tone: Exclude<SettlementSituationTone, 'good' | 'idle'>;
  label: string;
  action: string;
  buildingId?: string;
  resourceType?: ResourceType;
};

export type SettlementSituationSnapshot = {
  status: SettlementSituationTone;
  headline: string;
  primaryAction: {
    label: string;
    detail: string;
    buildingType?: BuildingType;
    resourceType?: ResourceType;
  };
  objective?: {
    id: GameObjective['id'];
    label: string;
    chapter: GameObjective['chapter'];
    progressLabel: string;
    complete: boolean;
  };
  economy: {
    workingBuildings: number;
    starvedBuildings: number;
    blockedBuildings: number;
    bottlenecks: EconomyBottleneck[];
  };
  transport: {
    tone: SettlementSituationTone;
    headline: string;
    detail: string;
    action: string;
    queuedJobs: number;
    totalCarriers: number;
    busyCarriers: number;
    idleCarriers: number;
    averageLatencySec: number;
    networkStress: number;
  };
  military: {
    tone: SettlementSituationTone;
    headline: string;
    detail: string;
    action: string;
    enemyPressure: number;
    defenseStrength: number;
    vaultIntegrity: number;
    nextAttackSec: number;
    activeRaidStrength: number;
  };
  topIssues: SettlementSituationIssue[];
};

export function getBottleneckAction(bottleneck: EconomyBottleneck): string {
  switch (bottleneck.kind) {
    case 'missingWorker':
      return 'Inspect the building and hire or auto-hire the missing worker.';
    case 'missingDeposit':
      return 'Place the extractor near a matching deposit or build the matching resource chain elsewhere.';
    case 'missingInput':
      return bottleneck.resourceType
        ? `Build or connect the ${resourceLabel(bottleneck.resourceType)} supply chain.`
        : 'Build or connect the missing input supply chain.';
    case 'outputFull':
      return 'Add carriers, roads, or storage so output can leave this building.';
    case 'roadDisconnected':
      return 'Use the Road tool to connect this building to the vault network.';
    case 'underConstruction':
      return 'Keep builders supplied until construction reaches 100%.';
    case 'paused':
      return 'Resume the building when its inputs and outputs are ready.';
    default:
      return 'Inspect this building for details.';
  }
}

type Producer = {
  buildingType: BuildingType;
  resourceType: ResourceType;
  inputResources: ResourceType[];
};

const RESOURCE_LABELS: Partial<Record<ResourceType, string>> = {
  sinewTimber: 'Sinew Timber',
  toothPlanks: 'Tooth Planks',
  sepulcherStone: 'Sepulcher Stone',
  amnioticWater: 'Amniotic Water',
  eyelessFish: 'Eyeless Fish',
  marrowGrain: 'Marrow Grain',
  boneDust: 'Bone Dust',
  funeralLoaf: 'Funeral Loaf',
  graveCoal: 'Grave Coal',
  veinIronOre: 'Vein Iron Ore',
  veinIronBar: 'Vein Iron Bar',
  tormentInstrument: 'Torment Instrument',
  brainSalt: 'Brain Salt',
};

function resourceLabel(resourceType: ResourceType): string {
  return RESOURCE_LABELS[resourceType] ?? resourceType;
}

function countOwnedBuildings(state: WorldState, ownerId: string | undefined, buildingType: BuildingType): number {
  return Object.values(state.buildings).filter((building) => {
    if (ownerId && building.ownerId !== ownerId) return false;
    return building.type === buildingType;
  }).length;
}

function getProducers(): Producer[] {
  const producers: Producer[] = [];

  for (const definition of Object.values(BUILDING_DEFINITIONS)) {
    if (definition.extraction) {
      producers.push({
        buildingType: definition.type,
        resourceType: definition.extraction.resource,
        inputResources: [],
      });
    }

    for (const recipeId of definition.recipeIds ?? []) {
      const recipe = RECIPES[recipeId];
      if (!recipe) continue;
      const inputResources = Object.keys(recipe.inputs) as ResourceType[];
      for (const resourceType of Object.keys(recipe.outputs) as ResourceType[]) {
        producers.push({
          buildingType: definition.type,
          resourceType,
          inputResources,
        });
      }
    }
  }

  return producers;
}

const PRODUCERS = getProducers();
const RENEWABLE_EXTRACTION_RESOURCES = new Set<ResourceType>(['pigFleshMass']);
const EXTRACTION_SEARCH_RADIUS = 2;

function extractionNeedsDeposit(resourceType: ResourceType, renewable?: boolean): boolean {
  return !renewable && !RENEWABLE_EXTRACTION_RESOURCES.has(resourceType);
}

function hasNearbyExtractionDeposit(state: WorldState, buildingId: string, resourceType: ResourceType): boolean {
  const building = state.buildings[buildingId];
  if (!building) return false;
  if (!state.territory?.tiles) return false;

  for (let dy = -EXTRACTION_SEARCH_RADIUS; dy <= EXTRACTION_SEARCH_RADIUS; dy++) {
    for (let dx = -EXTRACTION_SEARCH_RADIUS; dx <= EXTRACTION_SEARCH_RADIUS; dx++) {
      const tile = getTileAt(state.territory, building.position.x + dx, building.position.y + dy);
      if ((tile?.resourceDeposit?.[resourceType] ?? 0) > 0) return true;
    }
  }

  return false;
}

function findProducer(resourceType: ResourceType): Producer | undefined {
  return PRODUCERS.find((producer) => producer.resourceType === resourceType);
}

function findFirstMissingProducer(
  state: WorldState,
  ownerId: string | undefined,
  resourceType: ResourceType,
  visited = new Set<ResourceType>()
): Producer | undefined {
  if (visited.has(resourceType)) return undefined;
  visited.add(resourceType);

  const producer = findProducer(resourceType);
  if (!producer) return undefined;

  for (const input of producer.inputResources) {
    const missingInputProducer = findFirstMissingProducer(state, ownerId, input, visited);
    if (missingInputProducer && countOwnedBuildings(state, ownerId, missingInputProducer.buildingType) === 0) {
      return missingInputProducer;
    }
  }

  if (countOwnedBuildings(state, ownerId, producer.buildingType) === 0) {
    return producer;
  }

  return undefined;
}

function collectEconomyBottlenecks(state: WorldState, ownerId?: string): EconomyBottleneck[] {
  const bottlenecks: EconomyBottleneck[] = [];

  for (const building of Object.values(state.buildings)) {
    if (ownerId && building.ownerId !== ownerId) continue;
    const definition = BUILDING_DEFINITIONS[building.type];
    if (!definition) continue;
    const buildingName = definition.name;

    if (!building.isActive) {
      bottlenecks.push({
        buildingId: building.id,
        buildingType: building.type,
        buildingName,
        kind: 'paused',
        label: `${buildingName} is paused`,
      });
      continue;
    }

    if ((building.level ?? 0) <= 0 || (building.constructionProgress ?? 1) < 1) {
      bottlenecks.push({
        buildingId: building.id,
        buildingType: building.type,
        buildingName,
        kind: 'underConstruction',
        label: `${buildingName} is still under construction`,
      });
      continue;
    }

    if (definition.requiresRoadConnection && !building.connectedToRoad) {
      bottlenecks.push({
        buildingId: building.id,
        buildingType: building.type,
        buildingName,
        kind: 'roadDisconnected',
        label: `${buildingName} is disconnected from roads`,
      });
    }

    const requiredWorkers = Object.values(definition.workerSlots).reduce((sum, amount) => sum + (amount ?? 0), 0);
    if (building.assignedWorkers.length < requiredWorkers) {
      bottlenecks.push({
        buildingId: building.id,
        buildingType: building.type,
        buildingName,
        kind: 'missingWorker',
        label: `${buildingName} needs workers`,
      });
    }

    if (
      definition.extraction &&
      extractionNeedsDeposit(definition.extraction.resource, definition.extraction.renewable) &&
      !hasNearbyExtractionDeposit(state, building.id, definition.extraction.resource)
    ) {
      bottlenecks.push({
        buildingId: building.id,
        buildingType: building.type,
        buildingName,
        kind: 'missingDeposit',
        resourceType: definition.extraction.resource,
        label: `${buildingName} has no nearby ${resourceLabel(definition.extraction.resource)} deposit`,
      });
    }

    const outputLimit = building.type === 'vaultOfDigestiveStone'
      ? DEFAULT_SIMULATION_CONFIG.warehouseStorageLimit
      : DEFAULT_SIMULATION_CONFIG.buildingOutputBufferLimit;
    for (const [resource, amount] of Object.entries(building.outputBuffer)) {
      if ((amount ?? 0) >= outputLimit) {
        bottlenecks.push({
          buildingId: building.id,
          buildingType: building.type,
          buildingName,
          kind: 'outputFull',
          resourceType: resource as ResourceType,
          label: `${buildingName} output is full of ${resourceLabel(resource as ResourceType)}`,
        });
      }
    }

    const activeRecipeId = building.currentRecipeId ?? definition.recipeIds?.[0];
    const recipe = activeRecipeId ? RECIPES[activeRecipeId] : undefined;
    if (recipe) {
      for (const [resource, required] of Object.entries(recipe.inputs)) {
        if ((building.inputBuffer[resource as ResourceType] ?? 0) < (required ?? 0)) {
          bottlenecks.push({
            buildingId: building.id,
            buildingType: building.type,
            buildingName,
            kind: 'missingInput',
            resourceType: resource as ResourceType,
            label: `${buildingName} needs ${resourceLabel(resource as ResourceType)}`,
          });
          break;
        }
      }
    }
  }

  return bottlenecks;
}

export function getEconomyBottlenecks(state: WorldState, ownerId?: string): EconomyBottleneck[] {
  return collectEconomyBottlenecks(state, ownerId).slice(0, ECONOMY_BOTTLENECK_DISPLAY_LIMIT);
}

export function getEconomyRecommendation(state: WorldState, ownerId?: string): EconomyRecommendation {
  const objectives = getCampaignObjectives(state, ownerId);
  const nextObjective = objectives.find((objective) => !objective.complete);

  if (!nextObjective) {
    return {
      label: 'Campaign economy complete',
      reason: 'All tracked production objectives are complete.',
    };
  }

  if (nextObjective.buildingType) {
    const definition = BUILDING_DEFINITIONS[nextObjective.buildingType];
    return {
      label: `Build ${definition.name}`,
      reason: nextObjective.label,
      buildingType: nextObjective.buildingType,
      objective: nextObjective,
    };
  }

  if (nextObjective.resourceType) {
    const inventory = aggregateVaultInventory(state, ownerId);
    const missingAmount = Math.max(0, nextObjective.target - (inventory[nextObjective.resourceType] ?? 0));
    const missingProducer = findFirstMissingProducer(state, ownerId, nextObjective.resourceType);

    if (missingProducer) {
      const definition = BUILDING_DEFINITIONS[missingProducer.buildingType];
      return {
        label: `Build ${definition.name}`,
        reason: `${definition.name} is needed before ${resourceLabel(nextObjective.resourceType)} can be stored.`,
        buildingType: missingProducer.buildingType,
        resourceType: nextObjective.resourceType,
        objective: nextObjective,
      };
    }

    return {
      label: `Store ${missingAmount} more ${resourceLabel(nextObjective.resourceType)}`,
      reason: 'The production chain exists; keep inputs moving through the economy.',
      resourceType: nextObjective.resourceType,
      objective: nextObjective,
    };
  }

  if (nextObjective.metricType) {
    return getMetricRecommendation(nextObjective.metricType, nextObjective);
  }

  return {
    label: nextObjective.label,
    reason: 'Complete the next campaign objective.',
    objective: nextObjective,
  };
}

function getMetricRecommendation(
  metricType: CampaignObjectiveMetric,
  objective: GameObjective
): EconomyRecommendation {
  const remaining = Math.max(0, objective.target - objective.current);

  switch (metricType) {
    case 'controlledTiles':
      return {
        label: 'Expand controlled territory',
        reason: `Build or upgrade a Spire of Jurisdiction near the frontier to claim ${remaining} more tiles.`,
        objective,
      };
    case 'defenseStrength':
      return {
        label: 'Muster border defense',
        reason: `Recruit War Infants and staff Spires until defense strength rises by ${remaining}.`,
        objective,
      };
    case 'raidsRepelled':
      return {
        label: 'Survive the next attack wave',
        reason: 'Keep the vault defended until the next raid is repelled.',
        objective,
      };
    case 'hostileDefeated':
      return {
        label: 'Break the Hostile Choir',
        reason: 'Repel 2 raids and drive enemy pressure to 10 or lower.',
        objective,
      };
    default:
      return {
        label: objective.label,
        reason: 'Complete the next campaign objective.',
        objective,
      };
  }
}

function getObjectiveSnapshot(objective: GameObjective | undefined): SettlementSituationSnapshot['objective'] {
  if (!objective) return undefined;
  return {
    id: objective.id,
    label: objective.label,
    chapter: objective.chapter,
    progressLabel: `${Math.min(objective.current, objective.target)}/${objective.target}`,
    complete: objective.complete,
  };
}

function getEconomyActivity(state: WorldState, ownerId?: string): SettlementSituationSnapshot['economy'] {
  const allBottlenecks = collectEconomyBottlenecks(state, ownerId);
  const bottlenecks = allBottlenecks.slice(0, ECONOMY_BOTTLENECK_DISPLAY_LIMIT);
  let workingBuildings = 0;

  for (const building of Object.values(state.buildings)) {
    if (ownerId && building.ownerId !== ownerId) continue;
    if (building.type === 'vaultOfDigestiveStone') continue;
    if (!building.isActive) continue;
    if ((building.progressSec ?? 0) > 0) workingBuildings++;
  }

  return {
    workingBuildings,
    starvedBuildings: allBottlenecks.filter((bottleneck) => bottleneck.kind === 'missingInput').length,
    blockedBuildings: allBottlenecks.filter((bottleneck) => bottleneck.kind === 'outputFull' || bottleneck.kind === 'roadDisconnected').length,
    bottlenecks,
  };
}

function getTransportSituation(state: WorldState, ownerId?: string): SettlementSituationSnapshot['transport'] {
  const carriers = Object.values(state.workers).filter(
    (worker) => (!ownerId || worker.ownerId === ownerId) && worker.type === 'burdenThrall'
  );
  const activeTasks = Object.values(state.transport?.activeCarrierTasks ?? {}).filter((task) => {
    if (!ownerId) return true;
    const worker = state.workers[task.workerId];
    return worker?.ownerId === ownerId;
  });
  const totalCarriers = carriers.length;
  const busyCarriers = activeTasks.length;
  const idleCarriers = Math.max(0, totalCarriers - busyCarriers);
  const queuedJobs = state.transport?.queuedJobCount ?? 0;
  const averageLatencySec = state.transport?.averageLatencySec ?? 0;
  const networkStress = state.transport?.networkStress ?? 0;

  if (queuedJobs > 0 && totalCarriers === 0) {
    return {
      tone: 'warn',
      headline: 'No carriers can answer queued jobs',
      detail: `${queuedJobs} deliveries are waiting, but the settlement has no available Burden Thralls.`,
      action: 'Inspect the vault and hire Burden Thralls before adding more production.',
      queuedJobs,
      totalCarriers,
      busyCarriers,
      idleCarriers,
      averageLatencySec,
      networkStress,
    };
  }

  if (queuedJobs > Math.max(TRANSPORT_QUEUE_MIN_BACKLOG_WARNING, totalCarriers * TRANSPORT_QUEUE_CARRIER_BACKLOG_MULTIPLIER)) {
    return {
      tone: 'warn',
      headline: 'Transport queue is backing up',
      detail: `${queuedJobs} queued jobs are competing for ${totalCarriers} carriers.`,
      action: 'Hire more carriers, shorten roads, or raise delivery priority on starved buildings.',
      queuedJobs,
      totalCarriers,
      busyCarriers,
      idleCarriers,
      averageLatencySec,
      networkStress,
    };
  }

  if (networkStress >= TRANSPORT_NETWORK_STRESS_WARNING || averageLatencySec >= TRANSPORT_AVERAGE_LATENCY_WARNING_SEC) {
    return {
      tone: 'warn',
      headline: 'Routes are too slow',
      detail: `Average latency is ${averageLatencySec.toFixed(1)}s with network stress ${networkStress.toFixed(1)}.`,
      action: 'Pave high-footfall roads and keep vault-to-workplace routes direct.',
      queuedJobs,
      totalCarriers,
      busyCarriers,
      idleCarriers,
      averageLatencySec,
      networkStress,
    };
  }

  if (queuedJobs === 0 && busyCarriers === 0) {
    return {
      tone: totalCarriers > 0 ? 'idle' : 'warn',
      headline: totalCarriers > 0 ? 'Transport idle' : 'No carriers recruited',
      detail: totalCarriers > 0
        ? 'No deliveries are waiting right now.'
        : 'Production will stall once resources need to move.',
      action: totalCarriers > 0
        ? 'Build another production chain or inspect bottlenecks before expanding.'
        : 'Hire Burden Thralls from the vault before relying on logistics.',
      queuedJobs,
      totalCarriers,
      busyCarriers,
      idleCarriers,
      averageLatencySec,
      networkStress,
    };
  }

  return {
    tone: 'good',
    headline: 'Transport moving',
    detail: `${busyCarriers}/${totalCarriers} carriers are moving goods; ${queuedJobs} jobs are queued.`,
    action: 'Keep high-demand buildings connected and watch for growing queues.',
    queuedJobs,
    totalCarriers,
    busyCarriers,
    idleCarriers,
    averageLatencySec,
    networkStress,
  };
}

function getMilitarySituation(state: WorldState, ownerId?: string): SettlementSituationSnapshot['military'] {
  const player = ownerId ? state.players[ownerId] : Object.values(state.players)[0];
  const military = state.military;
  const metrics = player
    ? getMilitaryMetrics(state, player.id)
    : {
      defenseStrength: 0,
      vaultIntegrity: 0,
    };
  const nextAttackSec = military?.activeRaid
    ? 0
    : Math.max(0, (military?.nextAttackAge ?? Number.POSITIVE_INFINITY) - state.ageOfTeeth);
  const enemyPressure = military?.enemyPressure ?? 0;
  const activeRaidStrength = military?.activeRaid?.strength ?? 0;
  const defenseStrength = metrics.defenseStrength ?? 0;
  const vaultIntegrity = metrics.vaultIntegrity ?? 0;

  if (military?.activeRaid) {
    return {
      tone: 'danger',
      headline: 'Attack in progress',
      detail: `Raid strength ${activeRaidStrength}; defense strength ${defenseStrength}. Vault integrity ${Math.round(vaultIntegrity)}%.`,
      action: 'Recruit War Infants and keep Spires staffed until the raid breaks.',
      enemyPressure,
      defenseStrength,
      vaultIntegrity,
      nextAttackSec,
      activeRaidStrength,
    };
  }

  if (vaultIntegrity > 0 && vaultIntegrity <= VAULT_CRITICAL_INTEGRITY_PERCENT) {
    return {
      tone: 'danger',
      headline: 'Vault integrity critical',
      detail: `The vault is at ${Math.round(vaultIntegrity)}% integrity.`,
      action: 'Pause expansion and reinforce defense before the next raid lands.',
      enemyPressure,
      defenseStrength,
      vaultIntegrity,
      nextAttackSec,
      activeRaidStrength,
    };
  }

  if (enemyPressure >= ENEMY_PRESSURE_WARNING_THRESHOLD || nextAttackSec <= NEXT_ATTACK_WARNING_SEC) {
    return {
      tone: 'warn',
      headline: 'Border pressure rising',
      detail: nextAttackSec <= NEXT_ATTACK_WARNING_SEC
        ? `The next attack is expected in ${Math.round(nextAttackSec)}s.`
        : `Enemy pressure is ${Math.round(enemyPressure)}.`,
      action: 'Build or upgrade Spires and recruit War Infants before the warning becomes a raid.',
      enemyPressure,
      defenseStrength,
      vaultIntegrity,
      nextAttackSec,
      activeRaidStrength,
    };
  }

  return {
    tone: 'good',
    headline: 'Border contained',
    detail: `Defense strength ${defenseStrength}; enemy pressure ${Math.round(enemyPressure)}.`,
    action: 'Keep one reserve of Funeral Loaf and Rib Blades for emergency recruitment.',
    enemyPressure,
    defenseStrength,
    vaultIntegrity,
    nextAttackSec,
    activeRaidStrength,
  };
}

function issueToneRank(tone: SettlementSituationIssue['tone']): number {
  return tone === 'danger' ? 0 : 1;
}

function getIssueFingerprint(issue: SettlementSituationIssue): string {
  return [
    issue.kind,
    issue.tone,
    issue.label,
    issue.action,
    issue.resourceType ?? '',
  ].join('|');
}

function dedupeSituationIssues(issues: SettlementSituationIssue[]): SettlementSituationIssue[] {
  const seen = new Set<string>();
  const uniqueIssues: SettlementSituationIssue[] = [];

  for (const issue of issues) {
    const fingerprint = getIssueFingerprint(issue);
    if (seen.has(fingerprint)) continue;
    seen.add(fingerprint);
    uniqueIssues.push(issue);
  }

  return uniqueIssues;
}

function getSituationHeadline(status: SettlementSituationTone): string {
  switch (status) {
    case 'danger':
      return 'Settlement in immediate danger';
    case 'warn':
      return 'Settlement needs intervention';
    case 'idle':
      return 'Settlement awaiting orders';
    default:
      return 'Settlement stable';
  }
}

export function getSettlementSituationSnapshot(state: WorldState, ownerId?: string): SettlementSituationSnapshot {
  const objectives = getCampaignObjectives(state, ownerId);
  const nextObjective = objectives.find((objective) => !objective.complete);
  const recommendation = getEconomyRecommendation(state, ownerId);
  const economy = getEconomyActivity(state, ownerId);
  const transport = getTransportSituation(state, ownerId);
  const military = getMilitarySituation(state, ownerId);
  const topIssues: SettlementSituationIssue[] = [];

  if (military.tone === 'danger' || military.tone === 'warn') {
    topIssues.push({
      kind: 'military',
      tone: military.tone,
      label: military.headline,
      action: military.action,
    });
  }

  if (transport.tone === 'warn') {
    topIssues.push({
      kind: 'transport',
      tone: 'warn',
      label: transport.headline,
      action: transport.action,
    });
  }

  for (const bottleneck of economy.bottlenecks.slice(0, 3)) {
    const tone: SettlementSituationIssue['tone'] =
      bottleneck.kind === 'roadDisconnected' || bottleneck.kind === 'outputFull' ? 'warn' : 'warn';
    topIssues.push({
      kind: 'economy',
      tone,
      label: bottleneck.label,
      action: getBottleneckAction(bottleneck),
      buildingId: bottleneck.buildingId,
      resourceType: bottleneck.resourceType,
    });
  }

  topIssues.sort((a, b) => issueToneRank(a.tone) - issueToneRank(b.tone));
  const uniqueTopIssues = dedupeSituationIssues(topIssues);

  let status: SettlementSituationTone = 'good';
  if (military.tone === 'danger') status = 'danger';
  else if (military.tone === 'warn' || transport.tone === 'warn' || economy.bottlenecks.length > 0) status = 'warn';
  else if (economy.workingBuildings === 0) status = 'idle';

  const primaryAction = military.tone === 'danger'
    ? { label: 'Defend the vault', detail: military.action }
    : uniqueTopIssues[0]
      ? { label: uniqueTopIssues[0].label, detail: uniqueTopIssues[0].action }
      : {
        label: recommendation.label,
        detail: recommendation.reason,
        buildingType: recommendation.buildingType,
        resourceType: recommendation.resourceType,
      };

  return {
    status,
    headline: getSituationHeadline(status),
    primaryAction,
    objective: getObjectiveSnapshot(nextObjective),
    economy,
    transport,
    military,
    topIssues: uniqueTopIssues.slice(0, 5),
  };
}

export function getEconomyPlanSnapshot(state: WorldState, ownerId?: string): EconomyPlanSnapshot {
  const objectives = getCampaignObjectives(state, ownerId);
  return {
    nextObjective: objectives.find((objective) => !objective.complete),
    recommendation: getEconomyRecommendation(state, ownerId),
    bottlenecks: getEconomyBottlenecks(state, ownerId),
  };
}
