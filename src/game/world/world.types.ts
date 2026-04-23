import { TerritoryState } from '../core/game.types';

export interface WorldState {
	tick: number;
	seed: number;
	territory: TerritoryState;
	players?: Record<string, any>;
}


