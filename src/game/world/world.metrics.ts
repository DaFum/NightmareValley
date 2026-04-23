import { WorldState } from './world.types';

export function countTiles(world: WorldState): number {
	return Object.keys(world.territory.tiles || {}).length;
}

export function samplingSummary(world: WorldState) {
	return {
		tick: world.tick,
		seed: world.seed,
		tiles: countTiles(world),
	};
}


