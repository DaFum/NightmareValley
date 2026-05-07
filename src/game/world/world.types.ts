import { EconomySimulationState } from '../core/economy.simulation';
import { AiAction, AiState } from '../ai/ai.types';
import type { MilitaryRuntimeState } from '../military/military.types';

export type WorldEventSeverity = 'info' | 'warning' | 'danger';

export type WorldEventLogEntry = {
	id: string;
	age: number;
	title: string;
	description: string;
	severity: WorldEventSeverity;
};

export type WorldAiRuntime = {
	state: AiState;
	lastActions: AiAction[];
	appliedActions: AiAction[];
};

/**
 * WorldState now embeds the full economy simulation state so world ticks and
 * game loops operate against a single source of truth.
 */
export interface WorldState extends EconomySimulationState {
	seed: number;
	lastDeltaSec: number;
	aiOwnerId?: string;
	scenarioProfile?: 'sandbox' | 'challenging' | 'hardcore';
	biomeModifier?: number;
	events?: {
		lastEventStep: number;
		log: WorldEventLogEntry[];
	};
	ai?: WorldAiRuntime;
	military?: MilitaryRuntimeState;
	temporaryModifiers?: {
		productionBoost?: number;
		expiresAtAge?: number;
	};
}
