import { parseTiledMap } from "./tiled.adapter";
import { TerritoryState } from "../core/game.types";
import { generateProceduralTiledMap } from "./procedural";

export function loadInitialMap(): TerritoryState {
  const map = generateProceduralTiledMap({ width: 48, height: 48, seed: 1337 });
  return parseTiledMap(map);
}
