import { existsSync, readFileSync } from 'fs';
import { join } from 'path';

describe('Pixi world architecture', () => {
  it('does not keep the inactive world scaffold beside GameStage', () => {
    const worldFiles = [
      'WorldRoot.tsx',
      'WorldViewport.tsx',
      'WorldChunks.tsx',
      'ChunkContainer.tsx',
      'SortableWorldContainer.tsx',
    ];

    for (const file of worldFiles) {
      expect(existsSync(join(process.cwd(), 'src/pixi/world', file))).toBe(false);
    }
  });

  it('documents GameStage as the Pixi render composition point', () => {
    const architecture = readFileSync(join(process.cwd(), 'Architektur.md'), 'utf8');

    expect(architecture).not.toContain('src/pixi/world');
    expect(architecture).not.toContain('WorldRoot.tsx');
    expect(architecture).toContain('GameStage.tsx');
    expect(architecture).toContain('baut den Renderbaum der Spielwelt auf');
  });
});
