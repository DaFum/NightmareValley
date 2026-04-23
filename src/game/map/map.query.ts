import { TerritoryState, MapTile } from '../core/game.types';

export function getTileAt(territory: TerritoryState, tx: number, ty: number): MapTile | null {
	const id = `tile_${tx}_${ty}`;
	return territory.tiles[id] ?? null;
}

export function neighbors(tx: number, ty: number) {
	return [
		{ x: tx + 1, y: ty },
		{ x: tx - 1, y: ty },
		{ x: tx, y: ty + 1 },
		{ x: tx, y: ty - 1 },
	];
}

export function isBuildable(territory: TerritoryState, tx: number, ty: number): boolean {
	const tile = getTileAt(territory, tx, ty);
	if (!tile) return false;
	if (tile.buildingId) return false;
	// If tile has resource deposit or road, may still be buildable depending on rules; keep simple
	return true;
}


