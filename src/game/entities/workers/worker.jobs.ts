import { WorkerInstance } from '../../core/game.types';

export type Job = { id: string; type: string; target?: any };

export function assignJob(worker: WorkerInstance, job: Job) {
	(worker as any).currentJob = job;
	worker.isIdle = false;
}

export function clearJob(worker: WorkerInstance) {
	delete (worker as any).currentJob;
	worker.isIdle = true;
}


