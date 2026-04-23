import { TerritoryState } from '../../core/game.types';
import { getTileAt } from '../../map/map.query';

export function canPlaceBuilding(territory: TerritoryState, tx: number, ty: number, width = 1, height = 1) {
	let originTileId: string | undefined;
	for (let y = ty; y < ty + height; y++) {
		for (let x = tx; x < tx + width; x++) {
			const t = getTileAt(territory, x, y);
			if (!t) return { ok: false, reason: 'out_of_bounds' };
			if (t.buildingId) return { ok: false, reason: 'occupied' };
			if (x === tx && y === ty) originTileId = t.id;
		}
	}
	return { ok: true, tileId: originTileId! } as const;
}


