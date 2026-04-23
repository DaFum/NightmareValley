import { WorkerInstance } from '../../core/game.types';

export function animationFrameForWorker(w: WorkerInstance, t: number) {
	// Simple two-frame walk cycle based on time and id
	const phase = Math.floor(t / 200) % 2;
	return {
		frame: phase === 0 ? 'walk1' : 'walk2',
		tileOffsetY: w.position.y || 0,
	};
}


