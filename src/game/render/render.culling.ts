import { IsoTileRenderData } from './render.types';

export type IsoViewportBounds = {
  minX: number;
  maxX: number;
  minY: number;
  maxY: number;
};

export type IsoViewportInput = {
  cameraX: number;
  cameraY: number;
  centerX: number;
  centerY: number;
  viewportWidth: number;
  viewportHeight: number;
  zoom: number;
  padding?: number;
};

export type IsoScreenPoint = {
  screenX: number;
  screenY: number;
};

export function getIsoViewportBounds({
  cameraX,
  cameraY,
  centerX,
  centerY,
  viewportWidth,
  viewportHeight,
  zoom,
  padding = 0,
}: IsoViewportInput): IsoViewportBounds {
  const safeZoom = Number.isFinite(zoom) && zoom > 0 ? zoom : 1;
  const safePadding = Number.isFinite(padding) ? Math.max(0, padding) : 0;

  return {
    minX: (-centerX - cameraX - safePadding) / safeZoom,
    maxX: (viewportWidth - centerX - cameraX + safePadding) / safeZoom,
    minY: (-centerY - cameraY - safePadding) / safeZoom,
    maxY: (viewportHeight - centerY - cameraY + safePadding) / safeZoom,
  };
}

export function isIsoPointInBounds(point: IsoScreenPoint, bounds: IsoViewportBounds): boolean {
  return (
    point.screenX >= bounds.minX &&
    point.screenX <= bounds.maxX &&
    point.screenY >= bounds.minY &&
    point.screenY <= bounds.maxY
  );
}

export function filterIsoTilesInBounds(
  tiles: readonly IsoTileRenderData[],
  bounds: IsoViewportBounds,
): IsoTileRenderData[] {
  return tiles.filter((tile) => isIsoPointInBounds(tile, bounds));
}
