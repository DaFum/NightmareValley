export function merge<T extends Record<string, any>>(target: T, ...sources: Partial<T>[]): T {
	return Object.assign({}, target, ...sources);
}

export function pick<T extends Record<string, any>, K extends keyof T>(obj: T, keys: K[]): Partial<T> {
	const out: Partial<T> = {};
	for (const k of keys) {
		if (k in obj) out[k] = obj[k];
	}
	return out;
}

export function omit<T extends Record<string, any>, K extends keyof T>(obj: T, keys: K[]): Omit<T, K> {
	const out: any = {};
	for (const k of Object.keys(obj) as K[]) {
		if (!keys.includes(k)) out[k] = obj[k];
	}
	return out;
}


