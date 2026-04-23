import { AiAction } from './ai.types';

export function computePriority(weights: Record<string, number>, inputs: Record<string, number>): number {
	let sum = 0;
	for (const k of Object.keys(weights)) {
		const w = weights[k] ?? 0;
		const v = inputs[k] ?? 0;
		sum += w * v;
	}
	return sum;
}

export function chooseHighest<T>(items: T[], scoreFn: (t: T) => number): T | null {
	if (!items || items.length === 0) return null;
	let best: T | null = null;
	let bestScore = -Infinity;
	for (const it of items) {
		const s = scoreFn(it);
		if (s > bestScore) {
			bestScore = s;
			best = it;
		}
	}
	return best;
}


