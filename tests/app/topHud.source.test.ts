import { readFileSync } from 'fs';
import { join } from 'path';

describe('TopHud mode toggles', () => {
  it('labels the HUD density toggle by current mode instead of the opposite action', () => {
    const source = readFileSync(join(process.cwd(), 'src/ui/hud/TopHud.tsx'), 'utf8');

    expect(source).toContain("const hudDensityLabel = minimalHud ? 'HUD Minimal' : 'HUD Full';");
    expect(source).toContain('const hudDensityAriaLabel = `${hudDensityLabel}. ${hudDensityTitle}`;');
    expect(source).toContain('aria-label={hudDensityAriaLabel}');
    expect(source).toContain('{hudDensityLabel}');
    expect(source).not.toContain("{minimalHud ? 'Full HUD' : 'Minimal'}");
  });

  it('keeps the tactical map below the wrapped top HUD controls', () => {
    const css = readFileSync(join(process.cwd(), 'src/styles/ui.css'), 'utf8');

    expect(css).toContain('.tactical-map {\n  position: fixed;');
    expect(css).toContain('top: 204px;');
    expect(css).toContain('top: 164px;');
  });
});
