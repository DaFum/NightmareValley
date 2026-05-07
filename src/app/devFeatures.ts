export type DevFeature = 'debugRoute' | 'debugPanels' | 'mapDebugPanel';

const DEV_FEATURE_FLAGS: Record<DevFeature, boolean> = {
  debugRoute: __DEV__,
  debugPanels: __DEV__,
  mapDebugPanel: __DEV__,
};

const devFeatureOverrideCache: Partial<Record<DevFeature, boolean>> = {};
let devFeatureOverridesLoaded = false;

function loadDevFeatureOverrides() {
  if (devFeatureOverridesLoaded) return;
  devFeatureOverridesLoaded = true;

  try {
    const storage = globalThis.localStorage;
    if (!storage) return;
    for (const feature of Object.keys(DEV_FEATURE_FLAGS) as DevFeature[]) {
      const override = storage.getItem(`devFeature:${feature}`);
      if (override === '1' || override === 'true') devFeatureOverrideCache[feature] = true;
      if (override === '0' || override === 'false') devFeatureOverrideCache[feature] = false;
    }
  } catch {
    // Ignore localStorage access errors (for example SecurityError in restricted contexts).
  }
}

export function isDevFeatureEnabled(feature: DevFeature): boolean {
  loadDevFeatureOverrides();
  const override = devFeatureOverrideCache[feature];
  if (typeof override === 'boolean') return override;
  return DEV_FEATURE_FLAGS[feature];
}
