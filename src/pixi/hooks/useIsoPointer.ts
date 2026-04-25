import { useCallback } from 'react';
import { getIsoHit } from '../../game/iso/iso.hit-test';
import { ISO_TILE_HEIGHT, ISO_TILE_WIDTH } from '../../game/iso/iso.constants';
import type { IsoRenderWorld } from '../../game/render/render.types';

interface IsoPointerInput {
  world: IsoRenderWorld;
  centerX: number;
  centerY: number;
  cameraX: number;
  cameraY: number;
  zoom: number;
}

export function useIsoPointer({ world, centerX, centerY, cameraX, cameraY, zoom }: IsoPointerInput) {
  return useCallback((screenX: number, screenY: number) => {
    const cx = centerX + cameraX;
    const cy = centerY + cameraY;
    return getIsoHit(screenX, screenY, world, cx, cy, zoom, ISO_TILE_WIDTH, ISO_TILE_HEIGHT);
  }, [cameraX, cameraY, centerX, centerY, world, zoom]);
}

export default useIsoPointer;
