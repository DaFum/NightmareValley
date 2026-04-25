import { useCallback } from 'react';
import { Graphics } from '@pixi/react';
import * as PIXI from 'pixi.js';
import { IsoTileRenderData } from '../../game/render/render.types';
import { DEFAULT_SIMULATION_CONFIG } from '../../game/economy/balancing.constants';
import { ISO_TILE_WIDTH, ISO_TILE_HEIGHT } from '../../game/iso/iso.constants';

const HEATMAP_BUCKETS = 8;

type IsoFootfallHeatmapLayerProps = {
  tiles: IsoTileRenderData[];
};

export default function IsoFootfallHeatmapLayer({ tiles }: IsoFootfallHeatmapLayerProps): JSX.Element | null {
  const drawHeatmap = useCallback((g: PIXI.Graphics) => {
    g.clear();

    const pavedThreshold = Math.max(1, DEFAULT_SIMULATION_CONFIG.footfallTierThresholds.paved);

    // Group tiles by quantized alpha bucket to minimise beginFill calls
    const buckets: IsoTileRenderData[][] = Array.from({ length: HEATMAP_BUCKETS }, () => []);

    for (const tile of tiles) {
      if (tile.footfall <= 0) continue;
      const tileFootfall = Math.max(0, tile.footfall);
      const alpha = Math.min(0.7, tileFootfall / pavedThreshold);
      const bucketIdx = Math.min(HEATMAP_BUCKETS - 1, Math.max(0, Math.floor(alpha / 0.7 * HEATMAP_BUCKETS)));
      buckets[bucketIdx].push(tile);
    }

    for (let b = 0; b < HEATMAP_BUCKETS; b++) {
      if (buckets[b].length === 0) continue;
      const bucketAlpha = ((b + 0.5) / HEATMAP_BUCKETS) * 0.7;
      g.beginFill(0xff0000, bucketAlpha);
      for (const tile of buckets[b]) {
        // Draw iso diamond as a closed polygon so Pixi v7 fills each sub-path reliably.
        g.drawPolygon([
          tile.screenX, tile.screenY - ISO_TILE_HEIGHT / 2,
          tile.screenX + ISO_TILE_WIDTH / 2, tile.screenY,
          tile.screenX, tile.screenY + ISO_TILE_HEIGHT / 2,
          tile.screenX - ISO_TILE_WIDTH / 2, tile.screenY,
        ]);
      }
      g.endFill();
    }
  }, [tiles]);

  return <Graphics draw={drawHeatmap} zIndex={100} eventMode="none" />;
}
