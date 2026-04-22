import React from 'react';

import { Container, Sprite } from '@pixi/react';
import { useTextures } from './utils/textureRegistry';

export function GameStage() {
  const { registry } = useTextures();

  const buildingTex = registry.getTexture('buildings_stage4_organHarvester');

  return (
    <Container x={window.innerWidth / 2} y={window.innerHeight / 2}>
      {buildingTex && (
        <Sprite

          texture={buildingTex}
          anchor={{ x: 0.5, y: 0.5 }}
        />
      )}
    </Container>
  );
}
