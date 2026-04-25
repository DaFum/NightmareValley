import { EconomySimulationState } from '../core/economy.simulation';

/**
 * WorldState now embeds the full economy simulation state so world ticks and
 * game loops operate against a single source of truth.
 */
export interface WorldState extends EconomySimulationState {
	seed: number;
	lastDeltaSec: number;
	scenarioProfile?: 'sandbox' | 'challenging' | 'hardcore';
	biomeModifier?: number;
	temporaryModifiers?: {
		productionBoost?: number;
		expiresAtAge?: number;
	};
}
