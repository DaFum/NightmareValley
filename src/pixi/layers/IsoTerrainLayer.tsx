import React from 'react';
import { Container, Sprite } from '@pixi/react';
import { useTextures } from '../utils/textureRegistry';
import { IsoRenderWorld } from '../../game/render/render.types';
import { ISO_TILE_WIDTH, ISO_TILE_HEIGHT, TERRAIN_Z_INDEX_BIAS } from '../../game/iso/iso.constants';

interface IsoTerrainLayerProps {
  tiles: IsoRenderWorld['tiles'];
}

const warnedMissingTerrainTextures = new Set<string>();

export const IsoTerrainLayer = React.memo(function IsoTerrainLayer({ tiles }: IsoTerrainLayerProps) {
  const { registry } = useTextures();

  return (
    // cacheAsBitmap is intentionally absent: `tiles` is the frustum-culled visibleTiles
    // set which changes on every camera pan, so caching would re-rasterise every frame
    // and hurt performance rather than help. React.memo handles prop-level memoisation.
    <Container eventMode="none" sortableChildren={true}>
      {tiles.map((tile) => {
        // Fallback for missing textures based on terrain type
        let textureKey = tile.textureKey;
        if (!registry.hasTexture(textureKey)) {
           if (!warnedMissingTerrainTextures.has(textureKey)) {
             warnedMissingTerrainTextures.add(textureKey);
             console.warn(`Missing terrain texture: ${textureKey}`);
           }
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

        // For SVG terrain textures we want to display the full SVG
        // scaled to the tile width while preserving aspect ratio and
        // anchoring the sprite at its bottom-center so it sits on the
        // tile correctly.
        if (textureKey.startsWith('terrain_')) {
          const texW = texture.width || ISO_TILE_WIDTH;
          const scale = texW > 0 ? ISO_TILE_WIDTH / texW : 1;
          return (
            <Sprite
              key={tile.id}
              texture={texture}
              x={tile.screenX}
              y={tile.screenY}
              anchor={{ x: 0.5, y: 1 }}
              scale={scale}
              zIndex={tile.screenY + TERRAIN_Z_INDEX_BIAS}
              eventMode="none"
            />
          );
        }

        return null;
      })}
    </Container>
  );
});
