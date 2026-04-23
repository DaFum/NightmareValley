import { TerritoryState } from '../../core/game.types';
import { footprintTiles } from '../../map/map.building-slots';

export function canPlaceBuilding(territory: TerritoryState, tx: number, ty: number, width = 1, height = 1) {
	for (let y = ty; y < ty + height; y++) {
		for (let x = tx; x < tx + width; x++) {
			const id = `tile_${x}_${y}`;
			const t = territory.tiles[id];
			if (!t) return { ok: false, reason: 'out_of_bounds' };
			if (t.buildingId) return { ok: false, reason: 'occupied' };
		}
	}
	return { ok: true, tileId: `tile_${tx}_${ty}` } as const;
}


