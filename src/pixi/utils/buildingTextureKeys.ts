const BUILDING_STAGE_TEXTURE_KEY = /^buildings_stage([0-4])_(.+)$/;

function stageSearchOrder(requestedStage: number): number[] {
  const stages: number[] = [];

  for (let distance = 0; distance <= 4; distance += 1) {
    const candidates =
      distance === 0
        ? [requestedStage]
        : [requestedStage - distance, requestedStage + distance];

    for (const stage of candidates) {
      if (stage >= 0 && stage <= 4 && !stages.includes(stage)) {
        stages.push(stage);
      }
    }
  }

  return stages;
}

export function getBuildingTextureLookupKeys(spriteKey: string): string[] {
  const match = BUILDING_STAGE_TEXTURE_KEY.exec(spriteKey);
  if (!match) return [spriteKey];

  const requestedStage = Number(match[1]);
  const buildingType = match[2];

  return stageSearchOrder(requestedStage).map(
    (stage) => `buildings_stage${stage}_${buildingType}`,
  );
}

export function resolveBuildingTextureKey(
  spriteKey: string,
  hasTexture: (key: string) => boolean,
): string | undefined {
  return getBuildingTextureLookupKeys(spriteKey).find(hasTexture);
}
