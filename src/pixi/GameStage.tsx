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
import { ISO_TILE_WIDTH, ISO_TILE_HEIGHT } from '../game/iso/iso.constants';

const CHUNK_SCREEN_SIZE = 512;
// HQ is placed at tile (7,7); center the camera on it at startup.
// Uses ISO_TILE_WIDTH/HEIGHT (64/32) matching render.adapter.ts screen coords.
const HQ_TILE = { x: 7, y: 7 };
const HQ_SCREEN_X = (HQ_TILE.x - HQ_TILE.y) * (ISO_TILE_WIDTH / 2);
const HQ_SCREEN_Y = (HQ_TILE.x + HQ_TILE.y) * (ISO_TILE_HEIGHT / 2);

export function GameStage() {
  const setRunning = useGameStore((state) => state.setRunning);
  const setCameraPosition = useCameraStore((state) => state.setCameraPosition);
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

    // Center the camera on the HQ tile so the starting area is in view.
    // viewportHeight * (0.5 - 0.42) corrects for centerY = height * 0.42.
    const vh = typeof window !== 'undefined' ? window.innerHeight : 768;
    const initialCameraY = Math.round(vh * 0.08 - HQ_SCREEN_Y);
    setCameraPosition(HQ_SCREEN_X, initialCameraY);
    // eslint-disable-next-line no-console
    console.log('[GameStage] Camera init:', {
      vh,
      HQ_SCREEN_X,
      HQ_SCREEN_Y,
      initialCameraY,
      centerY: vh * 0.42,
      expectedHQScreenY: vh * 0.42 + initialCameraY + HQ_SCREEN_Y,
    });

    return () => {
      setRunning(false);
    };
  }, [setRunning, setCameraPosition]);

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

  // Tile screen positions are static after map load; rebuild when tiles change to handle map reloads.
  // Stores array indices instead of IDs to avoid O(N) map creation per frame.
  const chunkIndex = useMemo(() => {
    const grouped = new Map<string, number[]>();
    for (let i = 0; i < world.tiles.length; i++) {
      const tile = world.tiles[i];
      const key = `${Math.floor(tile.screenX / CHUNK_SCREEN_SIZE)},${Math.floor(tile.screenY / CHUNK_SCREEN_SIZE)}`;
      const indices = grouped.get(key);
      if (indices) indices.push(i);
      else grouped.set(key, [i]);
    }
    return grouped;
  }, [world.tiles]);

  const visibleTiles = useMemo(() => {
    const padding = lodLevel === 'full' ? 192 : 128;
    const minX = (-centerX - cameraX - padding) / zoom;
    const maxX = (viewportWidth - centerX - cameraX + padding) / zoom;
    const minY = (-centerY - cameraY - padding) / zoom;
    const maxY = (viewportHeight - centerY - cameraY + padding) / zoom;
    if (world.tiles.length > 0 && Math.random() < 0.01) {
      // eslint-disable-next-line no-console
      console.log('[visibleTiles] culling:', { minX, maxX, minY, maxY, cameraX, cameraY, tileCount: world.tiles.length, sampleTile: world.tiles[0] });
    }
    const minChunkX = Math.floor(minX / CHUNK_SCREEN_SIZE);
    const maxChunkX = Math.floor(maxX / CHUNK_SCREEN_SIZE);
    const minChunkY = Math.floor(minY / CHUNK_SCREEN_SIZE);
    const maxChunkY = Math.floor(maxY / CHUNK_SCREEN_SIZE);
    const selected: (typeof world.tiles)[number][] = [];

    for (let cx = minChunkX; cx <= maxChunkX; cx++) {
      for (let cy = minChunkY; cy <= maxChunkY; cy++) {
        const indices = chunkIndex.get(`${cx},${cy}`);
        if (!indices) continue;
        for (const i of indices) {
          const tile = world.tiles[i];
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
  }, [cameraX, cameraY, centerX, centerY, chunkIndex, lodLevel, viewportHeight, viewportWidth, zoom, world.tiles]);
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
