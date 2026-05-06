import { Graphics } from '@pixi/react';
import { ISO_TILE_WIDTH, ISO_TILE_HEIGHT } from '../../game/iso/iso.constants';
import { tileToScreen } from '../../game/iso/iso.project';

type IsoRoadGhostLayerProps = {
  hoveredTileX: number;
  hoveredTileY: number;
  isValid: boolean;
  mode: 'place' | 'remove';
};

export default function IsoRoadGhostLayer({
  hoveredTileX,
  hoveredTileY,
  isValid,
  mode,
}: IsoRoadGhostLayerProps): JSX.Element {
  const { x, y } = tileToScreen(hoveredTileX, hoveredTileY, ISO_TILE_WIDTH, ISO_TILE_HEIGHT);
  const tint = isValid ? (mode === 'place' ? 0x7ee787 : 0xf0a500) : 0xff4444;

  return (
    <Graphics
      x={x}
      y={y}
      zIndex={999}
      eventMode="none"
      draw={(graphics) => {
        graphics.clear();
        graphics.lineStyle(2, tint, 0.85);
        graphics.beginFill(tint, 0.22);
        graphics.moveTo(0, 0);
        graphics.lineTo(ISO_TILE_WIDTH / 2, ISO_TILE_HEIGHT / 2);
        graphics.lineTo(0, ISO_TILE_HEIGHT);
        graphics.lineTo(-ISO_TILE_WIDTH / 2, ISO_TILE_HEIGHT / 2);
        graphics.closePath();
        graphics.endFill();
      }}
    />
  );
}
