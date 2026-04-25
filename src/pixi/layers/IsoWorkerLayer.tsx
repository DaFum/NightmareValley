import React from 'react';
import { Container, Sprite } from '@pixi/react';
import { useTextures } from '../utils/textureRegistry';
import { IsoRenderWorld } from '../../game/render/render.types';

interface IsoWorkerLayerProps {
  workers: IsoRenderWorld['workers'];
}

const WORKER_SCALE = 0.13;
const WORKER_ANCHOR = { x: 0.5, y: 1 } as const;
// Carry sprite is proportionally larger and offset upward relative to the worker scale
const CARRY_SCALE = WORKER_SCALE * (0.2 / 0.13);
const CARRY_OFFSET_Y = -Math.round(16 * (WORKER_SCALE / 0.13));

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

        const carryingTex = worker.carrying ? registry.getTexture(`resource_${worker.carrying}`) : undefined;

        return (
          <Container
            key={worker.id}
            x={worker.screenX}
            y={worker.screenY}
            zIndex={worker.zIndex}
            sortableChildren={true}
          >
            <Sprite
              texture={texture}
              anchor={WORKER_ANCHOR}
              scale={WORKER_SCALE}
              zIndex={0}
            />
            {carryingTex && (
              <Sprite
                texture={carryingTex}
                anchor={{ x: 0.5, y: 1 }}
                y={CARRY_OFFSET_Y}
                scale={CARRY_SCALE}
                zIndex={1}
              />
            )}
          </Container>
        );
      })}
    </>
  );
}
