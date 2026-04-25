import { useCallback } from 'react';
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
          color = 0x7a5028;
          alpha = 0.52;
          break;
        case 'cobble':
          color = 0x484038;
          alpha = 0.62;
          break;
        case 'paved':
          color = 0x302828;
          alpha = 0.72;
          break;
        default:
          // Unknown tier — skip to avoid rendering a black diamond
          continue;
      }

      g.beginFill(color, alpha);

      // Draw iso diamond as a closed polygon so Pixi v7 fills each sub-path reliably.
      g.drawPolygon([
        tile.screenX, tile.screenY - ISO_TILE_HEIGHT / 2,
        tile.screenX + ISO_TILE_WIDTH / 2, tile.screenY,
        tile.screenX, tile.screenY + ISO_TILE_HEIGHT / 2,
        tile.screenX - ISO_TILE_WIDTH / 2, tile.screenY,
      ]);

      g.endFill();
    }
  }, [tiles]);

  return <Graphics draw={drawFootfall} zIndex={5} eventMode="none" />;
}
