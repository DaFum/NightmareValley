import { BUILDING_DEFINITIONS } from '../core/economy.data';
import { BuildingType, ResourceType } from '../core/economy.types';
import { aggregateVaultInventory, GameObjective, getCampaignObjectives } from '../core/victory.rules';
import { WorldState } from '../world/world.types';
import { DEFAULT_SIMULATION_CONFIG } from './balancing.constants';
import { RECIPES } from './recipes.data';

export type EconomyBottleneckKind =
  | 'missingWorker'
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

export type EconomyPlanSnapshot = {
  nextObjective?: GameObjective;
  recommendation: EconomyRecommendation;
  bottlenecks: EconomyBottleneck[];
};

export function getBottleneckAction(bottleneck: EconomyBottleneck): string {
  switch (bottleneck.kind) {
    case 'missingWorker':
      return 'Inspect the building and hire or auto-hire the missing worker.';
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

export function getEconomyBottlenecks(state: WorldState, ownerId?: string): EconomyBottleneck[] {
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

  return bottlenecks.slice(0, 8);
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

  return {
    label: nextObjective.label,
    reason: 'Complete the next campaign objective.',
    objective: nextObjective,
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
