import { findPathAStar } from '../../pathing/path.a-star';

export function planPath(grid: any, from: { x: number; y: number }, to: { x: number; y: number }) {
	try {
		return findPathAStar(grid, from, to);
	} catch (e) {
		return { points: [], cost: Infinity, isComplete: false };
	}
}


