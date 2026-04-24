import React, { useEffect } from 'react';

import { Container } from '@pixi/react';
import { IsoTerrainLayer } from './layers/IsoTerrainLayer';
import { IsoBuildingLayer } from './layers/IsoBuildingLayer';
import { IsoWorkerLayer } from './layers/IsoWorkerLayer';

import { useGameStore } from '../store/game.store';
import { useUIStore } from '../store/ui.store';
import { getIsoHit } from '../game/iso/iso.hit-test';
import { useRenderWorld } from './hooks/useRenderWorld';

export function GameStage() {
  const advanceTick = useGameStore((state) => state.advanceTick);
  const togglePlayPause = useGameStore((state) => state.togglePlayPause);
  const placeBuildingAt = useGameStore((state) => state.placeBuildingAt);
  const selectedBuildingToPlace = useUIStore((state) => state.selectedBuildingToPlace);
  const selectBuildingToPlace = useUIStore((state) => state.selectBuildingToPlace);

  const world = useRenderWorld();

  useEffect(() => {
    // Simple game loop
    let lastTime: number | null = null;
    let animationFrameId: number;

    const loop = (time: number) => {
      if (lastTime === null) {
        lastTime = time;
        animationFrameId = requestAnimationFrame(loop);
        return;
      }
      const deltaMs = time - lastTime;
      lastTime = time;

      const deltaSec = deltaMs / 1000;

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

  const isBrowser = typeof window !== 'undefined';
  const centerX = isBrowser ? window.innerWidth / 2 : 512;
  const centerY = isBrowser ? window.innerHeight / 4 : 192;

  const handlePointerDown = (e: any) => {
    if (!selectedBuildingToPlace) return;

    const cx = typeof window !== 'undefined' ? window.innerWidth / 2 : centerX;
    const cy = typeof window !== 'undefined' ? window.innerHeight / 4 : centerY;

    const hit = getIsoHit(e.global.x, e.global.y, world, cx, cy, 1, 64, 32);

    if (hit.tileId && !hit.buildingId && !hit.workerId) {
      const playerIds = Object.keys(useGameStore.getState().gameState.players);
      const playerId = playerIds.length > 0 ? playerIds[0] : 'player_1';
      placeBuildingAt(playerId, selectedBuildingToPlace, hit.tileId);
      selectBuildingToPlace(null);
    }
  };

  return (
    <Container x={centerX} y={centerY} sortableChildren={true} eventMode={'static' as const} pointerdown={handlePointerDown}>
      <IsoTerrainLayer tiles={world.tiles} />
      <IsoBuildingLayer buildings={world.buildings} />
      <IsoWorkerLayer workers={world.workers} />
    </Container>
  );
}
