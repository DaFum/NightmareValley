import { AiAction, RNG } from './ai.types';

export function decideEconomyActions(state: any, rng: RNG): AiAction[] {
	if (!state || !state.player || !state.player.stock) {
		return [];
	}

	// Minimal heuristic: if stock low, request production; otherwise idle or build
	const player = state.player;
	const stock = player.stock;
	const marrow = stock.marrowGrain ?? 0;

	const actions: AiAction[] = [];

	if (marrow < 10) {
		actions.push({ type: 'build', payload: { what: 'milestone_grinder' } });
	} else if (rng() < 0.05) {
		const frontier = state.frontier || [];
		if (Array.isArray(frontier) && frontier.length > 0) {
			const idx = Math.floor(rng() * frontier.length);
			actions.push({ type: 'expand', payload: { tile: frontier[idx] } });
		} else {
			actions.push({ type: 'idle' });
		}
	} else {
		actions.push({ type: 'idle' });
	}

	return actions;
}


