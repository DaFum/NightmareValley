import { EconomySimulationState } from '../core/economy.simulation';

export type WorldEventSeverity = 'info' | 'warning' | 'danger';

export type WorldEventLogEntry = {
	id: string;
	age: number;
	title: string;
	description: string;
	severity: WorldEventSeverity;
};

/**
 * WorldState now embeds the full economy simulation state so world ticks and
 * game loops operate against a single source of truth.
 */
export interface WorldState extends EconomySimulationState {
	seed: number;
	lastDeltaSec: number;
	scenarioProfile?: 'sandbox' | 'challenging' | 'hardcore';
	biomeModifier?: number;
	events?: {
		lastEventStep: number;
		log: WorldEventLogEntry[];
	};
	temporaryModifiers?: {
		productionBoost?: number;
		expiresAtAge?: number;
	};
}
