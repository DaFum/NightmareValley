import type { BuildingInstance } from '../../core/game.types';
export type { BuildingStatus } from './building.types';
import type { BuildingStatus } from './building.types';
import { BUILDING_DEFINITIONS } from '../../core/economy.data';
import type { ResourceType } from '../../core/economy.types';
import { DEFAULT_SIMULATION_CONFIG, type SimulationConfig } from '../../economy/balancing.constants';
import { RECIPES } from '../../economy/recipes.data';
import { canStoreRecipeOutputs, chooseRecipeForBuilding } from '../../economy/production.logic';
import { hasAssignedWorkersForBuilding, requiresRoad, type EconomySimulationState } from '../../core/economy.simulation';
import { hasEnoughResources } from '../../economy/stockpile.logic';
import { getTileAt } from '../../map/map.query';

export function deriveBuildingStatus(b: BuildingInstance | undefined): BuildingStatus {
	if (!b || !b.isActive) return 'disabled';
	if (b.constructionProgress !== undefined && b.constructionProgress < 1) return 'underConstruction';
	if (b.inputBuffer && Object.keys(b.inputBuffer).length === 0 && b.outputBuffer && Object.keys(b.outputBuffer).length === 0) return 'idle';
	return 'working';
}

export type ProductionStatusKind =
  | 'paused'
  | 'underConstruction'
  | 'roadDisconnected'
  | 'missingWorker'
  | 'missingDeposit'
  | 'missingInput'
  | 'outputFull'
  | 'working'
  | 'idle';

export type ProductionStatus = {
  kind: ProductionStatusKind;
  label: string;
  detail: string;
  resourceType?: ResourceType;
};

const KIND_TO_BUILDING_STATUS: Record<ProductionStatusKind, BuildingStatus> = {
  paused: 'disabled',
  underConstruction: 'underConstruction',
  roadDisconnected: 'blocked',
  missingWorker: 'idle',
  missingDeposit: 'blocked',
  missingInput: 'blocked',
  outputFull: 'blocked',
  working: 'working',
  idle: 'idle',
};

function resourceLabel(resourceType: ResourceType): string {
  return resourceType.replace(/([A-Z])/g, ' $1').replace(/^./, (char) => char.toUpperCase());
}

const RENEWABLE_EXTRACTION_RESOURCES = new Set<ResourceType>(['pigFleshMass']);
const EXTRACTION_SEARCH_RADIUS = 2;

function extractionNeedsDeposit(resourceType: ResourceType, renewable?: boolean): boolean {
  return !renewable && !RENEWABLE_EXTRACTION_RESOURCES.has(resourceType);
}

function hasNearbyExtractionDeposit(
  state: EconomySimulationState,
  building: BuildingInstance,
  resourceType: ResourceType,
): boolean {
  for (let dy = -EXTRACTION_SEARCH_RADIUS; dy <= EXTRACTION_SEARCH_RADIUS; dy++) {
    for (let dx = -EXTRACTION_SEARCH_RADIUS; dx <= EXTRACTION_SEARCH_RADIUS; dx++) {
      const tile = getTileAt(state.territory, building.position.x + dx, building.position.y + dy);
      if ((tile?.resourceDeposit?.[resourceType] ?? 0) > 0) return true;
    }
  }

  return false;
}

export function getProductionStatus(
  state: EconomySimulationState,
  building: BuildingInstance,
  config: SimulationConfig = DEFAULT_SIMULATION_CONFIG
): ProductionStatus {
  const definition = BUILDING_DEFINITIONS[building.type];
  const buildingName = definition?.name ?? building.type;

  if (!building.isActive) {
    return { kind: 'paused', label: 'Paused', detail: `${buildingName} is paused.` };
  }

  if ((building.constructionProgress ?? 1) < 1 || (building.level ?? 0) <= 0) {
    return { kind: 'underConstruction', label: 'Under construction', detail: `${buildingName} is still being built.` };
  }

  if (definition?.requiresRoadConnection && !building.connectedToRoad) {
    return { kind: 'roadDisconnected', label: 'No road', detail: `${buildingName} needs a road connection.` };
  }

  if (!definition) {
    return { kind: 'idle', label: 'Idle', detail: `${buildingName} has no definition.` };
  }

  if (definition.type === 'vaultOfDigestiveStone') {
    if (!hasAssignedWorkersForBuilding(state, building)) {
      return {
        kind: 'missingWorker',
        label: 'Needs carriers',
        detail: `${buildingName} needs assigned workers before it can dispatch storage deliveries.`,
      };
    }

    const storedUnits = Object.values(building.outputBuffer ?? {}).reduce((sum, amount) => sum + (amount ?? 0), 0);
    return {
      kind: 'idle',
      label: storedUnits > 0 ? 'Storage idle' : 'Storage empty',
      detail: storedUnits > 0
        ? `${buildingName} is the storage hub. Idle means no reachable building is currently requesting these resources.`
        : `${buildingName} is the storage hub, but no resources are stored yet.`,
    };
  }

  if (!hasAssignedWorkersForBuilding(state, building)) {
    return { kind: 'missingWorker', label: 'Needs workers', detail: `${buildingName} has unfilled worker slots.` };
  }

  const recipe = chooseRecipeForBuilding(building, definition);
  if (!recipe) {
    if (definition.extraction) {
      const outputLimit = config.buildingOutputBufferLimit;
      const current = building.outputBuffer[definition.extraction.resource] ?? 0;
      if (current >= outputLimit) {
        return {
          kind: 'outputFull',
          label: 'Output full',
          detail: `${buildingName} cannot store more ${resourceLabel(definition.extraction.resource)}.`,
          resourceType: definition.extraction.resource,
        };
      }
      if (
        extractionNeedsDeposit(definition.extraction.resource, definition.extraction.renewable) &&
        !hasNearbyExtractionDeposit(state, building, definition.extraction.resource)
      ) {
        return {
          kind: 'missingDeposit',
          label: 'No deposit',
          detail: `${buildingName} needs a nearby ${resourceLabel(definition.extraction.resource)} deposit.`,
          resourceType: definition.extraction.resource,
        };
      }
      return { kind: building.progressSec > 0 ? 'working' : 'idle', label: building.progressSec > 0 ? 'Working' : 'Idle', detail: `${buildingName} is ready to extract.` };
    }

    return { kind: 'idle', label: 'Idle', detail: `${buildingName} has no active recipe.` };
  }

  const missingInput = Object.entries(recipe.inputs).find(
    ([resource, required]) => (building.inputBuffer[resource as ResourceType] ?? 0) < (required ?? 0)
  );
  if (missingInput) {
    const resourceType = missingInput[0] as ResourceType;
    return {
      kind: 'missingInput',
      label: 'Starved',
      detail: `${buildingName} needs ${resourceLabel(resourceType)}.`,
      resourceType,
    };
  }

  if (!hasEnoughResources(building.inputBuffer, recipe.inputs)) {
    return { kind: 'missingInput', label: 'Starved', detail: `${buildingName} needs recipe inputs.` };
  }

  if (!canStoreRecipeOutputs(building.outputBuffer, recipe, config)) {
    const fullOutput = Object.keys(recipe.outputs).find((resource) => (
      (building.outputBuffer[resource as ResourceType] ?? 0) + (recipe.outputs[resource as ResourceType] ?? 0)
    ) > config.buildingOutputBufferLimit) as ResourceType | undefined;
    return {
      kind: 'outputFull',
      label: 'Output full',
      detail: fullOutput
        ? `${buildingName} cannot store more ${resourceLabel(fullOutput)}.`
        : `${buildingName} output buffer is full.`,
      resourceType: fullOutput,
    };
  }

  return {
    kind: building.progressSec > 0 ? 'working' : 'idle',
    label: building.progressSec > 0 ? 'Working' : 'Idle',
    detail: building.progressSec > 0 ? `${buildingName} is producing.` : `${buildingName} is ready.`,
  };
}

export function deriveProductionBuildingStatus(
  state: EconomySimulationState,
  building: BuildingInstance,
  config: SimulationConfig = DEFAULT_SIMULATION_CONFIG
): BuildingStatus {
  return KIND_TO_BUILDING_STATUS[getProductionStatus(state, building, config).kind];
}


