import { PathingGrid } from "./path.types";
import { TerritoryState } from "../core/game.types";

export function createGridFromTerritory(
  territory: TerritoryState,
  width: number,
  height: number
): PathingGrid {
  const nodes = new Array(width * height).fill(0);

  // For the MVP, we assume all territory tiles are walkable
  // unless there's a specific obstacle check. Let's just make everything
  // walkable except explicit blocking buildings if needed later.

  for (const tile of Object.values(territory.tiles)) {
    if (tile.position.x >= 0 && tile.position.x < width &&
        tile.position.y >= 0 && tile.position.y < height) {
      nodes[tile.position.y * width + tile.position.x] = 1;
    }
  }

  return { width, height, nodes };
}
