jest.resetModules();

describe('App smoke', () => {
  beforeEach(() => {
    jest.resetModules();
  });

  test('imports App without throwing (with light mocks)', async () => {
    const path = await import('path');
    const gameLayoutPath = path.resolve(process.cwd(), 'src', 'app', 'layout', 'GameLayout');
    const globalsCss = path.resolve(process.cwd(), 'src', 'styles', 'globals.css');
    const uiCss = path.resolve(process.cwd(), 'src', 'styles', 'ui.css');

    // Mock layout and CSS imports so importing App.tsx doesn't pull heavy browser-only modules
    jest.doMock(gameLayoutPath, () => ({ GameLayout: () => null }));
    jest.doMock(globalsCss, () => ({}), { virtual: true });
    jest.doMock(uiCss, () => ({}), { virtual: true });

    const { default: App } = await import('../../src/App');
    expect(App).toBeDefined();
  });
});
