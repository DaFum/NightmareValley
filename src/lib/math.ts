export function clamp(value: number, min: number, max: number): number {
	return Math.max(min, Math.min(max, value));
}

export function lerp(a: number, b: number, t: number): number {
	return a + (b - a) * t;
}

export function approxEqual(a: number, b: number, eps = 1e-6): boolean {
	return Math.abs(a - b) <= eps;
}


