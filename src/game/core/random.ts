export class Random {
	private state: number;

	constructor(seed: number) {
		// xorshift32 seed
		this.state = seed >>> 0 || 1;
	}

	// returns a float in [0,1)
	next(): number {
		let x = this.state;
		x ^= x << 13;
		x ^= x >>> 17;
		x ^= x << 5;
		this.state = x >>> 0;
		return (this.state >>> 0) / 4294967296;
	}

	int(max: number): number {
		if (!Number.isFinite(max)) {
			throw new TypeError("max must be a finite number");
		}
		const m = Math.floor(max);
		if (m <= 0) {
			throw new RangeError("max must be greater than 0");
		}
		return Math.floor(this.next() * m);
	}

	choice<T>(arr: T[], fallback?: T): T | undefined {
		if (!arr || arr.length === 0) return fallback;
		return arr[this.int(arr.length)];
	}

	shuffle<T>(arr: T[]): T[] {
		const out = arr.slice();
		for (let i = out.length - 1; i > 0; i--) {
			const j = this.int(i + 1);
			const tmp = out[i];
			out[i] = out[j];
			out[j] = tmp;
		}
		return out;
	}
}

export function createRandom(seed?: number) {
	const s = typeof seed === 'number' ? seed : Math.floor(Math.random() * 0xffffffff);
	return new Random(s);
}


