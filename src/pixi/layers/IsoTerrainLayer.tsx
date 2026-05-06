import React, { useEffect, useMemo } from 'react';
import { Sprite } from '@pixi/react';
import * as PIXI from 'pixi.js';
import { IsoRenderWorld } from '../../game/render/render.types';
import { ISO_TILE_WIDTH, ISO_TILE_HEIGHT, TERRAIN_Z_INDEX_BIAS } from '../../game/iso/iso.constants';
import imageMap from '../utils/vite-asset-loader';

interface IsoTerrainLayerProps {
  tiles: IsoRenderWorld['tiles'];
}

const TERRAIN_COLORS: Record<string, string> = {
  scarredEarth: '#4b2d1a',
  weepingForest: '#20391f',
  ribMountain: '#303247',
  placentaLake: '#102a4f',
  scarPath: '#352313',
  occupiedScar: '#2c1010',
  ashBog: '#20232c',
  cathedralRock: '#222238',
};

const TERRAIN_STROKES: Record<string, string> = {
  placentaLake: 'rgba(130, 180, 220, 0.18)',
  scarPath: 'rgba(210, 160, 95, 0.16)',
};

const terrainImageCache = new Map<string, HTMLImageElement>();
const terrainImagePromises = new Map<string, Promise<void>>();
const warnedMissingTerrainAssets = new Set<string>();

function terrainFromTextureKey(textureKey: string): string {
  return textureKey.replace(/^terrain_/, '').replace(/_[0-9]+$/, '');
}

function terrainAssetPath(textureKey: string): string {
  return `terrain/${textureKey.replace(/^terrain_/, '')}.png`;
}

function getLoadedTerrainImage(textureKey: string): HTMLImageElement | null {
  const cached = terrainImageCache.get(textureKey);
  return cached?.complete && cached.naturalWidth > 0 ? cached : null;
}

function loadTerrainImage(textureKey: string): Promise<boolean> {
  if (typeof Image === 'undefined') return Promise.resolve(false);
  if (getLoadedTerrainImage(textureKey)) return Promise.resolve(false);

  const pending = terrainImagePromises.get(textureKey);
  if (pending) return pending.then(() => false);

  const path = terrainAssetPath(textureKey);
  const src = imageMap[path];
  if (!src) {
    if (!warnedMissingTerrainAssets.has(path)) {
      warnedMissingTerrainAssets.add(path);
      console.warn(`Missing terrain asset: ${path}`);
    }
    return Promise.resolve(false);
  }

  const promise = new Promise<boolean>((resolve) => {
    const img = new Image();
    img.onload = () => {
      terrainImageCache.set(textureKey, img);
      resolve(true);
    };
    img.onerror = () => {
      if (!warnedMissingTerrainAssets.has(path)) {
        warnedMissingTerrainAssets.add(path);
        console.warn(`Failed to load terrain asset: ${path}`);
      }
      resolve(false);
    };
    img.src = src;
  });
  terrainImagePromises.set(textureKey, promise.then(() => {}));
  return promise;
}

function uniqueTerrainKeys(tiles: IsoRenderWorld['tiles']): string[] {
  return Array.from(new Set(tiles.map((tile) => tile.textureKey)));
}

function createTerrainTexture(tiles: IsoRenderWorld['tiles']) {
  if (typeof document === 'undefined' || tiles.length === 0) return null;

  let minX = Infinity;
  let minY = Infinity;
  let maxX = -Infinity;
  let maxY = -Infinity;

  for (const tile of tiles) {
    minX = Math.min(minX, tile.screenX - ISO_TILE_WIDTH / 2);
    minY = Math.min(minY, tile.screenY - ISO_TILE_HEIGHT / 2);
    maxX = Math.max(maxX, tile.screenX + ISO_TILE_WIDTH / 2);
    maxY = Math.max(maxY, tile.screenY + ISO_TILE_HEIGHT / 2);
  }

  const width = Math.ceil(maxX - minX);
  const height = Math.ceil(maxY - minY);
  const canvas = document.createElement('canvas');
  canvas.width = width;
  canvas.height = height;

  const ctx = canvas.getContext('2d');
  if (!ctx) return null;

  for (const tile of tiles) {
    const terrain = terrainFromTextureKey(tile.textureKey);
    const x = tile.screenX - minX;
    const y = tile.screenY - minY;
    const img = getLoadedTerrainImage(tile.textureKey);

    if (img) {
      ctx.drawImage(
        img,
        x - ISO_TILE_WIDTH / 2,
        y - ISO_TILE_HEIGHT / 2,
        ISO_TILE_WIDTH,
        ISO_TILE_HEIGHT
      );
    } else {
      ctx.beginPath();
      ctx.moveTo(x, y - ISO_TILE_HEIGHT / 2);
      ctx.lineTo(x + ISO_TILE_WIDTH / 2, y);
      ctx.lineTo(x, y + ISO_TILE_HEIGHT / 2);
      ctx.lineTo(x - ISO_TILE_WIDTH / 2, y);
      ctx.closePath();
      ctx.fillStyle = TERRAIN_COLORS[terrain] ?? TERRAIN_COLORS.scarredEarth;
      ctx.fill();
      ctx.strokeStyle = TERRAIN_STROKES[terrain] ?? 'rgba(8, 6, 6, 0.20)';
      ctx.lineWidth = 1;
      ctx.stroke();
    }
  }

  return {
    texture: PIXI.Texture.from(canvas),
    x: minX,
    y: minY,
  };
}

export const IsoTerrainLayer = React.memo(function IsoTerrainLayer({ tiles }: IsoTerrainLayerProps) {
  const [assetRevision, setAssetRevision] = React.useState(0);
  const terrainSignature = useMemo(
    () => tiles.map((tile) => `${tile.id}:${tile.textureKey}`).join('|'),
    [tiles]
  );
  const terrainTexture = useMemo(() => createTerrainTexture(tiles), [assetRevision, terrainSignature]);

  useEffect(() => {
    let cancelled = false;
    Promise.all(uniqueTerrainKeys(tiles).map(loadTerrainImage)).then((results) => {
      if (!cancelled && results.some((loaded) => loaded)) setAssetRevision((value) => value + 1);
    });
    return () => {
      cancelled = true;
    };
  }, [terrainSignature, tiles]);

  useEffect(() => {
    return () => {
      terrainTexture?.texture.destroy(true);
    };
  }, [terrainTexture]);

  if (!terrainTexture) return null;

  return (
    <Sprite
      texture={terrainTexture.texture}
      x={terrainTexture.x}
      y={terrainTexture.y}
      zIndex={TERRAIN_Z_INDEX_BIAS}
      eventMode="none"
    />
  );
});
