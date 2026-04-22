import React, { useEffect, useState } from 'react';

import { Container } from '@pixi/react';
import { IsoTerrainLayer } from './layers/IsoTerrainLayer';
import { IsoBuildingLayer } from './layers/IsoBuildingLayer';
import { IsoWorkerLayer } from './layers/IsoWorkerLayer';

import { useGameStore } from '../store/game.store';

export function GameStage() {
  const { advanceTick, togglePlayPause, isRunning } = useGameStore();

  useEffect(() => {
    // Simple game loop
    let lastTime = performance.now();
    let animationFrameId: number;

    const loop = (time: number) => {
      const deltaMs = time - lastTime;
      lastTime = time;

      const deltaSec = deltaMs / 1000;
      // Cap deltaSec to avoid huge jumps

      if (useGameStore.getState().isRunning) {
        advanceTick(Math.min(deltaSec, 0.1));
      }

      animationFrameId = requestAnimationFrame(loop);
    };

    animationFrameId = requestAnimationFrame(loop);

    return () => {
      cancelAnimationFrame(animationFrameId);
    };
  }, [advanceTick]);

  useEffect(() => {
    // Auto-start game on mount if it's not running
    if (!useGameStore.getState().isRunning) {
        togglePlayPause();
    }
  }, [togglePlayPause]);

  return (
    <Container
       x={window.innerWidth / 2}
       y={window.innerHeight / 4} // adjust to center iso map better
       sortableChildren={true}
    >
        <IsoTerrainLayer />
        <IsoBuildingLayer />
        <IsoWorkerLayer />
    </Container>
  );
}
