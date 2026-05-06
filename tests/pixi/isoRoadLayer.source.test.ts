import { readFileSync } from 'fs';
import { join } from 'path';

describe('IsoRoadLayer integration', () => {
  it('mounts the road layer from GameStage with tile render data', () => {
    const source = readFileSync(join(process.cwd(), 'src/pixi/GameStage.tsx'), 'utf8');

    expect(source).toContain("import IsoRoadLayer from './layers/IsoRoadLayer'");
    expect(source).toContain('<IsoRoadLayer tiles={world.tiles} />');
  });

  it('renders road tiles instead of null placeholders', () => {
    const layerSource = readFileSync(join(process.cwd(), 'src/pixi/layers/IsoRoadLayer.tsx'), 'utf8');
    const spriteSource = readFileSync(join(process.cwd(), 'src/pixi/entities/roads/IsoRoadSprite.tsx'), 'utf8');
    const segmentSource = readFileSync(join(process.cwd(), 'src/pixi/entities/roads/IsoRoadSegment.tsx'), 'utf8');

    expect(layerSource).toContain('tiles: IsoRenderWorld[\'tiles\']');
    expect(spriteSource).toContain('Graphics');
    expect(spriteSource).toContain('terrain_scarPath');
    expect(segmentSource).toContain('Graphics');
    expect(spriteSource).not.toContain('return null');
    expect(segmentSource).not.toContain('return null');
  });
});
