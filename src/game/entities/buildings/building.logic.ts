import { BuildingInstance } from '../../core/game.types';

export function advanceBuildingConstruction(b: BuildingInstance, deltaSec: number) {
	if (b.constructionProgress === undefined) return b;
	const next = { ...b };
	next.constructionProgress = Math.min(1, (next.constructionProgress ?? 0) + deltaSec / 10);
	if (next.constructionProgress >= 1) {
		delete next.constructionProgress;
	}
	return next;
}


