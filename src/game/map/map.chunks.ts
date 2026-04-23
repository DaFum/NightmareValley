import { CHUNK_SIZE } from './map.constants';

export function tileToChunk(tx: number, ty: number, chunkSize = CHUNK_SIZE) {
	const cx = Math.floor(tx / chunkSize);
	const cy = Math.floor(ty / chunkSize);
	return { cx, cy };
}

export function chunkId(cx: number, cy: number) {
	return `${cx}_${cy}`;
}

export function tilesInChunk(cx: number, cy: number, chunkSize = CHUNK_SIZE) {
	const tiles: Array<{ x: number; y: number }> = [];
	const startX = cx * chunkSize;
	const startY = cy * chunkSize;
	for (let y = startY; y < startY + chunkSize; y++) {
		for (let x = startX; x < startX + chunkSize; x++) {
			tiles.push({ x, y });
		}
	}
	return tiles;
}


