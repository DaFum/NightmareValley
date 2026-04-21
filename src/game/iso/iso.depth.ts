import { IsoFootprint } from "./iso.types";

export function getIsoDepth(_screenX: number, screenY: number): number {
  // _screenX kept for potential future tiebreaker usage
  return screenY;
}

export function getEntityZIndex(foot: IsoFootprint): number {
  return foot.footY;
}
