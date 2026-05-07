export type DevFeature = 'debugRoute' | 'debugPanels' | 'mapDebugPanel';

const DEV_FEATURE_FLAGS: Record<DevFeature, boolean> = {
  debugRoute: __DEV__,
  debugPanels: __DEV__,
  mapDebugPanel: __DEV__,
};

export function isDevFeatureEnabled(feature: DevFeature): boolean {
  if (typeof globalThis.localStorage !== 'undefined') {
    const key = `devFeature:${feature}`;
    const override = globalThis.localStorage.getItem(key);
    if (override === '1' || override === 'true') return true;
    if (override === '0' || override === 'false') return false;
  }
  return DEV_FEATURE_FLAGS[feature];
}
