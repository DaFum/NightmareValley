import { useCallback, useMemo } from 'react';
import { Graphics } from '@pixi/react';
import type * as PIXI from 'pixi.js';
import { ISO_TILE_HEIGHT, ISO_TILE_WIDTH } from '../../../game/iso/iso.constants';
import { ROAD_HORIZ_EXTENT_FRAC, ROAD_VERT_EXTENT_FRAC } from './road.constants';
import type { IsoRenderWorld } from '../../../game/render/render.types';

type IsoRoadSpriteProps = {
  tiles: IsoRenderWorld['tiles'];
};

function isRoadTile(tile: IsoRenderWorld['tiles'][number]): boolean {
  return /^(terrain_scarPath)(?:_\d+)?$/.test(tile.textureKey);
}

export default function IsoRoadSprite({ tiles }: IsoRoadSpriteProps): JSX.Element {
  const roadTiles = useMemo(() => tiles.filter(isRoadTile), [tiles]);
  const drawRoads = useCallback((graphics: PIXI.Graphics) => {
    graphics.clear();
    if (roadTiles.length === 0) return;

    graphics.lineStyle(1, 0x8f4f2a, 0.5);
    graphics.beginFill(0x5f3520, 0.7);

    for (const tile of roadTiles) {
      graphics.drawPolygon([
        tile.screenX,
        tile.screenY - ISO_TILE_HEIGHT * ROAD_VERT_EXTENT_FRAC,
        tile.screenX + ISO_TILE_WIDTH * ROAD_HORIZ_EXTENT_FRAC,
        tile.screenY,
        tile.screenX,
        tile.screenY + ISO_TILE_HEIGHT * ROAD_VERT_EXTENT_FRAC,
        tile.screenX - ISO_TILE_WIDTH * ROAD_HORIZ_EXTENT_FRAC,
        tile.screenY,
      ]);
    }

    graphics.endFill();
  }, [roadTiles]);

  return <Graphics eventMode="none" draw={drawRoads} />;
}
