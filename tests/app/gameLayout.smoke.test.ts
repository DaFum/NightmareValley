import React from 'react';
jest.resetModules();

describe('GameLayout server render', () => {
  beforeEach(() => {
    jest.resetModules();
  });

  test('renders GameLayout without throwing when subcomponents are mocked', async () => {
    const path = await import('path');

    const gameCanvasPath = path.resolve(process.cwd(), 'src', 'pixi', 'GameCanvas');
    const topHudPath = path.resolve(process.cwd(), 'src', 'ui', 'hud', 'TopHud');
    const buildingMenuPath = path.resolve(process.cwd(), 'src', 'ui', 'panels', 'BuildingMenu');

    // Mock heavy browser-dependent parts so we can require and render the layout on Node
    jest.doMock(gameCanvasPath, () => ({ GameCanvas: () => null }));
    jest.doMock(topHudPath, () => ({ TopHud: () => null }));
    jest.doMock(buildingMenuPath, () => ({ BuildingMenu: () => null }));

    const ReactServer = await import('react-dom/server');
    const { GameLayout } = await import('../../src/app/layout/GameLayout');

    const html = ReactServer.renderToString(React.createElement(GameLayout));
    expect(typeof html).toBe('string');
    expect(html.length).toBeGreaterThan(0);
  });
});
