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

  it('uses named balancing thresholds for settlement brief warnings', () => {
    const planner = readFileSync(join(process.cwd(), 'src/game/economy/economy.planner.ts'), 'utf8');
    const constants = readFileSync(join(process.cwd(), 'src/game/economy/balancing.constants.ts'), 'utf8');

    expect(constants).toContain('TRANSPORT_QUEUE_MIN_BACKLOG_WARNING');
    expect(constants).toContain('TRANSPORT_QUEUE_CARRIER_BACKLOG_MULTIPLIER');
    expect(constants).toContain('TRANSPORT_NETWORK_STRESS_WARNING');
    expect(constants).toContain('TRANSPORT_AVERAGE_LATENCY_WARNING_SEC');
    expect(constants).toContain('VAULT_CRITICAL_INTEGRITY_PERCENT');
    expect(constants).toContain('ENEMY_PRESSURE_WARNING_THRESHOLD');
    expect(constants).toContain('NEXT_ATTACK_WARNING_SEC');
    expect(planner).toContain('TRANSPORT_QUEUE_MIN_BACKLOG_WARNING');
    expect(planner).toContain('TRANSPORT_QUEUE_CARRIER_BACKLOG_MULTIPLIER');
    expect(planner).toContain('TRANSPORT_NETWORK_STRESS_WARNING');
    expect(planner).toContain('TRANSPORT_AVERAGE_LATENCY_WARNING_SEC');
    expect(planner).toContain('VAULT_CRITICAL_INTEGRITY_PERCENT');
    expect(planner).toContain('ENEMY_PRESSURE_WARNING_THRESHOLD');
    expect(planner).toContain('NEXT_ATTACK_WARNING_SEC');
    expect(planner).not.toContain('Math.max(3, totalCarriers * 2)');
    expect(planner).not.toContain('networkStress >= 8');
    expect(planner).not.toContain('averageLatencySec >= 12');
    expect(planner).not.toContain('vaultIntegrity <= 35');
    expect(planner).not.toContain('enemyPressure >= 70');
    expect(planner).not.toContain('nextAttackSec <= 45');
  });
});
