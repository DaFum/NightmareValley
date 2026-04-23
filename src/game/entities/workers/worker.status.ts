import { WorkerInstance } from '../../core/game.types';

export function workerStatus(w: WorkerInstance) {
	if (!w) return 'missing';
	if (w.isIdle) return 'idle';
	if (w.currentJob) return 'working';
	return 'moving';
}


