import React from 'react';
import { Container, Sprite } from '@pixi/react';
import { useRenderWorld } from '../hooks/useRenderWorld';
import { useTextures } from '../utils/textureRegistry';

export function IsoTerrainLayer() {
  const world = useRenderWorld();
  const { registry } = useTextures();

  return (
    <Container>
      {world.tiles.map((tile) => {
        // Fallback for missing textures based on terrain type
        let textureKey = tile.textureKey;
        if (!registry.hasTexture(textureKey)) {
           // Provide basic colored fallback textures or just first frame if available
           if (textureKey.includes("bloodWater")) {
               textureKey = "terrain_bloodWater";
           } else if (textureKey.includes("weepingForest")) {
               textureKey = "terrain_weepingForest";
           } else {
               textureKey = "terrain_scarredEarth"; // Default
           }

           // If even the base is missing, we might not render, but we'll try to find it
           // In this simplified app, we'll try to just grab any texture if the specific one is missing
        }

        const texture = registry.getTexture(textureKey);

        if (!texture) return null;

        return (
          <Sprite
            key={tile.id}
            texture={texture}
            x={tile.screenX}
            y={tile.screenY}
            anchor={{ x: 0.5, y: 0.5 }}
          />
        );
      })}
    </Container>
  );
}
