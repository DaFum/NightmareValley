import { simulateTick } from '../../game/core/economy.simulation';
import { evaluateGameOutcome } from '../../game/core/victory.rules';
import { WorldState } from '../../game/world/world.types';

const playerId = 'p1';

function building(id: string, type: string, x: number, y: number, inputBuffer = {}, outputBuffer = {}) {
  return {
    id,
    type,
    ownerId: playerId,
    level: 1,
    integrity: 100,
    position: { x, y },
    connectedToRoad: true,
    inputBuffer,
    outputBuffer,
    internalStorage: {},
    assignedWorkers: [`w_${id}`],
    progressSec: 0,
    isActive: true,
  } as any;
}

function worker(id: string, type: string, buildingId: string, x: number, y: number) {
  return {
    id,
    type,
    ownerId: playerId,
    homeBuildingId: buildingId,
    currentBuildingId: buildingId,
    position: { x, y },
    isIdle: false,
    morale: 100,
    infection: 0,
    scars: 0,
  } as any;
}

function makeCompleteChainState(): WorldState {
  const buildings: WorldState['buildings'] = {
    vault: { ...building('vault', 'vaultOfDigestiveStone', 0, 0, {}, { funeralLoaf: 10, tormentInstrument: 2 }), assignedWorkers: [] } as any,
    timber: building('timber', 'organHarvester', 1, 0),
    mill: building('mill', 'millOfGnashing', 2, 0, { sinewTimber: 1 }),
    quarry: building('quarry', 'sepulcherQuarry', 3, 0),
    well: building('well', 'wombWell', 4, 0),
    shore: building('shore', 'shoreOfHooks', 5, 0),
    refectory: building('refectory', 'refectoryOfSalt', 6, 0, { eyelessFish: 1 }),
    field: building('field', 'fieldOfMouths', 7, 0),
    dust: building('dust', 'dustCathedralMill', 8, 0, { marrowGrain: 1 }),
    oven: building('oven', 'ovenOfLastBread', 9, 0, { boneDust: 1, amnioticWater: 1 }),
    coal: building('coal', 'coalWound', 10, 0),
    iron: building('iron', 'ironVeinPit', 11, 0),
    smeltery: building('smeltery', 'bloodSmeltery', 12, 0, { veinIronOre: 1, graveCoal: 1 }),
    crucible: {
      ...building('crucible', 'instrumentCrucible', 13, 0, { veinIronBar: 1 }),
      currentRecipeId: 'forgeTormentInstrument',
    } as any,
  };

  const workers: WorldState['workers'] = {
    w_timber: worker('w_timber', 'timberExecutioner', 'timber', 1, 0),
    w_mill: worker('w_mill', 'gnashSawyer', 'mill', 2, 0),
    w_quarry: worker('w_quarry', 'graveToothBreaker', 'quarry', 3, 0),
    w_well: worker('w_well', 'wellSupplicant', 'well', 4, 0),
    w_shore: worker('w_shore', 'hookFisher', 'shore', 5, 0),
    w_refectory: worker('w_refectory', 'saltPriest', 'refectory', 6, 0),
    w_field: worker('w_field', 'mouthFarmer', 'field', 7, 0),
    w_dust: worker('w_dust', 'dustMiller', 'dust', 8, 0),
    w_oven: worker('w_oven', 'ovenAcolyte', 'oven', 9, 0),
    w_coal: worker('w_coal', 'deepVeinMiner', 'coal', 10, 0),
    w_iron: worker('w_iron', 'deepVeinMiner', 'iron', 11, 0),
    w_smeltery: worker('w_smeltery', 'smelterMonk', 'smeltery', 12, 0),
    w_crucible: worker('w_crucible', 'painArtisan', 'crucible', 13, 0),
  };

  return {
    tick: 0,
    ageOfTeeth: 0,
    seed: 1,
    lastDeltaSec: 0,
    players: {
      [playerId]: {
        id: playerId,
        name: 'p1',
        stock: {},
        buildings: Object.keys(buildings),
        workers: Object.keys(workers),
        territoryTileIds: [],
        populationLimit: 40,
        doctrine: 'industry',
        dread: 0,
        holinessDebt: 0,
      },
    },
    buildings,
    workers,
    territory: { tiles: {}, tileIndex: {} },
    transport: { jobs: {}, activeCarrierTasks: {}, networkStress: 0, averageLatencySec: 0, queuedJobCount: 0 },
    worldPulse: 0,
  };
}

describe('complete production chain', () => {
  it('runs the full tracked chain and reaches victory from a seeded economy', () => {
    const state = makeCompleteChainState();
    let next = simulateTick(state, 20);

    expect(next.buildings.mill.outputBuffer.toothPlanks).toBeGreaterThanOrEqual(1);
    expect(next.buildings.refectory.outputBuffer.brainSalt).toBeGreaterThanOrEqual(1);
    expect(next.buildings.oven.outputBuffer.funeralLoaf).toBeGreaterThanOrEqual(1);
    expect(next.buildings.smeltery.outputBuffer.veinIronBar).toBeGreaterThanOrEqual(1);
    expect(next.buildings.crucible.outputBuffer.tormentInstrument).toBeGreaterThanOrEqual(1);

    const victoryState = {
      ...next,
      seed: 1,
      lastDeltaSec: 20,
      buildings: {
        ...next.buildings,
        vault: {
          ...next.buildings.vault,
          outputBuffer: { ...next.buildings.vault.outputBuffer, funeralLoaf: 10, tormentInstrument: 3 },
        },
      },
    } as WorldState;

    expect(evaluateGameOutcome(victoryState, playerId).kind).toBe('victory');
  });
});
