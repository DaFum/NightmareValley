
import { useMemo } from 'react';
import { BUILDING_DEFINITIONS, WORKER_DEFINITIONS } from '../../game/core/economy.data';
import { BuildingInstance, WorkerInstance } from '../../game/core/game.types';
import { ResourceInventory, ResourceType } from '../../game/core/economy.types';
import { isConstructed } from '../../game/entities/buildings/building.types';
import { canAffordWorker, getWorkerHireCost } from '../../game/economy/production.logic';
import { getMilitaryMetrics } from '../../game/military';
import { player1Id, useGameStore } from '../../store/game.store';
import { getInventoryForCostChecks } from '../../store/simulation.selectors';
import imageMap from '../../pixi/utils/vite-asset-loader';

const fmt0 = new Intl.NumberFormat(undefined, { maximumFractionDigits: 0 });
const HOSTILE_RAIDS_REQUIRED = 2;
const HOSTILE_PRESSURE_TARGET = 10;

function countAssignedType(
  building: BuildingInstance,
  workers: Record<string, WorkerInstance>,
  workerType: keyof typeof WORKER_DEFINITIONS
): number {
  return building.assignedWorkers.reduce((count, workerId) => {
    const worker = workers[workerId];
    return count + (worker?.type === workerType ? 1 : 0);
  }, 0);
}

function isRecruitReady(building: BuildingInstance): boolean {
  return building.isActive && building.connectedToRoad && isConstructed(building);
}

function isRecruitPaused(building: BuildingInstance): boolean {
  const candidate = building as BuildingInstance & { paused?: boolean; isPaused?: boolean };
  return candidate.paused === true || candidate.isPaused === true || building.isActive === false;
}

export default function MilitaryPanel(): JSX.Element | null {
  const gameState = useGameStore((state) => state.gameState);
  const spawnAndAssignWorker = useGameStore((state) => state.spawnAndAssignWorker);
  const snapshot = useMemo(() => {
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

    const readyRecruitBuildings = recruitBuildings.filter(isRecruitReady);
    const unfinishedRecruitBuildings = recruitBuildings.filter((building) => !isConstructed(building));
    const disconnectedRecruitBuildings = recruitBuildings.filter((building) => {
      return isConstructed(building) && !building.connectedToRoad;
    });
    const pausedRecruitBuildings = recruitBuildings.filter((building) => {
      return isConstructed(building) && building.connectedToRoad && isRecruitPaused(building);
    });

    return {
      hasPlayer: Boolean(player),
      ageOfTeeth: gameState.ageOfTeeth,
      military: gameState.military,
      metrics,
      recruitBuildings,
      readyRecruitBuildings,
      unfinishedRecruitBuildings,
      disconnectedRecruitBuildings,
      pausedRecruitBuildings,
      population: player?.workers.length ?? 0,
      populationLimit: player?.populationLimit ?? 0,
      canAffordWarInfant: canAffordWorker(inventory, 'warInfant'),
      hireCost: getWorkerHireCost('warInfant'),
      inventory,
    };
  }, [gameState]);

  const recruitTarget = useMemo(() => {
    return snapshot.readyRecruitBuildings.find((building) => {
      const slots = BUILDING_DEFINITIONS[building.type].workerSlots.warInfant ?? 0;
      return countAssignedType(building, gameState.workers, 'warInfant') < slots;
    }) ?? null;
  }, [gameState.workers, snapshot.readyRecruitBuildings]);

  if (!snapshot.hasPlayer) return null;

  const military = snapshot.military;
  const nextAttack = military?.activeRaid
    ? 0
    : Math.max(0, (military?.nextAttackAge ?? 0) - snapshot.ageOfTeeth);
  const atPopulationCap = snapshot.population >= snapshot.populationLimit;
  const canRecruit = Boolean(recruitTarget) && snapshot.canAffordWarInfant && !atPopulationCap;
  const raidHealth = military?.activeRaid?.health ?? 0;
  const raidStrength = military?.activeRaid?.strength ?? 0;
  const missingRecruitCosts = getMissingCostEntries(snapshot.inventory, snapshot.hireCost.resources);
  const recruitSetupIssue = getRecruitSetupIssue(
    snapshot.recruitBuildings.length,
    snapshot.unfinishedRecruitBuildings,
    snapshot.disconnectedRecruitBuildings,
    snapshot.pausedRecruitBuildings,
    Boolean(recruitTarget),
  );
  const hostileRaidsRepelled = military?.raidsRepelled ?? 0;
  const hostilePressure = military?.enemyPressure ?? 0;
  const hostileDefeated = hostileRaidsRepelled >= HOSTILE_RAIDS_REQUIRED && hostilePressure <= HOSTILE_PRESSURE_TARGET;

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
        <div><dt>Enemy territory</dt><dd>{snapshot.metrics.enemyTerritoryTiles} tiles</dd></div>
        <div><dt>Vault integrity</dt><dd>{fmt0.format(snapshot.metrics.vaultIntegrity)}%</dd></div>
        <div><dt>Next raid</dt><dd>{military?.activeRaid ? 'now' : `in ${fmt0.format(nextAttack)}s`}</dd></div>
      </dl>

      {military?.activeRaid ? (
        <div className="military-panel__raid" role="status">
          <strong>Attack in progress</strong>
          <span>Strength {raidStrength} · Health {fmt0.format(raidHealth)}</span>
          <small>{snapshot.metrics.defenseStrength >= raidStrength ? 'Defense is winning; keep soldiers stationed.' : 'Raid strength exceeds defense; recruit or staff spires now.'}</small>
        </div>
      ) : recruitSetupIssue ? (
        <p className="military-panel__note">{recruitSetupIssue}</p>
      ) : (
        <p className="military-panel__note">Recruit defenders now, then keep Spires staffed before the next attack.</p>
      )}

      <div className={`military-panel__objective ${hostileDefeated ? 'military-panel__objective--complete' : ''}`}>
        <strong>Break the Hostile Choir</strong>
        <span>Goal: repel 2 raids and reduce enemy pressure to 10 or lower.</span>
        <small>
          Raids {Math.min(hostileRaidsRepelled, HOSTILE_RAIDS_REQUIRED)}/{HOSTILE_RAIDS_REQUIRED} · Pressure {fmt0.format(hostilePressure)}/{HOSTILE_PRESSURE_TARGET}
        </small>
      </div>

      <div className="military-panel__recruit">
        <button
          className="hud-button hud-button--primary"
          disabled={!canRecruit}
          onClick={() => recruitTarget && spawnAndAssignWorker(player1Id, 'warInfant', recruitTarget.id)}
          title={recruitTitle(Boolean(recruitTarget), atPopulationCap, missingRecruitCosts, recruitSetupIssue)}
        >
          Recruit Soldier
        </button>
        <div className="military-panel__costs">
          {Object.entries(snapshot.hireCost.resources).map(([resource, amount]) => {
            const current = snapshot.inventory[resource as ResourceType] ?? 0;
            const imgSrc = imageMap[`resources/${resource}.png`];
            return (
              <span
                key={resource}
                className={`resource-pill ${current >= (amount ?? 0) ? 'resource-pill--ready' : 'resource-pill--short'}`}
                title={`${resourceShortLabel(resource as ResourceType)}: ${amount} required, ${current} available`}
              >
                {imgSrc ? <img src={imgSrc} alt="" aria-hidden="true" /> : null}
                <span className="resource-pill__label">{resourceShortLabel(resource as ResourceType)}</span>
                <span className="resource-pill__amount">{amount} {resourceShortLabel(resource as ResourceType)} {current >= (amount ?? 0) ? '✓' : 'short'} {current}</span>
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

function recruitTitle(
  hasTarget: boolean,
  atPopulationCap: boolean,
  missingCosts: Array<{ resource: ResourceType; available: number; required: number }>,
  setupIssue: string | null,
): string {
  if (setupIssue) return setupIssue;
  if (!hasTarget) return 'Build a Pit of War Birth or a Spire with free soldier slots.';
  if (atPopulationCap) return 'Population limit reached.';
  if (missingCosts.length > 0) {
    return `Vault is short: ${missingCosts
      .map(({ resource, available, required }) => `${resourceShortLabel(resource)} ${available}/${required}`)
      .join(', ')}.`;
  }
  return 'Recruit a War Infant defender.';
}

function getRecruitSetupIssue(
  recruitBuildingCount: number,
  unfinishedRecruitBuildings: BuildingInstance[],
  disconnectedRecruitBuildings: BuildingInstance[],
  pausedRecruitBuildings: BuildingInstance[],
  hasRecruitTarget: boolean,
): string | null {
  if (recruitBuildingCount === 0) {
    return 'Build a Pit of War Birth or Spire of Jurisdiction to recruit and station defenders.';
  }
  if (unfinishedRecruitBuildings.length > 0) {
    return `${buildingList(unfinishedRecruitBuildings)} under construction. Keep it connected and wait for builders before recruiting.`;
  }
  if (disconnectedRecruitBuildings.length > 0) {
    return `Connect roads to ${buildingList(disconnectedRecruitBuildings)} before recruiting soldiers.`;
  }
  if (pausedRecruitBuildings.length > 0) {
    return `Recruit buildings are paused; resume production on ${buildingList(pausedRecruitBuildings)}.`;
  }
  if (!hasRecruitTarget) {
    return 'Soldier slots are full. Build another Pit or Spire, or upgrade an existing one.';
  }
  return null;
}

function buildingList(buildings: BuildingInstance[]): string {
  return buildings
    .map((building) => BUILDING_DEFINITIONS[building.type].name)
    .slice(0, 2)
    .join(' and ');
}

function getMissingCostEntries(
  inventory: ResourceInventory,
  cost: Partial<Record<ResourceType, number>>,
) {
  return Object.entries(cost)
    .map(([resource, required]) => ({
      resource: resource as ResourceType,
      required: required ?? 0,
      available: inventory[resource as ResourceType] ?? 0,
    }))
    .filter(({ available, required }) => available < required);
}

function resourceShortLabel(resource: ResourceType): string {
  switch (resource) {
    case 'toothPlanks':
      return 'Planks';
    case 'sepulcherStone':
      return 'Stone';
    case 'marrowGrain':
      return 'Grain';
    case 'boneDust':
      return 'Dust';
    case 'amnioticWater':
      return 'Water';
    case 'eyelessFish':
      return 'Fish';
    case 'brainSalt':
      return 'Salt';
    case 'funeralLoaf':
      return 'Loaf';
    case 'graveCoal':
      return 'Coal';
    case 'veinIronOre':
      return 'Ore';
    case 'veinIronBar':
      return 'Bars';
    case 'tormentInstrument':
      return 'Tools';
    case 'ribBlade':
      return 'Blades';
    case 'sinewTimber':
      return 'Timber';
    default:
      return resource.replace(/([A-Z])/g, ' $1');
  }
}

