import { readFileSync } from 'fs';
import { join } from 'path';

describe('gameplay layout CSS', () => {
  const css = () => readFileSync(join(process.cwd(), 'src/styles/ui.css'), 'utf8');

  it('keeps the dev logistics panel out of the build dock hit area', () => {
    const source = css();
    const debugPanelRule = source.match(/\.game-layout__debug-panel\s*\{[^}]+\}/)?.[0] ?? '';

    expect(debugPanelRule).toContain('top: 8rem');
    expect(debugPanelRule).not.toContain('bottom: 1rem');
    expect(debugPanelRule).toContain('z-index: 90');
    expect(debugPanelRule).toContain('overflow-y: auto');
  });

  it('allows the top HUD to wrap instead of overlapping at gameplay widths', () => {
    const source = css();
    const topHudRule = source.match(/\.top-hud-inner\s*\{[^}]+\}/)?.[0] ?? '';
    const controlsRule = source.match(/\.hud-controls\s*\{[^}]+\}/)?.[0] ?? '';

    expect(topHudRule).toContain('display: flex');
    expect(topHudRule).toContain('flex-wrap: wrap');
    expect(controlsRule).toContain('flex-wrap: wrap');
  });

  it('clears playfield overlays while placement tools are active', () => {
    const source = css();
    const gameLayout = readFileSync(join(process.cwd(), 'src/app/layout/GameLayout.tsx'), 'utf8');

    expect(gameLayout).toContain('ui--tool-active');
    expect(gameLayout).toContain('selectedBuildingToPlace || roadPlacementMode || roadRemovalMode');
    expect(source).toContain('body.ui--tool-active .game-guide');
    expect(source).toContain('body.ui--tool-active .settlement-brief');
    expect(source).toContain('body.ui--tool-active .build-menu-panel');
    expect(source).toContain('body.ui--tool-active .game-layout__debug-panel');
    expect(source).toContain('display: none');
  });

  it('keeps the build catalog above passive panels on mobile', () => {
    const source = css();
    const gameLayout = readFileSync(join(process.cwd(), 'src/app/layout/GameLayout.tsx'), 'utf8');
    const dockRules = [...source.matchAll(/\.build-dock\s*\{[^}]+\}/g)].map((match) => match[0]);
    const menuRules = [...source.matchAll(/\.build-menu-panel\s*\{[^}]+\}/g)].map((match) => match[0]);

    expect(gameLayout).toContain('ui--build-menu-open');
    expect(gameLayout).toContain("activePanel === 'buildingMenu'");
    expect(source).toContain('body.ui--build-menu-open .settlement-brief');
    expect(source).toContain('body.ui--build-menu-open .game-guide');
    expect(dockRules.some((rule) => rule.includes('z-index: 25'))).toBe(true);
    expect(menuRules.some((rule) => rule.includes('position: relative'))).toBe(true);
    expect(menuRules.some((rule) => rule.includes('z-index: 30'))).toBe(true);
  });
});
