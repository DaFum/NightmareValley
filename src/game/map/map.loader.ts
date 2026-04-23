import { parseTiledMap } from "./tiled.adapter";
import { TerritoryState } from "../core/game.types";
import { generateProceduralTiledMap } from "./procedural";

export function loadInitialMap(): TerritoryState {
  const map = generateProceduralTiledMap({ width: 64, height: 64 });
  return parseTiledMap(map);
}
