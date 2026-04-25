import { findPath, tierTileCost } from "../../game/pathing/path.a-star";
import { TerritoryState, MapTile } from "../../game/core/game.types";

describe("weighted A* pathfinding", () => {
  it("prefers a longer paved route over a shorter grass route", () => {
    // 5x4 grid with paved ('P') tiles forming a longer but cheaper route:
    // S . . . .
    // P . . . .
    // P P P T .
    // . . . . .
    // Start (0,0), Target (3,2)
    // Direct grass route cost: 5 steps × 1.0 = 5.0
    // Paved detour cost: 5 steps × 0.5 = 2.5  (preferred)

    const tiles: Record<string, MapTile> = {};
    const tileIndex: Record<string, string> = {};

    const addTile = (x: number, y: number, tier: "grass" | "dirt" | "cobble" | "paved") => {
      const id = `tile_${x}_${y}`;
      tiles[id] = { id, position: { x, y }, terrain: 'scarredEarth', tier, footfall: 0 } as MapTile;
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
    // The direct grass shortcut through (1,0),(2,0),(3,0) should NOT be taken
    const grassShortcut = [{ x: 1, y: 0 }, { x: 2, y: 0 }, { x: 3, y: 0 }];
    const pathStr = JSON.stringify(path.points);
    for (const pt of grassShortcut) {
      expect(pathStr).not.toContain(JSON.stringify(pt));
    }
  });
});
