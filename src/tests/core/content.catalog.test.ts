import manifest from '../../assets/spritesheets/manifest.json';
import { CONTENT_CATALOG } from '../../game/core/content.catalog';
import { BUILDING_DEFINITIONS, WORKER_DEFINITIONS } from '../../game/core/economy.data';
import { RECIPES } from '../../game/economy/recipes.data';
import { BuildingType, ResourceType, WorkerType } from '../../game/core/economy.types';

describe('content catalog integration', () => {
  it('includes every building and worker definition exactly once', () => {
    expect(CONTENT_CATALOG.buildings.map((entry) => entry.type).sort()).toEqual(
      Object.keys(BUILDING_DEFINITIONS).sort()
    );
    expect(CONTENT_CATALOG.workers.map((entry) => entry.type).sort()).toEqual(
      Object.keys(WORKER_DEFINITIONS).sort()
    );
  });

  it('connects every worker to at least one building slot', () => {
    const unusedWorkers = CONTENT_CATALOG.workers
      .filter((entry) => entry.buildings.length === 0)
      .map((entry) => entry.type);

    expect(unusedWorkers).toEqual([]);
  });

  it('connects every recipe input and output resource to the resource catalog', () => {
    const catalogResources = new Set(CONTENT_CATALOG.resources.map((entry) => entry.type));
    const recipeResources = new Set<ResourceType>();

    for (const recipe of Object.values(RECIPES)) {
      for (const resource of Object.keys(recipe.inputs) as ResourceType[]) recipeResources.add(resource);
      for (const resource of Object.keys(recipe.outputs) as ResourceType[]) recipeResources.add(resource);
    }

    for (const resource of recipeResources) {
      expect(catalogResources.has(resource)).toBe(true);
    }
  });

  it('has stage4 building art, worker art, and resource art registered for every content entry', () => {
    const stage4 = (manifest as any).buildings.stage4.assigned as Record<BuildingType, unknown>;
    const workers = (manifest as any).workers.assigned as Record<WorkerType, unknown>;
    const resources = (manifest as any).resources.assigned as Record<ResourceType, unknown>;

    const missingBuildings = CONTENT_CATALOG.buildings
      .filter((entry) => !stage4[entry.type])
      .map((entry) => entry.type);
    const missingWorkers = CONTENT_CATALOG.workers
      .filter((entry) => !workers[entry.type])
      .map((entry) => entry.type);
    const missingResources = CONTENT_CATALOG.resources
      .filter((entry) => !resources[entry.type])
      .map((entry) => entry.type);

    expect(missingBuildings).toEqual([]);
    expect(missingWorkers).toEqual([]);
    expect(missingResources).toEqual([]);
    expect((manifest as any).workers.missing).toEqual([]);
  });
});
