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
import { useRenderWorld } from './hooks/useRenderWorld';
import { useIsoCamera } from './hooks/useIsoCamera';
import { useGameLoop } from './hooks/useGameLoop';
import { useSelectionInput } from './hooks/useSelectionInput';

export function GameStage() {
  const togglePlayPause = useGameStore((state) => state.togglePlayPause);
  const cameraX = useCameraStore((state) => state.x);
  const cameraY = useCameraStore((state) => state.y);
  const zoom = useCameraStore((state) => state.zoom);
  const showFootfallHeatmap = useUIStore((state) => state.showFootfallHeatmap);

  const { spacePressedRef } = useIsoCamera();
  const world = useRenderWorld();
  useGameLoop();

  useEffect(() => {
    // Auto-start game on mount if it's not running
    if (!useGameStore.getState().isRunning) {
      togglePlayPause();
    }
  }, [togglePlayPause]);

  const isBrowser = typeof window !== 'undefined';
  const [viewportWidth, setViewportWidth] = React.useState(isBrowser ? window.innerWidth : 1024);
  const [viewportHeight, setViewportHeight] = React.useState(isBrowser ? window.innerHeight : 768);

  useEffect(() => {
    if (!isBrowser) return;
    const el = document.documentElement;
    const observer = new ResizeObserver((entries) => {
      for (const entry of entries) {
        const { width, height } = entry.contentRect;
        setViewportWidth(Math.round(width));
        setViewportHeight(Math.round(height));
      }
    });
    observer.observe(el);
    return () => {
      observer.disconnect();
    };
  }, [isBrowser]);

  const centerX = viewportWidth / 2;
  const centerY = viewportHeight * 0.42;

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

  const handlePointerDown = useSelectionInput({
    world,
    centerX,
    centerY,
    cameraX,
    cameraY,
    zoom,
    spacePressedRef,
  });

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
