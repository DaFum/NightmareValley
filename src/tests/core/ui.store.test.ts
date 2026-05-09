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

  it('closes the build panel when selecting a building to place', async () => {
    const { useUIStore } = await loadUIStore();

    useUIStore.getState().togglePanel('buildingMenu');
    useUIStore.getState().selectBuildingToPlace('sepulcherQuarry');

    expect(useUIStore.getState().selectedBuildingToPlace).toBe('sepulcherQuarry');
    expect(useUIStore.getState().activePanel).toBeNull();
  });

  it('closes the build panel when enabling road placement mode', async () => {
    const { useUIStore } = await loadUIStore();

    useUIStore.getState().togglePanel('buildingMenu');
    useUIStore.getState().setRoadPlacementMode(true);

    expect(useUIStore.getState().roadPlacementMode).toBe(true);
    expect(useUIStore.getState().activePanel).toBeNull();
  });

  it('closes the build panel when enabling road removal mode', async () => {
    const { useUIStore } = await loadUIStore();

    useUIStore.getState().togglePanel('buildingMenu');
    useUIStore.getState().setRoadRemovalMode(true);

    expect(useUIStore.getState().roadRemovalMode).toBe(true);
    expect(useUIStore.getState().activePanel).toBeNull();
  });

  it('clears stale placement feedback when selecting a building tool', async () => {
    const { useUIStore } = await loadUIStore();

    useUIStore.getState().setPlacementFeedback({
      tone: 'warn',
      label: 'Cannot place Sepulcher Quarry',
      detail: 'Claim this tile with a Spire of Jurisdiction before building here.',
    });

    useUIStore.getState().selectBuildingToPlace('sepulcherQuarry');
    expect(useUIStore.getState().placementFeedback).toBeNull();
  });

  it('clears stale placement feedback when enabling road placement mode', async () => {
    const { useUIStore } = await loadUIStore();

    useUIStore.getState().setPlacementFeedback({
      tone: 'warn',
      label: 'Road blocked',
      detail: 'Roads need owned empty ground.',
    });
    useUIStore.getState().setRoadPlacementMode(true);

    expect(useUIStore.getState().placementFeedback).toBeNull();
  });

  it('keeps only one left rail panel active at a time', async () => {
    const { useUIStore } = await loadUIStore();

    useUIStore.getState().setLeftPanel('economy');
    expect(useUIStore.getState().leftPanel).toBe('economy');

    useUIStore.getState().setLeftPanel('defense');
    expect(useUIStore.getState().leftPanel).toBe('defense');

    useUIStore.getState().toggleLeftPanel('defense');
    expect(useUIStore.getState().leftPanel).toBeNull();
  });
});
