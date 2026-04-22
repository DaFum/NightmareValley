import React from 'react';
import { Container, Sprite } from '@pixi/react';
import { useRenderWorld } from '../hooks/useRenderWorld';
import { useTextures } from '../utils/textureRegistry';

export function IsoWorkerLayer() {
  const world = useRenderWorld();
  const { registry } = useTextures();

  // Sort by zIndex
  const sortedWorkers = [...world.workers].sort((a, b) => a.zIndex - b.zIndex);

  return (
    <Container>
      {sortedWorkers.map((worker) => {
        // Fallback for worker texture
        const texture = registry.getTexture(`workers_${worker.type}_idle_SE_01`) || registry.getTexture('workers_burdenThrall_idle_SE_01');

        if (!texture) return null;

        return (
          <Sprite
            key={worker.id}
            texture={texture}
            x={worker.screenX}
            y={worker.screenY}
            anchor={{ x: 0.5, y: 0.5 }}
          />
        );
      })}
    </Container>
  );
}
