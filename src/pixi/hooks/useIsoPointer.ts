import { useCallback } from 'react';
import { getIsoPointerHit } from '../iso/iso.adapter';
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
    return getIsoPointerHit(screenX, screenY, world, cx, cy, zoom);
  }, [cameraX, cameraY, centerX, centerY, world, zoom]);
}

export default useIsoPointer;
