import { AiAction, RNG } from './ai.types';

export function decideEconomyActions(state: any, rng: RNG): AiAction[] {
	// Minimal heuristic: if stock low, request production; otherwise idle or build
	const player = (state && state.player) || {};
	const stock = player.stock || {};
	const marrow = stock.marrowGrain ?? 0;

	const actions: AiAction[] = [];

	if (marrow < 10) {
		actions.push({ type: 'build', payload: { what: 'milestone_grinder' } });
	} else if (rng() < 0.05) {
		actions.push({ type: 'expand' });
	} else {
		actions.push({ type: 'idle' });
	}

	return actions;
}


