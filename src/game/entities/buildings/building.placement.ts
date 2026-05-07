import { TerritoryState } from '../../core/game.types';
import { canPlaceBuildingFootprint } from '../../core/economy.simulation';

/** @deprecated Use simulation selectors + core isTileBuildableForPlayer for authoritative placement checks. */
export function canPlaceBuilding(territory: TerritoryState, playerId: string, tx: number, ty: number, width = 1, height = 1) {
	return canPlaceBuildingFootprint(territory, playerId, tx, ty, undefined, width, height);
}
