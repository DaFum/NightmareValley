import { findPath, tierTileCost } from "../../game/pathing/path.a-star";
import { TerritoryState, MapTile } from "../../game/core/game.types";

describe("weighted A* pathfinding", () => {
  it("prefers a longer paved route over a shorter grass route", () => {
    // Grid:
    // S D D D G
    // G G G D G
    // G G G T G
    // Start (0,0), Target (3,2)
    // Direct path: (0,0)->(1,0)->(2,0)->(3,0)->(3,1)->(3,2)
    // Path cost via dirt depends on tier speed multipliers.

    const tiles: Record<string, MapTile> = {};
    const tileIndex: Record<string, string> = {};

    const addTile = (x: number, y: number, tier: "grass" | "dirt" | "cobble" | "paved") => {
      const id = `tile_${x}_${y}`;
      tiles[id] = { id, position: { x, y }, tier, footfall: 0 } as MapTile;
      tileIndex[`${x},${y}`] = id;
    };

    // Fill grid with grass
    for (let x = 0; x < 5; x++) {
      for (let y = 0; y < 4; y++) {
        addTile(x, y, "grass");
      }
    }

    // Set a "paved" route that's longer but faster
    // Direct route (all grass): cost 1 each step. (0,0)->(1,0)->(1,1)->(2,1)->(3,1)->(3,2) = 5 steps = cost 5
    // Paved route (cost 0.5 each): (0,0) -> (0,1) -> (0,2) -> (1,2) -> (2,2) -> (3,2) = 5 steps * 0.5 = 2.5
    addTile(0, 1, "paved");
    addTile(0, 2, "paved");
    addTile(1, 2, "paved");
    addTile(2, 2, "paved");
    addTile(3, 2, "paved"); // target

    const state = {
      territory: { tiles, tileIndex } as TerritoryState
    };

    const start = { x: 0, y: 0 };
    const goal = { x: 3, y: 2 };

    const path = findPath(start, goal, state, tierTileCost);

    expect(path.isComplete).toBe(true);
    // Path should follow paved tiles
    expect(path.points).toContainEqual({ x: 0, y: 1 });
    expect(path.points).toContainEqual({ x: 0, y: 2 });
    expect(path.points).toContainEqual({ x: 1, y: 2 });
    expect(path.points).toContainEqual({ x: 2, y: 2 });
    expect(path.points).toContainEqual({ x: 3, y: 2 });
  });
});
