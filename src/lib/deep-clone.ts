export function deepClone<T>(value: T): T {
	if (value === null || value === undefined) return value;
	// Handle primitives
	if (typeof value !== 'object') return value;

	// Dates
	if (value instanceof Date) return new Date(value.getTime()) as any;

	// RegExp
	if (value instanceof RegExp) return new RegExp(value.source, value.flags) as any;

	// Arrays and objects
	try {
		return JSON.parse(JSON.stringify(value));
	} catch (e) {
		// Fallback: shallow copy
		return Object.assign(Array.isArray(value) ? [] : {}, value) as T;
	}
}


