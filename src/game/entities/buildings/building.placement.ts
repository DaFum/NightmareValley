import { TerritoryState } from '../../core/game.types';
import { getTileAt } from '../../map/map.query';

/** Boundary helper: call from orchestrator/store code if deprecation telemetry is desired. */
export function emitPlacementDeprecationWarning(): string {
	return '[deprecated] building.placement#canPlaceBuilding is a legacy helper. Use store/simulation.selectors + core simulation checks for new call sites.';
}

/** @deprecated Use simulation selectors + core isTileBuildableForPlayer for authoritative placement checks. */
export function canPlaceBuilding(territory: TerritoryState, playerId: string, tx: number, ty: number, width = 1, height = 1) {
	if (!Number.isFinite(width) || !Number.isFinite(height) || !Number.isInteger(width) || !Number.isInteger(height) || width <= 0 || height <= 0) return { ok: false, reason: 'invalid_footprint' };
	let originTileId: string | undefined;
	for (let y = ty; y < ty + height; y++) {
		for (let x = tx; x < tx + width; x++) {
			const t = getTileAt(territory, x, y);
			if (!t) return { ok: false, reason: 'out_of_bounds' };
			if (t.ownerId !== playerId) return { ok: false, reason: 'not_owner' };
			if (t.buildingId) return { ok: false, reason: 'occupied' };
			if (x === tx && y === ty) originTileId = t.id;
		}
	}
	return { ok: true, tileId: originTileId! } as const;
}
