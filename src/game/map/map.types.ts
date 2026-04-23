import { Position } from "../core/game.types";

export interface TiledMapData {
  width: number;
  height: number;
  tilewidth: number;
  tileheight: number;
  layers: TiledLayer[];
  tilesets: TiledTileset[];
}

export interface TiledLayer {
  type: string;
  name: string;
  data?: number[];
  width?: number;
  height?: number;
}

export interface TiledTileset {
  firstgid: number;
  name: string;
  tiles?: TiledTileDef[];
}

export interface TiledTileDef {
  id: number;
  properties?: TiledProperty[];
}

export interface TiledProperty {
  name: string;
  type: string;
  value: any;
}
