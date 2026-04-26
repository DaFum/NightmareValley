import { Container, Sprite } from '@pixi/react';
import { useTextures } from '../utils/textureRegistry';
import { tileToScreen } from '../../game/iso/iso.project';
import { ISO_TILE_WIDTH, ISO_TILE_HEIGHT, HALF_TILE_HEIGHT } from '../../game/iso/iso.constants';
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
}

export default function IsoGhostPlacementLayer({
  buildingType,
  hoveredTileX,
  hoveredTileY,
  isValid,
}: IsoGhostPlacementLayerProps): JSX.Element | null {
  const { registry } = useTextures();

  const spriteKey = `buildings_stage4_${buildingType}`;
  const texture = registry.getTexture(spriteKey);
  if (!texture) {
    if (!warnedMissingGhostTextures.has(spriteKey)) {
      warnedMissingGhostTextures.add(spriteKey);
      console.warn(`Missing texture for ghost placement: ${spriteKey}`);
    }
    return null;
  }

  const { x: sx, y: sy } = tileToScreen(hoveredTileX, hoveredTileY, ISO_TILE_WIDTH, ISO_TILE_HEIGHT);

  // Depth-sort: place ghost above terrain but below other entities
  const zIndex = (sx + sy) * 0.5 + GHOST_Z_INDEX_BIAS;

  const tint = isValid ? 0x88ff88 : 0xff4444;

  return (
    <Container x={sx} y={sy} zIndex={zIndex} eventMode="none">
      <Sprite
        texture={texture}
        anchor={BUILDING_ANCHOR}
        y={HALF_TILE_HEIGHT}
        scale={BUILDING_SCALE}
        tint={tint}
        alpha={0.65}
      />
    </Container>
  );
}
