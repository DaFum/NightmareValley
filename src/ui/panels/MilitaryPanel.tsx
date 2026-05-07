
import { useMemo } from 'react';
import { useShallow } from 'zustand/react/shallow';
import { BUILDING_DEFINITIONS, WORKER_DEFINITIONS } from '../../game/core/economy.data';
import { BuildingInstance } from '../../game/core/game.types';
import { canAffordWorker, getWorkerHireCost } from '../../game/economy/production.logic';
import { getMilitaryMetrics } from '../../game/military';
import { player1Id, useGameStore } from '../../store/game.store';
import { getInventoryForCostChecks } from '../../store/simulation.selectors';
import imageMap from '../../pixi/utils/vite-asset-loader';

const fmt0 = new Intl.NumberFormat(undefined, { maximumFractionDigits: 0 });

function countAssignedType(building: BuildingInstance, workerType: keyof typeof WORKER_DEFINITIONS): number {
  return building.assignedWorkers.reduce((count, workerId) => {
    const worker = useGameStore.getState().gameState.workers[workerId];
    return count + (worker?.type === workerType ? 1 : 0);
  }, 0);
}

export default function MilitaryPanel(): JSX.Element | null {
  const snapshot = useGameStore(useShallow((state) => {
    const gameState = state.gameState;
    const player = gameState.players[player1Id];
    const inventory = getInventoryForCostChecks(gameState, player1Id);
    const metrics = getMilitaryMetrics(gameState, player1Id);
    const recruitBuildings = player
      ? player.buildings
        .map((id) => gameState.buildings[id])
        .filter((building): building is BuildingInstance => {
          if (!building) return false;
          return building.type === 'pitOfWarBirth' || building.type === 'spireOfJurisdiction';
        })
      : [];

    return {
      hasPlayer: Boolean(player),
      ageOfTeeth: gameState.ageOfTeeth,
      military: gameState.military,
      metrics,
      recruitBuildings,
      population: player?.workers.length ?? 0,
      populationLimit: player?.populationLimit ?? 0,
      canAffordWarInfant: canAffordWorker(inventory, 'warInfant'),
      hireCost: getWorkerHireCost('warInfant'),
      inventory,
    };
  }));
  const spawnAndAssignWorker = useGameStore((state) => state.spawnAndAssignWorker);

  const recruitTarget = useMemo(() => {
    return snapshot.recruitBuildings.find((building) => {
      const slots = BUILDING_DEFINITIONS[building.type].workerSlots.warInfant ?? 0;
      return countAssignedType(building, 'warInfant') < slots;
    }) ?? null;
  }, [snapshot.recruitBuildings]);

  if (!snapshot.hasPlayer) return null;

  const military = snapshot.military;
  const nextAttack = military?.activeRaid
    ? 0
    : Math.max(0, (military?.nextAttackAge ?? 0) - snapshot.ageOfTeeth);
  const atPopulationCap = snapshot.population >= snapshot.populationLimit;
  const canRecruit = Boolean(recruitTarget) && snapshot.canAffordWarInfant && !atPopulationCap;
  const raidHealth = military?.activeRaid?.health ?? 0;
  const raidStrength = military?.activeRaid?.strength ?? 0;

  return (
    <section className="military-panel macabre-panel" aria-label="Military and defense">
      <header className="military-panel__header">
        <div>
          <span className="panel-kicker">Defense</span>
          <h2>Border Pressure</h2>
        </div>
        <strong className={`military-panel__pressure military-panel__pressure--${pressureTone(military?.enemyPressure ?? 0)}`}>
          {fmt0.format(military?.enemyPressure ?? 0)}
        </strong>
      </header>

      <dl className="military-panel__stats">
        <div><dt>Soldiers</dt><dd>{snapshot.metrics.soldiers}</dd></div>
        <div><dt>Spires</dt><dd>{snapshot.metrics.spires}</dd></div>
        <div><dt>Defense</dt><dd>{fmt0.format(snapshot.metrics.defenseStrength)}</dd></div>
        <div><dt>Enemy land</dt><dd>{snapshot.metrics.enemyTerritoryTiles}</dd></div>
        <div><dt>Vault</dt><dd>{fmt0.format(snapshot.metrics.vaultIntegrity)}%</dd></div>
        <div><dt>Next attack</dt><dd>{military?.activeRaid ? 'now' : `${fmt0.format(nextAttack)}s`}</dd></div>
      </dl>

      {military?.activeRaid ? (
        <div className="military-panel__raid" role="status">
          <strong>Attack in progress</strong>
          <span>Strength {raidStrength} · Health {fmt0.format(raidHealth)}</span>
        </div>
      ) : (
        <p className="military-panel__note">Build a Pit of War Birth or Spire of Jurisdiction to recruit and station defenders.</p>
      )}

      <div className="military-panel__recruit">
        <button
          className="hud-button hud-button--primary"
          disabled={!canRecruit}
          onClick={() => recruitTarget && spawnAndAssignWorker(player1Id, 'warInfant', recruitTarget.id)}
          title={recruitTitle(Boolean(recruitTarget), snapshot.canAffordWarInfant, atPopulationCap)}
        >
          Recruit Soldier
        </button>
        <div className="military-panel__costs">
          {Object.entries(snapshot.hireCost.resources).map(([resource, amount]) => {
            const current = snapshot.inventory[resource as keyof typeof snapshot.inventory] ?? 0;
            const imgSrc = imageMap[`resources/${resource}.png`];
            return (
              <span
                key={resource}
                className={`resource-pill ${current >= (amount ?? 0) ? 'resource-pill--ready' : 'resource-pill--short'}`}
                title={`${resource}: ${current}/${amount}`}
              >
                {imgSrc ? <img src={imgSrc} alt="" aria-hidden="true" /> : null}
                {current}/{amount}
              </span>
            );
          })}
        </div>
      </div>
    </section>
  );
}

function pressureTone(value: number): 'low' | 'medium' | 'high' {
  if (value >= 70) return 'high';
  if (value >= 35) return 'medium';
  return 'low';
}

function recruitTitle(hasTarget: boolean, canAfford: boolean, atPopulationCap: boolean): string {
  if (!hasTarget) return 'Build a Pit of War Birth or a Spire with free soldier slots.';
  if (atPopulationCap) return 'Population limit reached.';
  if (!canAfford) return 'Missing Funeral Loaf or Rib Blade.';
  return 'Recruit a War Infant defender.';
}

