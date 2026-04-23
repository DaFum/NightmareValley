import React from 'react';
jest.resetModules();

describe('RootLayout render', () => {
  beforeEach(() => {
    jest.resetModules();
  });

  test('renders children and preserves markup', async () => {
    const ReactServer = await import('react-dom/server');
    const { RootLayout } = await import('../../src/app/layout/RootLayout');

    const html = ReactServer.renderToString(React.createElement(RootLayout, null, React.createElement('span', { className: 'test' }, 'ok')));
    expect(html).toContain('ok');
    expect(html).toContain('test');
  });
});
