import { BuildingInstance } from '../../core/game.types';

import { getBuildingDefinition } from './building.data';

/**
 * Advances the construction progress of a building.
 * Returns the original instance (no-op) when the building is already constructed.
 */
export function advanceBuildingConstruction(b: BuildingInstance, deltaSec: number) {
	if (b.constructionProgress === undefined) return b;
	const next = { ...b };
	const def = getBuildingDefinition(b.type);
	const time = def?.constructionTime ?? 10;
	next.constructionProgress = Math.min(1, (next.constructionProgress ?? 0) + deltaSec / time);
	if (next.constructionProgress >= 1) {
		delete next.constructionProgress;
	}
	return next;
}


