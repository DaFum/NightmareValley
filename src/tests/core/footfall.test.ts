import { decayFootfall, recomputeTierFromFootfall } from "../../game/economy/transport.logic";
import { EconomySimulationState } from "../../game/core/economy.simulation";
import { MapTile, TerritoryState } from "../../game/core/game.types";
import { DEFAULT_SIMULATION_CONFIG } from "../../game/economy/balancing.constants";

function makeMockTile(overrides: Partial<MapTile> = {}): MapTile {
  return {
    id: "t_mock",
    position: { x: 0, y: 0 },
    terrain: "weepingForest",
    footfall: 0,
    tier: "grass",
    ...overrides,
  };
}

describe("footfall decay and tier transitions", () => {
  const thresholds = DEFAULT_SIMULATION_CONFIG.footfallTierThresholds;

  it("upgrades tier correctly based on thresholds", () => {
    const tile = makeMockTile({ footfall: 0, tier: "grass" });

    recomputeTierFromFootfall(tile, thresholds);
    expect(tile.tier).toBe("grass");

    tile.footfall = 10;
    recomputeTierFromFootfall(tile, thresholds);
    expect(tile.tier).toBe("dirt");

    tile.footfall = 50;
    recomputeTierFromFootfall(tile, thresholds);
    expect(tile.tier).toBe("cobble");

    tile.footfall = 200;
    recomputeTierFromFootfall(tile, thresholds);
    expect(tile.tier).toBe("paved");
  });

  it("decays footfall every 10 ticks and downgrades tiers", () => {
    const tile = makeMockTile({ id: "t1", footfall: 200, tier: "paved" });

    let state: EconomySimulationState = {
      tick: 10,
      territory: {
        tiles: { "t1": tile }
      } as TerritoryState
    } as any;

    const config = { ...DEFAULT_SIMULATION_CONFIG, footfallDecayPerTenTicks: 1 };

    // Tick 10: decay applied
    decayFootfall(state, config);
    expect(tile.footfall).toBe(199);
    expect(tile.tier).toBe("cobble"); // 199 < 200

    // Tick 11: no decay applied
    state.tick = 11;
    decayFootfall(state, config);
    expect(tile.footfall).toBe(199);

    // Floor at 0
    tile.footfall = 0.5;
    state.tick = 20;
    decayFootfall(state, config);
    expect(tile.footfall).toBe(0);
    expect(tile.tier).toBe("grass");
  });
});
