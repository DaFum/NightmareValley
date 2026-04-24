import { BuildingDefinition } from '../../core/economy.types';

export function calcFootprint(def: Partial<BuildingDefinition> | null, originX = 0, originY = 0) {
	const w = def?.widthTiles !== undefined ? def.widthTiles : 1;
	const h = def?.heightTiles !== undefined ? def.heightTiles : 1;

	if (!Number.isFinite(w) || !Number.isInteger(w) || w <= 0) {
		throw new RangeError(`Invalid widthTiles: ${w}`);
	}
	if (!Number.isFinite(h) || !Number.isInteger(h) || h <= 0) {
		throw new RangeError(`Invalid heightTiles: ${h}`);
	}

	const tiles: Array<{ x: number; y: number }> = [];
	for (let y = 0; y < h; y++) {
		for (let x = 0; x < w; x++) {
			tiles.push({ x: originX + x, y: originY + y });
		}
	}
	return tiles;
}


