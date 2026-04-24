import React from 'react';
import { BUILDING_DEFINITIONS } from '../../game/core/economy.data';
import { canAffordUpgrade, getUpgradeCost } from '../../game/economy/production.logic';
import { useGameStore } from '../../store/game.store';
import { useSelectionStore } from '../../store/selection.store';
import imageMap from '../../pixi/utils/vite-asset-loader';

type BuildingInspectorProps = {
  buildingId: string;
};

export default function BuildingInspector({ buildingId }: BuildingInspectorProps): JSX.Element | null {
  const building = useGameStore((state) => state.gameState.buildings[buildingId]);
  const player = useGameStore((state) => building ? state.gameState.players[building.ownerId] : undefined);
  const upgradeBuildingAt = useGameStore((state) => state.upgradeBuildingAt);
  const connectBuildingAt = useGameStore((state) => state.connectBuildingAt);
  const toggleBuildingActive = useGameStore((state) => state.toggleBuildingActive);
  const clearSelection = useSelectionStore((state) => state.clearSelection);

  if (!building || !player) return null;

  const def = BUILDING_DEFINITIONS[building.type];
  const upgradeCost = getUpgradeCost(building, building.level + 1);
  const canUpgrade = canAffordUpgrade(player, building);

  return (
    <aside className="macabre-panel inspector-panel" aria-label="Building inspector">
      <div className="inspector-panel__header">
        <img
          src={imageMap[`buildings/stage4/${building.type}.png`]}
          alt=""
          aria-hidden="true"
          className="inspector-portrait"
        />
        <div>
          <span className="panel-kicker">Building</span>
          <h2>{def.name}</h2>
        </div>
        <button className="hud-button" onClick={clearSelection}>Close</button>
      </div>

      <p className="inspector-panel__description">{def.description}</p>

      <dl className="inspector-stats">
        <div><dt>Level</dt><dd>{building.level}/{def.maxLevel}</dd></div>
        <div><dt>Integrity</dt><dd>{Math.round(building.integrity)}%</dd></div>
        <div><dt>Status</dt><dd>{building.isActive ? 'active' : 'paused'}</dd></div>
        <div><dt>Road</dt><dd>{building.connectedToRoad ? 'connected' : 'missing'}</dd></div>
        <div><dt>Workers</dt><dd>{building.assignedWorkers.length}</dd></div>
        <div><dt>Corruption</dt><dd>{Math.round(building.corruption ?? 0)}%</dd></div>
      </dl>

      <InventoryBlock title="Input" inventory={building.inputBuffer} />
      <InventoryBlock title="Output" inventory={building.outputBuffer} />

      <div className="inspector-actions">
        <button className="hud-button" onClick={() => toggleBuildingActive(building.id)}>
          {building.isActive ? 'Pause' : 'Resume'}
        </button>
        {!building.connectedToRoad ? (
          <button className="hud-button" onClick={() => connectBuildingAt(building.id)}>Connect road</button>
        ) : null}
        <button className="hud-button" disabled={!canUpgrade} onClick={() => upgradeBuildingAt(player.id, building.id)}>
          Upgrade
        </button>
      </div>

      {upgradeCost ? (
        <div className="cost-row">
          {Object.entries(upgradeCost.resources).map(([resource, amount]) => (
            <span key={resource} className="resource-pill">
              <img src={imageMap[`resources/${resource}.png`]} alt="" aria-hidden="true" />
              {amount}
            </span>
          ))}
        </div>
      ) : (
        <p className="inspector-note">Maximum level reached.</p>
      )}
    </aside>
  );
}

type InventoryBlockProps = {
  title: string;
  inventory: Record<string, number | undefined>;
};

function InventoryBlock({ title, inventory }: InventoryBlockProps) {
  const entries = Object.entries(inventory).filter(([, amount]) => (amount ?? 0) > 0);
  return (
    <section className="inventory-block">
      <h3>{title}</h3>
      {entries.length ? (
        <div className="cost-row">
          {entries.map(([resource, amount]) => (
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
  );
}

