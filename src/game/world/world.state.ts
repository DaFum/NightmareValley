import { WorldState } from './world.types';
import { generateInitialWorld } from './world.generator';

export function createWorld(seed?: number, width = 64, height = 64, playerId = "player_1"): WorldState {
	const resolvedSeed = typeof seed === 'number' ? seed : Math.floor(Math.random() * 0xffffffff);
	const base = generateInitialWorld(playerId, resolvedSeed, width, height);

	return {
		...base,
		seed: resolvedSeed,
		lastDeltaSec: 0,
		scenarioProfile: 'challenging',
		biomeModifier: 1,
		temporaryModifiers: undefined,
	};
}
