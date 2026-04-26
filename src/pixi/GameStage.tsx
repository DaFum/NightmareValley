import React, { useCallback, useEffect, useMemo } from 'react';

import { Container } from '@pixi/react';
import * as PIXI from 'pixi.js';
import { IsoTerrainLayer } from './layers/IsoTerrainLayer';
import { IsoBuildingLayer } from './layers/IsoBuildingLayer';
import { IsoWorkerLayer } from './layers/IsoWorkerLayer';
import IsoFootfallLayer from './layers/IsoFootfallLayer';
import IsoFootfallHeatmapLayer from './layers/IsoFootfallHeatmapLayer';
import IsoResourceLayer from './layers/IsoResourceLayer';
import IsoGhostPlacementLayer from './layers/IsoGhostPlacementLayer';

import { useGameStore, player1Id } from '../store/game.store';
import { useUIStore } from '../store/ui.store';
import { useCameraStore } from '../store/camera.store';
import { useRenderStore } from '../store/render.store';
import { useRenderWorld } from './hooks/useRenderWorld';
import { useIsoCamera } from './hooks/useIsoCamera';
import { useGameLoop } from './hooks/useGameLoop';
import { useSelectionInput } from './hooks/useSelectionInput';
import { ISO_TILE_WIDTH, ISO_TILE_HEIGHT } from '../game/iso/iso.constants';
import { screenToIsoTile } from '../game/iso/iso.inverse';
import { BUILDING_DEFINITIONS } from '../game/core/economy.data';

const CHUNK_SCREEN_SIZE = 512;
// Starting buildings are placed at tile (7,7); center on (7,7).
// Uses ISO_TILE_WIDTH/HEIGHT (64/32) matching render.adapter.ts screen coords.
const START_TILE = { x: 7, y: 7 };
const START_SCREEN_X = (START_TILE.x - START_TILE.y) * (ISO_TILE_WIDTH / 2);
const START_SCREEN_Y = (START_TILE.x + START_TILE.y) * (ISO_TILE_HEIGHT / 2);

export function GameStage() {
  const setRunning = useGameStore((state) => state.setRunning);
  const setCameraPosition = useCameraStore((state) => state.setCameraPosition);
  const cameraX = useCameraStore((state) => state.x);
  const cameraY = useCameraStore((state) => state.y);
  const zoom = useCameraStore((state) => state.zoom);
  const showFootfallHeatmap = useUIStore((state) => state.showFootfallHeatmap);
  const setRenderStats = useRenderStore((state) => state.setRenderStats);
  const selectedBuildingToPlace = useUIStore((state) => state.selectedBuildingToPlace);
  const territory = useGameStore((state) => state.gameState.territory);

  const { spacePressedRef } = useIsoCamera();
  const world = useRenderWorld();
  useGameLoop();

  const [ghostTile, setGhostTile] = React.useState<{ x: number; y: number } | null>(null);

  const initialZoomRef = React.useRef(zoom);
  useEffect(() => {
    // Auto-start simulation in an idempotent way.
    // This avoids double-toggle issues under React StrictMode remounting.
    setRunning(true);

    // Center the camera on the starting tile so the starting area is in view.
    // viewportHeight * (0.5 - 0.42) corrects for centerY = height * 0.42.
    const vh = typeof window !== 'undefined' ? window.innerHeight : 768;
    const initialCameraX = -START_SCREEN_X * initialZoomRef.current;
    const initialCameraY = Math.round(vh * 0.08 - START_SCREEN_Y * initialZoomRef.current);
    setCameraPosition(initialCameraX, initialCameraY);

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
        // Ignore zero-dimension reports from headless/hidden environments.
        if (width > 0) setViewportWidth(Math.round(width));
        if (height > 0) setViewportHeight(Math.round(height));
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
    const minChunkX = Math.floor(minX / CHUNK_SCREEN_SIZE);
    const maxChunkX = Math.floor(maxX / CHUNK_SCREEN_SIZE);
    const minChunkY = Math.floor(minY / CHUNK_SCREEN_SIZE);
    const maxChunkY = Math.floor(maxY / CHUNK_SCREEN_SIZE);

    const filtered: (typeof world.tiles)[number][] = [];

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
            filtered.push(tile);
          }
        }
      }
    }
    return filtered;
  }, [cameraX, cameraY, centerX, centerY, chunkIndex, lodLevel, viewportHeight, viewportWidth, zoom, world.tiles]);
  const hitArea = useMemo(() => new PIXI.Rectangle(
    (-centerX - cameraX) / zoom,
    (-centerY - cameraY) / zoom,
    viewportWidth / zoom,
    viewportHeight / zoom
  ), [cameraX, cameraY, centerX, centerY, viewportHeight, viewportWidth, zoom]);

  const handlePointerMove = useCallback((event: PIXI.FederatedPointerEvent) => {
    if (!selectedBuildingToPlace) {
      setGhostTile(null);
      return;
    }
    const cx = centerX + cameraX;
    const cy = centerY + cameraY;
    const { tileX, tileY } = screenToIsoTile(
      event.global.x, event.global.y, cx, cy, zoom, ISO_TILE_WIDTH, ISO_TILE_HEIGHT
    );
    setGhostTile((prev) => {
      if (prev?.x === tileX && prev?.y === tileY) return prev;
      return { x: tileX, y: tileY };
    });
  }, [selectedBuildingToPlace, centerX, cameraX, centerY, cameraY, zoom]);

  const isGhostValid = useMemo(() => {
    if (!ghostTile || !selectedBuildingToPlace) return false;
    const tileId = `tile_${ghostTile.x}_${ghostTile.y}`;
    const tile = territory.tiles[tileId];
    if (!tile || tile.buildingId || tile.ownerId !== player1Id) return false;
    const def = BUILDING_DEFINITIONS[selectedBuildingToPlace];
    return def.allowedTerrain.includes(tile.terrain);
  }, [ghostTile, selectedBuildingToPlace, territory]);

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
    <Container x={centerX + cameraX} y={centerY + cameraY} scale={zoom} hitArea={hitArea} sortableChildren={true} eventMode={'static' as const} pointerdown={handlePointerDown} pointermove={handlePointerMove}>
      <IsoTerrainLayer tiles={visibleTiles} />
      <IsoResourceLayer tiles={visibleTiles} />
      <IsoFootfallLayer tiles={visibleTiles} />
      {drawHeatmap && <IsoFootfallHeatmapLayer tiles={visibleTiles} />}
      <IsoBuildingLayer buildings={world.buildings} />
      {drawWorkers && <IsoWorkerLayer workers={world.workers} />}
      {selectedBuildingToPlace && ghostTile && (
        <IsoGhostPlacementLayer
          buildingType={selectedBuildingToPlace}
          hoveredTileX={ghostTile.x}
          hoveredTileY={ghostTile.y}
          isValid={isGhostValid}
        />
      )}
    </Container>
  );
}
