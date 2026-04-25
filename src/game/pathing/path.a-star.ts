import { Position, TerritoryState } from "../core/game.types";
import { Path, PathingGrid } from "./path.types";
import { createGridFromTerritory } from "./path.grid";

interface AStarNode {
  x: number;
  y: number;
  f: number;
  g: number;
  h: number;
  parent: AStarNode | null;
}

import { MapTile } from "../core/game.types";
import { DEFAULT_SIMULATION_CONFIG } from "../economy/balancing.constants";

export function findPathAStar(
  grid: PathingGrid,
  start: Position,
  goal: Position,
  state?: { territory?: TerritoryState },
  tileCost?: (tile: MapTile) => number
): Path {
  const { width, height, nodes } = grid;

  if (start.x === goal.x && start.y === goal.y) {
    return { points: [start], cost: 0, isComplete: true };
  }

  const isWalkable = (x: number, y: number) => {
    if (x < 0 || x >= width || y < 0 || y >= height) return false;
    return nodes[y * width + x] === 1;
  };

  if (!isWalkable(start.x, start.y) || !isWalkable(goal.x, goal.y)) {
    return { points: [], cost: 0, isComplete: false };
  }

  const openList: AStarNode[] = [];
  const closedSet: Set<string> = new Set();

  // Compute minEdgeCost once before any node is created so startNode.h uses the same
  // scaled heuristic as neighbor nodes, keeping A* admissible with tier speed multipliers.
  let minEdgeCost = 1.0;
  if (tileCost) {
    const maxMultiplier = Math.max(...Object.values(DEFAULT_SIMULATION_CONFIG.tierSpeedMultipliers || { paved: 2.0 }));
    minEdgeCost = 1 / (maxMultiplier || 1);
  }

  const startNode: AStarNode = {
    x: start.x,
    y: start.y,
    f: 0,
    g: 0,
    h: (Math.abs(start.x - goal.x) + Math.abs(start.y - goal.y)) * minEdgeCost,
    parent: null
  };
  startNode.f = startNode.g + startNode.h;

  openList.push(startNode);

  while (openList.length > 0) {
    // Find node with lowest f
    let currentIdx = 0;
    for (let i = 1; i < openList.length; i++) {
      if (openList[i].f < openList[currentIdx].f) {
        currentIdx = i;
      }
    }

    const current = openList[currentIdx];

    // Check if goal reached
    if (current.x === goal.x && current.y === goal.y) {
      const path: Position[] = [];
      let curr: AStarNode | null = current;
      while (curr !== null) {
        path.push({ x: curr.x, y: curr.y });
        curr = curr.parent;
      }
      return {
        points: path.reverse(),
        cost: current.g,
        isComplete: true
      };
    }

    // Move current from open to closed
    openList.splice(currentIdx, 1);
    closedSet.add(`${current.x},${current.y}`);

    // Generate neighbors (up, down, left, right)
    const neighbors = [
      { x: current.x, y: current.y - 1 },
      { x: current.x, y: current.y + 1 },
      { x: current.x - 1, y: current.y },
      { x: current.x + 1, y: current.y }
    ];

    for (const neighbor of neighbors) {
      if (!isWalkable(neighbor.x, neighbor.y)) continue;

      const key = `${neighbor.x},${neighbor.y}`;
      if (closedSet.has(key)) continue;


      let baseEdgeCost = 1;
      if (tileCost && state?.territory?.tileIndex) {
        const tileId = state.territory.tileIndex[`${neighbor.x},${neighbor.y}`];
        if (tileId) {
          const tile = state.territory.tiles[tileId];
          if (tile) {
            const costMult = tileCost(tile);
            if (costMult === Infinity) continue;
            baseEdgeCost *= costMult;
          }
        }
      }

      const g = current.g + baseEdgeCost; // Distance to neighbor

      // minEdgeCost is computed once before the while loop starts (see above).
      const h = (Math.abs(neighbor.x - goal.x) + Math.abs(neighbor.y - goal.y)) * minEdgeCost;
      const f = g + h;

      // Check if neighbor is already in open list with a lower g score
      let inOpenList = false;
      for (let i = 0; i < openList.length; i++) {
        if (openList[i].x === neighbor.x && openList[i].y === neighbor.y) {
          inOpenList = true;
          if (g < openList[i].g) {
            openList[i].g = g;
            openList[i].f = f;
            openList[i].parent = current;
          }
          break;
        }
      }

      if (!inOpenList) {
        openList.push({
          x: neighbor.x,
          y: neighbor.y,
          f,
          g,
          h,
          parent: current
        });
      }
    }
  }

  // No path found
  return { points: [], cost: 0, isComplete: false };
}

export function findPath(start: Position, goal: Position, state: { territory?: TerritoryState }, tileCost?: (tile: MapTile) => number): Path {
  const tiles = state?.territory ? Object.values(state.territory.tiles) : [];

  let width = 10;
  let height = 10;
  if (tiles && tiles.length > 0) {
    let maxX = 0;
    let maxY = 0;
    for (const t of tiles as any[]) {
      if (t.position.x > maxX) maxX = t.position.x;
      if (t.position.y > maxY) maxY = t.position.y;
    }
    width = maxX + 1;
    height = maxY + 1;
  }

  const grid = createGridFromTerritory((state?.territory ?? { tiles: {} }) as TerritoryState, width, height);
  return findPathAStar(grid, start, goal, state, tileCost);
}

export function tierTileCost(tile: MapTile): number {
  const multipliers = DEFAULT_SIMULATION_CONFIG.tierSpeedMultipliers || { grass: 1.0, dirt: 1.2, cobble: 1.5, paved: 2.0 };
  return 1 / (multipliers[tile.tier] || 1);
}

export function calculatePathDistance(path: Path): number {
  if (!path) return Number.POSITIVE_INFINITY;
  if (!path.isComplete) return Number.POSITIVE_INFINITY;
  if (typeof path.cost === 'number' && path.cost >= 0) return path.cost;
  return Math.max(0, (path.points?.length ?? 0) - 1);
}
