import { useMemo, useState } from 'react';
import { useShallow } from 'zustand/react/shallow';
import { BUILDING_DEFINITIONS } from '../../game/core/economy.data';
import { getCampaignObjectives } from '../../game/core/victory.rules';
import { getEconomyBottlenecks } from '../../game/economy/economy.planner';
import imageMap from '../../pixi/utils/vite-asset-loader';
import { player1Id, useGameStore } from '../../store/game.store';

export default function ProductionChainPanel(): JSX.Element {
  const [open, setOpen] = useState(false);
  const { buildings, workers, transport } = useGameStore(
    useShallow((state) => ({
      buildings: state.gameState.buildings,
      workers: state.gameState.workers,
      transport: state.gameState.transport,
    }))
  );

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

  return (
    <div className="production-chain">
      <button
        className={`macabre-panel production-chain__toggle ${open ? 'active' : ''}`}
        onClick={() => setOpen((value) => !value)}
        aria-expanded={open}
        aria-controls="production-chain-panel"
        title="Open the objective production chain with blocked steps and rewards"
      >
        Chain {completeCount}/{rows.length}
      </button>

      {open && (
        <section id="production-chain-panel" className="macabre-panel production-chain__panel" aria-label="Production chain">
          <header className="production-chain__header">
            <h2>Production Chain</h2>
            <span>{completeCount}/{rows.length} complete</span>
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
