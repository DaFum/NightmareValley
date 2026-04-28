import { useMemo } from 'react';
import { useShallow } from 'zustand/react/shallow';
import { BUILDING_DEFINITIONS } from '../../game/core/economy.data';
import { ResourceType } from '../../game/core/economy.types';
import { DEFAULT_SIMULATION_CONFIG } from '../../game/economy/balancing.constants';
import { RECIPES } from '../../game/economy/recipes.data';
import { getCampaignObjectives } from '../../game/core/victory.rules';
import { getEconomyPlanSnapshot } from '../../game/economy/economy.planner';
import { WorldState } from '../../game/world/world.types';
import { GameScenarioProfile, player1Id, useGameStore } from '../../store/game.store';

type BriefStatus = 'good' | 'warn' | 'idle';

type BriefGoal = {
  label: string;
  done: boolean;
};

const scenarioLabels: Record<GameScenarioProfile, string> = {
  sandbox: 'Sandbox',
  challenging: 'Challenging',
  hardcore: 'Hardcore',
};

function getVaultInventory(buildings: WorldState['buildings']) {
  const inventory: Partial<Record<ResourceType, number>> = {};
  for (const building of Object.values(buildings)) {
    if (building.ownerId !== player1Id || building.type !== 'vaultOfDigestiveStone') continue;
    for (const [resource, amount] of Object.entries(building.outputBuffer)) {
      const key = resource as ResourceType;
      inventory[key] = (inventory[key] ?? 0) + (amount ?? 0);
    }
  }
  return inventory;
}

export default function SettlementBriefPanel(): JSX.Element {
  const {
    activeScenario,
    buildings,
    workers,
    transport,
    setScenarioProfile,
  } = useGameStore(
    useShallow((state) => ({
      activeScenario: state.activeScenario,
      buildings: state.gameState.buildings,
      workers: state.gameState.workers,
      transport: state.gameState.transport,
      setScenarioProfile: state.setScenarioProfile,
    }))
  );

  const brief = useMemo(() => {
    const playerBuildings = Object.values(buildings).filter((building) => building.ownerId === player1Id);
    const inventory = getVaultInventory(buildings);
    const carriers = Object.values(workers).filter((worker) => worker.ownerId === player1Id && worker.type === 'burdenThrall');
    const idleCarriers = carriers.filter((worker) => worker.isIdle).length;
    const queuedJobs = transport.queuedJobCount ?? 0;

    let working = 0;
    let starved = 0;
    let blocked = 0;
    for (const building of playerBuildings) {
      const definition = BUILDING_DEFINITIONS[building.type];
      const outputLimit = building.type === 'vaultOfDigestiveStone'
        ? DEFAULT_SIMULATION_CONFIG.warehouseStorageLimit
        : DEFAULT_SIMULATION_CONFIG.buildingOutputBufferLimit;
      const outputFull = Object.values(building.outputBuffer).some((amount) => (amount ?? 0) >= outputLimit);

      if (building.progressSec > 0 && outputFull) {
        blocked++;
      } else if (building.progressSec > 0) {
        working++;
      } else if (definition.recipeIds?.length) {
        const recipe = RECIPES[building.currentRecipeId || definition.recipeIds[0]];
        const isStarved = recipe
          ? Object.entries(recipe.inputs).some(([resource, required]) => (building.inputBuffer[resource as ResourceType] ?? 0) < required)
          : false;
        if (isStarved) starved++;
      }
    }

    const plannerSnapshot = getEconomyPlanSnapshot({ buildings, workers, transport } as WorldState, player1Id);
    const goals: BriefGoal[] = getCampaignObjectives({ buildings, workers, transport } as WorldState, player1Id)
      .map((objective) => ({
        label: objective.target > 1 ? `${objective.label} ${Math.min(objective.current, objective.target)}/${objective.target}` : objective.label,
        done: objective.complete,
      }));

    let status: BriefStatus = 'good';
    let statusText = 'Settlement stable';
    if (blocked > 0 || queuedJobs > carriers.length * 2) {
      status = 'warn';
      statusText = 'Logistics pressure';
    } else if (starved > working && playerBuildings.length > 3) {
      status = 'warn';
      statusText = 'Inputs starved';
    } else if (working === 0) {
      status = 'idle';
      statusText = 'Awaiting orders';
    }

    return {
      status,
      statusText,
      goals,
      working,
      starved,
      blocked,
      idleCarriers,
      carrierCount: carriers.length,
      queuedJobs,
      plankStock: inventory.toothPlanks ?? 0,
      stoneStock: inventory.sepulcherStone ?? 0,
      recommendation: plannerSnapshot.recommendation,
      bottlenecks: plannerSnapshot.bottlenecks.slice(0, 3),
    };
  }, [buildings, transport.queuedJobCount, workers]);

  return (
    <section className="settlement-brief macabre-panel" aria-label="Settlement brief">
      <div className="settlement-brief__header">
        <div>
          <h2>Settlement Brief</h2>
          <p className={`settlement-brief__status settlement-brief__status--${brief.status}`}>{brief.statusText}</p>
        </div>
        <div className="settlement-brief__scenario" aria-label="Scenario profile">
          {(Object.keys(scenarioLabels) as GameScenarioProfile[]).map((profile) => (
            <button
              key={profile}
              className={`settlement-brief__scenario-btn ${activeScenario === profile ? 'active' : ''}`}
              onClick={() => setScenarioProfile(profile)}
              aria-pressed={activeScenario === profile}
            >
              {scenarioLabels[profile]}
            </button>
          ))}
        </div>
      </div>

      <div className="settlement-brief__metrics">
        <span><strong>{brief.working}</strong> working</span>
        <span><strong>{brief.starved}</strong> starved</span>
        <span><strong>{brief.blocked}</strong> blocked</span>
        <span><strong>{brief.idleCarriers}/{brief.carrierCount}</strong> carriers idle</span>
        <span><strong>{brief.queuedJobs}</strong> queued</span>
        <span><strong>{brief.plankStock}</strong> planks</span>
        <span><strong>{brief.stoneStock}</strong> stone</span>
      </div>

      <div className="settlement-brief__recommendation">
        <span>Next order</span>
        <strong>{brief.recommendation.label}</strong>
        <small>{brief.recommendation.reason}</small>
      </div>

      {brief.bottlenecks.length > 0 && (
        <ul className="settlement-brief__bottlenecks" aria-label="Economy bottlenecks">
          {brief.bottlenecks.map((bottleneck) => (
            <li key={`${bottleneck.buildingId}-${bottleneck.kind}`}>{bottleneck.label}</li>
          ))}
        </ul>
      )}

      <ol className="settlement-brief__goals" aria-label="Suggested build order">
        {brief.goals.map((goal) => (
          <li key={goal.label} className={goal.done ? 'done' : ''}>
            <span aria-hidden="true">{goal.done ? 'OK' : '--'}</span>
            {goal.label}
          </li>
        ))}
      </ol>
    </section>
  );
}
