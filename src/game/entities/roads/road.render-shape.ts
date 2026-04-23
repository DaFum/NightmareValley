import { RoadSegment } from './road.types';

export function roadShapeForSegment(seg: RoadSegment) {
	// Return a simple diamond polygon for isometric rendering
	const { x, y } = seg.position as any;
	const size = 1;
	return [
		{ x: x, y: y - size },
		{ x: x + size, y: y },
		{ x: x, y: y + size },
		{ x: x - size, y: y },
	];
}


