import { readFileSync } from 'fs';
import { join } from 'path';

describe('Playwright game smoke script', () => {
  it('covers the playable browser loop with CDP screenshots', () => {
    const packageJson = readFileSync(join(process.cwd(), 'package.json'), 'utf8');
    const script = readFileSync(join(process.cwd(), 'scripts/playwright-game-smoke.mjs'), 'utf8');

    expect(packageJson).toContain('"smoke:playwright": "node scripts/playwright-game-smoke.mjs"');
    expect(script).toContain('Page.captureScreenshot');
    expect(script).toContain("await page.goto(`${BASE_URL}/game`");
    expect(script).toContain('getByRole');
    expect(script).toContain('Build');
    expect(script).toContain('Toggle road building tool');
    expect(script).toContain('Toggle road removal tool');
    expect(script).toContain('Inspect Vault of Digestive Stone');
    expect(script).toContain('Economy overview');
    expect(script).toContain('Transport status');
    expect(script).toContain('Missing building texture');
    expect(script).toContain('Worker');
    expect(script).toContain('setSpeed(page,');
  });
});
