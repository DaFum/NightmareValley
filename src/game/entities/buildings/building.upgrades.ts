import { BuildingInstance } from '../../core/game.types';
import { getUpgradeCost as getUpgradeCostFromSimulation } from '../../economy/production.logic';

let warned = false;

function warnLegacyUsage() {
	if (__DEV__ && !warned) {
		warned = true;
		console.warn('[deprecated] building.upgrades#getUpgradeCost is a legacy adapter. Import from game/economy/production.logic instead.');
	}
}

/** @deprecated Use production.logic#getUpgradeCost as the simulation source of truth. */
export function getUpgradeCost(instance: BuildingInstance, toLevel: number) {
	warnLegacyUsage();
	return getUpgradeCostFromSimulation(instance, toLevel);
}

