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
        // The manifest registers workers as `worker_<type>` (flat files),
        // so prefer that base key. Animated variant keys are not available
        // in the current sheets, so fall back to the base worker texture.
        const baseKey = `worker_${worker.type}`;
        const fallbackKey = 'worker_burdenThrall';

        const texture = registry.getTexture(baseKey) || registry.getTexture(fallbackKey);

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
