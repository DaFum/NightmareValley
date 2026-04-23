import { BuildingInstance } from '../../core/game.types';

export type BuildingStatus = 'disabled' | 'underConstruction' | 'idle' | 'working';

export function deriveBuildingStatus(b: BuildingInstance): BuildingStatus {
	if (!b) return 'disabled';
	if (!b.isActive) return 'disabled';
	if (b.constructionProgress !== undefined && b.constructionProgress < 1) return 'underConstruction';
	if (b.inputBuffer && Object.keys(b.inputBuffer).length === 0 && b.outputBuffer && Object.keys(b.outputBuffer).length === 0) return 'idle';
	return 'working';
}
