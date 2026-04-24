import { TerritoryState, MapTile } from '../core/game.types';

export function getTileAt(territory: TerritoryState, tx: number, ty: number): MapTile | null {
	if (territory.tileIndex) {
		const id = territory.tileIndex[`${tx},${ty}`];
		if (id) {
			return territory.tiles[id] ?? null;
		}
		return null;
	}

	for (const tile of Object.values(territory.tiles)) {
		if (tile.position.x === tx && tile.position.y === ty) return tile;
	}
	return null;
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


