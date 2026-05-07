import { WorldState } from './world.types';
import { calculateGameScore } from '../core/victory.rules';

export function countTiles(world: WorldState): number {
	return Object.keys(world.territory.tiles || {}).length;
}

export function samplingSummary(world: WorldState) {
	return {
		tick: world.tick,
		seed: world.seed,
		tiles: countTiles(world),
		buildings: Object.keys(world.buildings ?? {}).length,
		workers: Object.keys(world.workers ?? {}).length,
		score: calculateGameScore(world).total,
	};
}

