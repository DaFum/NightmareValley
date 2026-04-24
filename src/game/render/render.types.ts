
import { TileTier } from "../core/game.types";

export type IsoTileRenderData = {
  id: string;
  screenX: number;
  screenY: number;
  textureKey: string;
  chunkId: string;
  resourceDeposit?: import("../core/economy.types").ResourceInventory;
  footfall: number;
  tier: TileTier;
};
import { IsoBuildingRenderData, IsoWorkerRenderData } from "../iso/iso.types";

export type RenderBloodSmeltery = {
  id: string;
  x: number;
  y: number;
  zIndex: number;

  buildStage: 0 | 1 | 2 | 3 | 4;

  state:
    | "planned"
    | "underConstruction"
    | "idle"
    | "heatingUp"
    | "working"
    | "waitingForCoal"
    | "waitingForOre"
    | "outputBlocked"
    | "upgrading"
    | "damaged"
    | "destroyed";

  oreFill: number;
  coalFill: number;
  outputFill: number;

  fireIntensity: number;
  smokeIntensity: number;
  selected: boolean;
  hovered: boolean;
  integrity: number;
};

export type IsoRenderWorld = {
  tiles: IsoTileRenderData[];
  buildings: IsoBuildingRenderData[];
  workers: IsoWorkerRenderData[];
};
