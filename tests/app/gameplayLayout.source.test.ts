import { readFileSync } from 'fs';
import { join } from 'path';

describe('gameplay layout CSS', () => {
  const css = () => readFileSync(join(process.cwd(), 'src/styles/ui.css'), 'utf8');

  it('keeps the dev logistics panel out of bottom dock tool hit areas', () => {
    const source = css();
    const debugPanelRule = source.match(/\.game-layout__debug-panel\s*\{[^}]+\}/)?.[0] ?? '';
    const debugSource = readFileSync(join(process.cwd(), 'src/ui/panels/DebugLogisticsPanel.tsx'), 'utf8');

    expect(debugPanelRule).toContain('right: 24px');
    expect(debugPanelRule).toContain('bottom: 96px');
    expect(debugPanelRule).not.toContain('left: 1rem');
    expect(debugPanelRule).toContain('z-index: 90');
    expect(debugPanelRule).toContain('overflow-y: auto');
    expect(source).toContain('.debug-logistics-panel__checkbox');
    expect(debugSource).toContain('className="macabre-panel debug-logistics-panel"');
    expect(debugSource).not.toContain('style={{');
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
    expect(source).toContain('body.ui--tool-active .military-panel');
    expect(source).toContain('body.ui--tool-active .game-layout__debug-panel');
    const hiddenOverlayBlock = source.match(/body\.ui--tool-active \.game-guide[\s\S]*?body\.ui--tool-active \.game-layout__debug-panel\s*\{[\s\S]*?\}/)?.[0] ?? '';
    expect(hiddenOverlayBlock).toContain('display: none');
  });

  it('keeps primary build controls visible in minimal HUD while hiding secondary panels', () => {
    const source = css();
    const minimalBlock = source.match(/body\.ui--minimal \.top-hud__economy[\s\S]*?\{\s*display: none;\s*\}/)?.[0] ?? '';

    expect(minimalBlock).toContain('body.ui--minimal .game-layout__debug-panel');
    expect(minimalBlock).toContain('body.ui--minimal .military-panel');
    expect(minimalBlock).not.toContain('body.ui--minimal .build-dock');
  });

  it('hides passive military and debug overlays while guide or build catalog owns the playfield', () => {
    const source = css();
    const guideBlock = source.match(/body\.ui--guide-open \.event-log[\s\S]*?\{\s*display: none;\s*\}/)?.[0] ?? '';
    const buildMenuBlock = source.match(/body\.ui--build-menu-open \.game-guide[\s\S]*?\{\s*display: none;\s*\}/)?.[0] ?? '';

    expect(guideBlock).toContain('body.ui--guide-open .military-panel');
    expect(guideBlock).toContain('body.ui--guide-open .game-layout__debug-panel');
    expect(buildMenuBlock).toContain('body.ui--build-menu-open .military-panel');
    expect(buildMenuBlock).toContain('body.ui--build-menu-open .top-hud__economy');
    expect(buildMenuBlock).toContain('body.ui--build-menu-open .top-hud__pulse');
  });

  it('constrains the bottom dock so stacked panels cannot cover the whole desktop playfield', () => {
    const source = css();
    const bottomDockRule = source.match(/\.game-layout__bottom-dock\s*\{[^}]+\}/)?.[0] ?? '';

    expect(bottomDockRule).toContain('max-height:');
    expect(bottomDockRule).toContain('overflow-y: auto');
    expect(bottomDockRule).toContain('padding-bottom: 5rem');
    expect(bottomDockRule).toContain('scrollbar-gutter: stable');
  });

  it('keeps the build menu list scrollable inside the viewport-bound panel', () => {
    const source = css();
    const buildMenuRule = source.match(/\.build-menu-panel\s*\{[^}]+\}/)?.[0] ?? '';
    const buildingListRule = source.match(/\.building-list\s*\{[^}]+\}/)?.[0] ?? '';

    expect(buildMenuRule).toContain('position: fixed');
    expect(buildMenuRule).toContain('left: 24px');
    expect(buildMenuRule).toContain('bottom: 96px');
    expect(buildMenuRule).toContain('grid-template-rows: auto auto auto minmax(0, 1fr)');
    expect(buildMenuRule).toContain('box-sizing: border-box');
    expect(buildingListRule).toContain('min-height: 0');
    expect(buildingListRule).toContain('overflow-y: auto');
  });

  it('keeps the build catalog above passive panels on mobile', () => {
    const source = css();
    const gameLayout = readFileSync(join(process.cwd(), 'src/app/layout/GameLayout.tsx'), 'utf8');
    const dockRules = [...source.matchAll(/\.build-dock\s*\{[^}]+\}/g)].map((match) => match[0]);
    const menuRules = [...source.matchAll(/\.build-menu-panel\s*\{[^}]+\}/g)].map((match) => match[0]);
    const mobileBlock = source.match(/@media \(max-width: 760px\) \{[\s\S]*?\/\* ─── Game Guide/)?.[0] ?? '';

    expect(gameLayout).toContain('ui--build-menu-open');
    expect(gameLayout).toContain("activePanel === 'buildingMenu'");
    expect(source).toContain('body.ui--build-menu-open .settlement-brief');
    expect(source).toContain('body.ui--build-menu-open .game-guide');
    expect(dockRules.some((rule) => rule.includes('position: fixed'))).toBe(true);
    expect(dockRules.some((rule) => rule.includes('bottom: 24px'))).toBe(true);
    expect(dockRules.some((rule) => rule.includes('z-index: 140'))).toBe(true);
    expect(mobileBlock).toContain('.build-dock');
    expect(mobileBlock).toContain('left: 12px');
    expect(mobileBlock).toContain('right: 12px');
    expect(mobileBlock).toContain('bottom: 12px');
    expect(menuRules.some((rule) => rule.includes('position: fixed'))).toBe(true);
    expect(menuRules.some((rule) => rule.includes('z-index: 30'))).toBe(true);
    expect(mobileBlock).toContain('bottom: 148px');
  });

  it('clears active placement tools when the run ends or restarts', () => {
    const gameLayout = readFileSync(join(process.cwd(), 'src/app/layout/GameLayout.tsx'), 'utf8');

    expect(gameLayout).toContain('const clearActiveTools = React.useCallback');
    expect(gameLayout).toContain('selectBuildingToPlace(null);');
    expect(gameLayout).toContain('setRoadPlacementMode(false);');
    expect(gameLayout).toContain('setRoadRemovalMode(false);');
    expect(gameLayout).toContain('clearSelection();');
    expect(gameLayout).toMatch(/if \(outcome\.kind !== 'in-progress'\) \{[\s\S]*?clearActiveTools\(\);[\s\S]*?\}/);
    expect(gameLayout).toMatch(/const handleRestart = React\.useCallback\(\(\) => \{[\s\S]*?clearActiveTools\(\);[\s\S]*?resetGame\(\);/);
  });

  it('lets Escape close the build catalog before falling back to map selection cleanup', () => {
    const gameLayout = readFileSync(join(process.cwd(), 'src/app/layout/GameLayout.tsx'), 'utf8');

    expect(gameLayout).toMatch(/action === 'cancelOrClose'[\s\S]*?activePanel === 'buildingMenu'[\s\S]*?togglePanel\('buildingMenu'\);/);
  });

  it('prevents desktop HUD flex-basis from becoming mobile panel height', () => {
    const source = css();
    const mobileBlock = source.match(/@media \(max-width: 760px\) \{[\s\S]*?\/\* ─── Game Guide/)?.[0] ?? '';
    const economyRule = mobileBlock.match(/\.top-hud__economy\s*\{[^}]+\}/)?.[0] ?? '';
    const pulseRule = mobileBlock.match(/\.top-hud__pulse\s*\{[^}]+\}/)?.[0] ?? '';

    expect(economyRule).toContain('flex: 0 0 auto');
    expect(pulseRule).toContain('flex: 0 0 auto');
    expect(pulseRule).toContain('min-width: 0');
  });
});
