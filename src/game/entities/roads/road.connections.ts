import { RoadSegment } from './road.types';

export function neighborKey(x: number, y: number) {
	return `road_${x}_${y}`;
}

export function connectSegments(a: RoadSegment, b: RoadSegment): [RoadSegment, RoadSegment] {
	if (a.id === b.id) return [a, b];

	const newConnectionsA = a.connections.includes(b.id) ? a.connections : [...a.connections, b.id];
	const newConnectionsB = b.connections.includes(a.id) ? b.connections : [...b.connections, a.id];

	return [
		{ ...a, connections: newConnectionsA },
		{ ...b, connections: newConnectionsB },
	];
}


