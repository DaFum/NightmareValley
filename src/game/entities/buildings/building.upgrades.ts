import { BuildingInstance } from '../../core/game.types';
import { getUpgradeCost as getUpgradeCostFromSimulation } from '../../economy/production.logic';

/** @deprecated Use production.logic#getUpgradeCost as the simulation source of truth. */
export function getUpgradeCost(instance: BuildingInstance, toLevel: number) {
	return getUpgradeCostFromSimulation(instance, toLevel);
}
