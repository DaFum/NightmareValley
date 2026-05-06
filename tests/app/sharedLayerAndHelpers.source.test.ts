import { existsSync, readFileSync } from 'fs';
import { join } from 'path';

describe('shared UI and helper ownership', () => {
  it('keeps reusable UI components in src/ui/shared instead of src/components', () => {
    const root = process.cwd();

    expect(existsSync(join(root, 'src/components/Button.tsx'))).toBe(false);
    expect(existsSync(join(root, 'src/components/Card.tsx'))).toBe(false);
    expect(existsSync(join(root, 'src/ui/shared/Button.tsx'))).toBe(true);
    expect(existsSync(join(root, 'src/ui/shared/Card.tsx'))).toBe(true);

    const panel = readFileSync(join(root, 'src/ui/shared/Panel.tsx'), 'utf8');
    const icon = readFileSync(join(root, 'src/ui/shared/Icon.tsx'), 'utf8');

    expect(panel).not.toContain('JSX.Element | null');
    expect(panel).not.toContain('<>{children ?? null}</>');
    expect(icon).not.toContain('return null');
  });

  it('uses lib helpers instead of economy.simulation-local duplicates', () => {
    const source = readFileSync(join(process.cwd(), 'src/game/core/economy.simulation.ts'), 'utf8');

    expect(source).toContain('import { deepClone } from "../../lib/deep-clone"');
    expect(source).toContain('import { clamp } from "../../lib/math"');
    expect(source).not.toContain('export function deepClone');
    expect(source).not.toContain('export function clamp');
  });

  it('migrates economy clamp imports to the lib helper', () => {
    const economyFiles = [
      'src/game/economy/extraction.logic.ts',
      'src/game/economy/production.logic.ts',
      'src/game/economy/transport.logic.ts',
    ];

    for (const file of economyFiles) {
      const source = readFileSync(join(process.cwd(), file), 'utf8');
      expect(source).toContain('import { clamp } from "../../lib/math"');
      expect(source).not.toMatch(/import\s+\{[^}]*clamp[^}]*\}\s+from ["']\.\.\/core\/economy\.simulation["']/);
    }
  });
});
