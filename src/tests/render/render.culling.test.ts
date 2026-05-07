import { filterIsoTilesInBounds, getIsoViewportBounds, isIsoPointInBounds } from '../../game/render/render.culling';
import { IsoTileRenderData } from '../../game/render/render.types';

function tile(id: string, screenX: number, screenY: number): IsoTileRenderData {
  return {
    id,
    screenX,
    screenY,
    textureKey: 'terrain_scarredEarth',
    terrain: 'scarredEarth',
    chunkId: '0,0',
    footfall: 0,
    tier: 'grass',
  };
}

describe('render culling', () => {
  it('derives iso-space viewport bounds from camera and zoom', () => {
    const bounds = getIsoViewportBounds({
      cameraX: -32,
      cameraY: 16,
      centerX: 100,
      centerY: 80,
      viewportWidth: 320,
      viewportHeight: 200,
      zoom: 2,
      padding: 20,
    });

    expect(bounds).toEqual({
      minX: -44,
      maxX: 136,
      minY: -58,
      maxY: 62,
    });
  });

  it('keeps boundary points visible and rejects outside points', () => {
    const bounds = { minX: -10, maxX: 10, minY: -4, maxY: 4 };

    expect(isIsoPointInBounds({ screenX: -10, screenY: 4 }, bounds)).toBe(true);
    expect(isIsoPointInBounds({ screenX: 11, screenY: 0 }, bounds)).toBe(false);
    expect(isIsoPointInBounds({ screenX: 0, screenY: -5 }, bounds)).toBe(false);
  });

  it('filters tile render data without mutating the source array', () => {
    const tiles = [
      tile('left', -12, 0),
      tile('center', 0, 0),
      tile('edge', 10, 4),
      tile('right', 14, 0),
    ];

    const visible = filterIsoTilesInBounds(tiles, { minX: -10, maxX: 10, minY: -4, maxY: 4 });

    expect(visible.map((entry) => entry.id)).toEqual(['center', 'edge']);
    expect(tiles).toHaveLength(4);
  });
});
