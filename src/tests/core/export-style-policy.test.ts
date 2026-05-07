import fs from 'node:fs';
import path from 'node:path';

const repoRoot = path.resolve(__dirname, '../../..');
const DOMAIN_DIRS = ['src/game', 'src/lib', 'src/store'] as const;
const UI_DIRS = ['src/ui', 'src/components'] as const;

function walk(dir: string): string[] {
  const out: string[] = [];
  for (const entry of fs.readdirSync(dir, { withFileTypes: true })) {
    const full = path.join(dir, entry.name);
    if (entry.isDirectory()) out.push(...walk(full));
    else if (/\.(ts|tsx)$/.test(entry.name)) out.push(full);
  }
  return out;
}

describe('export style policy', () => {
  it('keeps domain utilities on named exports only', () => {
    const offenders: string[] = [];

    for (const dir of DOMAIN_DIRS) {
      for (const file of walk(path.join(repoRoot, dir))) {
        const code = fs.readFileSync(file, 'utf8');
        if (/export\s+default\b/.test(code)) {
          offenders.push(path.relative(repoRoot, file).replace(/\\/g, '/'));
        }
      }
    }

    expect(offenders).toEqual([]);
  });

  it('documents UI/component layer as default-export friendly', () => {
    const defaultsInUi = UI_DIRS.flatMap((dir) =>
      walk(path.join(repoRoot, dir)).filter((file) => /export\s+default\b/.test(fs.readFileSync(file, 'utf8'))),
    );

    expect(defaultsInUi.length).toBeGreaterThan(0);
  });
});
