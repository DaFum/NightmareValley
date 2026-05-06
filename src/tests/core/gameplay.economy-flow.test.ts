import { player1Id, useGameStore } from "../../store/game.store";

describe("complete gameplay economy flow", () => {
  beforeEach(() => {
    useGameStore.getState().resetGame("challenging");
    useGameStore.setState({ isRunning: true, lastError: undefined });
  });

  it("keeps building buffers non-negative across 120 ticks", () => {
    for (let i = 0; i < 120; i++) {
      useGameStore.getState().runSimulationSteps(1, 0.2, 5);
    }

    const state = useGameStore.getState().gameState;
    const player = state.players[player1Id];
    expect(player.buildings.length).toBeGreaterThan(0);

    for (const building of Object.values(state.buildings)) {
      for (const amount of Object.values(building.inputBuffer)) {
        expect(amount).toBeGreaterThanOrEqual(0);
      }
      for (const amount of Object.values(building.outputBuffer)) {
        expect(amount).toBeGreaterThanOrEqual(0);
      }
    }
  });

  it("keeps worker morale and position finite across 120 ticks", () => {
    for (let i = 0; i < 120; i++) {
      useGameStore.getState().runSimulationSteps(1, 0.2, 5);
    }

    const state = useGameStore.getState().gameState;
    const player = state.players[player1Id];
    expect(player.workers.length).toBeGreaterThan(0);

    for (const worker of Object.values(state.workers)) {
      expect(worker.morale).toBeGreaterThanOrEqual(0);
      expect(worker.infection).toBeGreaterThanOrEqual(0);
      expect(Number.isFinite(worker.position.x)).toBe(true);
      expect(Number.isFinite(worker.position.y)).toBe(true);
    }
  });

  it("never reports lastError during steady-state simulation", () => {
    for (let i = 0; i < 120; i++) {
      useGameStore.getState().runSimulationSteps(1, 0.2, 5);
    }

    expect(useGameStore.getState().lastError).toBeUndefined();
  });
});
