import React from 'react';
import { Container, Sprite } from '@pixi/react';
import { useRenderWorld } from '../hooks/useRenderWorld';
import { useTextures } from '../utils/textureRegistry';

export function IsoBuildingLayer() {
  const world = useRenderWorld();
  const { registry } = useTextures();

  // Sort by zIndex
  const sortedBuildings = [...world.buildings].sort((a, b) => a.zIndex - b.zIndex);

  return (
    <Container>
      {sortedBuildings.map((building) => {
        const texture = registry.getTexture(`buildings_stage4_${building.type}`);

        if (!texture) return null;

        return (
          <Sprite
            key={building.id}
            texture={texture}
            x={building.screenX}
            y={building.screenY}
            anchor={{ x: 0.5, y: 0.5 }}
          />
        );
      })}
    </Container>
  );
}
