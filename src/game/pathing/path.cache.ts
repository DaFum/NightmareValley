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
		// A tile change can affect any cached path that traverses that tile.
		// Clearing the entire cache is the simplest safe approach.
		this.clear();
	}
}


