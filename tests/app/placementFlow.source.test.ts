import { readFileSync } from 'fs';
import { join } from 'path';

describe('placement flow', () => {
  it('keeps building placement active when placement is rejected', () => {
    const hook = readFileSync(join(process.cwd(), 'src/pixi/hooks/useSelectionInput.ts'), 'utf8');
    const store = readFileSync(join(process.cwd(), 'src/store/game.store.ts'), 'utf8');

    expect(store).toContain('placeBuildingAt: (ownerId: string, buildingType: BuildingType, tileId: string) => boolean');
    expect(store).toMatch(/placeBuildingAt:\s*\(ownerId,\s*buildingType,\s*tileId\)\s*=>\s*{\s*try\s*{[\s\S]*?return true;\s*}\s*catch\s*\([^)]*\)\s*{[\s\S]*?return false;\s*}\s*},/);
    expect(hook).toContain('const placed = placeBuildingAt(player1Id, selectedBuildingToPlace, tile.id);');
    expect(hook).toMatch(/if \(placed\) \{\s*clearPlacementFeedback\(\);\s*selectBuildingToPlace\(null\);\s*\} else \{\s*setPlacementFeedback\(/);
    expect(hook).not.toMatch(/placeBuildingAt\([^)]*\);\s*selectBuildingToPlace\(/);
  });
});
