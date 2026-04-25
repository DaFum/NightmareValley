import { WorldState } from './world.types';
import { generateInitialWorld } from './world.generator';

export function createWorld(seed?: number, _width = 64, _height = 64): WorldState {
	const base = generateInitialWorld();
	const resolvedSeed = typeof seed === 'number' ? seed : Math.floor(Math.random() * 0xffffffff);

	return {
		...base,
		seed: resolvedSeed,
		lastDeltaSec: 0,
		scenarioProfile: 'challenging',
		biomeModifier: 1,
		temporaryModifiers: undefined,
	};
}
