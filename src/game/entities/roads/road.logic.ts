import { EconomySimulationState } from '../../core/economy.simulation';
import { RoadNetwork, RoadSegment } from './road.types';
import { canPlaceRoadForPlayer, isRemovableRoadTile } from './road.validation';
import { BuildingInstance, MapTile, Position } from '../../core/game.types';

export function addRoadSegment(network: RoadNetwork, x: number, y: number): RoadNetwork {
	const id = `road_${x}_${y}`;
	if (network.segments[id]) return network;
	return {
		...network,
		segments: {
			...network.segments,
			[id]: { id, position: { x, y }, connections: [] } as RoadSegment,
		},
	};
}

export function removeRoadSegment(network: RoadNetwork, id: string): RoadNetwork {
	if (!network.segments[id]) return network;
	const newSegments: Record<string, RoadSegment> = {};
	for (const [segId, seg] of Object.entries(network.segments)) {
		if (segId === id) continue;
		const filteredConnections = seg.connections.filter(c => c !== id);
		newSegments[segId] =
			filteredConnections.length === seg.connections.length ? seg : { ...seg, connections: filteredConnections };
	}
	return {
		...network,
		segments: newSegments,
	};
}

export function placeRoadTile(
	state: EconomySimulationState,
	ownerId: string,
	tileId: string
): EconomySimulationState {
	const tile = state.territory.tiles[tileId];
	if (!tile) throw new Error(`Unknown road tile: ${tileId}`);

	const placement = canPlaceRoadForPlayer(state.territory, tile.position.x, tile.position.y, ownerId);
	if (!placement.ok) throw new Error(`Cannot place road at ${tile.position.x},${tile.position.y}: ${placement.reason}`);

	const nextTile = {
		...tile,
		ownerId,
		terrain: 'scarPath' as const,
		tier: 'dirt' as const,
	};

	const buildings = { ...state.buildings };
	for (const building of Object.values(state.buildings)) {
		if (building.ownerId !== ownerId) continue;
		const distance =
			Math.abs(building.position.x - tile.position.x) +
			Math.abs(building.position.y - tile.position.y);
		if (distance <= 1 && !building.connectedToRoad) {
			buildings[building.id] = { ...building, connectedToRoad: true };
		}
	}

	return {
		...state,
		buildings,
		territory: {
			...state.territory,
			tiles: {
				...state.territory.tiles,
				[tileId]: nextTile,
			},
		},
	};
}

export function removeRoadTile(
	state: EconomySimulationState,
	ownerId: string,
	tileId: string
): EconomySimulationState {
	const tile = state.territory.tiles[tileId];
	if (!tile) throw new Error(`Unknown road tile: ${tileId}`);
	if (tile.ownerId !== ownerId) throw new Error(`Cannot remove road from unowned tile ${tileId}`);
	if (!isRemovableRoadTile(tile)) throw new Error(`Tile ${tileId} is not a removable road`);
	if (tile.buildingId) throw new Error(`Cannot remove road under building ${tile.buildingId}`);

	return {
		...state,
		territory: {
			...state.territory,
			tiles: {
				...state.territory.tiles,
				[tileId]: {
					...tile,
					terrain: 'scarredEarth' as const,
					tier: 'grass' as const,
				},
			},
		},
	};
}

function isRoadTile(tile: MapTile | undefined): boolean {
	return !!tile && (tile.terrain === 'scarPath' || tile.tier === 'dirt' || tile.tier === 'cobble' || tile.tier === 'paved');
}

function adjacentRoadTileIds(state: EconomySimulationState, position: Position): string[] {
	const ids: string[] = [];
	const offsets = [
		{ x: 1, y: 0 },
		{ x: -1, y: 0 },
		{ x: 0, y: 1 },
		{ x: 0, y: -1 },
	];
	for (const offset of offsets) {
		const id = state.territory.tileIndex?.[`${position.x + offset.x},${position.y + offset.y}`];
		if (id && isRoadTile(state.territory.tiles[id])) ids.push(id);
	}
	return ids;
}

export function areBuildingsRoadConnected(
	state: EconomySimulationState,
	source: BuildingInstance,
	target: BuildingInstance
): boolean {
	if (!source.connectedToRoad || !target.connectedToRoad) return false;
	if (!state.territory.tileIndex || Object.keys(state.territory.tiles).length === 0) return true;

	const sourceEntrances = adjacentRoadTileIds(state, source.position);
	const targetEntrances = new Set(adjacentRoadTileIds(state, target.position));

	// Legacy starter maps can have connected buildings before explicit road tiles exist.
	if (sourceEntrances.length === 0 && targetEntrances.size === 0) return true;
	if (sourceEntrances.length === 0 || targetEntrances.size === 0) return false;

	const queue = [...sourceEntrances];
	const visited = new Set(queue);
	while (queue.length > 0) {
		const tileId = queue.shift()!;
		if (targetEntrances.has(tileId)) return true;
		const tile = state.territory.tiles[tileId];
		if (!tile) continue;
		for (const neighborId of adjacentRoadTileIds(state, tile.position)) {
			if (visited.has(neighborId)) continue;
			visited.add(neighborId);
			queue.push(neighborId);
		}
	}

	return false;
}

export function getRoadConnectionDiagnostic(
	state: EconomySimulationState,
	source: BuildingInstance,
	target: BuildingInstance
): string | null {
	if (areBuildingsRoadConnected(state, source, target)) return null;
	if (!source.connectedToRoad) return `${source.type} has no road entrance`;
	if (!target.connectedToRoad) return `${target.type} has no road entrance`;
	return `${source.type} and ${target.type} are on disconnected roads`;
}


