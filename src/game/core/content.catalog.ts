import { BUILDING_DEFINITIONS, WORKER_DEFINITIONS } from './economy.data';
import { BuildingCost, BuildingType, ResourceType, WorkerType } from './economy.types';
import { RECIPES } from '../economy/recipes.data';

export type ResourceCatalogEntry = {
  type: ResourceType;
  label: string;
  tooltip: string;
  producedBy: BuildingType[];
  consumedBy: BuildingType[];
};

export type BuildingCatalogEntry = {
  type: BuildingType;
  name: string;
  description: string;
  workers: WorkerType[];
  produces: ResourceType[];
  consumes: ResourceType[];
};

export type WorkerCatalogEntry = {
  type: WorkerType;
  name: string;
  description: string;
  hireCost: BuildingCost;
  buildings: BuildingType[];
};

export type ContentCatalog = {
  buildings: BuildingCatalogEntry[];
  workers: WorkerCatalogEntry[];
  resources: ResourceCatalogEntry[];
};

function unique<T>(values: T[]): T[] {
  return Array.from(new Set(values));
}

export function getBuildingProduces(type: BuildingType): ResourceType[] {
  const definition = BUILDING_DEFINITIONS[type];
  const produced: ResourceType[] = [];

  if (definition.extraction) {
    produced.push(definition.extraction.resource);
  }

  for (const recipeId of definition.recipeIds ?? []) {
    const recipe = RECIPES[recipeId];
    if (!recipe) continue;
    produced.push(...Object.keys(recipe.outputs) as ResourceType[]);
  }

  return unique(produced);
}

export function getBuildingConsumes(type: BuildingType): ResourceType[] {
  const definition = BUILDING_DEFINITIONS[type];
  const consumed: ResourceType[] = [];

  for (const recipeId of definition.recipeIds ?? []) {
    const recipe = RECIPES[recipeId];
    if (!recipe) continue;
    consumed.push(...Object.keys(recipe.inputs) as ResourceType[]);
  }

  return unique(consumed);
}

export function createContentCatalog(): ContentCatalog {
  const buildings: BuildingCatalogEntry[] = Object.values(BUILDING_DEFINITIONS).map((definition) => ({
    type: definition.type,
    name: definition.name,
    description: definition.description,
    workers: Object.entries(definition.workerSlots)
      .filter(([, count]) => (count ?? 0) > 0)
      .map(([worker]) => worker as WorkerType),
    produces: getBuildingProduces(definition.type),
    consumes: getBuildingConsumes(definition.type),
  }));

  const workers: WorkerCatalogEntry[] = Object.values(WORKER_DEFINITIONS).map((definition) => ({
    type: definition.type,
    name: definition.name,
    description: definition.description,
    hireCost: definition.hireCost ?? { resources: {} },
    buildings: buildings
      .filter((building) => building.workers.includes(definition.type))
      .map((building) => building.type),
  }));

  const resourceTypes = unique([
    ...buildings.flatMap((building) => building.produces),
    ...buildings.flatMap((building) => building.consumes),
    ...Object.values(BUILDING_DEFINITIONS).flatMap((definition) => Object.keys(definition.buildCost.resources) as ResourceType[]),
    ...Object.values(BUILDING_DEFINITIONS).flatMap((definition) => definition.upgradeCosts.flatMap((cost) => Object.keys(cost.resources) as ResourceType[])),
  ]);

  const resources: ResourceCatalogEntry[] = resourceTypes.map((type) => ({
    type,
    label: formatCatalogLabel(type),
    tooltip: createResourceTooltip(type, buildings),
    producedBy: buildings
      .filter((building) => building.produces.includes(type))
      .map((building) => building.type),
    consumedBy: buildings
      .filter((building) => building.consumes.includes(type))
      .map((building) => building.type),
  }));

  return { buildings, workers, resources };
}

export function formatCatalogLabel(type: string): string {
  return type
    .replace(/([A-Z])/g, ' $1')
    .replace(/^./, (char) => char.toUpperCase());
}

function createResourceTooltip(type: ResourceType, buildings: BuildingCatalogEntry[]): string {
  const producedBy = buildings
    .filter((building) => building.produces.includes(type))
    .map((building) => building.name);
  const consumedBy = buildings
    .filter((building) => building.consumes.includes(type))
    .map((building) => building.name);

  const source = producedBy.length ? `Produced by ${producedBy.join(', ')}` : 'No direct producer';
  const sink = consumedBy.length ? `Consumed by ${consumedBy.join(', ')}` : 'Stored or spent by construction';
  return `${formatCatalogLabel(type)}. ${source}. ${sink}.`;
}

export const CONTENT_CATALOG = createContentCatalog();
