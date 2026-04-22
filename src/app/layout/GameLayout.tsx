import React from 'react';
import { GameCanvas } from '../../pixi/GameCanvas';

export function GameLayout() {
  return (
    <div style={{ position: 'absolute', top: 0, left: 0, right: 0, bottom: 0 }}>
      <GameCanvas />

      {/* Stunning UI */}
      <div style={{
        position: 'absolute',
        top: 20,
        left: 20,
        right: 20,
        display: 'flex',
        justifyContent: 'space-between',
        pointerEvents: 'none'
      }}>
        <div style={{
          background: 'rgba(20, 10, 15, 0.8)',
          padding: '12px 24px',
          borderRadius: '4px',
          border: '1px solid #c0392b',
          color: '#e74c3c',
          fontFamily: 'monospace',
          fontSize: '18px',
          boxShadow: '0 0 10px rgba(192, 57, 43, 0.5)'
        }}>
          SETTLERS NIGHTMARE
        </div>
        <div style={{
          background: 'rgba(20, 10, 15, 0.8)',
          padding: '12px 24px',
          borderRadius: '4px',
          border: '1px solid #c0392b',
          color: '#e74c3c',
          fontFamily: 'monospace',
          fontSize: '16px',
          boxShadow: '0 0 10px rgba(192, 57, 43, 0.5)'
        }}>
          Resources: 666
        </div>
      </div>
    </div>
  );
}
