import { WorldState } from './world.types';
import { generateProceduralTiledMap } from '../map/procedural';
import { parseTiledMap } from '../map/tiled.adapter';

export function createWorld(seed?: number, width = 64, height = 64): WorldState {
	const s = typeof seed === 'number' ? seed : Math.floor(Math.random() * 0xffffffff);
	const map = generateProceduralTiledMap({ width, height, seed: s });
	const territory = parseTiledMap(map as any);
	return { tick: 0, seed: s, territory, players: {} };
}


