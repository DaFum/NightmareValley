import { AiState, RNG, createSeededRng } from './ai.types';
import { createAiState, advanceTick } from './ai.state';
import { decideEconomyActions } from './ai.economy';
import { decideExpansion } from './ai.expansion';
import { decideMilitaryActions } from './ai.military';

export function runAiTick(state: AiState | undefined, world: any): { state: AiState; actions: any[] } {
	const current = state ?? createAiState();
	const rng = createSeededRng(current.seed + current.tick);

	const actions: any[] = [];

	// economy
	actions.push(...decideEconomyActions({ player: world.player }, rng));

	// expansion
	const exp = decideExpansion({ frontier: world.frontier }, rng);
	if (exp) actions.push(exp);

	// military
	actions.push(...decideMilitaryActions({ enemiesNearby: world.enemies || [] }, rng));

	const nextState = advanceTick(current);

	return { state: nextState, actions };
}


