import { Position } from "../core/game.types";
import { distance } from "../core/economy.simulation";
import { EconomySimulationState } from "../core/economy.simulation";

// Since roadNodes was partially stubbed, we'll implement a simple A* for transport
// prioritizing road nodes over standard terrain.
// A* Pathfinding:
export function findPath(
  start: Position,
  goal: Position,
  state: EconomySimulationState
): Position[] {
  // Very simplistic fallback if we don't need real obstacles yet:
  // We just return a direct line for now until a full grid system is present.

  // Real implementation would look at state.territory.tiles to check buildability/obstacles
  // and prioritize state.transport.roadNodes

  const path: Position[] = [];
  path.push(start);
  path.push(goal);
  return path;
}

export function calculatePathDistance(path: Position[]): number {
    if (!path || path.length < 2) return 0;
    let dist = 0;
    for (let i = 0; i < path.length - 1; i++) {
        dist += distance(path[i], path[i+1]);
    }
    return dist;
}
