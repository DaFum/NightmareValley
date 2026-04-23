import React from 'react';
import { Container, Sprite } from '@pixi/react';
import { useTextures } from '../utils/textureRegistry';
import { IsoRenderWorld } from '../../game/render/render.types';

interface IsoWorkerLayerProps {
  workers: IsoRenderWorld['workers'];
}

export function IsoWorkerLayer({ workers }: IsoWorkerLayerProps) {
  const { registry } = useTextures();

  // No need to sort if the parent Container has sortableChildren=true,
  // but we must set the zIndex on the sprites.

  return (
    <>
      {workers.map((worker) => {
        // Build the specific texture key, fallback to a safe default
        const computedKey = `workers_${worker.type}_${worker.animation}_${worker.dir}_01`;
        const defaultKey = 'workers_burdenThrall_idle_SE_01';

        const texture = registry.getTexture(computedKey) || registry.getTexture(defaultKey);

        if (!texture) return null;

        return (
          <Sprite
            key={worker.id}
            texture={texture}
            x={worker.screenX}
            y={worker.screenY}
            anchor={{ x: 0.5, y: 1.0 }}
            zIndex={worker.zIndex}
          />
        );
      })}
    </>
  );
}
