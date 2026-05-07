import { Container, Graphics, Sprite, Text } from '@pixi/react';
import * as PIXI from 'pixi.js';
import { useTextures } from '../utils/textureRegistry';
import { HALF_TILE_HEIGHT, ISO_TILE_HEIGHT, ISO_TILE_WIDTH } from '../../game/iso/iso.constants';
import { isoTileToScreen } from '../iso/iso.adapter';
import { BuildingType } from '../../game/core/economy.types';

const BUILDING_SCALE = 0.28;
const warnedMissingGhostTextures = new Set<string>();
const BUILDING_ANCHOR = { x: 0.5, y: 1 } as const;
const GHOST_Z_INDEX_BIAS = 1000;

interface IsoGhostPlacementLayerProps {
  buildingType: BuildingType;
  hoveredTileX: number;
  hoveredTileY: number;
  isValid: boolean;
  reason?: string;
  footprintWidth?: number;
  footprintHeight?: number;
}

export default function IsoGhostPlacementLayer({
  buildingType,
  hoveredTileX,
  hoveredTileY,
  isValid,
  reason,
  footprintWidth = 1,
  footprintHeight = 1,
}: IsoGhostPlacementLayerProps): JSX.Element | null {
  const { registry } = useTextures();

  // stage4 is the fully-built appearance; ghosts always show the final form regardless of level
  const spriteKey = `buildings_stage4_${buildingType}`;
  const texture = registry.getTexture(spriteKey);
  if (!texture) {
    if (!warnedMissingGhostTextures.has(spriteKey)) {
      warnedMissingGhostTextures.add(spriteKey);
      console.warn(`Missing texture for ghost placement: ${spriteKey}`);
    }
    return null;
  }

  const { x: sx, y: sy } = isoTileToScreen(hoveredTileX, hoveredTileY);

  // Depth-sort: place ghost above terrain but below other entities
  const zIndex = (sx + sy) * 0.5 + GHOST_Z_INDEX_BIAS;

  const tint = isValid ? 0x88ff88 : 0xff4444;
  const footprintAlpha = isValid ? 0.18 : 0.24;
  const label = !isValid && reason ? reason : null;

  return (
    <Container x={sx} y={sy} zIndex={zIndex} eventMode="none">
      <Graphics
        draw={(graphics) => {
          graphics.clear();
          graphics.lineStyle(2, tint, 0.85);
          graphics.beginFill(tint, footprintAlpha);

          for (let dy = 0; dy < footprintHeight; dy++) {
            for (let dx = 0; dx < footprintWidth; dx++) {
              const tileScreen = isoTileToScreen(hoveredTileX + dx, hoveredTileY + dy);
              const ox = tileScreen.x - sx;
              const oy = tileScreen.y - sy;
              graphics.drawPolygon([
                ox, oy,
                ox + ISO_TILE_WIDTH / 2, oy + ISO_TILE_HEIGHT / 2,
                ox, oy + ISO_TILE_HEIGHT,
                ox - ISO_TILE_WIDTH / 2, oy + ISO_TILE_HEIGHT / 2,
              ]);
            }
          }

          graphics.endFill();
        }}
      />
      <Sprite
        texture={texture}
        anchor={BUILDING_ANCHOR}
        y={HALF_TILE_HEIGHT}
        scale={BUILDING_SCALE}
        tint={tint}
        alpha={0.65}
      />
      {label && (
        <Container y={HALF_TILE_HEIGHT + 18} eventMode="none">
          <Graphics
            draw={(graphics) => {
              graphics.clear();
              graphics.lineStyle(1, 0xff4444, 0.85);
              graphics.beginFill(0x111111, 0.86);
              graphics.drawRoundedRect(-132, -4, 264, 34, 6);
              graphics.endFill();
            }}
          />
          <Text
            text={label}
            anchor={{ x: 0.5, y: 0 }}
            style={
              new PIXI.TextStyle({
                fill: 0xffffff,
                fontSize: 10,
                fontWeight: 'bold',
                align: 'center',
                wordWrap: true,
                wordWrapWidth: 244,
              }) as PIXI.TextStyle
            }
          />
        </Container>
      )}
    </Container>
  );
}
