import { TerritoryState } from '../../core/game.types';

export function canPlaceRoad(territory: TerritoryState, x: number, y: number) {
	const id = `tile_${x}_${y}`;
	const tile = territory.tiles[id];
	if (!tile) return { ok: false, reason: 'out_of_bounds' };
	if (tile.roadNodeId) return { ok: false, reason: 'already_road' };
	return { ok: true } as const;
}


