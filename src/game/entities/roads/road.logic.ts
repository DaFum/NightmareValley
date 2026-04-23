import { RoadNetwork, RoadSegment } from './road.types';

export function addRoadSegment(network: RoadNetwork, x: number, y: number) {
	const id = `road_${x}_${y}`;
	if (network.segments[id]) return network;
	network.segments[id] = { id, position: { x, y }, connections: [] } as RoadSegment;
	return network;
}

export function removeRoadSegment(network: RoadNetwork, id: string) {
	delete network.segments[id];
	for (const s of Object.values(network.segments)) {
		const i = s.connections.indexOf(id);
		if (i >= 0) s.connections.splice(i, 1);
	}
	return network;
}


