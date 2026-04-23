import { BuildingDefinition } from '../../core/economy.types';

export function calcFootprint(def: Partial<BuildingDefinition> | null, originX = 0, originY = 0) {
	const w = (def && (def as any).widthTiles) || 1;
	const h = (def && (def as any).heightTiles) || 1;
	const tiles: Array<{ x: number; y: number }> = [];
	for (let y = 0; y < h; y++) {
		for (let x = 0; x < w; x++) {
			tiles.push({ x: originX + x, y: originY + y });
		}
	}
	return tiles;
}


