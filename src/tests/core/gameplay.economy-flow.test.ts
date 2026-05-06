import { player1Id, useGameStore } from "../../store/game.store";

describe("complete gameplay economy flow", () => {
  beforeEach(() => {
    useGameStore.getState().resetGame("challenging");
    useGameStore.setState({ isRunning: true, lastError: undefined });
  });

  it("runs buildings, workers, transport, and stock sync without invalid counters", () => {
    for (let i = 0; i < 120; i++) {
      useGameStore.getState().runSimulationSteps(1, 0.2, 5);
    }

    const state = useGameStore.getState().gameState;
    const player = state.players[player1Id];

    expect(useGameStore.getState().lastError).toBeUndefined();
    expect(player.buildings.length).toBeGreaterThan(0);
    expect(player.workers.length).toBeGreaterThan(0);
    expect(state.transport.queuedJobCount).toBeGreaterThanOrEqual(0);
    expect(state.worldPulse).toBeGreaterThanOrEqual(0);

    for (const building of Object.values(state.buildings)) {
      for (const amount of Object.values(building.inputBuffer)) {
        expect(amount ?? 0).toBeGreaterThanOrEqual(0);
      }
      for (const amount of Object.values(building.outputBuffer)) {
        expect(amount ?? 0).toBeGreaterThanOrEqual(0);
      }
    }

    for (const worker of Object.values(state.workers)) {
      expect(worker.morale).toBeGreaterThanOrEqual(0);
      expect(worker.infection).toBeGreaterThanOrEqual(0);
      expect(Number.isFinite(worker.position.x)).toBe(true);
      expect(Number.isFinite(worker.position.y)).toBe(true);
    }
  });
});
