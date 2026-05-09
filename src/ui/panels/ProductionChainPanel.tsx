import { useEffect, useMemo, useState } from 'react';
import { useShallow } from 'zustand/react/shallow';
import { BUILDING_DEFINITIONS } from '../../game/core/economy.data';
import { getCampaignObjectives } from '../../game/core/victory.rules';
import { getBottleneckAction, getEconomyBottlenecks } from '../../game/economy/economy.planner';
import imageMap from '../../pixi/utils/vite-asset-loader';
import { player1Id, useGameStore } from '../../store/game.store';

export type ProductionChainPanelProps = {
  forceOpen?: boolean;
};

export default function ProductionChainPanel({ forceOpen = false }: ProductionChainPanelProps): JSX.Element {
  const [open, setOpen] = useState(false);
  const { buildings, workers, transport } = useGameStore(
    useShallow((state) => ({
      buildings: state.gameState.buildings,
      workers: state.gameState.workers,
      transport: state.gameState.transport,
    }))
  );

  useEffect(() => {
    if (!forceOpen) {
      setOpen(false);
    }
  }, [forceOpen]);

  const rows = useMemo(() => {
    const gameState = { buildings, workers, transport } as ReturnType<typeof useGameStore.getState>['gameState'];
    const bottlenecks = getEconomyBottlenecks(gameState, player1Id);
    return getCampaignObjectives(gameState, player1Id).map((objective) => {
      const building = objective.buildingType ? BUILDING_DEFINITIONS[objective.buildingType] : undefined;
      const blocked = objective.buildingType
        ? bottlenecks.find((bottleneck) => bottleneck.buildingType === objective.buildingType)
        : bottlenecks.find((bottleneck) => bottleneck.resourceType === objective.resourceType);
      return { objective, building, blocked };
    });
  }, [buildings, transport, workers]);

  const completeCount = rows.filter((row) => row.objective.complete).length;
  const panelOpen = forceOpen || open;

  return (
    <div className="production-chain">
      <button
        className={`macabre-panel production-chain__toggle ${panelOpen ? 'active' : ''}`}
        onClick={() => {
          if (forceOpen) return;
          setOpen((value) => !value);
        }}
        aria-expanded={panelOpen}
        aria-controls="production-chain-panel"
        title="Objectives show current chain progress, blocked steps, and the next useful action"
      >
        Objectives {completeCount}/{rows.length}
      </button>

      {panelOpen && (
        <section id="production-chain-panel" className="macabre-panel production-chain__panel" aria-label="Production chain">
          <header className="production-chain__header">
            <h2>Resource Chain</h2>
            <span title="Completed objectives / total objectives. Build, connect, and supply the listed chain steps to raise this value.">
              {completeCount}/{rows.length} complete
            </span>
          </header>

          <ol className="production-chain__list">
            {rows.map(({ objective, building, blocked }) => {
              const icon = objective.resourceType
                ? imageMap[`resources/${objective.resourceType}.png`]
                : building
                  ? imageMap[`buildings/stage4/${building.type}.png`]
                  : undefined;
              return (
                <li
                  key={objective.id}
                  className={[
                    'production-chain__row',
                    objective.complete ? 'production-chain__row--complete' : '',
                    blocked ? 'production-chain__row--blocked' : '',
                  ].filter(Boolean).join(' ')}
                  title={blocked ? `${objective.label}: ${blocked.label}` : `${objective.label}: ${objective.reward}`}
                  aria-label={blocked ? `${objective.label}. Blocked: ${blocked.label}` : `${objective.label}. ${objective.reward}`}
                >
                  {icon ? <img src={icon} alt="" aria-hidden="true" /> : <span className="production-chain__fallback" />}
                  <div>
                    <strong>{objective.label}</strong>
                    <small>{blocked ? blocked.label : objective.reward}</small>
                    {blocked ? <em>{getBottleneckAction(blocked)}</em> : null}
                  </div>
                  <span className="production-chain__count">{Math.min(objective.current, objective.target)}/{objective.target}</span>
                </li>
              );
            })}
          </ol>
        </section>
      )}
    </div>
  );
}
