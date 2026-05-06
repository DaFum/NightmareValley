import fs from 'node:fs';
import path from 'node:path';

const repoRoot = path.resolve(__dirname, '../../..');
const srcRoot = path.join(repoRoot, 'src');

function walk(dir: string): string[] {
  const out: string[] = [];
  for (const entry of fs.readdirSync(dir, { withFileTypes: true })) {
    const full = path.join(dir, entry.name);
    if (entry.isDirectory()) out.push(...walk(full));
    else if (/\.(ts|tsx)$/.test(entry.name)) out.push(full);
  }
  return out;
}

describe('worker transition ownership', () => {
  it('allows worker transition modules only from simulation orchestrators/tests', () => {
    const runtimeFiles = walk(srcRoot).filter((f) => !/\.test\./.test(f));
    const offenders: string[] = [];

    for (const file of runtimeFiles) {
      const rel = path.relative(repoRoot, file).replace(/\\/g, '/');
      const code = fs.readFileSync(file, 'utf8');

      const importsTransition = /from\s+['\"][^'\"]*entities\/workers\/(worker\.logic|worker\.jobs)['\"]/.test(code);
      if (!importsTransition) continue;

      const allowed = rel === 'src/game/core/economy.simulation.ts' || rel === 'src/store/workerDomain.ts';
      if (!allowed) offenders.push(rel);
    }

    expect(offenders).toEqual([]);
  });
});
