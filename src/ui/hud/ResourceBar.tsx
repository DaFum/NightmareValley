import React from 'react';
import { useGameStore } from '../../store/game.store';
import imageMap from '../../pixi/utils/vite-asset-loader';

import { useShallow } from 'zustand/react/shallow';

const resourceFileByLabel: Record<string, string> = {
  Teeth: 'resources/toothPlanks.png',
  Stone: 'resources/sepulcherStone.png',
  Marrow: 'resources/marrowGrain.png',
  Dust: 'resources/boneDust.png',
  Bile: 'resources/amnioticWater.png',
  Loaf: 'resources/funeralLoaf.png',
};

export function ResourceBar() {
  // Try to use real data from the store, but fall back to thematic placeholder if store structure isn't ready

  const stock = useGameStore(useShallow((state) => {
    const playerIds = Object.keys(state.gameState.players);
    if (playerIds.length > 0) return state.gameState.players[playerIds[0]].stock;
    return {};
  }));

  const teeth = stock.toothPlanks ?? 0;
  const marrow = stock.marrowGrain ?? 0;
  const stone = stock.sepulcherStone ?? 0;
  const bile = stock.amnioticWater ?? 0;
  const loaf = stock.funeralLoaf ?? 0;
  const dust = stock.boneDust ?? 0;

  return (
    <div className="resource-strip" aria-label="Resources">
      <ResourceChip label="Teeth" value={teeth} tone="bone" />
      <ResourceChip label="Stone" value={stone} tone="stone" />
      <ResourceChip label="Marrow" value={marrow} tone="marrow" />
      <ResourceChip label="Dust" value={dust} tone="bone" />
      <ResourceChip label="Bile" value={bile} tone="bile" />
      <ResourceChip label="Loaf" value={loaf} tone="flesh" />
    </div>
  );
}

type ResourceChipProps = {
  label: string;
  value: number;
  tone: 'bone' | 'stone' | 'marrow' | 'bile' | 'flesh';
};

function ResourceChip({ label, value, tone }: ResourceChipProps) {
  const image = imageMap[resourceFileByLabel[label]];

  return (
    <div className={`resource-chip resource-chip--${tone}`}>
      {image ? <img src={image} alt="" aria-hidden="true" /> : null}
      <span>{label}</span>
      <strong>{value}</strong>
    </div>
  );
}
