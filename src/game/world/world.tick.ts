import { WorldState } from './world.types';

export function tickWorld(world: WorldState, deltaSec = 1): WorldState {
	// Incorporate deltaSec into progression logic if needed here
	// Placeholder: integrate subsystem ticks (AI, economy, transport) here
	return {
		...world,
		tick: world.tick + deltaSec,
		territory: {
			...world.territory,
			tiles: { ...world.territory.tiles },
			...(world.territory.tileIndex ? { tileIndex: { ...world.territory.tileIndex } } : {})
		},
		players: world.players ? { ...world.players } : undefined
	};
}


