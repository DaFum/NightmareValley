import { readFileSync } from 'fs';
import { join } from 'path';

function extractRule(css: string, selector: string): string {
  const start = css.indexOf(selector);
  if (start < 0) return '';
  const end = css.indexOf('\n}', start);
  return end < 0 ? css.slice(start) : css.slice(start, end + 3);
}

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
    const baseTacticalMapRule = extractRule(css, '.tactical-map {');
    const mobileTacticalMapMatch = css.match(/@media \(max-width: 760px\) \{[\s\S]*?\.tactical-map \{[\s\S]*?top: 164px;[\s\S]*?\n  \}/);

    expect(baseTacticalMapRule).toContain('.tactical-map {\n  position: fixed;');
    expect(baseTacticalMapRule).toContain('top: 204px;');
    expect(mobileTacticalMapMatch?.[0] ?? '').toContain('top: 164px;');
  });
});
