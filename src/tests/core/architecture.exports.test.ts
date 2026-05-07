import fs from 'node:fs';
import path from 'node:path';

const repoRoot = path.resolve(__dirname, '../../..');
const TARGET_DIRS = ['src/game/core', 'src/game/economy', 'src/game/entities', 'src/game/iso'] as const;
const BASELINE_PATH = path.join(repoRoot, 'src/tests/core/fixtures/unused-exports-baseline.json');

function walk(dir: string): string[] {
  const out: string[] = [];
  for (const entry of fs.readdirSync(dir, { withFileTypes: true })) {
    const full = path.join(dir, entry.name);
    if (entry.isDirectory()) out.push(...walk(full));
    else if (/\.(ts|tsx)$/.test(entry.name)) out.push(full);
  }
  return out;
}

function collectUnusedFunctionExports(): string[] {
  const targetFiles = TARGET_DIRS.flatMap((dir) => walk(path.join(repoRoot, dir)));
  const runtimeFiles = walk(path.join(repoRoot, 'src')).filter(
    (file) => !/\.test\./.test(file) && !/\/tests\//.test(file) && !/\.d\.ts$/.test(file),
  );

  const exportedFunctions = targetFiles.flatMap((file) => {
    const rel = path.relative(repoRoot, file).replace(/\\/g, '/');
    const code = fs.readFileSync(file, 'utf8');
    return [...code.matchAll(/export\s+function\s+([A-Za-z0-9_]+)/g)].map((m) => `${rel}::${m[1]}`);
  });

  const used = new Set<string>();
  for (const runtimeFile of runtimeFiles) {
    const code = fs.readFileSync(runtimeFile, 'utf8');
    for (const m of code.matchAll(/import\s+([^;]+?)\s+from\s+['"]([^'"]+)['"]/g)) {
      const clause = m[1].trim();
      const spec = m[2];
      if (!spec.startsWith('.')) continue;

      const base = path.resolve(path.dirname(runtimeFile), spec);
      const resolved = [base, `${base}.ts`, `${base}.tsx`, path.join(base, 'index.ts')].find((p) => fs.existsSync(p));
      if (!resolved) continue;

      const relImport = path.relative(repoRoot, resolved).replace(/\\/g, '/');
      if (!TARGET_DIRS.some((dir) => relImport.startsWith(`${dir}/`))) continue;

      const named = clause.match(/\{([^}]+)\}/);
      if (!named) continue;
      for (const raw of named[1].split(',')) {
        const part = raw.trim();
        if (!part) continue;
        const [left] = part.split(/\s+as\s+/i);
        used.add(`${relImport}::${left.trim()}`);
      }
    }
  }

  return exportedFunctions.filter((symbol) => !used.has(symbol)).sort();
}

describe('architecture export usage guard', () => {
  it('fails when newly exported helper functions are not wired into runtime', () => {
    const baseline: string[] = JSON.parse(fs.readFileSync(BASELINE_PATH, 'utf8'));
    const baselineSet = new Set(baseline);
    const unusedNow = collectUnusedFunctionExports();

    const newlyUnused = unusedNow.filter((symbol) => !baselineSet.has(symbol));
    expect(newlyUnused).toEqual([]);
  });
});
