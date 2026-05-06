import { readFileSync } from 'fs';
import { join } from 'path';

describe('placement flow', () => {
  it('keeps building placement active when placement is rejected', () => {
    const hook = readFileSync(join(process.cwd(), 'src/pixi/hooks/useSelectionInput.ts'), 'utf8');
    const store = readFileSync(join(process.cwd(), 'src/store/game.store.ts'), 'utf8');

    expect(store).toContain('placeBuildingAt: (ownerId: string, buildingType: BuildingType, tileId: string) => boolean');
    expect(store).toMatch(/placeBuildingAt:\s*\(ownerId: string, buildingType: BuildingType, tileId: string\) => boolean[\s\S]*?try[\s\S]*?return true;[\s\S]*?catch[\s\S]*?return false;/);
    expect(hook).toContain('const placed = placeBuildingAt(player1Id, selectedBuildingToPlace, hit.tileId);');
    expect(hook).toContain('if (placed) selectBuildingToPlace(null);');
    expect(hook).not.toMatch(/placeBuildingAt\([^)]*\);\s*selectBuildingToPlace\(/);
  });
});
