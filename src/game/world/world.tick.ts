import { WorldState } from './world.types';
import { simulateTick } from '../core/economy.simulation';
import { DEFAULT_SIMULATION_CONFIG, SimulationConfig } from '../economy/balancing.constants';

export function tickWorld(
	world: WorldState,
	deltaSec = 1,
	config: SimulationConfig = DEFAULT_SIMULATION_CONFIG
): WorldState {
	const safeDelta = Number.isFinite(deltaSec) && deltaSec > 0 ? deltaSec : 0;
	if (safeDelta === 0) return world;
	const scenarioMultiplier = world.scenarioProfile === 'hardcore' ? 0.9 : world.scenarioProfile === 'sandbox' ? 1.15 : 1;
	const biomeModifier = Number.isFinite(world.biomeModifier) && (world.biomeModifier ?? 0) > 0 ? (world.biomeModifier as number) : 1;
	const temporaryProductionBoost = world.temporaryModifiers?.productionBoost ?? 1;
	const effectiveDelta = safeDelta * scenarioMultiplier * biomeModifier * temporaryProductionBoost;
	const next = simulateTick(world, effectiveDelta, config);
	const eventDue = Math.floor(world.ageOfTeeth / 120) < Math.floor(next.ageOfTeeth / 120);
	const expiredTemporary = world.temporaryModifiers?.expiresAtAge
		? next.ageOfTeeth >= world.temporaryModifiers.expiresAtAge
		: false;

	return {
		...next,
		seed: world.seed,
		lastDeltaSec: safeDelta,
		scenarioProfile: world.scenarioProfile,
		biomeModifier: world.biomeModifier,
		temporaryModifiers: expiredTemporary
			? eventDue
				? {
						productionBoost: 1.08,
						expiresAtAge: next.ageOfTeeth + 30,
					}
				: undefined
			: eventDue
				? {
						productionBoost: 1.08,
						expiresAtAge: next.ageOfTeeth + 30,
					}
				: world.temporaryModifiers,
	};
}
