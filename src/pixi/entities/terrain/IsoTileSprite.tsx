import React, { useCallback } from "react";
import { Sprite, Graphics } from "@pixi/react";
import * as PIXI from "pixi.js";
import { IsoTileRenderData } from "../../../game/render/render.types";
import { useTextures } from "../../utils/textureRegistry";

export interface IsoTileSpriteProps {
  data: IsoTileRenderData;
}

export const IsoTileSprite: React.FC<IsoTileSpriteProps> = ({ data }) => {
  const { registry } = useTextures();

  // The texture keys are likely to be like 'terrain_wasteland'
  const texture = registry.getTexture(data.textureKey);

  const drawFallback = useCallback((g: PIXI.Graphics) => {
    g.clear();
    // Iso tile polygon (64x32)
    g.beginFill(0x2a2a2a);
    g.lineStyle(1, 0x111111, 1);
    g.moveTo(0, -16);
    g.lineTo(32, 0);
    g.lineTo(0, 16);
    g.lineTo(-32, 0);
    g.closePath();
    g.endFill();
  }, []);

  if (!texture) {
    // Return a fallback graphical tile
    return (
      <Graphics
        draw={drawFallback}
        x={data.screenX}
        y={data.screenY}
        zIndex={0}
      />
    );
  }

  return (
    <Sprite
      texture={texture}
      x={data.screenX}
      y={data.screenY}
      anchor={{ x: 0.5, y: 0.5 }}
    />
  );
};
