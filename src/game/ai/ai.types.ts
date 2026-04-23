export type AiActionType = 'build' | 'assign' | 'expand' | 'attack' | 'idle';

export interface AiAction {
	type: AiActionType;
	payload?: any;
}

export interface AiState {
	seed: number;
	tick: number;
}

export type RNG = () => number;

export function createSeededRng(seed: number): RNG {
	// mulberry32
	let t = seed >>> 0;
	return function () {
		t += 0x6D2B79F5;
		let r = Math.imul(t ^ (t >>> 15), 1 | t);
		r = (r + Math.imul(r ^ (r >>> 7), 61 | r)) ^ r;
		return ((r ^ (r >>> 14)) >>> 0) / 4294967296;
	};
}


