import { Position } from "../core/game.types";
import { Path, PathingGrid } from "./path.types";

interface AStarNode {
  x: number;
  y: number;
  f: number;
  g: number;
  h: number;
  parent: AStarNode | null;
}

export function findPathAStar(
  grid: PathingGrid,
  start: Position,
  goal: Position
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

  const startNode: AStarNode = {
    x: start.x,
    y: start.y,
    f: 0,
    g: 0,
    h: Math.abs(start.x - goal.x) + Math.abs(start.y - goal.y),
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

      const g = current.g + 1; // Distance to neighbor is always 1 (no diagonals)
      const h = Math.abs(neighbor.x - goal.x) + Math.abs(neighbor.y - goal.y);
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
