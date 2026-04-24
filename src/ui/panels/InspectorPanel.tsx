import React from 'react';
import { useGameStore } from '../../store/game.store';
import { useSelectionStore } from '../../store/selection.store';
import BuildingInspector from './BuildingInspector';
import WorkerInspector from './WorkerInspector';
import imageMap from '../../pixi/utils/vite-asset-loader';

export default function InspectorPanel(): JSX.Element | null {
  const selectedBuildingId = useSelectionStore((state) => state.selectedBuildingId);
  const selectedWorkerId = useSelectionStore((state) => state.selectedWorkerId);
  const selectedTileId = useSelectionStore((state) => state.selectedTileId);
  const clearSelection = useSelectionStore((state) => state.clearSelection);
  const tile = useGameStore((state) => selectedTileId ? state.gameState.territory.tiles[selectedTileId] : undefined);

  if (selectedBuildingId) {
    return <BuildingInspector buildingId={selectedBuildingId} />;
  }

  if (selectedWorkerId) {
    return <WorkerInspector workerId={selectedWorkerId} />;
  }

  if (!tile) return null;
  const deposits = Object.entries(tile.resourceDeposit ?? {}).filter(([, amount]) => (amount ?? 0) > 0);

  return (
    <aside className="macabre-panel inspector-panel" aria-label="Tile inspector">
      <div className="inspector-panel__header">
        <div>
          <span className="panel-kicker">Tile</span>
          <h2>{tile.terrain}</h2>
        </div>
        <button className="hud-button" onClick={clearSelection}>Close</button>
      </div>
      <dl className="inspector-stats">
        <div><dt>Position</dt><dd>{tile.position.x}, {tile.position.y}</dd></div>
        <div><dt>Owner</dt><dd>{tile.ownerId ?? 'unclaimed'}</dd></div>
        <div><dt>Road</dt><dd>{tile.roadNodeId ? 'connected' : 'none'}</dd></div>
      </dl>
      <section className="inventory-block">
        <h3>Deposits</h3>
        {deposits.length ? (
          <div className="cost-row">
            {deposits.map(([resource, amount]) => (
              <span key={resource} className="resource-pill">
                <img src={imageMap[`resources/${resource}.png`]} alt="" aria-hidden="true" />
                {amount}
              </span>
            ))}
          </div>
        ) : (
          <p className="inspector-note">empty</p>
        )}
      </section>
    </aside>
  );
}

