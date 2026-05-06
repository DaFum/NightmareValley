import { useCallback, useMemo } from 'react';
import { Graphics } from '@pixi/react';
import type * as PIXI from 'pixi.js';
import { ISO_TILE_HEIGHT, ISO_TILE_WIDTH } from '../../../game/iso/iso.constants';
import type { IsoRenderWorld } from '../../../game/render/render.types';

type IsoRoadSpriteProps = {
  tiles: IsoRenderWorld['tiles'];
};

function isRoadTile(tile: IsoRenderWorld['tiles'][number]): boolean {
  return tile.textureKey.includes('terrain_scarPath');
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
        tile.screenY - ISO_TILE_HEIGHT * 0.22,
        tile.screenX + ISO_TILE_WIDTH * 0.34,
        tile.screenY,
        tile.screenX,
        tile.screenY + ISO_TILE_HEIGHT * 0.22,
        tile.screenX - ISO_TILE_WIDTH * 0.34,
        tile.screenY,
      ]);
    }

    graphics.endFill();
  }, [roadTiles]);

  return <Graphics eventMode="none" draw={drawRoads} />;
}

