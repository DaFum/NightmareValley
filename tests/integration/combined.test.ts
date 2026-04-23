jest.resetModules();

describe('Quick module import tests', () => {
  beforeEach(() => {
    jest.resetModules();
  });

  test('import many core modules without runtime errors', async () => {
    jest.doMock('pixi.js', () => ({
      BaseTexture: { from: () => ({ valid: true, width: 1, height: 1, once: () => {}, off: () => {} }) },
      Texture: { WHITE: {} },
      SCALE_MODES: { NEAREST: 0 },
      Rectangle: jest.fn(),
      utils: { TextureCache: {} }
    }));

    // Mock vite asset loader and spritesheet loader to avoid import.meta usage
    jest.doMock('../../src/pixi/utils/vite-asset-loader', () => ({ loadAssets: jest.fn() }));
    jest.doMock('../../src/pixi/utils/spritesheetLoader', () => ({ loadSpritesheets: jest.fn() }));
    jest.doMock('../../src/pixi/utils/textureRegistry', () => ({ TextureRegistry: { initTextures: jest.fn(), getReady: jest.fn(() => true) } }));

    const modules = [
      '../../src/app/layout/GameLayout',
      '../../src/app/layout/HudLayout',
      '../../src/app/layout/RootLayout',
      '../../src/app/providers/AppProviders',
      '../../src/app/providers/ErrorBoundary',
      '../../src/app/providers/ThemeProvider',
      '../../src/app/routes/DebugRoute',
      '../../src/app/routes/GameRoute',
      '../../src/app/routes/NotFoundRoute',

      '../../src/game/ai/ai.economy',
      '../../src/game/ai/ai.expansion',
      '../../src/game/ai/ai.military',
      '../../src/game/ai/ai.priority',
      '../../src/game/ai/ai.state',
      '../../src/game/ai/ai.tick',
      '../../src/game/ai/ai.types',

      '../../src/game/camera/camera.clamp',
      '../../src/game/camera/camera.logic',
      '../../src/game/camera/camera.pan',
      '../../src/game/camera/camera.types',
      '../../src/game/camera/camera.zoom',

      '../../src/game/core/economy.data',
      '../../src/game/core/economy.simulation',
      '../../src/game/core/economy.types',
      '../../src/game/core/entity.ids',
      '../../src/game/core/game.constants',
      '../../src/game/core/game.types',
      '../../src/game/core/random',
      '../../src/game/core/victory.rules',

      '../../src/game/economy/balancing.constants',
      '../../src/game/economy/economy.snapshot',
      '../../src/game/economy/extraction.logic',
      '../../src/game/economy/production.logic',
      '../../src/game/economy/recipes.data',
      '../../src/game/economy/recipes.types',
      '../../src/game/economy/stockpile.logic',
      '../../src/game/economy/transport.logic',

      '../../src/game/entities/buildings/building.data',
      '../../src/game/entities/buildings/building.footprints',
      '../../src/game/entities/buildings/building.logic',
      '../../src/game/entities/buildings/building.placement',
      '../../src/game/entities/buildings/building.status',
      '../../src/game/entities/buildings/building.types',
      '../../src/game/entities/buildings/building.upgrades',

      '../../src/game/map/map.building-slots',
      '../../src/game/map/map.chunks',
      '../../src/game/map/map.constants',
      '../../src/game/map/map.generator',
      '../../src/game/map/map.loader',
      '../../src/game/map/map.occupancy',
      '../../src/game/map/map.query',
      '../../src/game/map/map.territory',
      '../../src/game/map/map.types',
      '../../src/game/map/tiled.adapter',

      '../../src/game/pathing/path.a-star',
      '../../src/game/pathing/path.cache',
      '../../src/game/pathing/path.debug',
      '../../src/game/pathing/path.flowfield',
      '../../src/game/pathing/path.grid',
      '../../src/game/pathing/path.types',

      '../../src/game/render/render.adapter',
      '../../src/game/render/render.animations',
      '../../src/game/render/render.culling',
      '../../src/game/render/render.debug',
      '../../src/game/render/render.interpolation',
      '../../src/game/render/render.overlays',
      '../../src/game/render/render.sort',
      '../../src/game/render/render.textures',
      '../../src/game/render/render.types',

      '../../src/game/selection/selection.actions',
      '../../src/game/selection/selection.logic',
      '../../src/game/selection/selection.queries',
      '../../src/game/selection/selection.types',

      '../../src/game/transport/carrier.routing',
      '../../src/game/transport/transport.assignment',
      '../../src/game/transport/transport.delivery',
      '../../src/game/transport/transport.jobs',
      '../../src/game/transport/transport.metrics',
      '../../src/game/transport/transport.reservation',
      '../../src/game/transport/transport.types',

      '../../src/game/world/world.generator',
      '../../src/game/world/world.metrics',
      '../../src/game/world/world.state',
      '../../src/game/world/world.tick',
      '../../src/game/world/world.types',

      '../../src/lib/array',
      '../../src/lib/asserts',
      '../../src/lib/deep-clone',
      '../../src/lib/logger',
    ];

    for (const modPath of modules) {
      try {
        const m = await import(modPath);
        expect(m).toBeDefined();
      } catch (err: any) {
        throw new Error(`Failed to import ${modPath}: ${err && err.message ? err.message : String(err)}`);
      }
    }
  }, 30000);
});
