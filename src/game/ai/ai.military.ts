import { AiAction, RNG } from './ai.types';

function computeThreat(enemy: any): number {
	return enemy && typeof enemy.threat === 'number' ? enemy.threat : 0;
}

export function decideMilitaryActions(state: any, rng: RNG): AiAction[] {
	// Minimal military: if enemies nearby choose attack, otherwise idle
	const nearby = (state && state.enemiesNearby) || [];
	const actions: AiAction[] = [];

	if (Array.isArray(nearby) && nearby.length > 0) {
		// pick highest threat (random tie-breaker)
		const maxThreat = nearby.reduce((max, e) => Math.max(max, computeThreat(e)), 0);
		const highestThreatEnemies = nearby.filter(e => computeThreat(e) === maxThreat);
		const idx = Math.floor(rng() * highestThreatEnemies.length);
		actions.push({ type: 'attack', payload: { target: highestThreatEnemies[idx] } });
	} else if (rng() < 0.02) {
		const frontier = (state && state.frontier) || [];
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


