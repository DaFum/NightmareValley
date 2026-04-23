import { TerritoryState } from '../../core/game.types';
import { getTileAt } from '../../map/map.query';

export function canPlaceRoad(territory: TerritoryState, x: number, y: number) {
	const tile = getTileAt(territory, x, y);
	if (!tile) return { ok: false, reason: 'out_of_bounds' };
	if (tile.buildingId) return { ok: false, reason: 'occupied' };
	if (tile.roadNodeId) return { ok: false, reason: 'already_road' };
	return { ok: true } as const;
}


