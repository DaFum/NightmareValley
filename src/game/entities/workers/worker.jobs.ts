import { WorkerInstance, Job } from '../../core/game.types';

export function assignJob(worker: WorkerInstance, job: Job): WorkerInstance {
	return { ...worker, currentJob: job, isIdle: false };
}

export function clearJob(worker: WorkerInstance): WorkerInstance {
	const { currentJob, ...rest } = worker as any;
	const isIdle = !(rest.path && rest.path.length > 0);
	return { ...rest, isIdle } as WorkerInstance;
}


