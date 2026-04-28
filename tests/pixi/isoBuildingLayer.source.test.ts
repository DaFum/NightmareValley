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
});
