import { useGameStore } from '../../store/game.store';
import { useSelectionStore } from '../../store/selection.store';
import BuildingInspector from './BuildingInspector';
import WorkerInspector from './WorkerInspector';
import imageMap from '../../pixi/utils/vite-asset-loader';
import { useShallow } from 'zustand/react/shallow';
import { getInspectorTarget } from '../../store/inspectorDomain';

export default function InspectorPanel(): JSX.Element | null {
  const selection = useSelectionStore(useShallow(state => ({
    selectedBuildingId: state.selectedBuildingId,
    selectedWorkerId: state.selectedWorkerId,
    selectedTileId: state.selectedTileId,
    clearSelection: state.clearSelection,
  })));
  const { clearSelection } = selection;
  const gameState = useGameStore((state) => state.gameState);
  const target = getInspectorTarget(gameState, selection);

  if (target.kind === 'building') {
    return <BuildingInspector buildingId={target.buildingId} />;
  }

  if (target.kind === 'worker') {
    return <WorkerInspector workerId={target.workerId} />;
  }

  if (target.kind === 'stale') {
    return (
      <aside className="macabre-panel inspector-panel" aria-label="Missing selection inspector">
        <div className="inspector-panel__header">
          <div>
            <span className="panel-kicker">Selection lost</span>
            <h2>Missing {target.missingKind}</h2>
          </div>
          <button className="hud-button" onClick={clearSelection} aria-label="Close missing selection inspector">Close</button>
        </div>
        <p className="inspector-panel__description">
          The selected {target.missingKind} no longer exists. It may have been destroyed, cancelled, or replaced by the simulation.
        </p>
        <p className="inspector-note">Clear the selection and choose another map object.</p>
      </aside>
    );
  }

  if (target.kind !== 'tile') return null;

  const tile = gameState.territory.tiles[target.tileId];
  if (!tile) return null;
  const deposits = Object.entries(tile.resourceDeposit ?? {}).filter(([, amount]) => (amount ?? 0) > 0);

  return (
    <aside className="macabre-panel inspector-panel" aria-label="Tile inspector">
      <div className="inspector-panel__header">
        <div>
          <span className="panel-kicker">Tile</span>
          <h2>{tile.terrain}</h2>
        </div>
        <button className="hud-button" onClick={clearSelection} aria-label="Close tile inspector">Close</button>
      </div>
      <dl className="inspector-stats">
        <div><dt>Position</dt><dd>{tile.position.x}, {tile.position.y}</dd></div>
        <div><dt>Owner</dt><dd>{tile.ownerId ?? 'unclaimed'}</dd></div>
        <div><dt>Tier</dt><dd>{tile.tier}</dd></div>
        <div><dt>Footfall</dt><dd>{tile.footfall}</dd></div>
      </dl>
      <section className="inventory-block">
        <h3>Deposits</h3>
        {deposits.length ? (
          <div className="cost-row">
            {deposits.map(([resource, amount]) => {
              const imgSrc = imageMap[`resources/${resource}.png`];
              return (
                <span key={resource} className="resource-pill" title={resource}>
                  {imgSrc ? (
                    <img src={imgSrc} alt={resource} aria-hidden="true" />
                  ) : (
                    <span>{(resource.charAt(0) || '?').toUpperCase()}</span>
                  )}
                  {amount}
                </span>
              );
            })}
          </div>
        ) : (
          <p className="inspector-note">empty</p>
        )}
      </section>
    </aside>
  );
}

