import { AiAction, RNG } from './ai.types';

export function decideMilitaryActions(state: any, rng: RNG): AiAction[] {
	// Minimal military: if enemies nearby choose attack, otherwise idle
	const nearby = (state && state.enemiesNearby) || [];
	const actions: AiAction[] = [];

	if (Array.isArray(nearby) && nearby.length > 0) {
		// pick highest threat (random tie-breaker)
		const computeThreat = (enemy: any) => enemy.threat ?? 0;
		const maxThreat = Math.max(...nearby.map(computeThreat));
		const highestThreats = nearby.filter((enemy: any) => computeThreat(enemy) === maxThreat);

		const idx = Math.floor(rng() * highestThreats.length);
		actions.push({ type: 'attack', payload: { target: highestThreats[idx] } });
	} else if (rng() < 0.02) {
		actions.push({ type: 'expand', payload: { tile: null } });
	} else {
		actions.push({ type: 'idle' });
	}

	return actions;
}


