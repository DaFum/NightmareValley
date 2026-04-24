import { RoadSegment } from './road.types';

export function neighborKey(x: number, y: number) {
	return `road_${x}_${y}`;
}

export function connectSegments(a: RoadSegment, b: RoadSegment): [RoadSegment, RoadSegment] {
	if (a.id === b.id) return [a, b];

	const setA = new Set(a.connections);
	setA.add(b.id);
	const newConnectionsA = Array.from(setA);

	const setB = new Set(b.connections);
	setB.add(a.id);
	const newConnectionsB = Array.from(setB);

	return [
		{ ...a, connections: newConnectionsA },
		{ ...b, connections: newConnectionsB },
	];
}


