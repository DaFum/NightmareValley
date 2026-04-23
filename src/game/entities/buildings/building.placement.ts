import { TerritoryState } from '../../core/game.types';
import { getTileAt } from '../../map/map.query';

export function canPlaceBuilding(territory: TerritoryState, tx: number, ty: number, width = 1, height = 1) {
	if (width <= 0 || height <= 0) return { ok: false, reason: 'invalid_footprint' };
	let originTileId: string | undefined;
	for (let y = ty; y < ty + height; y++) {
		for (let x = tx; x < tx + width; x++) {
			const t = getTileAt(territory, x, y);
			if (!t) return { ok: false, reason: 'out_of_bounds' };
			if (t.buildingId) return { ok: false, reason: 'occupied' };
			if (t.roadNodeId) return { ok: false, reason: 'occupied_by_road' };
			if (x === tx && y === ty) originTileId = t.id;
		}
	}
	return { ok: true, tileId: originTileId! } as const;
}


