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

  it('resolves the clicked tile once for all placement tool branches', () => {
    const hook = readFileSync(join(process.cwd(), 'src/pixi/hooks/useSelectionInput.ts'), 'utf8');

    expect(hook.match(/const tile = tileId \? gameState\.territory\.tiles\[tileId\] : undefined;/g) ?? []).toHaveLength(1);
    expect(hook).not.toContain('const tile = tileRef?.tile ?? (tileId ? gameState.territory.tiles[tileId] : undefined);');
  });

  it('uses an exhaustive typed road placement reason for player-facing road feedback', () => {
    const hook = readFileSync(join(process.cwd(), 'src/pixi/hooks/useSelectionInput.ts'), 'utf8');
    const domain = readFileSync(join(process.cwd(), 'src/store/placementFeedbackDomain.ts'), 'utf8');

    expect(hook).toContain('getRoadPlacementReasonMessage(roadValidation.reason)');
    expect(hook).not.toContain('function getRoadPlacementMessage');
    expect(domain).toContain("type RoadPlacementReason");
    expect(domain).toContain('export function getRoadPlacementReasonMessage(reason: RoadPlacementReason): string');
    expect(domain).toMatch(/never\s*=\s*reason/);
  });
});
