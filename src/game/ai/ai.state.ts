import { AiState } from './ai.types';

export function createAiState(seed?: number): AiState {
	const s = typeof seed === 'number' ? seed : Math.floor(Math.random() * 0xffffffff);
	return { seed: s, tick: 0 };
}

export function advanceTick(state: AiState): AiState {
	return { ...state, tick: state.tick + 1 };
}


