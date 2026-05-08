import { readFileSync } from 'fs';
import { join } from 'path';

describe('IsoBuildingLayer texture fallbacks', () => {
  it('does not pass pseudo texture keys to the Sprite image prop', () => {
    const source = readFileSync(join(process.cwd(), 'src/pixi/layers/IsoBuildingLayer.tsx'), 'utf8');

    expect(source).not.toContain('image="generic_building_shadow"');
    expect(source).not.toContain('image="selection_ellipse_building"');
    expect(source).not.toContain('image="hover_ellipse_building"');
    expect(source).not.toContain('image={spriteKey}');
  });

  it('waits for texture registry readiness before warning about missing building sprites', () => {
    const buildingLayerSource = readFileSync(join(process.cwd(), 'src/pixi/layers/IsoBuildingLayer.tsx'), 'utf8');
    const ghostLayerSource = readFileSync(join(process.cwd(), 'src/pixi/layers/IsoGhostPlacementLayer.tsx'), 'utf8');
    const useTexturesPattern = /const\s*\{\s*ready\s*,\s*registry\s*\}\s*=\s*useTextures\(\s*\)\s*;/;
    const readyGuardPattern = /if\s*\(\s*!ready\s*\)\s*return\s+null\s*;/;

    expect(buildingLayerSource).toMatch(useTexturesPattern);
    expect(buildingLayerSource).toMatch(readyGuardPattern);
    expect(ghostLayerSource).toMatch(useTexturesPattern);
    expect(ghostLayerSource).toMatch(readyGuardPattern);
  });
});
