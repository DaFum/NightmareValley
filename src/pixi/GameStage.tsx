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
import { useRenderStore } from '../store/render.store';
import { useRenderWorld } from './hooks/useRenderWorld';
import { useIsoCamera } from './hooks/useIsoCamera';
import { useGameLoop } from './hooks/useGameLoop';
import { useSelectionInput } from './hooks/useSelectionInput';

export function GameStage() {
  const setRunning = useGameStore((state) => state.setRunning);
  const cameraX = useCameraStore((state) => state.x);
  const cameraY = useCameraStore((state) => state.y);
  const zoom = useCameraStore((state) => state.zoom);
  const showFootfallHeatmap = useUIStore((state) => state.showFootfallHeatmap);
  const setRenderStats = useRenderStore((state) => state.setRenderStats);

  const { spacePressedRef } = useIsoCamera();
  const world = useRenderWorld();
  useGameLoop();

  useEffect(() => {
    // Auto-start simulation in an idempotent way.
    // This avoids double-toggle issues under React StrictMode remounting.
    setRunning(true);
    return () => {
      setRunning(false);
    };
  }, [setRunning]);

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
  const lodLevel: 'full' | 'medium' | 'low' = zoom >= 1.1 ? 'full' : zoom >= 0.75 ? 'medium' : 'low';
  const drawHeatmap = showFootfallHeatmap && lodLevel !== 'low';
  const drawWorkers = lodLevel !== 'low' || world.workers.length <= 120;
  const CHUNK_SCREEN_SIZE = 512;
  const chunkKey = (x: number, y: number) => `${Math.floor(x / CHUNK_SCREEN_SIZE)},${Math.floor(y / CHUNK_SCREEN_SIZE)}`;

  const chunkIndex = useMemo(() => {
    const grouped = new Map<string, typeof world.tiles>();
    for (const tile of world.tiles) {
      const key = chunkKey(tile.screenX, tile.screenY);
      const bucket = grouped.get(key);
      if (bucket) bucket.push(tile);
      else grouped.set(key, [tile]);
    }
    return grouped;
  }, [world.tiles]);

  const visibleTiles = useMemo(() => {
    const padding = lodLevel === 'full' ? 192 : 128;
    const minX = (-centerX - cameraX - padding) / zoom;
    const maxX = (viewportWidth - centerX - cameraX + padding) / zoom;
    const minY = (-centerY - cameraY - padding) / zoom;
    const maxY = (viewportHeight - centerY - cameraY + padding) / zoom;
    const minChunkX = Math.floor(minX / CHUNK_SCREEN_SIZE);
    const maxChunkX = Math.floor(maxX / CHUNK_SCREEN_SIZE);
    const minChunkY = Math.floor(minY / CHUNK_SCREEN_SIZE);
    const maxChunkY = Math.floor(maxY / CHUNK_SCREEN_SIZE);
    const selected: typeof world.tiles = [];

    for (let cx = minChunkX; cx <= maxChunkX; cx++) {
      for (let cy = minChunkY; cy <= maxChunkY; cy++) {
        const bucket = chunkIndex.get(`${cx},${cy}`);
        if (!bucket) continue;
        for (const tile of bucket) {
          if (
            tile.screenX >= minX &&
            tile.screenX <= maxX &&
            tile.screenY >= minY &&
            tile.screenY <= maxY
          ) {
            selected.push(tile);
          }
        }
      }
    }
    return selected;
  }, [cameraX, cameraY, centerX, centerY, chunkIndex, lodLevel, viewportHeight, viewportWidth, zoom]);
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

  useEffect(() => {
    setRenderStats({
      visibleTiles: visibleTiles.length,
      visibleBuildings: world.buildings.length,
      visibleWorkers: world.workers.length,
      lodLevel,
    });
  }, [lodLevel, setRenderStats, visibleTiles.length, world.buildings.length, world.workers.length]);

  return (
    <Container x={centerX + cameraX} y={centerY + cameraY} scale={zoom} hitArea={hitArea} sortableChildren={true} eventMode={'static' as const} pointerdown={handlePointerDown}>
      <IsoTerrainLayer tiles={visibleTiles} />
      <IsoResourceLayer tiles={visibleTiles} />
      <IsoFootfallLayer tiles={visibleTiles} />
      {drawHeatmap && <IsoFootfallHeatmapLayer tiles={visibleTiles} />}
      <IsoBuildingLayer buildings={world.buildings} />
      {drawWorkers && <IsoWorkerLayer workers={world.workers} />}
    </Container>
  );
}
