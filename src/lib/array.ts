/** Lightweight array helpers used across the codebase */
export function unique<T>(arr: T[]): T[] {
	return Array.from(new Set(arr));
}

export function flatten<T>(arr: T[][]): T[] {
	return arr.reduce((acc, v) => acc.concat(v), [] as T[]);
}

export function head<T>(arr: T[]): T | undefined {
	return arr && arr.length > 0 ? arr[0] : undefined;
}

export function tail<T>(arr: T[]): T[] {
	return arr && arr.length > 1 ? arr.slice(1) : [];
}

export function insertAt<T>(arr: T[], index: number, item: T): T[] {
	const copy = arr.slice();
	copy.splice(index, 0, item);
	return copy;
}

export function removeAt<T>(arr: T[], index: number): T[] {
	const copy = arr.slice();
	copy.splice(index, 1);
	return copy;
}


