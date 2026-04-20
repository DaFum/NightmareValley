import { IsoFootprint } from "./iso.types";

export function getIsoDepth(screenX: number, screenY: number): number {
  return screenY;
}

export function getEntityZIndex(foot: IsoFootprint): number {
  return foot.footY;
}
