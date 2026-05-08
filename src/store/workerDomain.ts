import { BUILDING_DEFINITIONS } from '../game/core/economy.data';
import type { CarrierTask } from '../game/economy/transport.logic';
import type { BuildingInstance, Job, WorkerInstance } from '../game/core/game.types';
import { getWorkerDef, listWorkerTypes } from '../game/entities/workers/worker.data';
import { planPath } from '../game/entities/workers/worker.pathing';
import { workerStatus } from '../game/entities/workers/worker.status';
import { createWorker } from '../game/entities/workers/worker.types';
import { resourceLabel } from './economy.utils';

type BuildingLookup = Record<string, Pick<BuildingInstance, 'type'> | undefined>;

export type WorkerTransportInspectorModel = {
  deliveryState: 'Idle' | 'Heading to pickup' | 'Delivering';
  detail: string;
  route: string;
  carrying: string;
  progress: string;
  idleReason: string | null;
};

export function listWorkerDomainTypes(): string[] {
  return listWorkerTypes();
}

function getBuildingName(buildings: BuildingLookup | undefined, buildingId: string): string {
  const building = buildings?.[buildingId];
  if (!building) return `Missing building ${buildingId}`;
  return BUILDING_DEFINITIONS[building.type]?.name ?? building.type;
}

function getTaskProgress(task: CarrierTask): string {
  const totalSteps = task.path.length;
  if (totalSteps <= 0) return 'No route steps';
  const currentStep = Math.min(totalSteps, Math.max(1, task.pathIndex + 1));
  return `${currentStep}/${totalSteps} tiles`;
}

function getTransportInspectorModel(
  worker: WorkerInstance,
  activeTask?: CarrierTask,
  buildings?: BuildingLookup,
): WorkerTransportInspectorModel | null {
  const isCarrier = worker.type === 'burdenThrall';

  if (!isCarrier && !activeTask) return null;

  if (!activeTask) {
    return {
      deliveryState: 'Idle',
      detail: 'Waiting for the next reachable transport job.',
      route: 'No active route',
      carrying: 'Nothing',
      progress: 'No active route',
      idleReason: worker.isIdle
        ? 'No active transport task is assigned. This worker will claim the next reachable queued job from connected roads.'
        : 'No active transport task is assigned, but this worker is still finishing movement or local work.',
    };
  }

  const pickupName = getBuildingName(buildings, activeTask.pickupBuildingId);
  const dropoffName = getBuildingName(buildings, activeTask.dropoffBuildingId);
  const amountAndResource = `${activeTask.amount} ${resourceLabel(activeTask.resourceType)}`;
  const headingToPickup = activeTask.phase === 'toPickup';

  return {
    deliveryState: headingToPickup ? 'Heading to pickup' : 'Delivering',
    detail: headingToPickup
      ? `Walking to ${pickupName} to collect ${amountAndResource}.`
      : `Carrying ${amountAndResource} to ${dropoffName}.`,
    route: `${pickupName} -> ${dropoffName}`,
    carrying: headingToPickup ? 'Nothing' : amountAndResource,
    progress: getTaskProgress(activeTask),
    idleReason: null,
  };
}

export function getWorkerInspectorModel(
  worker: WorkerInstance | null | undefined,
  activeTask?: CarrierTask,
  buildings?: BuildingLookup,
) {
  if (!worker) return null;
  return {
    definition: getWorkerDef(worker.type),
    status: workerStatus(worker),
    transport: getTransportInspectorModel(worker, activeTask, buildings),
  };
}

// Pure projection helper: returns a simulated assigned worker instance.
export function projectAssignedWorker(worker: WorkerInstance, job: Job): WorkerInstance {
  return { ...worker, currentJob: job, path: [], isIdle: false };
}

// Pure projection helper: returns a simulated cleared worker instance.
export function projectClearedWorker(worker: WorkerInstance): WorkerInstance {
  return { ...worker, currentJob: undefined, path: [], isIdle: true };
}

export function planWorkerRoute(grid: any, from: { x: number; y: number }, to: { x: number; y: number }) {
  return planPath(grid, from, to);
}

export function createWorkerDraft(id: string, type: string, ownerId: string, x = 0, y = 0) {
  return createWorker(id, type, ownerId, x, y);
}
