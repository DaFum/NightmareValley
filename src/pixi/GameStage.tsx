import React from 'react';

import { Container, Sprite } from '@pixi/react';
import { useTextures } from './utils/textureRegistry';
import { useGameStore } from '../store/game.store';
import { useGameLoop } from './hooks/useGameLoop';

export function GameStage() {
  const { registry } = useTextures();
  const buildings = useGameStore((state) => state.gameState.buildings);

  // Initialize the game loop hook
  useGameLoop();

  return (
    <Container x={window.innerWidth / 2} y={window.innerHeight / 2}>
      {Object.values(buildings).map((building) => {
        // e.g. buildings_stage4_organHarvester
        const stage = building.constructionProgress && building.constructionProgress < 100
          ? `stage${Math.floor((building.constructionProgress / 100) * 3)}`
          : 'stage4';

        const textureKey = `buildings_${stage}_${building.type}`;
        const tex = registry.getTexture(textureKey);

        if (!tex) return null;

        // Super basic isometric pseudo-positioning for rendering
        // In Cartesian, but rendering logic usually projects to isometric.
        // As a temporary visualization, we'll just offset by building positions.
        const xOffset = building.position.x * 64 - building.position.y * 64;
        const yOffset = building.position.x * 32 + building.position.y * 32;

        return (
          <Sprite
            key={building.id}
            texture={tex}
            x={xOffset}
            y={yOffset}
            anchor={{ x: 0.5, y: 0.5 }}
          />
        );
      })}
    </Container>
  );
}
