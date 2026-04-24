import { TerritoryState, PlayerState } from '../core/game.types';
import { OwnerId } from '../core/entity.ids';

export interface WorldState {
	tick: number;
	seed: number;
	territory: TerritoryState;
	players?: Record<OwnerId, PlayerState>;
}


