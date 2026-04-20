import { IsoBuildingRenderData, IsoWorkerRenderData } from "../iso/iso.types";

export type IsoRenderWorld = {
  tiles: Array<{
    id: string;
    screenX: number;
    screenY: number;
    textureKey: string;
    chunkId: string;
  }>;
  buildings: IsoBuildingRenderData[];
  workers: IsoWorkerRenderData[];
};
