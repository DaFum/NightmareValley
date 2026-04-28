import React, { useEffect, useMemo } from 'react';
import { Sprite } from '@pixi/react';
import * as PIXI from 'pixi.js';
import { ResourceType } from '../../game/core/economy.types';
import { IsoRenderWorld } from '../../game/render/render.types';
import { ISO_TILE_HEIGHT, ISO_TILE_WIDTH } from '../../game/iso/iso.constants';

type IsoResourceLayerProps = {
  tiles: IsoRenderWorld['tiles'];
};

const RESOURCE_COLORS: Partial<Record<ResourceType, string>> = {
  sinewTimber: '#5aa15a',
  toothPlanks: '#b8884f',
  sepulcherStone: '#a9a49a',
  marrowGrain: '#c9b75f',
  boneDust: '#d7d0bf',
  amnioticWater: '#55a7d7',
  eyelessFish: '#88b7d0',
  brainSalt: '#ded5c0',
  funeralLoaf: '#c68b58',
  graveCoal: '#33343c',
  veinIronOre: '#a66d55',
  veinIronBar: '#b7bac2',
  tormentInstrument: '#d4b35a',
  pigFleshMass: '#b45b64',
  flensedMeat: '#ce7a7a',
  skinWall: '#aa8073',
  haloGoldBar: '#e4c35c',
  cathedralGoldOre: '#b99a42',
  lungAsh: '#8a8c92',
  ribBlade: '#b9c2cf',
  saintFat: '#d9c19a',
};

function strongestResource(deposit: NonNullable<IsoRenderWorld['tiles'][number]['resourceDeposit']>): ResourceType | null {
  let best: ResourceType | null = null;
  let bestAmount = 0;

  for (const [resource, amount] of Object.entries(deposit) as [ResourceType, number | undefined][]) {
    const value = amount ?? 0;
    if (value > bestAmount) {
      best = resource;
      bestAmount = value;
    }
  }

  return best;
}

function resourceSignatureForTile(tile: IsoRenderWorld['tiles'][number]): string {
  const deposit = tile.resourceDeposit;
  if (!deposit) return '';

  return Object.entries(deposit)
    .filter(([, amount]) => (amount ?? 0) > 0)
    .sort(([left], [right]) => left.localeCompare(right))
    .map(([resource, amount]) => `${resource}:${amount}`)
    .join(',');
}

function createResourceTexture(tiles: IsoRenderWorld['tiles']) {
  if (typeof document === 'undefined' || tiles.length === 0) return null;

  let minX = Infinity;
  let minY = Infinity;
  let maxX = -Infinity;
  let maxY = -Infinity;
  let hasResources = false;

  for (const tile of tiles) {
    if (!tile.resourceDeposit || !strongestResource(tile.resourceDeposit)) continue;
    hasResources = true;
    minX = Math.min(minX, tile.screenX - ISO_TILE_WIDTH / 2);
    minY = Math.min(minY, tile.screenY - ISO_TILE_HEIGHT / 2);
    maxX = Math.max(maxX, tile.screenX + ISO_TILE_WIDTH / 2);
    maxY = Math.max(maxY, tile.screenY + ISO_TILE_HEIGHT / 2);
  }

  if (!hasResources) return null;

  const canvas = document.createElement('canvas');
  canvas.width = Math.ceil(maxX - minX);
  canvas.height = Math.ceil(maxY - minY);

  const ctx = canvas.getContext('2d');
  if (!ctx) return null;

  for (const tile of tiles) {
    const deposit = tile.resourceDeposit;
    if (!deposit) continue;

    const resource = strongestResource(deposit);
    if (!resource) continue;

    const x = tile.screenX - minX;
    const y = tile.screenY - minY - 12;
    ctx.beginPath();
    ctx.arc(x, y, 3.25, 0, Math.PI * 2);
    ctx.fillStyle = RESOURCE_COLORS[resource] ?? '#ffffff';
    ctx.globalAlpha = 0.86;
    ctx.fill();
    ctx.globalAlpha = 1;
    ctx.strokeStyle = 'rgba(5, 5, 5, 0.35)';
    ctx.lineWidth = 1;
    ctx.stroke();
  }

  return {
    texture: PIXI.Texture.from(canvas),
    x: minX,
    y: minY,
  };
}

export default React.memo(function IsoResourceLayer({ tiles }: IsoResourceLayerProps): JSX.Element | null {
  const resourceSignature = useMemo(
    () => tiles.map((tile) => `${tile.id}:${resourceSignatureForTile(tile)}`).join('|'),
    [tiles]
  );
  const resourceTexture = useMemo(() => createResourceTexture(tiles), [resourceSignature]);

  useEffect(() => {
    return () => {
      resourceTexture?.texture.destroy(true);
    };
  }, [resourceTexture]);

  if (!resourceTexture) return null;

  return (
    <Sprite
      texture={resourceTexture.texture}
      x={resourceTexture.x}
      y={resourceTexture.y}
      zIndex={8}
      eventMode="none"
    />
  );
});
