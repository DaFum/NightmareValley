import { TerritoryState } from '../core/game.types';

export class Occupancy {
	constructor(private territory: TerritoryState) {}

	isOccupied(tileId: string) {
		const t = this.territory.tiles[tileId];
		if (!t) return false;
		return !!(t.buildingId || t.roadNodeId);
	}

	reserve(tileId: string, buildingId?: string, roadNodeId?: string) {
		if (this.isOccupied(tileId)) return false;
		const t = this.territory.tiles[tileId];
		if (t) {
			if (buildingId) t.buildingId = buildingId as any;
			if (roadNodeId) t.roadNodeId = roadNodeId;
		}
		return true;
	}

	release(tileId: string) {
		const t = this.territory.tiles[tileId];
		if (t) {
			delete t.buildingId;
			delete t.roadNodeId;
		}
	}
}


