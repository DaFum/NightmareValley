import { Container, Sprite } from '@pixi/react';
import { useTextures } from '../utils/textureRegistry';
import { tileToScreen } from '../../game/iso/iso.project';
import { BuildingType } from '../../game/core/economy.types';

const GHOST_TILE_WIDTH = 64;
const GHOST_TILE_HEIGHT = 32;
const BUILDING_SCALE = 0.28;
const BUILDING_ANCHOR = { x: 0.5, y: 1 } as const;

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
  if (!texture) return null;

  const { x: sx, y: sy } = tileToScreen(hoveredTileX, hoveredTileY, GHOST_TILE_WIDTH, GHOST_TILE_HEIGHT);

  // Depth-sort: place ghost above terrain but below other entities
  const zIndex = (sx + sy) * 0.5 + 1000;

  const tint = isValid ? 0x88ff88 : 0xff4444;

  return (
    <Container x={sx} y={sy} zIndex={zIndex} eventMode="none">
      <Sprite
        texture={texture}
        anchor={BUILDING_ANCHOR}
        y={16}
        scale={BUILDING_SCALE}
        tint={tint}
        alpha={0.65}
      />
    </Container>
  );
}
