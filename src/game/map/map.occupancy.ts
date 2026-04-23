import { TerritoryState } from '../core/game.types';

export class Occupancy {
	private occupied: Set<string> = new Set();

	constructor(private territory?: TerritoryState) {
		// Prepopulate occupied set from tiles that have buildings/roadNodes
		if (territory) {
			for (const t of Object.values(territory.tiles)) {
				if (t.buildingId) this.occupied.add(t.id);
				if (t.roadNodeId) this.occupied.add(t.id);
			}
		}
	}

	isOccupied(tileId: string) {
		return this.occupied.has(tileId);
	}

	reserve(tileId: string) {
		if (this.occupied.has(tileId)) return false;
		this.occupied.add(tileId);
		return true;
	}

	release(tileId: string) {
		this.occupied.delete(tileId);
	}
}


