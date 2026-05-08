import { readFileSync } from 'fs';
import { join } from 'path';

describe('BuildingInspector store subscriptions', () => {
  it('derives panel data from a stable game-state snapshot instead of an object-returning selector', () => {
    const source = readFileSync(join(process.cwd(), 'src/ui/panels/BuildingInspector.tsx'), 'utf8');

    expect(source).toMatch(/import\s*\{[^}]*\buseMemo\b[^}]*\}\s*from\s*['"]react['"]/);
    expect(source).toContain('const gameState = useGameStore((state) => state.gameState);');
    expect(source).toContain('const panelDerived = useMemo(() => {');
    expect(source).not.toContain('const panelDerived = useGameStore((state) => {');
  });

  it('distinguishes under-construction from max-level upgrade notes', () => {
    const source = readFileSync(join(process.cwd(), 'src/ui/panels/BuildingInspector.tsx'), 'utf8');

    expect(source).toContain("isUnderConstruction ? 'Finish construction before upgrading.' : 'Maximum level reached.'");
  });

  it('shows worker hire costs with resource labels and vault availability', () => {
    const source = readFileSync(join(process.cwd(), 'src/ui/panels/BuildingInspector.tsx'), 'utf8');

    expect(source).toContain('resourceShortLabel(resource as ResourceType)');
    expect(source).toContain('{currentAmount}/{amount}');
    expect(source).toContain('Vault is short');
  });
});
