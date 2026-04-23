const fs: any = require('fs');
const path: any = require('path');

describe('spritesheets manifest', () => {
  test('all referenced files exist', () => {
    const manifest: any = require('../../src/assets/spritesheets/manifest.json');
    const files: string[] = [];

    function collect(obj: any): void {
      if (!obj || typeof obj !== 'object') return;
      for (const k of Object.keys(obj)) {
        const v: any = obj[k];
        if (k === 'file' && typeof v === 'string') files.push(v);
        else if (Array.isArray(v)) v.forEach((item: any) => collect(item));
        else if (typeof v === 'object') collect(v);
      }
    }

    collect(manifest);
    expect(files.length).toBeGreaterThan(0);

    const missing = files.filter((f: string) => !fs.existsSync(path.resolve(process.cwd(), 'src/assets/spritesheets', f)));
    expect(missing).toHaveLength(0);
  });
});
