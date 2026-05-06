import { DEFAULT_SIMULATION_CONFIG } from "../../game/economy/balancing.constants";
import { advanceCarrierMovement, canTransportBetweenBuildings, findBestJobForCarrier, findTargetBuildingsForResource, generateTransportJobs, gridManhattanDistance, updateTransportMetrics } from "../../game/economy/transport.logic";
import { EconomySimulationState } from "../../game/core/economy.simulation";

describe("transport.logic", () => {
  it("requires road-required buildings to share a connected road component", () => {
    const state: EconomySimulationState = {
      tick: 0,
      ageOfTeeth: 0,
      players: {},
      buildings: {
        source: { id: "source", ownerId: "p1", type: "organHarvester", position: { x: -1, y: 0 }, connectedToRoad: true } as any,
        target: { id: "target", ownerId: "p1", type: "vaultOfDigestiveStone", position: { x: 5, y: 0 }, connectedToRoad: true } as any,
      },
      workers: {},
      territory: {
        tiles: {
          r1: { id: "r1", position: { x: 0, y: 0 }, terrain: "scarPath", ownerId: "p1", footfall: 0, tier: "dirt" },
          r2: { id: "r2", position: { x: 4, y: 0 }, terrain: "scarPath", ownerId: "p1", footfall: 0, tier: "dirt" },
        },
        tileIndex: { "0,0": "r1", "4,0": "r2" },
      } as any,
      transport: { jobs: {}, activeCarrierTasks: {}, networkStress: 0, averageLatencySec: 0, queuedJobCount: 0 },
      worldPulse: 0,
    };

    expect(canTransportBetweenBuildings(state, state.buildings.source as any, state.buildings.target as any)).toBe(false);
  });

  it("uses Manhattan distance as tiebreaker for equal-need targets", () => {
    const state: EconomySimulationState = {
      tick: 0,
      ageOfTeeth: 0,
      players: {},
      buildings: {
        source: {
          id: "source",
          ownerId: "p1",
          type: "organHarvester",
          position: { x: 0, y: 0 },
          outputBuffer: { sinewTimber: 2 },
          inputBuffer: {},
          internalStorage: {}
        } as any,
        near: {
          id: "near",
          ownerId: "p1",
          type: "vaultOfDigestiveStone",
          position: { x: 1, y: 0 },
          inputBuffer: {},
          internalStorage: {},
          isActive: true,
        } as any,
        far: {
          id: "far",
          ownerId: "p1",
          type: "vaultOfDigestiveStone",
          position: { x: 6, y: 0 },
          inputBuffer: {},
          internalStorage: {},
          isActive: true,
        } as any,
      },
      workers: {},
      territory: { tiles: {}, tileIndex: {} } as any,
      transport: {
        jobs: {},
        activeCarrierTasks: {},
        networkStress: 0,
        averageLatencySec: 0,
        queuedJobCount: 0
      },
      worldPulse: 0
    };

    const source = state.buildings.source as any;
    const sorted = findTargetBuildingsForResource(
      state,
      source,
      "sinewTimber",
      DEFAULT_SIMULATION_CONFIG
    );

    expect(sorted.map((b) => b.id)).toEqual(["near", "far"]);
  });

  it("uses Manhattan distance consistently for transport latency metrics", () => {
    const state: EconomySimulationState = {
      tick: 0,
      ageOfTeeth: 0,
      players: {},
      buildings: {
        a: { id: "a", ownerId: "p1", type: "organHarvester", position: { x: 0, y: 0 } } as any,
        b: { id: "b", ownerId: "p1", type: "vaultOfDigestiveStone", position: { x: 3, y: 4 } } as any,
      },
      workers: {},
      territory: { tiles: {}, tileIndex: {} } as any,
      transport: {
        jobs: {
          j1: {
            id: "j1",
            fromBuildingId: "a",
            toBuildingId: "b",
            resourceType: "sinewTimber",
            amount: 1,
            priority: 1,
            reserved: 0,
            delivered: 0,
            status: "queued",
          } as any,
        },
        activeCarrierTasks: {},
        networkStress: 0,
        averageLatencySec: 0,
        queuedJobCount: 1
      },
      worldPulse: 0
    };

    updateTransportMetrics(
      state,
      { ...DEFAULT_SIMULATION_CONFIG, carrierBaseSpeed: 2 }
    );
    expect(gridManhattanDistance({ x: 0, y: 0 }, { x: 3, y: 4 })).toBe(7);
    expect(state.transport.averageLatencySec).toBe(3.5);
  });

  it("treats queued sibling jobs as pending demand when selecting best carrier job", () => {
    const state: EconomySimulationState = {
      tick: 0,
      ageOfTeeth: 0,
      players: {},
      buildings: {
        src: { id: "src", ownerId: "p1", type: "organHarvester", position: { x: 0, y: 0 }, outputBuffer: { sinewTimber: 1 } } as any,
        tgtA: { id: "tgtA", ownerId: "p1", type: "vaultOfDigestiveStone", position: { x: 1, y: 0 }, outputBuffer: {}, inputBuffer: {}, internalStorage: {} } as any,
        tgtB: { id: "tgtB", ownerId: "p1", type: "vaultOfDigestiveStone", position: { x: 2, y: 0 }, outputBuffer: {}, inputBuffer: {}, internalStorage: {} } as any,
      },
      workers: {
        wrk: { id: "wrk", ownerId: "p1", type: "burdenThrall", position: { x: 0, y: 0 }, isIdle: true } as any
      },
      territory: { tiles: {}, tileIndex: {} } as any,
      transport: {
        jobs: {
          queuedSibling: {
            id: "queuedSibling",
            fromBuildingId: "src",
            toBuildingId: "tgtA",
            resourceType: "sinewTimber",
            amount: 1,
            priority: 50,
            reserved: 0,
            delivered: 0,
            status: "queued"
          } as any
        },
        activeCarrierTasks: {},
        networkStress: 0,
        averageLatencySec: 0,
        queuedJobCount: 1
      },
      worldPulse: 0
    };

    const candidate = {
      id: "candidate",
      fromBuildingId: "src",
      toBuildingId: "tgtB",
      resourceType: "sinewTimber",
      amount: 1,
      priority: 100,
      reserved: 0,
      delivered: 0,
      status: "queued"
    } as any;

    const best = findBestJobForCarrier(
      state,
      state.workers.wrk as any,
      [candidate],
      DEFAULT_SIMULATION_CONFIG
    );

    expect(best).toBeNull();
  });

  it("does not count a candidate job against its own available source amount", () => {
    const candidate = {
      id: "candidate",
      fromBuildingId: "src",
      toBuildingId: "tgt",
      resourceType: "sinewTimber",
      amount: 1,
      priority: 100,
      reserved: 0,
      delivered: 0,
      status: "queued"
    } as any;

    const state: EconomySimulationState = {
      tick: 0,
      ageOfTeeth: 0,
      players: {},
      buildings: {
        src: { id: "src", ownerId: "p1", type: "organHarvester", position: { x: 0, y: 0 }, outputBuffer: { sinewTimber: 1 } } as any,
        tgt: { id: "tgt", ownerId: "p1", type: "vaultOfDigestiveStone", position: { x: 1, y: 0 }, inputBuffer: {}, internalStorage: {} } as any,
      },
      workers: {
        wrk: { id: "wrk", ownerId: "p1", type: "burdenThrall", position: { x: 0, y: 0 }, isIdle: true } as any
      },
      territory: { tiles: {}, tileIndex: {} } as any,
      transport: {
        jobs: { candidate },
        activeCarrierTasks: {},
        networkStress: 0,
        averageLatencySec: 0,
        queuedJobCount: 1
      },
      worldPulse: 0
    };

    const best = findBestJobForCarrier(
      state,
      state.workers.wrk as any,
      [candidate],
      DEFAULT_SIMULATION_CONFIG
    );

    expect(best?.id).toBe("candidate");
  });

  it("caps generated job amounts by remaining source availability across targets", () => {
    const state: EconomySimulationState = {
      tick: 1,
      ageOfTeeth: 0,
      players: {},
      buildings: {
        src: {
          id: "src",
          ownerId: "p1",
          type: "organHarvester",
          position: { x: 0, y: 0 },
          outputBuffer: { sinewTimber: 2 },
          inputBuffer: {},
          internalStorage: {},
          isActive: true,
        } as any,
        tgtA: { id: "tgtA", ownerId: "p1", type: "vaultOfDigestiveStone", position: { x: 1, y: 0 }, outputBuffer: {}, inputBuffer: {}, internalStorage: {}, isActive: true } as any,
        tgtB: { id: "tgtB", ownerId: "p1", type: "vaultOfDigestiveStone", position: { x: 2, y: 0 }, outputBuffer: {}, inputBuffer: {}, internalStorage: {}, isActive: true } as any,
      },
      workers: {},
      territory: { tiles: {}, tileIndex: {} } as any,
      transport: {
        jobs: {},
        activeCarrierTasks: {},
        networkStress: 0,
        averageLatencySec: 0,
        queuedJobCount: 0
      },
      worldPulse: 0
    };

    generateTransportJobs(state, { ...DEFAULT_SIMULATION_CONFIG, maxJobBatchSize: 2 });
    const createdJobs = Object.values(state.transport.jobs);
    const totalQueuedAmount = createdJobs.reduce((sum, job) => sum + (job.status === "queued" ? job.amount : 0), 0);
    expect(totalQueuedAmount).toBeLessThanOrEqual(2);
  });

  it("does not queue more inbound deliveries than a target input buffer can hold", () => {
    const state: EconomySimulationState = {
      tick: 1,
      ageOfTeeth: 0,
      players: {},
      buildings: {
        srcA: {
          id: "srcA",
          ownerId: "p1",
          type: "vaultOfDigestiveStone",
          position: { x: 0, y: 0 },
          outputBuffer: { sinewTimber: 4 },
          inputBuffer: {},
          internalStorage: {},
          isActive: true,
          connectedToRoad: true,
        } as any,
        srcB: {
          id: "srcB",
          ownerId: "p1",
          type: "vaultOfDigestiveStone",
          position: { x: 0, y: 2 },
          outputBuffer: { sinewTimber: 4 },
          inputBuffer: {},
          internalStorage: {},
          isActive: true,
          connectedToRoad: true,
        } as any,
        mill: {
          id: "mill",
          ownerId: "p1",
          type: "millOfGnashing",
          position: { x: 2, y: 0 },
          outputBuffer: {},
          inputBuffer: { sinewTimber: 2 },
          internalStorage: {},
          isActive: true,
          connectedToRoad: true,
        } as any,
      },
      workers: {},
      territory: { tiles: {}, tileIndex: {} } as any,
      transport: {
        jobs: {},
        activeCarrierTasks: {},
        networkStress: 0,
        averageLatencySec: 0,
        queuedJobCount: 0,
      },
      worldPulse: 0,
    };

    generateTransportJobs(state, { ...DEFAULT_SIMULATION_CONFIG, maxJobBatchSize: 4, maxJobsPerTick: 10 });

    const inboundToMill = Object.values(state.transport.jobs)
      .filter((job) => job.toBuildingId === "mill" && job.resourceType === "sinewTimber" && job.status === "queued")
      .reduce((sum, job) => sum + job.amount, 0);

    expect(inboundToMill).toBe(1);
  });

  it("spills a delivery instead of overfilling a target whose capacity vanished in transit", () => {
    const state: EconomySimulationState = {
      tick: 1,
      ageOfTeeth: 0,
      players: {},
      buildings: {
        src: {
          id: "src",
          ownerId: "p1",
          type: "vaultOfDigestiveStone",
          position: { x: 0, y: 0 },
          outputBuffer: {},
          inputBuffer: {},
          internalStorage: {},
          isActive: true,
        } as any,
        mill: {
          id: "mill",
          ownerId: "p1",
          type: "millOfGnashing",
          position: { x: 1, y: 0 },
          outputBuffer: {},
          inputBuffer: { sinewTimber: DEFAULT_SIMULATION_CONFIG.buildingInputBufferLimit },
          internalStorage: {},
          isActive: true,
        } as any,
      },
      workers: {
        carrier: {
          id: "carrier",
          ownerId: "p1",
          type: "burdenThrall",
          position: { x: 1, y: 0 },
          isIdle: false,
        } as any,
      },
      territory: {
        tiles: {
          tile_1_0: { id: "tile_1_0", position: { x: 1, y: 0 }, terrain: "scarredEarth", tier: "grass", footfall: 0 },
        },
        tileIndex: { "1,0": "tile_1_0" },
      } as any,
      transport: {
        jobs: {
          job: {
            id: "job",
            fromBuildingId: "src",
            toBuildingId: "mill",
            resourceType: "sinewTimber",
            amount: 1,
            priority: 1,
            reserved: 0,
            delivered: 0,
            status: "claimed",
          } as any,
        },
        activeCarrierTasks: {
          carrier: {
            workerId: "carrier",
            jobId: "job",
            pickupBuildingId: "src",
            dropoffBuildingId: "mill",
            resourceType: "sinewTimber",
            amount: 1,
            phase: "toDropoff",
            path: [{ x: 1, y: 0 }],
            pathIndex: 0,
            stepProgress: 0,
          } as any,
        },
        networkStress: 0,
        averageLatencySec: 0,
        queuedJobCount: 0,
      },
      worldPulse: 0,
    };

    advanceCarrierMovement(state, 1, DEFAULT_SIMULATION_CONFIG);

    expect(state.buildings.mill.inputBuffer.sinewTimber).toBe(DEFAULT_SIMULATION_CONFIG.buildingInputBufferLimit);
    expect(state.transport.jobs.job.status).toBe("spilled");
    expect(state.workers.carrier.isIdle).toBe(true);
    expect(state.transport.activeCarrierTasks.carrier).toBeUndefined();
  });

  it("prunes terminal jobs periodically when transport history grows large", () => {
    const jobs: Record<string, any> = {
      keptQueued: { id: "keptQueued", fromBuildingId: "a", toBuildingId: "b", resourceType: "sinewTimber", amount: 1, priority: 1, reserved: 0, delivered: 0, status: "queued" },
      doneDelivered: { id: "doneDelivered", fromBuildingId: "a", toBuildingId: "b", resourceType: "sinewTimber", amount: 1, priority: 1, reserved: 0, delivered: 1, status: "delivered" },
      doneLost: { id: "doneLost", fromBuildingId: "a", toBuildingId: "b", resourceType: "sinewTimber", amount: 1, priority: 1, reserved: 0, delivered: 0, status: "lost" },
    };
    for (let i = 0; i < 205; i += 1) {
      jobs[`history-${i}`] = {
        id: `history-${i}`,
        fromBuildingId: "a",
        toBuildingId: "b",
        resourceType: "sinewTimber",
        amount: 1,
        priority: 1,
        reserved: 0,
        delivered: 0,
        status: "delivered"
      };
    }

    const state: EconomySimulationState = {
      tick: 50,
      ageOfTeeth: 0,
      players: {},
      buildings: {},
      workers: {},
      territory: { tiles: {}, tileIndex: {} } as any,
      transport: {
        jobs: jobs as any,
        activeCarrierTasks: {},
        networkStress: 0,
        averageLatencySec: 0,
        queuedJobCount: 1
      },
      worldPulse: 0
    };

    generateTransportJobs(state, DEFAULT_SIMULATION_CONFIG);
    expect(Object.keys(state.transport.jobs)).toEqual(["keptQueued"]);
  });
});

describe("warehouse-first routing (vault-first)", () => {
  it("prefers vault over production building when source is production", () => {
    const state: EconomySimulationState = {
      tick: 0,
      ageOfTeeth: 0,
      players: {},
      buildings: {
        src: {
          id: "src",
          ownerId: "p1",
          type: "organHarvester",
          position: { x: 0, y: 0 },
          outputBuffer: { sinewTimber: 2 },
          inputBuffer: {},
          internalStorage: {},
          isActive: true,
        } as any,
        vault: {
          id: "vault",
          ownerId: "p1",
          type: "vaultOfDigestiveStone",
          position: { x: 1, y: 0 },
          outputBuffer: { sinewTimber: 9998 }, // 9998/9999 full → need=1 (lower than mill's need=4)
          inputBuffer: {},
          internalStorage: {},
          isActive: true,
        } as any,
        mill: {
          id: "mill",
          ownerId: "p1",
          type: "millOfGnashing",
          position: { x: 2, y: 0 },
          outputBuffer: {},
          inputBuffer: { sinewTimber: 0 }, // 0/4 full → need=4 (higher than vault's need=1)
          internalStorage: {},
          isActive: true,
        } as any,
      },
      workers: {},
      territory: { tiles: {}, tileIndex: {} } as any,
      transport: {
        jobs: {},
        activeCarrierTasks: {},
        networkStress: 0,
        averageLatencySec: 0,
        queuedJobCount: 0,
      },
      worldPulse: 0,
    };

    const source = state.buildings.src as any;
    const sorted = findTargetBuildingsForResource(state, source, "sinewTimber", DEFAULT_SIMULATION_CONFIG);

    // Despite mill having higher need (4 vs 1), vault must come first due to warehouse-first preference
    expect(sorted[0].id).toBe("vault");
    expect(sorted.map(b => b.id)).not.toContain("src");
  });

  it("falls back to production buildings when all vaults are full", () => {
    const state: EconomySimulationState = {
      tick: 0,
      ageOfTeeth: 0,
      players: {},
      buildings: {
        src: {
          id: "src",
          ownerId: "p1",
          type: "organHarvester",
          position: { x: 0, y: 0 },
          outputBuffer: { sinewTimber: 2 },
          inputBuffer: {},
          internalStorage: {},
          isActive: true,
        } as any,
        fullVault: {
          id: "fullVault",
          ownerId: "p1",
          type: "vaultOfDigestiveStone",
          position: { x: 1, y: 0 },
          // Vault is at storage limit (9999)
          outputBuffer: { sinewTimber: DEFAULT_SIMULATION_CONFIG.warehouseStorageLimit },
          inputBuffer: {},
          internalStorage: {},
          isActive: true,
        } as any,
        mill: {
          id: "mill",
          ownerId: "p1",
          type: "millOfGnashing",
          position: { x: 2, y: 0 },
          outputBuffer: {},
          inputBuffer: { sinewTimber: 0 },
          internalStorage: {},
          isActive: true,
        } as any,
      },
      workers: {},
      territory: { tiles: {}, tileIndex: {} } as any,
      transport: {
        jobs: {},
        activeCarrierTasks: {},
        networkStress: 0,
        averageLatencySec: 0,
        queuedJobCount: 0,
      },
      worldPulse: 0,
    };

    const source = state.buildings.src as any;
    const sorted = findTargetBuildingsForResource(state, source, "sinewTimber", DEFAULT_SIMULATION_CONFIG);

    // Full vault should NOT be in preferred targets; production buildings must be reachable in fallback
    // The mill should appear in targets, enabling non-stalling even when all vaults are saturated
    const ids = sorted.map(b => b.id);
    expect(ids).toContain("mill");
    // Full vault has need=0, so it should appear after mill in sorting (or not preferred)
    const millIndex = ids.indexOf("mill");
    const vaultIndex = ids.indexOf("fullVault");
    // mill should rank before fullVault (higher need), or vault should be absent from preferred
    if (vaultIndex !== -1) {
      expect(millIndex).toBeLessThan(vaultIndex);
    }
  });

  it("does not route vault to vault (prevents circular transport)", () => {
    const state: EconomySimulationState = {
      tick: 0,
      ageOfTeeth: 0,
      players: {},
      buildings: {
        srcVault: {
          id: "srcVault",
          ownerId: "p1",
          type: "vaultOfDigestiveStone",
          position: { x: 0, y: 0 },
          outputBuffer: { sinewTimber: 5 },
          inputBuffer: {},
          internalStorage: {},
          isActive: true,
        } as any,
        dstVault: {
          id: "dstVault",
          ownerId: "p1",
          type: "vaultOfDigestiveStone",
          position: { x: 1, y: 0 },
          outputBuffer: {},
          inputBuffer: {},
          internalStorage: {},
          isActive: true,
        } as any,
        mill: {
          id: "mill",
          ownerId: "p1",
          type: "millOfGnashing",
          position: { x: 2, y: 0 },
          outputBuffer: {},
          inputBuffer: { sinewTimber: 0 },
          internalStorage: {},
          isActive: true,
        } as any,
      },
      workers: {},
      territory: { tiles: {}, tileIndex: {} } as any,
      transport: {
        jobs: {},
        activeCarrierTasks: {},
        networkStress: 0,
        averageLatencySec: 0,
        queuedJobCount: 0,
      },
      worldPulse: 0,
    };

    const srcVault = state.buildings.srcVault as any;
    const sorted = findTargetBuildingsForResource(state, srcVault, "sinewTimber", DEFAULT_SIMULATION_CONFIG);

    // Vault should not route to another vault
    expect(sorted.map(b => b.id)).not.toContain("dstVault");
    expect(sorted.map(b => b.id)).toContain("mill");
  });

  it("caps transport job generation under many buildings", () => {
    const buildings: EconomySimulationState['buildings'] = {
      src: {
        id: "src",
        ownerId: "p1",
        type: "organHarvester",
        position: { x: 0, y: 0 },
        outputBuffer: { sinewTimber: 500 },
        inputBuffer: {},
        internalStorage: {},
        connectedToRoad: true,
        level: 1,
        isActive: true,
      } as any,
    };
    for (let i = 0; i < 120; i++) {
      buildings[`mill_${i}`] = {
        id: `mill_${i}`,
        ownerId: "p1",
        type: "millOfGnashing",
        position: { x: i + 1, y: 0 },
        outputBuffer: {},
        inputBuffer: {},
        internalStorage: {},
        connectedToRoad: true,
        level: 1,
        isActive: true,
      } as any;
    }

    const state: EconomySimulationState = {
      tick: 1,
      ageOfTeeth: 0,
      players: {},
      buildings,
      workers: {},
      territory: { tiles: {}, tileIndex: {} } as any,
      transport: { jobs: {}, activeCarrierTasks: {}, networkStress: 0, averageLatencySec: 0, queuedJobCount: 0 },
      worldPulse: 0,
    };

    const next = generateTransportJobs(state, { ...DEFAULT_SIMULATION_CONFIG, maxJobsPerTick: 12 });

    expect(Object.values(next.transport.jobs)).toHaveLength(12);
    expect(next.transport.queuedJobCount).toBe(12);
  });
});
