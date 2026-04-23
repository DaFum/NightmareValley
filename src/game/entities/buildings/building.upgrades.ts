import { BuildingInstance } from '../../core/game.types';
import { BUILDING_DEFINITIONS } from '../../core/economy.data';

export function getUpgradeCost(instance: BuildingInstance, toLevel: number) {
	const def = BUILDING_DEFINITIONS[instance.type];
	if (!def) return null;
	if (toLevel <= instance.level) return null;
	if (def.maxLevel !== undefined && toLevel > def.maxLevel) return null;
	if (toLevel < 1) return null;

	const idx = toLevel - 1;
	if (!def.upgradeCosts || idx >= def.upgradeCosts.length) return null;

	return def.upgradeCosts[idx] || null;
}
