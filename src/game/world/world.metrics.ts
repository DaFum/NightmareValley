import { WorldState } from './world.types';
import { calculateScoreSnapshot } from '../core/victory.rules';

export function countTiles(world: WorldState): number {
	return Object.keys(world.territory.tiles || {}).length;
}

export function samplingSummary(world: WorldState) {
	const snapshot = calculateScoreSnapshot(world);
	return {
		tick: world.tick,
		seed: world.seed,
		tiles: countTiles(world),
		buildings: Object.keys(world.buildings ?? {}).length,
		workers: Object.keys(world.workers ?? {}).length,
		score: snapshot.score.total,
	};
}
