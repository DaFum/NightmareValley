export function assert(condition: unknown, message?: string): asserts condition {
	if (!condition) {
		throw new Error(message || 'Assertion failed');
	}
}

export function assertType<T>(value: unknown, predicate: (v: unknown) => v is T, message?: string): T {
	if (!predicate(value)) throw new Error(message || 'Type assertion failed');
	return value;
}


