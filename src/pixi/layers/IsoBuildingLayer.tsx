import React from 'react';
import { Container, Sprite } from '@pixi/react';
import { useTextures } from '../utils/textureRegistry';
import { IsoRenderWorld } from '../../game/render/render.types';

interface IsoBuildingLayerProps {
  buildings: IsoRenderWorld['buildings'];
}

export function IsoBuildingLayer({ buildings }: IsoBuildingLayerProps) {
  const { registry } = useTextures();

  // No need to sort if the parent Container has sortableChildren=true,
  // but we must set the zIndex on the sprites.

  return (
    <>
      {buildings.map((building) => {
        const stage = building.buildStage ?? 4;
        const texture = registry.getTexture(`buildings_stage${stage}_${building.type}`);

        if (!texture) return null;

        return (
          <Sprite
            key={building.id}
            texture={texture}
            x={building.screenX}
            y={building.screenY}
            anchor={{ x: 0.5, y: 0.75 }}
            zIndex={building.zIndex}
          />
        );
      })}
    </>
  );
}
