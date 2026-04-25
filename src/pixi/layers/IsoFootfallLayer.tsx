import React, { useCallback } from 'react';
import { Graphics } from '@pixi/react';
import * as PIXI from 'pixi.js';
import { IsoTileRenderData } from '../../game/render/render.types';
import { ISO_TILE_WIDTH, ISO_TILE_HEIGHT } from '../../game/iso/iso.constants';

type IsoFootfallLayerProps = {
  tiles: IsoTileRenderData[];
};

export default function IsoFootfallLayer({ tiles }: IsoFootfallLayerProps): JSX.Element | null {
  const drawFootfall = useCallback((g: PIXI.Graphics) => {
    g.clear();
    g.lineStyle(0); // Reset stroke

    for (const tile of tiles) {
      if (tile.tier === 'grass') continue;

      let color = 0x000000;
      let alpha = 1.0;

      switch (tile.tier) {
        case 'dirt':
          color = 0x8a6a3a;
          alpha = 0.45;
          break;
        case 'cobble':
          color = 0x9a9a8a;
          alpha = 0.55;
          break;
        case 'paved':
          color = 0x6a6a6a;
          alpha = 0.65;
          break;
        default:
          // Unknown tier — skip to avoid rendering a black diamond
          continue;
      }

      g.beginFill(color, alpha);

      // Draw iso diamond
      g.moveTo(tile.screenX, tile.screenY - ISO_TILE_HEIGHT / 2);
      g.lineTo(tile.screenX + ISO_TILE_WIDTH / 2, tile.screenY);
      g.lineTo(tile.screenX, tile.screenY + ISO_TILE_HEIGHT / 2);
      g.lineTo(tile.screenX - ISO_TILE_WIDTH / 2, tile.screenY);

      g.endFill();
    }
  }, [tiles]);

  return <Graphics draw={drawFootfall} zIndex={5} eventMode="none" />;
}
