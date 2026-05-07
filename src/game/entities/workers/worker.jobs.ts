import { WorkerInstance, Job } from '../../core/game.types';

/** @deprecated Route worker state transitions through simulation tick orchestration. */
export function assignJob(worker: WorkerInstance, job: Job): WorkerInstance {
	return { ...worker, currentJob: job, isIdle: false };
}

export function clearJob(worker: WorkerInstance): WorkerInstance {
	const { currentJob, ...rest } = worker;
	const isIdle = true;
	return { ...rest, path: [], isIdle };
}


