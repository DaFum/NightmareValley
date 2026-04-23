import { AiAction, RNG } from './ai.types';

export function decideExpansion(state: any, rng: RNG): AiAction | null {
	// Minimal expansion: pick a random adjacent empty tile if available
	const frontier = (state && state.frontier) || [];
	if (!Array.isArray(frontier) || frontier.length === 0) return null;
	const idx = Math.floor(rng() * frontier.length);
	return { type: 'expand', payload: { tile: frontier[idx] } };
}


