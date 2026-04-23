import { WorkerInstance } from '../../core/game.types';

export function createWorker(id: string, type: string, ownerId: string, x = 0, y = 0): WorkerInstance {
	return {
		id: id as any,
		type: (type as any),
		ownerId: (ownerId as any),
		position: { x, y },
		isIdle: true,
		morale: 1,
		infection: 0,
		scars: 0,
	} as WorkerInstance;
}


