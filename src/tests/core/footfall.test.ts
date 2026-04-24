import { decayFootfall, recomputeTierFromFootfall } from "../../game/economy/transport.logic";
import { EconomySimulationState } from "../../game/core/economy.simulation";
import { MapTile, TerritoryState } from "../../game/core/game.types";
import { DEFAULT_SIMULATION_CONFIG } from "../../game/economy/balancing.constants";

describe("footfall decay and tier transitions", () => {
  const thresholds = DEFAULT_SIMULATION_CONFIG.footfallTierThresholds;

  it("upgrades tier correctly based on thresholds", () => {
    const tile: MapTile = { footfall: 0, tier: "grass" } as any;

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
    const tile: MapTile = { id: "t1", footfall: 200, tier: "paved" } as any;

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
