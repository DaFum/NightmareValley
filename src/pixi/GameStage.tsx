import React from 'react';

import { Container, Sprite } from '@pixi/react';
import { useTextures } from './utils/textureRegistry';
import { useGameStore } from '../store/game.store';
import { useGameLoop } from './hooks/useGameLoop';
import { tileToScreen } from '../game/iso/iso.project';

export function GameStage() {
  const { registry } = useTextures();
  const buildings = useGameStore((state) => state.gameState.buildings);
  const workers = useGameStore((state) => state.gameState.workers);

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

        const pos = tileToScreen(building.position.x, building.position.y, 128, 64);

        return (
          <Sprite
            key={building.id}
            texture={tex}
            x={pos.x}
            y={pos.y}
            anchor={{ x: 0.5, y: 0.5 }}
          />
        );
      })}

      {Object.values(workers).map((worker) => {
        // Fallback or explicit worker texture
        const textureKey = `worker_${worker.type}`;
        const tex = registry.getTexture(textureKey) || registry.getTexture('worker_burdenThrall');
        if (!tex) return null;

        const pos = tileToScreen(worker.position.x, worker.position.y, 128, 64);

        return (
          <Sprite
            key={worker.id}
            texture={tex}
            x={pos.x}
            y={pos.y}
            anchor={{ x: 0.5, y: 1.0 }} // Workers usually anchored at bottom-center
          />
        );
      })}
    </Container>
  );
}
