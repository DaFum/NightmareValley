import { BuildingInstance } from '../../core/game.types';

import { getBuildingDefinition } from './building.data';

export function advanceBuildingConstruction(b: BuildingInstance, deltaSec: number) {
	if (b.constructionProgress === undefined) return b;
	const next = { ...b };
	const def = getBuildingDefinition(b.type);
	let time = def?.constructionTime;
	if (typeof time !== 'number' || time <= 0) time = 60;
	next.constructionProgress = Math.min(1, (next.constructionProgress ?? 0) + deltaSec / time);
	if (next.constructionProgress >= 1) {
		delete next.constructionProgress;
	}
	return next;
}


