import React from 'react';
import { useUIStore } from '../../store/ui.store';
import { useGameStore } from '../../store/game.store';
import { BUILDING_DEFINITIONS } from '../../game/core/economy.data';
import { BuildingType } from '../../game/core/economy.types';
import { canAffordBuilding } from '../../game/economy/production.logic';

export function BuildingMenu() {
  const { activePanel, togglePanel, selectedBuildingToPlace, selectBuildingToPlace } = useUIStore();
  const gameState = useGameStore(state => state.gameState);

  // We assume single player (player_1) for UI purposes right now
  const playerId = "player_1";
  const player = gameState.players[playerId];

  if (!player) return null;

  const isOpen = activePanel === 'buildingMenu';

  const buildingsToRender = Object.values(BUILDING_DEFINITIONS);

  return (
    <>
      <button
        onClick={() => togglePanel('buildingMenu')}
        className={`macabre-panel ${isOpen ? 'active' : ''}`}
        style={{
          position: 'absolute',
          bottom: '24px',
          left: '24px',
          padding: '12px 24px',
          color: 'var(--bone)',
          fontFamily: 'var(--font-display)',
          fontSize: '20px',
          cursor: 'pointer',
          zIndex: 101,
          border: '1px solid var(--coagulated-blood)',
          background: isOpen ? 'var(--void-shadow)' : 'rgba(10, 5, 6, 0.85)'
        }}
      >
        Erect Monuments
      </button>

      {isOpen && (
        <div
          className="macabre-panel animate-bleed-in"
          style={{
            position: 'absolute',
            bottom: '80px',
            left: '24px',
            width: '350px',
            maxHeight: '60vh',
            overflowY: 'auto',
            padding: '20px',
            display: 'flex',
            flexDirection: 'column',
            gap: '16px',
            zIndex: 101
          }}
        >
          <h2 className="macabre-text-glow" style={{ margin: 0, fontFamily: 'var(--font-display)', color: 'var(--fresh-blood)' }}>
            Architecture of Duty
          </h2>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
            {buildingsToRender.map(def => {
              const canAfford = canAffordBuilding(player, def.type);
              const isSelected = selectedBuildingToPlace === def.type;

              return (
                <div
                  key={def.type}
                  onClick={() => canAfford ? selectBuildingToPlace(isSelected ? null : def.type) : null}
                  style={{
                    padding: '12px',
                    border: `1px solid ${isSelected ? 'var(--fresh-blood)' : 'var(--coagulated-blood)'}`,
                    background: isSelected ? 'rgba(90, 12, 19, 0.3)' : 'rgba(0,0,0,0.5)',
                    cursor: canAfford ? 'pointer' : 'not-allowed',
                    opacity: canAfford ? 1 : 0.5,
                    transition: 'all 0.2s'
                  }}
                >
                  <h3 style={{ margin: '0 0 8px 0', color: 'var(--bone)' }}>{def.name}</h3>
                  <p style={{ margin: '0 0 12px 0', fontSize: '14px', fontStyle: 'italic', color: 'var(--marrow)' }}>
                    {def.description}
                  </p>
                  <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px' }}>
                    {Object.entries(def.buildCost.resources).map(([res, amt]) => (
                      <span key={res} style={{ fontSize: '12px', background: 'var(--void-black)', padding: '2px 6px', border: '1px solid var(--coagulated-blood)' }}>
                        {res}: {amt}
                      </span>
                    ))}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}
    </>
  );
}
