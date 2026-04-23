import mapData from "../../assets/maps/nightmare_valley.json";
import { parseTiledMap } from "./tiled.adapter";
import { TerritoryState } from "../core/game.types";
import { TiledMapData } from "./map.types";

export function loadInitialMap(): TerritoryState {
  // Cast JSON data to our type to satisfy TS compiler
  return parseTiledMap(mapData as TiledMapData);
}
