import { screenToIsoTile } from './iso.inverse';

export function selectTileAtScreen(
	screenX: number,
	screenY: number,
	cameraX: number,
	cameraY: number,
	zoom: number,
	tileWidth: number,
	tileHeight: number
) {
	return screenToIsoTile(screenX, screenY, cameraX, cameraY, zoom, tileWidth, tileHeight);
}

export function selectTilesInRect(
	x1: number,
	y1: number,
	x2: number,
	y2: number,
	cameraX: number,
	cameraY: number,
	zoom: number,
	tileWidth: number,
	tileHeight: number
) {
	const a = screenToIsoTile(x1, y1, cameraX, cameraY, zoom, tileWidth, tileHeight);
	const b = screenToIsoTile(x2, y2, cameraX, cameraY, zoom, tileWidth, tileHeight);

	const minX = Math.min(a.tileX, b.tileX);
	const maxX = Math.max(a.tileX, b.tileX);
	const minY = Math.min(a.tileY, b.tileY);
	const maxY = Math.max(a.tileY, b.tileY);

	const tiles: Array<{ x: number; y: number }> = [];
	for (let tx = minX; tx <= maxX; tx++) {
		for (let ty = minY; ty <= maxY; ty++) {
			tiles.push({ x: tx, y: ty });
		}
	}

	return tiles;
}


