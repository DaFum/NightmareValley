import React from 'react';
import { Sprite } from '@pixi/react';
import { ResourceType } from '../../game/core/economy.types';
import { IsoRenderWorld } from '../../game/render/render.types';
import { useTextures } from '../utils/textureRegistry';

type IsoResourceLayerProps = {
  tiles: IsoRenderWorld['tiles'];
};

const RESOURCE_ANCHOR = { x: 0.5, y: 1 } as const;
const RESOURCE_SCALE = 0.09;

export default function IsoResourceLayer({ tiles }: IsoResourceLayerProps): JSX.Element {
  const { registry } = useTextures();

  return (
    <>
      {tiles.map((tile) => {
        const deposit = tile.resourceDeposit;
        if (!deposit) return null;

        const entries = Object.entries(deposit)
          .filter(([, amount]) => (amount ?? 0) > 0)
          .sort((a, b) => {
            const diff = (b[1] ?? 0) - (a[1] ?? 0);
            if (diff !== 0) return diff;
            return a[0].localeCompare(b[0]);
          });

        if (entries.length === 0) return null;

        const [resource] = entries[0] as [ResourceType, number];
        const texture = registry.getTexture(`resource_${resource}`);
        if (!texture) return null;

        return (
          <Sprite
            key={`${tile.id}_${resource}`}
            texture={texture}
            x={tile.screenX}
            y={tile.screenY - 8}
            anchor={RESOURCE_ANCHOR}
            scale={RESOURCE_SCALE}
            alpha={0.88}
            zIndex={8}
            eventMode="none"
          />
        );
      })}
    </>
  );
}
