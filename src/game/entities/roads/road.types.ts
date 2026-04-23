import { Position } from '../../core/game.types';

export interface RoadSegment {
	id: string;
	position: Position;
	connections: string[];
}

export interface RoadNetwork {
	segments: Record<string, RoadSegment>;
}


