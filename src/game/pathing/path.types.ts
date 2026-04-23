import { Position } from "../core/game.types";

export interface Path {
  points: Position[];
  cost: number;
  isComplete: boolean;
}

export interface PathingGrid {
  width: number;
  height: number;
  nodes: number[]; // 1 = walkable, 0 = obstacle
}
