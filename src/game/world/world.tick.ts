import { WorldState } from './world.types';

export function tickWorld(world: WorldState, deltaSec = 1): WorldState {
	world.tick += 1;
	// Placeholder: integrate subsystem ticks (AI, economy, transport) here
	return world;
}


