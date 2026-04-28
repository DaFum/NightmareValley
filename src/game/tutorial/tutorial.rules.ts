import { OwnerId } from '../core/entity.ids';
import { BUILDING_DEFINITIONS, WORKER_DEFINITIONS } from '../core/economy.data';
import { BuildingType, ResourceType, WorkerType } from '../core/economy.types';
import { EconomySimulationState } from '../core/economy.simulation';
import { isConstructed } from '../entities/buildings/building.types';

export type TutorialStepId =
  | 'buildQuarry'
  | 'buildWell'
  | 'placeRoads'
  | 'staffWorkers'
  | 'produceFood'
  | 'produceTools'
  | 'complete';

export type TutorialStep = {
  id: TutorialStepId;
  title: string;
  body: string;
  action: string;
  buildingType?: BuildingType;
  workerType?: WorkerType;
  resourceType?: ResourceType;
};

const STEPS: Record<TutorialStepId, TutorialStep> = {
  buildQuarry: {
    id: 'buildQuarry',
    title: 'Raise the quarry',
    body: 'Stone unlocks the early economy. Build a Sepulcher Quarry on rib mountain terrain.',
    action: 'Open Build, choose Sepulcher Quarry, then place it on owned mountain tiles.',
    buildingType: 'sepulcherQuarry',
  },
  buildWell: {
    id: 'buildWell',
    title: 'Secure bile water',
    body: 'Water feeds bread production and prevents the food chain from stalling later.',
    action: 'Build a Womb Well near owned terrain and keep it connected to roads.',
    buildingType: 'wombWell',
  },
  placeRoads: {
    id: 'placeRoads',
    title: 'Bind buildings with roads',
    body: 'Carriers need connected scar paths to move stone, water, bread, and tools reliably.',
    action: 'Select Road and draw paths between the vault and production buildings.',
  },
  staffWorkers: {
    id: 'staffWorkers',
    title: 'Staff idle buildings',
    body: 'A building without its required worker cannot contribute to the chain.',
    action: 'Select the highlighted building and hire the missing worker, or enable Auto.',
  },
  produceFood: {
    id: 'produceFood',
    title: 'Bake funeral loaves',
    body: 'Funeral Loaf is the campaign food reserve and a checkpoint before industry.',
    action: 'Build field, mill, oven, and water supply, then store 10 Funeral Loaf in the vault.',
    resourceType: 'funeralLoaf',
  },
  produceTools: {
    id: 'produceTools',
    title: 'Forge torment instruments',
    body: 'Tools finish the industrial chain and unlock the scenario endgame.',
    action: 'Build coal, iron, smeltery, and instrument crucible, then store 3 Torment Instruments.',
    resourceType: 'tormentInstrument',
  },
  complete: {
    id: 'complete',
    title: 'Settlement doctrine complete',
    body: 'The core economy is online. Continue optimizing roads, stockpiles, and expansion.',
    action: 'Use the economy and chain panels to remove remaining bottlenecks.',
  },
};

export function getTutorialStep(state: EconomySimulationState, ownerId: OwnerId): TutorialStep {
  if (!hasConstructedBuilding(state, ownerId, 'sepulcherQuarry')) return STEPS.buildQuarry;
  if (!hasConstructedBuilding(state, ownerId, 'wombWell')) return STEPS.buildWell;
  if (countOwnedRoadTiles(state, ownerId) < 3) return STEPS.placeRoads;

  const missingStaff = findMissingStaff(state, ownerId);
  if (missingStaff) {
    const definition = BUILDING_DEFINITIONS[missingStaff.building.type];
    const workerName = WORKER_DEFINITIONS[missingStaff.workerType]?.name ?? missingStaff.workerType;
    return {
      ...STEPS.staffWorkers,
      body: `${definition.name} needs a ${workerName} before it can work.`,
      action: `Inspect ${definition.name} and hire ${workerName}.`,
      buildingType: missingStaff.building.type,
      workerType: missingStaff.workerType,
    };
  }

  if (getVaultResourceAmount(state, ownerId, 'funeralLoaf') < 10) return STEPS.produceFood;
  if (getVaultResourceAmount(state, ownerId, 'tormentInstrument') < 3) return STEPS.produceTools;
  return STEPS.complete;
}

function hasConstructedBuilding(state: EconomySimulationState, ownerId: OwnerId, type: BuildingType): boolean {
  return Object.values(state.buildings).some(
    (building) => building.ownerId === ownerId && building.type === type && isConstructed(building)
  );
}

function countOwnedRoadTiles(state: EconomySimulationState, ownerId: OwnerId): number {
  let count = 0;
  for (const tile of Object.values(state.territory.tiles ?? {})) {
    if (tile.ownerId === ownerId && tile.terrain === 'scarPath') count++;
  }
  return count;
}

function findMissingStaff(state: EconomySimulationState, ownerId: OwnerId) {
  for (const building of Object.values(state.buildings)) {
    if (building.ownerId !== ownerId || !isConstructed(building) || !building.isActive) continue;
    if (building.type === 'vaultOfDigestiveStone') continue;
    const definition = BUILDING_DEFINITIONS[building.type];
    if (!definition) continue;

    const assignedCounts: Partial<Record<WorkerType, number>> = {};
    for (const workerId of building.assignedWorkers) {
      const worker = state.workers[workerId];
      if (worker) assignedCounts[worker.type] = (assignedCounts[worker.type] ?? 0) + 1;
    }

    for (const [workerType, needed] of Object.entries(definition.workerSlots) as [WorkerType, number][]) {
      if ((needed ?? 0) <= 0) continue;
      if ((assignedCounts[workerType] ?? 0) < needed) return { building, workerType };
    }
  }
  return null;
}

function getVaultResourceAmount(state: EconomySimulationState, ownerId: OwnerId, resourceType: ResourceType): number {
  let amount = 0;
  for (const building of Object.values(state.buildings)) {
    if (building.ownerId !== ownerId || building.type !== 'vaultOfDigestiveStone') continue;
    amount += building.outputBuffer[resourceType] ?? 0;
  }
  return amount;
}
