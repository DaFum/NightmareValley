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

    expect(buildingLayerSource).toContain('const { ready, registry } = useTextures();');
    expect(buildingLayerSource).toContain('if (!ready) return null;');
    expect(ghostLayerSource).toContain('const { ready, registry } = useTextures();');
    expect(ghostLayerSource).toContain('if (!ready) return null;');
  });
});
