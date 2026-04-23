import { WorldState } from './world.types';

export function tickWorld(world: WorldState, deltaSec = 1): WorldState {
	// Placeholder: integrate subsystem ticks (AI, economy, transport) here
	return {
		...world,
		tick: world.tick + 1
	};
}


