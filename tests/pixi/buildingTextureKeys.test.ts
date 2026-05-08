import {
  getBuildingTextureLookupKeys,
  resolveBuildingTextureKey,
} from "../../src/pixi/utils/buildingTextureKeys";

describe("building texture key fallbacks", () => {
  it("keeps the requested construction stage first", () => {
    expect(getBuildingTextureLookupKeys("buildings_stage1_vaultOfDigestiveStone")).toEqual([
      "buildings_stage1_vaultOfDigestiveStone",
      "buildings_stage0_vaultOfDigestiveStone",
      "buildings_stage2_vaultOfDigestiveStone",
      "buildings_stage3_vaultOfDigestiveStone",
      "buildings_stage4_vaultOfDigestiveStone",
    ]);
  });

  it("uses the nearest manifest-backed building stage when a construction texture is absent", () => {
    const available = new Set([
      "buildings_stage0_vaultOfDigestiveStone",
      "buildings_stage3_vaultOfDigestiveStone",
      "buildings_stage4_vaultOfDigestiveStone",
    ]);

    expect(
      resolveBuildingTextureKey("buildings_stage1_vaultOfDigestiveStone", (key) =>
        available.has(key),
      ),
    ).toBe("buildings_stage0_vaultOfDigestiveStone");

    expect(
      resolveBuildingTextureKey("buildings_stage2_vaultOfDigestiveStone", (key) =>
        available.has(key),
      ),
    ).toBe("buildings_stage3_vaultOfDigestiveStone");
  });

  it("still reports no texture when every candidate is missing", () => {
    expect(resolveBuildingTextureKey("buildings_stage1_unknownStructure", () => false)).toBeUndefined();
  });
});
