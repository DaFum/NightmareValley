import { screenToIsoTile } from './iso.inverse';

export function pickTileFromScreen(
	screenX: number,
	screenY: number,
	cameraX: number,
	cameraY: number,
	zoom: number,
	tileWidth: number,
	tileHeight: number
) {
	const { tileX, tileY } = screenToIsoTile(screenX, screenY, cameraX, cameraY, zoom, tileWidth, tileHeight);
	return { x: tileX, y: tileY };
}

export function snapToNearestTile(tx: number, ty: number) {
	return { x: Math.round(tx), y: Math.round(ty) };
}


