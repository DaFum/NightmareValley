
import { Graphics } from '@pixi/react';
import { ISO_TILE_HEIGHT, ISO_TILE_WIDTH } from '../../game/iso/iso.constants';
import type { IsoRenderWorld } from '../../game/render/render.types';

type IsoTerritoryLayerProps = {
  tiles: IsoRenderWorld['tiles'];
  playerId: string;
  enemyOwnerId?: string;
};

export default function IsoTerritoryLayer({
  tiles,
  playerId,
  enemyOwnerId,
}: IsoTerritoryLayerProps): JSX.Element | null {
  if (tiles.length === 0) return null;

  return (
    <Graphics
      zIndex={12}
      eventMode="none"
      draw={(graphics) => {
        graphics.clear();
        for (const tile of tiles) {
          const ownerTone = getOwnerTone(tile.ownerId, playerId, enemyOwnerId);
          if (!ownerTone) continue;

          graphics.lineStyle(1, ownerTone.stroke, ownerTone.strokeAlpha);
          graphics.beginFill(ownerTone.fill, ownerTone.fillAlpha);
          graphics.moveTo(tile.screenX, tile.screenY - ISO_TILE_HEIGHT / 2);
          graphics.lineTo(tile.screenX + ISO_TILE_WIDTH / 2, tile.screenY);
          graphics.lineTo(tile.screenX, tile.screenY + ISO_TILE_HEIGHT / 2);
          graphics.lineTo(tile.screenX - ISO_TILE_WIDTH / 2, tile.screenY);
          graphics.closePath();
          graphics.endFill();
        }
      }}
    />
  );
}

function getOwnerTone(ownerId: string | undefined, playerId: string, enemyOwnerId?: string) {
  if (ownerId === playerId) {
    return {
      fill: 0x3fb950,
      fillAlpha: 0.15,
      stroke: 0x7ee787,
      strokeAlpha: 0.20,
    };
  }

  if (ownerId && ownerId === enemyOwnerId) {
    return {
      fill: 0xff4d5d,
      fillAlpha: 0.16,
      stroke: 0xff8a95,
      strokeAlpha: 0.22,
    };
  }

  return null;
}

