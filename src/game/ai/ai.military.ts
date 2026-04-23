import { AiAction, RNG } from './ai.types';

export function decideMilitaryActions(state: any, rng: RNG): AiAction[] {
	// Minimal military: if enemies nearby choose attack, otherwise idle
	const nearby = (state && state.enemiesNearby) || [];
	const actions: AiAction[] = [];

	if (Array.isArray(nearby) && nearby.length > 0) {
		// pick highest threat (random tie-breaker)
		const idx = Math.floor(rng() * nearby.length);
		actions.push({ type: 'attack', payload: { target: nearby[idx] } });
	} else if (rng() < 0.02) {
		actions.push({ type: 'expand' });
	} else {
		actions.push({ type: 'idle' });
	}

	return actions;
}


