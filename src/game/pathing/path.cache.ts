import { Path } from './path.types';

export class PathCache {
	private cache = new Map<string, Path>();

	private key(start: any, goal: any) {
		return `${start.x},${start.y}->${goal.x},${goal.y}`;
	}

	get(start: any, goal: any): Path | undefined {
		return this.cache.get(this.key(start, goal));
	}

	set(start: any, goal: any, path: Path) {
		this.cache.set(this.key(start, goal), path);
	}

	clear() {
		this.cache.clear();
	}

	invalidateForTile(tx: number, ty: number) {
		const target = `${tx},${ty}`;
		for (const k of Array.from(this.cache.keys())) {
			const parts = k.split('->');
			if (parts.length !== 2) continue;
			const [startStr, goalStr] = parts;
			if (startStr === target || goalStr === target) {
				this.cache.delete(k);
			}
		}
	}
}


