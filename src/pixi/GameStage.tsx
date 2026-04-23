import React, { useEffect, useState } from 'react';

import { Container } from '@pixi/react';
import { IsoTerrainLayer } from './layers/IsoTerrainLayer';
import { IsoBuildingLayer } from './layers/IsoBuildingLayer';
import { IsoWorkerLayer } from './layers/IsoWorkerLayer';

import { useGameStore } from '../store/game.store';
import { useUIStore } from '../store/ui.store';
import { getIsoHit } from '../game/iso/iso.hit-test';
import { useRenderWorld } from './hooks/useRenderWorld';

export function GameStage() {
  const advanceTick = useGameStore(state => state.advanceTick);
  const togglePlayPause = useGameStore(state => state.togglePlayPause);
  const placeBuildingAt = useGameStore(state => state.placeBuildingAt);
  const selectedBuildingToPlace = useUIStore(state => state.selectedBuildingToPlace);
  const selectBuildingToPlace = useUIStore(state => state.selectBuildingToPlace);

  const world = useRenderWorld();

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

  const handlePointerDown = (e: any) => {
    if (!selectedBuildingToPlace) return;

    const centerX = window.innerWidth / 2;
    const centerY = window.innerHeight / 4;

    const hit = getIsoHit(
      e.data.global.x,
      e.data.global.y,
      world,
      centerX,
      centerY,
      1, // zoom
      64, // tileWidth
      32  // tileHeight
    );

    if (hit.tileId && !hit.buildingId && !hit.workerId) {
      placeBuildingAt("player_1", selectedBuildingToPlace, hit.tileId);
      selectBuildingToPlace(null);
    }
  };

  return (
    <Container
       x={window.innerWidth / 2}
       y={window.innerHeight / 4} // adjust to center iso map better
       sortableChildren={true}
       interactive={true}
       pointerdown={handlePointerDown}
    >
        <IsoTerrainLayer tiles={world.tiles} />
        <IsoBuildingLayer buildings={world.buildings} />
        <IsoWorkerLayer workers={world.workers} />
    </Container>
  );
}
