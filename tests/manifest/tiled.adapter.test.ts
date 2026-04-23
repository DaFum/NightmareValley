import mapData from '../../src/assets/maps/nightmare_valley.json';
jest.resetModules();

describe('Tiled adapter', () => {
  beforeEach(() => {
    jest.resetModules();
  });

  test('parses nightmare_valley.json into territory tiles', async () => {
    const { parseTiledMap } = await import('../../src/game/map/tiled.adapter');

    // Count non-zero tiles in the Terrain layer
    const terrainLayer = mapData.layers.find((l: any) => l.name === 'Terrain' && l.type === 'tilelayer');
    expect(terrainLayer).toBeDefined();
    const nonZeroCount = terrainLayer!.data.filter((v: number) => v && v !== 0).length;

    const territory = parseTiledMap(mapData as any);
    const parsedCount = Object.keys(territory.tiles || {}).length;

    expect(parsedCount).toBe(nonZeroCount);
  });
});
