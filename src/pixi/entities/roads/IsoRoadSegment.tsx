import { Graphics } from '@pixi/react';
import { ISO_TILE_HEIGHT, ISO_TILE_WIDTH } from '../../../game/iso/iso.constants';
import type { IsoRenderWorld } from '../../../game/render/render.types';

type IsoRoadSegmentProps = {
  tile: IsoRenderWorld['tiles'][number];
};

export default function IsoRoadSegment({ tile }: IsoRoadSegmentProps): JSX.Element {
  return (
    <Graphics
      x={tile.screenX}
      y={tile.screenY}
      eventMode="none"
      draw={(graphics) => {
        graphics.clear();
        graphics.lineStyle(1, 0x8f4f2a, 0.55);
        graphics.beginFill(0x5f3520, 0.72);
        graphics.drawPolygon([
          0,
          -ISO_TILE_HEIGHT * 0.22,
          ISO_TILE_WIDTH * 0.34,
          0,
          0,
          ISO_TILE_HEIGHT * 0.22,
          -ISO_TILE_WIDTH * 0.34,
          0,
        ]);
        graphics.endFill();
      }}
    />
  );
}

