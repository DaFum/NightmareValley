import { AiAction, RNG } from './ai.types';

export function decideEconomyActions(state: any, rng: RNG): AiAction[] {
	// Minimal heuristic: if stock low, request production; otherwise idle or build
	const actions: AiAction[] = [];

	if (!state || !state.player || !state.player.stock) {
		actions.push({ type: 'idle' });
		return actions;
	}

	const player = state.player;
	const stock = player.stock;
	const marrow = stock.marrowGrain;

	if (marrow !== undefined && marrow < 10) {
		actions.push({ type: 'build', payload: { what: 'milestone_grinder' } });
	} else if (rng() < 0.05) {
		actions.push({ type: 'expand', payload: { tile: null } });
	} else {
		actions.push({ type: 'idle' });
	}

	return actions;
}


