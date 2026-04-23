import { BuildingInstance } from '../../core/game.types';

export type PlacementResult = { ok: true; tileId: string } | { ok: false; reason: string };

export type Footprint = { x: number; y: number }[];

export type BuildingStatus = 'planned' | 'underConstruction' | 'idle' | 'working' | 'blocked' | 'disabled';

export function isConstructed(b: BuildingInstance | undefined): boolean {
	if (!b) return false;
	return b.constructionProgress === undefined || b.constructionProgress >= 1;
}


