import React from 'react';
import { useUIStore } from '../../store/ui.store';
import { useGameStore } from '../../store/game.store';
import { BUILDING_DEFINITIONS } from '../../game/core/economy.data';
import { canAffordBuilding } from '../../game/economy/production.logic';
import imageMap from '../../pixi/utils/vite-asset-loader';

export function BuildingMenu() {
  const { activePanel, togglePanel, selectedBuildingToPlace, selectBuildingToPlace } = useUIStore();
  const gameState = useGameStore(state => state.gameState);

  // Get the actual first player ID instead of a hardcoded one
  const playerIds = Object.keys(gameState.players);
  const playerId = playerIds.length > 0 ? playerIds[0] : "player_1";
  const player = gameState.players[playerId];

  if (!player) return null;

  const isOpen = activePanel === 'buildingMenu';

  const buildingsToRender = Object.values(BUILDING_DEFINITIONS);

  return (
    <div className="build-dock">
      <button
        onClick={() => togglePanel('buildingMenu')}
        className={`macabre-panel build-dock__toggle ${isOpen ? 'active' : ''}`}
        aria-expanded={isOpen}
        aria-controls="building-menu-panel"
      >
        Build
      </button>

      {isOpen && (
        <div
          id="building-menu-panel"
          className="macabre-panel build-menu-panel animate-bleed-in"
        >
          <h2 className="macabre-text-glow build-menu-panel__title">
            Architecture of Duty
          </h2>

          <div className="building-list">
            {buildingsToRender.map(def => {
              const canAfford = canAffordBuilding(player, def.type);
              const isSelected = selectedBuildingToPlace === def.type;

              return (
                <button
                  key={def.type}
                  onClick={() => canAfford ? selectBuildingToPlace(isSelected ? null : def.type) : null}
                  className={`building-option ${isSelected ? 'selected' : ''}`}
                  disabled={!canAfford}
                >
                  <span className="building-option__header">
                    <img
                      src={imageMap[`buildings/stage4/${def.type}.png`]}
                      alt=""
                      aria-hidden="true"
                      className="building-option__icon"
                    />
                    <span className="building-option__name">{def.name}</span>
                  </span>
                  <span className="building-option__description">{def.description}</span>
                  <span className="building-option__costs">
                    {Object.entries(def.buildCost.resources).map(([res, amt]) => (
                      <span key={res} className="resource-pill">
                        <img
                          src={imageMap[`resources/${res}.png`]}
                          alt=""
                          aria-hidden="true"
                        />
                        {amt}
                      </span>
                    ))}
                  </span>
                </button>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
}
