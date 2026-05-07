import { readFileSync } from 'fs';
import { join } from 'path';

describe('playwright screenshot script configuration', () => {
  it('targets the dev server by default when dev-only screenshots are requested', () => {
    const source = readFileSync(join(process.cwd(), 'scripts/playwright-screenshots.mjs'), 'utf8');

    expect(source).toContain('const DEFAULT_PORT = INCLUDE_DEV_SCREENSHOTS ? 5173 : 4173;');
    expect(source).toContain('const PORT = Number(process.env.PORT ?? DEFAULT_PORT);');
    expect(source).not.toContain('const PORT = 4173;');
  });
});
