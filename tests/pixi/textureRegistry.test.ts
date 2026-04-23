jest.resetModules();

describe('TextureRegistry.initTextures', () => {
  beforeEach(() => {
    jest.resetModules();
  });

  test('resolves when spritesheet loader rejects', async () => {
    // Mock the spritesheet loader to reject
    const mockLoader = jest.fn().mockRejectedValue(new Error('loader fail'));
    jest.doMock('../../src/pixi/utils/spritesheetLoader', () => ({ loadSpritesheets: mockLoader }));

    // Provide a minimal mock for pixi.js so importing the registry doesn't blow up in Node
    class MockTexture {
      constructor(public base?: any, public frame?: any) {}
      static WHITE = { baseTexture: {} };
      static addToCache = jest.fn();
    }

    const mockBaseTexture = {
      from: jest.fn(() => ({ valid: true, width: 1, height: 1, once: jest.fn(), off: jest.fn() })),
    };

    jest.doMock('pixi.js', () => ({
      SCALE_MODES: { NEAREST: 0 },
      utils: { TextureCache: {} },
      BaseTexture: mockBaseTexture,
      Texture: MockTexture,
      Rectangle: jest.fn(),
    }));

    const { TextureRegistry } = await import('../../src/pixi/utils/textureRegistry');

    await expect(TextureRegistry.initTextures()).resolves.toBeUndefined();
    expect(TextureRegistry.getReady()).toBe(true);
  });
});
