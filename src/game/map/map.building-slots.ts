export function footprintTiles(width: number, height: number, originX = 0, originY = 0) {
	if (!Number.isFinite(width) || width <= 0 || !Number.isInteger(width)) throw new RangeError("width must be a positive integer");
	if (!Number.isFinite(height) || height <= 0 || !Number.isInteger(height)) throw new RangeError("height must be a positive integer");
	const tiles: Array<{ x: number; y: number }> = [];
	for (let y = 0; y < height; y++) {
		for (let x = 0; x < width; x++) {
			tiles.push({ x: originX + x, y: originY + y });
		}
	}
	return tiles;
}

export function footprintBounds(width: number, height: number, originX = 0, originY = 0) {
	if (!Number.isFinite(width) || width <= 0 || !Number.isInteger(width)) throw new RangeError("width must be a positive integer");
	if (!Number.isFinite(height) || height <= 0 || !Number.isInteger(height)) throw new RangeError("height must be a positive integer");
	return { minX: originX, minY: originY, maxX: originX + width - 1, maxY: originY + height - 1 };
}


