export type IsoFootprint = {
  footX: number;
  footY: number;
};

export type BuildingFootprint = {
  width: number;
  height: number;
  blockedTiles: Array<{ x: number; y: number }>;
  anchor: { x: number; y: number };
};

export type IsoBuildingRenderData = {
  id: string;
  tileX: number;
  tileY: number;
  widthTiles: number;
  heightTiles: number;
  originTileX: number;
  originTileY: number;
  screenX: number;
  screenY: number;
  footX: number;
  footY: number;
  zIndex: number;
  spriteKey: string;
  selected: boolean;
  state: "idle" | "working" | "blocked";
};

export type IsoWorkerRenderData = {
  id: string;
  worldX: number;
  worldY: number;
  screenX: number;
  screenY: number;
  footX: number;
  footY: number;
  zIndex: number;
  dir: "NE" | "NW" | "SE" | "SW";
  animation: "idle" | "walk" | "carry";
  carrying?: string;
};
