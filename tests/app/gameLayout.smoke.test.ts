
import React from 'react';
// Ensure jest types are available

import { jest, describe, beforeEach, test, expect } from '@jest/globals';
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
    const inspectorPanelPath = path.resolve(process.cwd(), 'src', 'ui', 'panels', 'InspectorPanel');

    // Mock heavy browser-dependent parts so we can require and render the layout on Node
    jest.doMock(gameCanvasPath, () => ({ GameCanvas: () => null }));
    jest.doMock(topHudPath, () => ({ TopHud: () => null }));
    jest.doMock(buildingMenuPath, () => ({ BuildingMenu: () => null }));
    jest.doMock(inspectorPanelPath, () => ({ __esModule: true, default: () => null }));

    const ReactServer = await import('react-dom/server');
    const { GameLayout } = await import('../../src/app/layout/GameLayout');

    const html = ReactServer.renderToString(React.createElement(GameLayout));
    expect(typeof html).toBe('string');
    expect(html.length).toBeGreaterThan(0);
  });
});
