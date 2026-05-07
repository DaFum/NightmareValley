export type DevFeature = 'debugRoute' | 'debugPanels' | 'mapDebugPanel';

const DEV_FEATURE_FLAGS: Record<DevFeature, boolean> = {
  debugRoute: __DEV__,
  debugPanels: __DEV__,
  mapDebugPanel: __DEV__,
};

export function isDevFeatureEnabled(feature: DevFeature): boolean {
  return DEV_FEATURE_FLAGS[feature];
}
