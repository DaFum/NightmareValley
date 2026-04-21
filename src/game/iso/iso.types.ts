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

export type VisualState = {
  state: "idle" | "working" | "blocked" | "moving";
  variant: number;
  selected: boolean;
  hovered: boolean;
  animation: string;
  effectFlags: string[];
};

export type IsoBuildingRenderData = {
  id: string;
  type: string;
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
  variant: number;
  buildStage: 0 | 1 | 2 | 3 | 4;
  state:
    | "planned"
    | "underConstruction"
    | "idle"
    | "waitingForInput"
    | "working"
    | "outputBlocked"
    | "upgrading"
    | "damaged"
    | "disabled";
  selected: boolean;
  hovered: boolean;
  statusIcons: string[];
  effectFlags: string[];
  inputFill?: number;
  outputFill?: number;
};

export type IsoWorkerRenderData = {
  id: string;
  type: string;
  worldX: number;
  worldY: number;
  prevWorldX: number;
  prevWorldY: number;
  screenX: number;
  screenY: number;
  footX: number;
  footY: number;
  zIndex: number;
  dir: "NE" | "NW" | "SE" | "SW";
  animation:
    | "idle"
    | "walk"
    | "carry"
    | "pickup"
    | "dropoff"
    | "work"
    | "blocked";
  carrying?: string;
  tool?: string;
  selected: boolean;
  hovered: boolean;
  state:
    | "idle"
    | "walking"
    | "carrying"
    | "working"
    | "waiting"
    | "blocked";
  variant: number;
};
