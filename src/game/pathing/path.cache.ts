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
		const prefix = `${tx},${ty}`;
		for (const k of Array.from(this.cache.keys())) {
			if (k.includes(prefix)) this.cache.delete(k);
		}
	}
}


