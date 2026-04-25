import { TerritoryState } from '../core/game.types';
import { BuildingId } from '../core/entity.ids';

export class Occupancy {
	constructor(private territory: TerritoryState) {}

	isOccupied(tileId: string) {
		const t = this.territory.tiles[tileId];
		if (!t) return false;
		return !!t.buildingId;
	}

	reserve(tileId: string, buildingId: BuildingId) {
		if (this.isOccupied(tileId)) return false;
		const t = this.territory.tiles[tileId];
		if (t) {
			t.buildingId = buildingId;
		}
		return true;
	}

	release(tileId: string) {
		const t = this.territory.tiles[tileId];
		if (t) {
			delete t.buildingId;
		}
	}
}


