import { useMemo } from 'react';
import { useShallow } from 'zustand/react/shallow';
import { useGameStore } from '../../store/game.store';
import { BUILDING_DEFINITIONS } from '../../game/core/economy.data';
import { BuildingType, ResourceType } from '../../game/core/economy.types';
import { RECIPES } from '../../game/economy/recipes.data';
import { DEFAULT_SIMULATION_CONFIG } from '../../game/economy/balancing.constants';

const fmt1 = new Intl.NumberFormat(undefined, { maximumFractionDigits: 1 });
const fmtPct = new Intl.NumberFormat(undefined, { style: 'percent', maximumFractionDigits: 0 });

type BuildingRow = {
  id: string;
  type: BuildingType;
  name: string;
  level: number;
  status: string;
  inputFill: number;
  outputFill: number;
  workers: number;
  workerSlots: number;
  corruption: number;
};

type ResourceFlow = {
  resource: ResourceType;
  inBuffer: number;
  outBuffer: number;
  inTransit: number;
};

function statusLabel(status: string): { label: string; color: string } {
  switch (status) {
    case 'working':         return { label: 'Working', color: 'var(--econ-success)' };
    case 'idle':            return { label: 'Idle',    color: 'var(--econ-idle)' };
    case 'waitingForInput': return { label: 'Starved', color: 'var(--econ-warn)' };
    case 'disabled':        return { label: 'Paused',  color: 'var(--econ-disabled)' };
    case 'damaged':         return { label: 'Damaged', color: 'var(--econ-damaged)' };
    default:                return { label: status,    color: 'var(--econ-default)' };
  }
}

export default function EconomyPanel(): JSX.Element | null {
  const { buildings, workers, transport, ageOfTeeth } = useGameStore(
    useShallow((s) => ({
      buildings: s.gameState.buildings,
      workers: s.gameState.workers,
      transport: s.gameState.transport,
      ageOfTeeth: s.gameState.ageOfTeeth,
    }))
  );

  const buildingRows = useMemo((): BuildingRow[] => {
    return Object.values(buildings).map((b) => {
      const def = BUILDING_DEFINITIONS[b.type];
      const totalWorkerSlots = Object.values(def.workerSlots).reduce((s, n) => s + (n ?? 0), 0);

      let status = 'idle';
      if (!b.isActive) {
        status = 'disabled';
      } else if (b.progressSec > 0) {
        status = 'working';
      } else if ((b.corruption ?? 0) > 50) {
        status = 'damaged';
      } else if (def.recipeIds && def.recipeIds.length > 0) {
        // Check if the active recipe's inputs are satisfied
        const activeRecipeId = b.currentRecipeId || def.recipeIds[0];
        const recipe = activeRecipeId ? RECIPES[activeRecipeId] : undefined;
        if (recipe) {
          const hasAllInputs = Object.entries(recipe.inputs).every(
            ([resource, required]) => (b.inputBuffer[resource as ResourceType] ?? 0) >= required
          );
          if (!hasAllInputs) {
            status = 'waitingForInput';
          }
        }
      }

      const inputVals = Object.values(b.inputBuffer).map(v => v ?? 0);
      const outputVals = Object.values(b.outputBuffer).map(v => v ?? 0);
      const isVault = b.type === 'vaultOfDigestiveStone';
      const outputLimit = isVault ? DEFAULT_SIMULATION_CONFIG.warehouseStorageLimit : DEFAULT_SIMULATION_CONFIG.buildingOutputBufferLimit;
      const inputFill = inputVals.length ? Math.max(...inputVals) / DEFAULT_SIMULATION_CONFIG.buildingInputBufferLimit : 0;
      const outputFill = outputVals.length ? Math.max(...outputVals) / outputLimit : 0;

      return {
        id: b.id,
        type: b.type,
        name: def.name,
        level: b.level,
        status,
        inputFill: Math.min(1, inputFill),
        outputFill: Math.min(1, outputFill),
        workers: b.assignedWorkers.length,
        workerSlots: totalWorkerSlots,
        corruption: b.corruption ?? 0,
      };
    });
  }, [buildings]);

  const resourceFlows = useMemo((): ResourceFlow[] => {
    const inBuffer: Partial<Record<ResourceType, number>> = {};
    const outBuffer: Partial<Record<ResourceType, number>> = {};

    for (const b of Object.values(buildings)) {
      for (const [res, amt] of Object.entries(b.inputBuffer)) {
        const r = res as ResourceType;
        inBuffer[r] = (inBuffer[r] ?? 0) + (amt ?? 0);
      }
      for (const [res, amt] of Object.entries(b.outputBuffer)) {
        const r = res as ResourceType;
        outBuffer[r] = (outBuffer[r] ?? 0) + (amt ?? 0);
      }
    }

    const inTransitMap: Partial<Record<ResourceType, number>> = {};
    for (const task of Object.values(transport.activeCarrierTasks)) {
      if (task.phase === 'toDropoff') {
        inTransitMap[task.resourceType as ResourceType] =
          (inTransitMap[task.resourceType as ResourceType] ?? 0) + task.amount;
      }
    }

    const allRes = new Set([
      ...Object.keys(inBuffer),
      ...Object.keys(outBuffer),
      ...Object.keys(inTransitMap),
    ]) as Set<ResourceType>;

    return Array.from(allRes)
      .map((resource) => ({
        resource,
        inBuffer: inBuffer[resource] ?? 0,
        outBuffer: outBuffer[resource] ?? 0,
        inTransit: inTransitMap[resource] ?? 0,
      }))
      .filter((r) => r.outBuffer > 0 || r.inTransit > 0)
      .sort((a, b) => (b.outBuffer + b.inTransit) - (a.outBuffer + a.inTransit))
      .slice(0, 8);
  }, [buildings, transport.activeCarrierTasks]);

  const activeCarriers = Object.keys(transport.activeCarrierTasks).length;
  const carriers = Object.values(workers).filter((w) => w.type === 'burdenThrall');
  const totalCarriers = carriers.length;
  const idleCarriers = carriers.filter((w) => w.isIdle).length;
  const totalWorkers = Object.keys(workers).length;
  const queuedJobs = transport.queuedJobCount ?? 0;
  const stress = fmt1.format(transport.networkStress);
  const latency = fmt1.format(transport.averageLatencySec);
  const ageStr = fmt1.format(ageOfTeeth);

  const workingCount = buildingRows.filter((r) => r.status === 'working').length;
  const waitingCount = buildingRows.filter((r) => r.status === 'waitingForInput').length;
  const idleBldCount = buildingRows.filter((r) => r.status === 'idle').length;

  return (
    <div className="economy-panel macabre-panel" aria-label="Economy overview">
      <div className="economy-panel__header">
        <span className="economy-panel__title">Economy — Age {ageStr}s</span>
        <div className="economy-panel__summary-chips">
          <span className="econ-chip econ-chip--green" title="Buildings producing">
            {workingCount} working
          </span>
          <span className="econ-chip econ-chip--yellow" title="Buildings waiting for input">
            {waitingCount} starved
          </span>
          <span className="econ-chip econ-chip--grey" title="Buildings idle">
            {idleBldCount} idle
          </span>
        </div>
      </div>

      <div className="economy-panel__cols">
        {/* Buildings column */}
        <section className="economy-panel__section" aria-label="Buildings">
          <h3 className="economy-panel__section-title">Buildings</h3>
          <div className="econ-building-list">
            {buildingRows.map((row) => {
              const { label, color } = statusLabel(row.status);
              return (
                <div key={row.id} className="econ-building-row">
                  <div className="econ-building-row__name" title={row.name}>
                    {row.name}
                    <span className="econ-building-row__lvl">L{row.level}</span>
                  </div>
                  <div className="econ-building-row__meta">
                    <span style={{ color }}>{label}</span>
                    <span className="econ-building-row__workers" title="Workers assigned / required">
                      {row.workers}/{row.workerSlots}w
                    </span>
                  </div>
                  <div className="econ-buffer-bar" title={`Input ${fmtPct.format(row.inputFill)} · Output ${fmtPct.format(row.outputFill)}`}>
                    <div
                      className="econ-buffer-bar__fill econ-buffer-bar__fill--in"
                      style={{ width: `${row.inputFill * 50}%` }}
                    />
                    <div
                      className="econ-buffer-bar__fill econ-buffer-bar__fill--out"
                      style={{ width: `${row.outputFill * 50}%`, marginLeft: '50%' }}
                    />
                  </div>
                </div>
              );
            })}
          </div>
        </section>

        {/* Right column: transport + resource flow */}
        <div className="economy-panel__right">
          <section className="economy-panel__section" aria-label="Transport">
            <h3 className="economy-panel__section-title">Transport</h3>
            <dl className="econ-stat-grid">
              <div><dt>Carriers</dt><dd>{activeCarriers} active / {totalCarriers - idleCarriers} busy</dd></div>
              <div><dt>Idle workers</dt><dd>{idleCarriers}/{totalCarriers}</dd></div>
              <div><dt>Queued jobs</dt><dd>{queuedJobs}</dd></div>
              <div><dt>Avg latency</dt><dd>{latency}s</dd></div>
              <div><dt>Net stress</dt><dd>{stress}</dd></div>
            </dl>
          </section>

          <section className="economy-panel__section" aria-label="Resource flow">
            <h3 className="economy-panel__section-title">In Production</h3>
            <div className="econ-resource-list">
              {resourceFlows.length === 0 ? (
                <p className="inspector-note">No active output buffers.</p>
              ) : (
                resourceFlows.map((r) => (
                  <div key={r.resource} className="econ-resource-row">
                    <span className="econ-resource-row__name">{r.resource}</span>
                    <span className="econ-resource-row__out" title="In output buffers">{r.outBuffer}</span>
                    {r.inTransit > 0 && (
                      <span className="econ-resource-row__transit" title="In transit">+{r.inTransit} ↗</span>
                    )}
                  </div>
                ))
              )}
            </div>
          </section>
        </div>
      </div>
    </div>
  );
}
