import { readFileSync } from 'fs';
import { join } from 'path';

describe('Pixi render performance safeguards', () => {
  it('memoizes road tile filtering and draw callbacks without wrapping Pixi components', () => {
    const layerSource = readFileSync(join(process.cwd(), 'src/pixi/layers/IsoRoadLayer.tsx'), 'utf8');
    const spriteSource = readFileSync(join(process.cwd(), 'src/pixi/entities/roads/IsoRoadSprite.tsx'), 'utf8');

    expect(layerSource).toContain('function IsoRoadLayer');
    expect(layerSource).not.toContain('React.memo');
    expect(spriteSource).not.toContain('React.memo');
    expect(spriteSource).toContain('useMemo');
    expect(spriteSource).toContain('useCallback');
  });

  it('does not dump the full texture cache to the console during gameplay startup', () => {
    const registrySource = readFileSync(join(process.cwd(), 'src/pixi/utils/textureRegistry.ts'), 'utf8');
    const loaderSource = readFileSync(join(process.cwd(), 'src/pixi/utils/spritesheetLoader.ts'), 'utf8');

    expect(registrySource).not.toContain('texture keys:');
    expect(registrySource).not.toContain('sample texture details');
    expect(loaderSource).not.toContain('registered textures:');
  });
});
