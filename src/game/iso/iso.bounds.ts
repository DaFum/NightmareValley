import { tileToScreen } from './iso.project';

export function computeIsoWorldBounds(widthTiles: number, heightTiles: number, tileWidth: number, tileHeight: number) {
	// compute corners in screen space
	const top = tileToScreen(0, 0, tileWidth, tileHeight);
	const right = tileToScreen(widthTiles - 1, 0, tileWidth, tileHeight);
	const bottom = tileToScreen(widthTiles - 1, heightTiles - 1, tileWidth, tileHeight);
	const left = tileToScreen(0, heightTiles - 1, tileWidth, tileHeight);

	const xs = [top.x, right.x, bottom.x, left.x];
	const ys = [top.y, right.y, bottom.y, left.y];

	const minX = Math.min(...xs);
	const maxX = Math.max(...xs);
	const minY = Math.min(...ys);
	const maxY = Math.max(...ys);

	return { minX, minY, maxX, maxY };
}


