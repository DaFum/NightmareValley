import { WorkerInstance, Job } from '../../core/game.types';

export function assignJob<T = unknown>(worker: WorkerInstance, job: Job<T>): WorkerInstance {
	return { ...worker, currentJob: job, isIdle: false };
}

export function clearJob(worker: WorkerInstance): WorkerInstance {
	const { currentJob, ...rest } = worker;
	return { ...rest, isIdle: true } as WorkerInstance;
}


