import { RoadSegment } from './road.types';

export function neighborKey(x: number, y: number) {
	return `road_${x}_${y}`;
}

export function connectSegments(a: RoadSegment, b: RoadSegment) {
	if (!a.connections.includes(b.id)) a.connections.push(b.id);
	if (!b.connections.includes(a.id)) b.connections.push(a.id);
}


