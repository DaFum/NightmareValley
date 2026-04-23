import { BuildingInstance } from '../../core/game.types';
import { BUILDING_DEFINITIONS } from '../../core/economy.data';

export function getUpgradeCost(instance: BuildingInstance, toLevel: number) {
	const def = BUILDING_DEFINITIONS[instance.type];
	if (!def) return null;
	const idx = Math.max(0, Math.min((def.upgradeCosts || []).length - 1, toLevel - 1));
	return (def.upgradeCosts && def.upgradeCosts[idx]) || null;
}


