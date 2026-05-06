function createMemoryLocalStorage(initial: Record<string, string> = {}) {
  const values = new Map(Object.entries(initial));
  return {
    getItem: jest.fn((key: string) => values.get(key) ?? null),
    setItem: jest.fn((key: string, value: string) => {
      values.set(key, value);
    }),
    removeItem: jest.fn((key: string) => {
      values.delete(key);
    }),
  };
}

async function loadUIStore(storage = createMemoryLocalStorage()) {
  jest.resetModules();
  Object.defineProperty(globalThis, 'localStorage', {
    configurable: true,
    value: storage,
  });
  const module = await import('../../store/ui.store');
  return { storage, useUIStore: module.useUIStore };
}

describe('ui.store autosave preference', () => {
  afterEach(() => {
    jest.resetModules();
    delete (globalThis as Partial<typeof globalThis> & { localStorage?: Storage }).localStorage;
  });

  it('enables autosave by default when no stored preference exists', async () => {
    const { useUIStore } = await loadUIStore();
    expect(useUIStore.getState().autosaveEnabled).toBe(true);
  });

  it('persists autosave preference changes', async () => {
    const { storage, useUIStore } = await loadUIStore();

    useUIStore.getState().setAutosaveEnabled(false);
    expect(useUIStore.getState().autosaveEnabled).toBe(false);
    expect(storage.setItem).toHaveBeenCalledWith('ui:autosaveEnabled', '0');

    useUIStore.getState().setAutosaveEnabled(true);
    expect(useUIStore.getState().autosaveEnabled).toBe(true);
    expect(storage.setItem).toHaveBeenCalledWith('ui:autosaveEnabled', '1');
  });

  it('reads disabled autosave from local storage', async () => {
    const { useUIStore } = await loadUIStore(createMemoryLocalStorage({ 'ui:autosaveEnabled': '0' }));
    expect(useUIStore.getState().autosaveEnabled).toBe(false);
  });

  it('persists hidden guide state across reloads', async () => {
    const { storage, useUIStore } = await loadUIStore();

    useUIStore.getState().setGuideOpen(false);
    expect(useUIStore.getState().guideOpen).toBe(false);
    expect(storage.setItem).toHaveBeenCalledWith('ui:guideOpen', '0');

    const { useUIStore: reloadedStore } = await loadUIStore(storage);
    expect(reloadedStore.getState().guideOpen).toBe(false);
  });
});
