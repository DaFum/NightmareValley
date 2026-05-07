import { WorldState } from './world.types';
import { generateInitialWorld } from './world.generator';

export type WorldPreset = 'tiny' | 'standard' | 'large';

const WORLD_SIZE_TINY = { width: 40, height: 40 } as const;
const WORLD_SIZE_STANDARD = { width: 64, height: 64 } as const;
const WORLD_SIZE_LARGE = { width: 96, height: 96 } as const;

const WORLD_PRESET_SIZES: Record<WorldPreset, { width: number; height: number }> = {
	tiny: WORLD_SIZE_TINY,
	standard: WORLD_SIZE_STANDARD,
	large: WORLD_SIZE_LARGE,
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
