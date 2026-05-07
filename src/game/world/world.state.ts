import { WorldState } from './world.types';
import { generateInitialWorld } from './world.generator';

export type WorldPreset = 'tiny' | 'standard' | 'large';

const WORLD_PRESET_SIZES: Record<WorldPreset, { width: number; height: number }> = {
	tiny: { width: 40, height: 40 },
	standard: { width: 64, height: 64 },
	large: { width: 96, height: 96 },
};

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

export function createWorldFromPreset(
	preset: WorldPreset,
	seed?: number,
	playerId = "player_1"
): WorldState {
	const size = WORLD_PRESET_SIZES[preset] ?? WORLD_PRESET_SIZES.standard;
	return createWorld(seed, size.width, size.height, playerId);
}
