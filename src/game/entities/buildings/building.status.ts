import { BuildingInstance } from '../../core/game.types';
export { BuildingStatus } from './building.types';
import { BuildingStatus } from './building.types';

export function deriveBuildingStatus(b: BuildingInstance | undefined): BuildingStatus {
	if (!b || !b.isActive) return 'disabled';
	if (b.constructionProgress !== undefined && b.constructionProgress < 1) return 'underConstruction';
	if (b.inputBuffer && Object.keys(b.inputBuffer).length === 0 && b.outputBuffer && Object.keys(b.outputBuffer).length === 0) return 'idle';
	return 'working';
}


