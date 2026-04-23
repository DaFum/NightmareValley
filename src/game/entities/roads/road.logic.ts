import { RoadNetwork, RoadSegment } from './road.types';

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


