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
  missingInput: 'blocked',
  outputFull: 'blocked',
  working: 'working',
  idle: 'idle',
};

function resourceLabel(resourceType: ResourceType): string {
  return resourceType.replace(/([A-Z])/g, ' $1').replace(/^./, (char) => char.toUpperCase());
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


