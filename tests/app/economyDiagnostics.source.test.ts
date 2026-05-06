import { readFileSync } from 'fs';
import { join } from 'path';

describe('economy diagnostics integration', () => {
  it('uses createEconomySnapshot in DebugLogisticsPanel', () => {
    const source = readFileSync(join(process.cwd(), 'src/ui/panels/DebugLogisticsPanel.tsx'), 'utf8');

    expect(source).toContain("import { createEconomySnapshot } from '../../game/economy/economy.snapshot'");
    expect(source).toContain('createEconomySnapshot(gameState)');
    expect(source).toContain('snapshot.totalBuildings');
    expect(source).toContain('snapshot.totalWorkers');
    expect(source).toContain('snapshot.totalStoredResources');
  });

  it('uses transport route diagnostics in EconomyPanel road-disconnected details', () => {
    const source = readFileSync(join(process.cwd(), 'src/ui/panels/EconomyPanel.tsx'), 'utf8');

    expect(source).toContain("getTransportRouteDiagnostic");
    expect(source).toContain('getRoadDisconnectedDetail');
    expect(source).toContain("productionStatus.kind === 'roadDisconnected'");
    expect(source).toContain('routeDiagnostic ?? productionStatus.detail');
  });
});
