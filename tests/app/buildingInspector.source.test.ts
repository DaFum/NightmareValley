import { readFileSync } from 'fs';
import { join } from 'path';

describe('BuildingInspector store subscriptions', () => {
  it('derives panel data from a stable game-state snapshot instead of an object-returning selector', () => {
    const source = readFileSync(join(process.cwd(), 'src/ui/panels/BuildingInspector.tsx'), 'utf8');

    expect(source).toContain("import { useMemo } from 'react'");
    expect(source).toContain('const gameState = useGameStore((state) => state.gameState);');
    expect(source).toContain('const panelDerived = useMemo(() => {');
    expect(source).not.toContain('const panelDerived = useGameStore((state) => {');
  });

  it('does not call unfinished construction maximum level', () => {
    const source = readFileSync(join(process.cwd(), 'src/ui/panels/BuildingInspector.tsx'), 'utf8');

    expect(source).toContain("isUnderConstruction ? 'Finish construction before upgrading.' : 'Maximum level reached.'");
  });
});
