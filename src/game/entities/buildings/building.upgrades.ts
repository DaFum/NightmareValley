import { BuildingInstance } from '../../core/game.types';
import { getUpgradeCost as getUpgradeCostFromSimulation } from '../../economy/production.logic';

/** Boundary helper: call from orchestrator/store code if deprecation telemetry is desired. */
export function emitUpgradeDeprecationWarning(): string {
	return '[deprecated] building.upgrades#getUpgradeCost is a legacy adapter. Import from game/economy/production.logic instead.';
}

/** @deprecated Use production.logic#getUpgradeCost as the simulation source of truth. */
export function getUpgradeCost(instance: BuildingInstance, toLevel: number) {
	return getUpgradeCostFromSimulation(instance, toLevel);
}
