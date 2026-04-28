import { TerritoryState } from '../../core/game.types';
import { TerrainType } from '../../core/economy.types';
import { getTileAt } from '../../map/map.query';

const ROAD_ALLOWED_TERRAIN = new Set<TerrainType>([
	'scarredEarth',
	'weepingForest',
	'ashBog',
]);

export function canPlaceRoad(territory: TerritoryState, x: number, y: number) {
	const tile = getTileAt(territory, x, y);
	if (!tile) return { ok: false, reason: 'out_of_bounds' };
	if (tile.buildingId) return { ok: false, reason: 'occupied' };
	if (tile.tier === 'dirt') return { ok: false, reason: 'dirt_path' };
	if (tile.tier === 'cobble' || tile.tier === 'paved') return { ok: false, reason: 'already_road' };
	if (!ROAD_ALLOWED_TERRAIN.has(tile.terrain)) return { ok: false, reason: 'invalid_terrain' };
	return { ok: true } as const;
}

export function canPlaceRoadForPlayer(territory: TerritoryState, x: number, y: number, ownerId: string) {
	const base = canPlaceRoad(territory, x, y);
	if (!base.ok) return base;

	const tile = getTileAt(territory, x, y);
	if (!tile || tile.ownerId !== ownerId) return { ok: false, reason: 'unowned' };

	return { ok: true } as const;
}


