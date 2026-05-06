import { WorldState } from './world.types';
import { placeBuilding, simulateTick, syncStockFromVaults } from '../core/economy.simulation';
import { DEFAULT_SIMULATION_CONFIG, SimulationConfig } from '../economy/balancing.constants';
import { applyScheduledWorldEvents } from '../events/events.logic';
import { AiAction } from '../ai/ai.types';
import { runAiTick } from '../ai/ai.tick';
import { MapTile, PlayerState } from '../core/game.types';
import { BuildingType } from '../core/economy.types';
import { BUILDING_DEFINITIONS } from '../core/economy.data';

const AI_BUILDING_ALIASES: Record<string, BuildingType> = {
	milestone_grinder: 'fieldOfMouths',
};

function getPrimaryPlayer(state: WorldState): PlayerState | undefined {
	const playerIds = Object.keys(state.players);
	if (playerIds.length === 0) return undefined;
	const prioritized = playerIds.find((id) => state.players[id]?.buildings?.length);
	return state.players[prioritized ?? playerIds[0]];
}

function adjacentPositions(position: { x: number; y: number }) {
	return [
		{ x: position.x + 1, y: position.y },
		{ x: position.x - 1, y: position.y },
		{ x: position.x, y: position.y + 1 },
		{ x: position.x, y: position.y - 1 },
	];
}

function getTileAtPosition(state: WorldState, x: number, y: number): MapTile | undefined {
	const indexed = state.territory.tileIndex?.[`${x},${y}`];
	if (indexed) return state.territory.tiles[indexed];
	return Object.values(state.territory.tiles).find((tile) => tile.position.x === x && tile.position.y === y);
}

function getAiFrontier(state: WorldState, ownerId: string): MapTile[] {
	const frontier = new Map<string, MapTile>();
	const ownedTileIds = state.players[ownerId]?.territoryTileIds ?? [];

	for (const tileId of ownedTileIds) {
		const tile = state.territory.tiles[tileId];
		if (!tile || tile.ownerId !== ownerId) continue;

		for (const pos of adjacentPositions(tile.position)) {
			const neighbor = getTileAtPosition(state, pos.x, pos.y);
			if (!neighbor || neighbor.ownerId || neighbor.buildingId) continue;
			frontier.set(neighbor.id, neighbor);
		}
	}

	return Array.from(frontier.values()).sort((a, b) => a.id.localeCompare(b.id));
}

function resolveActionTileId(action: AiAction): string | null {
	if (action.type !== 'expand') return null;
	const tile = action.payload.tile;
	if (typeof tile === 'string') return tile;
	if (tile && typeof tile.id === 'string') return tile.id;
	return null;
}

function resolveActionBuildingType(action: AiAction): BuildingType | null {
	if (action.type !== 'build') return null;
	const requested = action.payload.what;
	if (requested in BUILDING_DEFINITIONS) return requested as BuildingType;
	return AI_BUILDING_ALIASES[requested] ?? null;
}

function findAiBuildTileId(state: WorldState, ownerId: string, buildingType: BuildingType): string | null {
	const definition = BUILDING_DEFINITIONS[buildingType];
	const player = state.players[ownerId];
	if (!definition || !player) return null;

	for (const tileId of player.territoryTileIds) {
		const tile = state.territory.tiles[tileId];
		if (!tile || tile.ownerId !== ownerId || tile.buildingId) continue;
		if (!definition.allowedTerrain.includes(tile.terrain)) continue;
		return tile.id;
	}

	return null;
}

function canClaimFrontierTile(state: WorldState, ownerId: string, tile: MapTile | undefined): tile is MapTile {
	if (!tile || tile.ownerId || tile.buildingId) return false;
	const ownedTileIds = state.players[ownerId]?.territoryTileIds ?? [];
	return ownedTileIds.some((tileId) => {
		const owned = state.territory.tiles[tileId];
		if (!owned || owned.ownerId !== ownerId) return false;
		return Math.abs(owned.position.x - tile.position.x) + Math.abs(owned.position.y - tile.position.y) === 1;
	});
}

function applyAiActions(state: WorldState, ownerId: string | undefined, actions: AiAction[]): { state: WorldState; appliedActions: AiAction[] } {
	if (!ownerId || !state.players[ownerId]) return { state, appliedActions: [] };

	let next = state;
	const appliedActions: AiAction[] = [];

	for (const action of actions) {
		if (action.type === 'build') {
			const buildingType = resolveActionBuildingType(action);
			const tileId = buildingType ? findAiBuildTileId(next, ownerId, buildingType) : null;
			if (!buildingType || !tileId) continue;

			try {
				const placed = placeBuilding(next, ownerId, buildingType, tileId);
				next = syncStockFromVaults({ ...next, ...placed } as WorldState) as WorldState;
				appliedActions.push(action);
			} catch {
				continue;
			}
		} else if (action.type === 'expand') {
			const tileId = resolveActionTileId(action);
			if (!tileId) continue;

			const tile = next.territory.tiles[tileId];
			if (!canClaimFrontierTile(next, ownerId, tile)) continue;

			next = {
				...next,
				players: {
					...next.players,
					[ownerId]: {
						...next.players[ownerId],
						territoryTileIds: Array.from(new Set([...next.players[ownerId].territoryTileIds, tile.id])),
					},
				},
				territory: {
					...next.territory,
					tiles: {
						...next.territory.tiles,
						[tile.id]: { ...tile, ownerId },
					},
				},
			};
			appliedActions.push(action);
		}
	}

	return { state: next, appliedActions };
}

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
	const expiredTemporary = world.temporaryModifiers?.expiresAtAge
		? next.ageOfTeeth >= world.temporaryModifiers.expiresAtAge
		: false;
	const aiPlayer = getPrimaryPlayer(next as WorldState);
	const aiResult = runAiTick(world.ai?.state ?? { seed: world.seed, tick: 0 }, {
		player: aiPlayer,
		frontier: aiPlayer ? getAiFrontier(next as WorldState, aiPlayer.id) : [],
		enemies: [],
	});

	const merged: WorldState = {
		...next,
		seed: world.seed,
		lastDeltaSec: safeDelta,
		scenarioProfile: world.scenarioProfile,
		biomeModifier: world.biomeModifier,
		events: world.events,
		ai: {
			state: aiResult.state,
			lastActions: aiResult.actions,
			appliedActions: [],
		},
		temporaryModifiers: expiredTemporary ? undefined : world.temporaryModifiers,
	};

	const appliedAi = applyAiActions(merged, aiPlayer?.id, aiResult.actions);
	return applyScheduledWorldEvents({
		...appliedAi.state,
		ai: {
			state: aiResult.state,
			lastActions: aiResult.actions,
			appliedActions: appliedAi.appliedActions,
		},
	});
}
