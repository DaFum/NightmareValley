import React, { useCallback } from 'react';
import { Graphics } from '@pixi/react';
import * as PIXI from 'pixi.js';
import { IsoTileRenderData } from '../../game/render/render.types';

type IsoFootfallHeatmapLayerProps = {
  tiles: IsoTileRenderData[];
};

export default function IsoFootfallHeatmapLayer({ tiles }: IsoFootfallHeatmapLayerProps): JSX.Element | null {
  const drawHeatmap = useCallback((g: PIXI.Graphics) => {
    g.clear();

    const TILE_WIDTH = 64;
    const TILE_HEIGHT = 32;

    for (const tile of tiles) {
      if (tile.footfall <= 0) continue;

      const alpha = Math.min(0.7, tile.footfall / 200);

      g.beginFill(0xff0000, alpha);

      // Draw iso diamond
      g.moveTo(tile.screenX, tile.screenY - TILE_HEIGHT / 2);
      g.lineTo(tile.screenX + TILE_WIDTH / 2, tile.screenY);
      g.lineTo(tile.screenX, tile.screenY + TILE_HEIGHT / 2);
      g.lineTo(tile.screenX - TILE_WIDTH / 2, tile.screenY);

      g.endFill();
    }
  }, [tiles]);

  return <Graphics draw={drawHeatmap} zIndex={100} eventMode="none" />;
}
