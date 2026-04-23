import fs from 'fs';
import path from 'path';
import manifest from '../../src/assets/spritesheets/manifest.json';
import { jest, describe, beforeEach, test, expect } from '@jest/globals';

jest.resetModules();

describe('Spritesheet manifest file check', () => {
  test('all referenced files exist under src/assets/spritesheets', () => {
    const sheetRoot = path.resolve(process.cwd(), 'src', 'assets', 'spritesheets');
    const found = new Set<string>();

    function walk(obj: any) {
      if (!obj) return;
      if (Array.isArray(obj)) {
        for (const v of obj) walk(v);
        return;
      }
      if (typeof obj === 'object') {
        if (obj.file) found.add(obj.file);
        for (const k of Object.keys(obj)) {
          if (k === 'metadata') continue;
          walk(obj[k]);
        }
      }
    }

    walk(manifest as any);

    const missing: string[] = [];
    for (const f of Array.from(found)) {
      const p = path.join(sheetRoot, f.replace(/\//g, path.sep));
      if (!fs.existsSync(p)) missing.push(f);
    }

    expect(missing).toEqual([]);
  });
});
