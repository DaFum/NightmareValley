import { Job, WorkerInstance } from '../game/core/game.types';
import { getWorkerDef, listWorkerTypes } from '../game/entities/workers/worker.data';
import { assignJob, clearJob } from '../game/entities/workers/worker.jobs';
import { planPath } from '../game/entities/workers/worker.pathing';
import { workerStatus } from '../game/entities/workers/worker.status';
import { createWorker } from '../game/entities/workers/worker.types';

export function listWorkerDomainTypes(): string[] {
  return listWorkerTypes();
}

export function getWorkerInspectorModel(worker: WorkerInstance | null | undefined) {
  if (!worker) return null;
  return {
    definition: getWorkerDef(worker.type),
    status: workerStatus(worker),
  };
}

// Pure projection helper: returns a simulated assigned worker instance.
export function projectAssignedWorker(worker: WorkerInstance, job: Job): WorkerInstance {
  return assignJob(worker, job);
}

// Pure projection helper: returns a simulated cleared worker instance.
export function projectClearedWorker(worker: WorkerInstance): WorkerInstance {
  return clearJob(worker);
}

export function planWorkerRoute(grid: any, from: { x: number; y: number }, to: { x: number; y: number }) {
  return planPath(grid, from, to);
}

export function createWorkerDraft(id: string, type: string, ownerId: string, x = 0, y = 0) {
  return createWorker(id, type, ownerId, x, y);
}
