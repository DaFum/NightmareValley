import React from 'react';
import { Container, Sprite } from '@pixi/react';
import { useTextures } from '../utils/textureRegistry';
import { IsoRenderWorld } from '../../game/render/render.types';

interface IsoTerrainLayerProps {
  tiles: IsoRenderWorld['tiles'];
}

const TILE_ANCHOR = { x: 0.5, y: 0.5 } as const;

export const IsoTerrainLayer = React.memo(function IsoTerrainLayer({ tiles }: IsoTerrainLayerProps) {
  const { registry } = useTextures();

  return (
    // cacheAsBitmap: terrain is static — rasterising once avoids per-frame redraws.
    // The footfall overlay is a separate layer and composites on top.
    <Container eventMode="none" cacheAsBitmap={true}>
      {tiles.map((tile) => {
        // Fallback for missing textures based on terrain type
        let textureKey = tile.textureKey;
        if (!registry.hasTexture(textureKey)) {
           // Provide basic colored fallback textures or just first frame if available
           if (textureKey.includes("placentaLake")) {
               textureKey = "terrain_placentaLake";
           } else if (textureKey.includes("weepingForest")) {
               textureKey = "terrain_weepingForest";
           } else {
               textureKey = "terrain_scarredEarth"; // Default
           }
        }

        const texture = registry.getTexture(textureKey);

        if (!texture) return null;

        return (
          <Sprite
            key={tile.id}
            texture={texture}
            x={tile.screenX}
            y={tile.screenY}
            anchor={TILE_ANCHOR}
          />
        );
      })}
    </Container>
  );
});
