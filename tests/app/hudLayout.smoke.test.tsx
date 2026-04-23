
import React from 'react';
import { jest, describe, beforeEach, test, expect } from '@jest/globals';


jest.resetModules();

describe('HudLayout render', () => {
  beforeEach(() => {
    jest.resetModules();
  });

  test('renders children without throwing', async () => {
    const ReactServer = await import('react-dom/server');
    const { HudLayout } = await import('../../src/app/layout/HudLayout');

    const html = ReactServer.renderToString(React.createElement(HudLayout, null, React.createElement('div', { id: 'child' }, 'child')));
    expect(html).toContain('child');
  });
});
