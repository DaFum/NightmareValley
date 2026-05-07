import { ISO_TILE_HEIGHT, ISO_TILE_WIDTH } from '../../game/iso/iso.constants';
import { screenToIsoTile } from '../../game/iso/iso.inverse';
import { tileToScreen } from '../../game/iso/iso.project';
import { getIsoHit } from '../../game/iso/iso.hit-test';
import { IsoRenderWorld } from '../../game/render/render.types';

export function isoTileToScreen(tileX: number, tileY: number) {
  return tileToScreen(tileX, tileY, ISO_TILE_WIDTH, ISO_TILE_HEIGHT);
}

export function isoScreenToTile(screenX: number, screenY: number, cameraX: number, cameraY: number, zoom: number) {
  return screenToIsoTile(screenX, screenY, cameraX, cameraY, zoom, ISO_TILE_WIDTH, ISO_TILE_HEIGHT);
}

export function getIsoPointerHit(
  screenX: number,
  screenY: number,
  world: IsoRenderWorld,
  cameraX: number,
  cameraY: number,
  zoom: number,
) {
  return getIsoHit(screenX, screenY, world, cameraX, cameraY, zoom, ISO_TILE_WIDTH, ISO_TILE_HEIGHT);
}

export function isoDiamondPoints(centerX: number, centerY: number): number[] {
  return [
    centerX, centerY - ISO_TILE_HEIGHT / 2,
    centerX + ISO_TILE_WIDTH / 2, centerY,
    centerX, centerY + ISO_TILE_HEIGHT / 2,
    centerX - ISO_TILE_WIDTH / 2, centerY,
  ];
}
