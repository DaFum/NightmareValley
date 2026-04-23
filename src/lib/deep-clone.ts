export function deepClone<T>(value: T): T {
	if (value === null || value === undefined) return value;
	// Primitives
	if (typeof value !== 'object') return value;

	// Prefer native structuredClone when available (handles circular refs and many types)
	const sc: any = (globalThis as any).structuredClone;
	if (typeof sc === 'function') {
		try {
			return sc(value);
		} catch (e) {
			// fall through to fallback
		}
	}

	const visited = new WeakMap<object, any>();

	function _clone<T>(val: T): T {
		if (val === null || typeof val !== 'object') return val;
		const obj = val as any;
		if (visited.has(obj)) return visited.get(obj);

		if (obj instanceof Date) {
			const d = new Date(obj.getTime());
			visited.set(obj, d);
			return d as any;
		}
		if (obj instanceof RegExp) {
			const r = new RegExp(obj.source, obj.flags);
			visited.set(obj, r);
			return r as any;
		}

		if (obj instanceof Map) {
			const m = new Map();
			visited.set(obj, m);
			obj.forEach((v: any, k: any) => {
				m.set(_clone(k), _clone(v));
			});
			return m as any;
		}

		if (obj instanceof Set) {
			const s = new Set();
			visited.set(obj, s);
			obj.forEach((v: any) => s.add(_clone(v)));
			return s as any;
		}

		if (obj instanceof ArrayBuffer) {
			const buf = obj.slice(0);
			visited.set(obj, buf);
			return buf as any;
		}

		if (ArrayBuffer.isView(obj)) {
			try {
				const ctor = (obj as any).constructor;
				const copy = new ctor(obj as any);
				visited.set(obj, copy);
				return copy as any;
			} catch (e) {
				const arr = Array.from(obj as any);
				const copy = new (obj as any).constructor(arr);
				visited.set(obj, copy);
				return copy as any;
			}
		}

		if (Array.isArray(obj)) {
			const arr: any[] = [];
			visited.set(obj, arr);
			for (let i = 0; i < obj.length; i++) arr[i] = _clone(obj[i]);
			return arr as any;
		}

		// Plain object (preserve prototype and descriptors)
		const proto = Object.getPrototypeOf(obj);
		const out = Object.create(proto);
		visited.set(obj, out);

		for (const key of Reflect.ownKeys(obj)) {
			const desc = Object.getOwnPropertyDescriptor(obj, key as any);
			if (!desc) continue;
			if ('value' in desc) desc.value = _clone(desc.value);
			Object.defineProperty(out, key, desc);
		}
		return out as any;
	}

	try {
		return _clone(value);
	} catch (err) {
		// Last resort: try JSON for simple structures (no circular refs)
		try {
			return JSON.parse(JSON.stringify(value));
		} catch (e) {
			throw new Error('deepClone failed: unsupported type or circular reference');
		}
	}
}


