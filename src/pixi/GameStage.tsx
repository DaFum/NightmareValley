import React, { useEffect, useMemo } from 'react';

import { Container } from '@pixi/react';
import * as PIXI from 'pixi.js';
import { IsoTerrainLayer } from './layers/IsoTerrainLayer';
import { IsoBuildingLayer } from './layers/IsoBuildingLayer';
import { IsoWorkerLayer } from './layers/IsoWorkerLayer';
import IsoFootfallLayer from './layers/IsoFootfallLayer';
import IsoFootfallHeatmapLayer from './layers/IsoFootfallHeatmapLayer';
import IsoResourceLayer from './layers/IsoResourceLayer';

import { useGameStore } from '../store/game.store';
import { useUIStore } from '../store/ui.store';
import { useCameraStore } from '../store/camera.store';
import { useSelectionStore } from '../store/selection.store';
import { getIsoHit } from '../game/iso/iso.hit-test';
import { useRenderWorld } from './hooks/useRenderWorld';
import { useIsoCamera } from './hooks/useIsoCamera';

export function GameStage() {
  const advanceTick = useGameStore((state) => state.advanceTick);
  const togglePlayPause = useGameStore((state) => state.togglePlayPause);
  const placeBuildingAt = useGameStore((state) => state.placeBuildingAt);
  const selectedBuildingToPlace = useUIStore((state) => state.selectedBuildingToPlace);
  const selectBuildingToPlace = useUIStore((state) => state.selectBuildingToPlace);
  const cameraX = useCameraStore((state) => state.x);
  const cameraY = useCameraStore((state) => state.y);
  const zoom = useCameraStore((state) => state.zoom);
  const isDebugSpawningWarehouse = useUIStore((state) => state.isDebugSpawningWarehouse);
  const setDebugSpawningWarehouse = useUIStore((state) => state.setDebugSpawningWarehouse);
  const showFootfallHeatmap = useUIStore((state) => state.showFootfallHeatmap);
  const selectBuilding = useSelectionStore((state) => state.selectBuilding);
  const selectWorker = useSelectionStore((state) => state.selectWorker);
  const selectTile = useSelectionStore((state) => state.selectTile);

  useIsoCamera();
  const world = useRenderWorld();

  useEffect(() => {
    const SIMULATION_STEP_SEC = 0.1;
    const MAX_STEPS_PER_FRAME = 5;
    let lastTime: number | null = null;
    let accumulatedSec = 0;
    let animationFrameId: number;

    const loop = (time: number) => {
      if (lastTime === null) {
        lastTime = time;
        animationFrameId = requestAnimationFrame(loop);
        return;
      }
      const deltaMs = time - lastTime;
      lastTime = time;

      const deltaSec = Math.min(deltaMs / 1000, 0.25);

      if (useGameStore.getState().isRunning) {
        accumulatedSec += deltaSec;
        let steps = 0;
        while (accumulatedSec >= SIMULATION_STEP_SEC && steps < MAX_STEPS_PER_FRAME) {
          advanceTick(SIMULATION_STEP_SEC);
          accumulatedSec -= SIMULATION_STEP_SEC;
          steps += 1;
        }
        if (steps === MAX_STEPS_PER_FRAME) {
          accumulatedSec = 0;
        }
      } else {
        accumulatedSec = 0;
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
  const centerY = isBrowser ? window.innerHeight * 0.42 : 320;
  const viewportWidth = isBrowser ? window.innerWidth : 1024;
  const viewportHeight = isBrowser ? window.innerHeight : 768;
  const visibleTiles = useMemo(() => {
    const padding = 192;
    const minX = (-centerX - cameraX - padding) / zoom;
    const maxX = (viewportWidth - centerX - cameraX + padding) / zoom;
    const minY = (-centerY - cameraY - padding) / zoom;
    const maxY = (viewportHeight - centerY - cameraY + padding) / zoom;

    return world.tiles.filter((tile) => (
      tile.screenX >= minX &&
      tile.screenX <= maxX &&
      tile.screenY >= minY &&
      tile.screenY <= maxY
    ));
  }, [cameraX, cameraY, centerX, centerY, viewportHeight, viewportWidth, world.tiles, zoom]);
  const hitArea = useMemo(() => new PIXI.Rectangle(
    (-centerX - cameraX) / zoom,
    (-centerY - cameraY) / zoom,
    viewportWidth / zoom,
    viewportHeight / zoom
  ), [cameraX, cameraY, centerX, centerY, viewportHeight, viewportWidth, zoom]);

  const handlePointerDown = (e: any) => {
    if (typeof e.button === 'number' && e.button !== 0) return;

    const cx = (typeof window !== 'undefined' ? window.innerWidth / 2 : centerX) + cameraX;
    const cy = (typeof window !== 'undefined' ? window.innerHeight * 0.42 : centerY) + cameraY;

    const hit = getIsoHit(e.global.x, e.global.y, world, cx, cy, zoom, 64, 32);

    if (isDebugSpawningWarehouse && hit.tileId && !hit.buildingId && !hit.workerId) {
      const playerIds = Object.keys(useGameStore.getState().gameState.players);
      const playerId = playerIds.length > 0 ? playerIds[0] : 'player_1';
      placeBuildingAt(playerId, "vaultOfDigestiveStone", hit.tileId);
      setDebugSpawningWarehouse(false);
      return;
    }

    if (hit.buildingId) {
      selectBuilding(hit.buildingId);
    } else if (hit.workerId) {
      selectWorker(hit.workerId);
    } else {
      selectTile(hit.tileId ?? null);
    }
  };

  return (
    <Container x={centerX + cameraX} y={centerY + cameraY} scale={zoom} hitArea={hitArea} sortableChildren={true} eventMode={'static' as const} pointerdown={handlePointerDown}>
      <IsoTerrainLayer tiles={visibleTiles} />
      <IsoResourceLayer tiles={visibleTiles} />
      <IsoFootfallLayer tiles={visibleTiles} />
      {showFootfallHeatmap && <IsoFootfallHeatmapLayer tiles={visibleTiles} />}
      <IsoBuildingLayer buildings={world.buildings} />
      <IsoWorkerLayer workers={world.workers} />
    </Container>
  );
}
