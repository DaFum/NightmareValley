import React from 'react';
import { useGameStore } from '../../store/game.store';
import imageMap from '../../pixi/utils/vite-asset-loader';

export function ResourceBar() {
  // Try to use real data from the store, but fall back to thematic placeholder if store structure isn't ready

  const teeth = useGameStore((state) => {
    const playerIds = Object.keys(state.gameState.players);
    if (playerIds.length > 0) return state.gameState.players[playerIds[0]].stock.toothPlanks ?? 0;
    return 0;
  });
  const marrow = useGameStore((state) => {
    const playerIds = Object.keys(state.gameState.players);
    if (playerIds.length > 0) return state.gameState.players[playerIds[0]].stock.marrowGrain ?? 0;
    return 0;
  });
  const stone = useGameStore((state) => {
    const playerIds = Object.keys(state.gameState.players);
    if (playerIds.length > 0) return state.gameState.players[playerIds[0]].stock.sepulcherStone ?? 0;
    return 0;
  });
  const bile = useGameStore((state) => {
    const playerIds = Object.keys(state.gameState.players);
    if (playerIds.length > 0) return state.gameState.players[playerIds[0]].stock.amnioticWater ?? 0;
    return 0;
  });
  const loaf = useGameStore((state) => {
    const playerIds = Object.keys(state.gameState.players);
    if (playerIds.length > 0) return state.gameState.players[playerIds[0]].stock.funeralLoaf ?? 0;
    return 0;
  });
  const dust = useGameStore((state) => {
    const playerIds = Object.keys(state.gameState.players);
    if (playerIds.length > 0) return state.gameState.players[playerIds[0]].stock.boneDust ?? 0;
    return 0;
  });

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
  const resourceFileByLabel: Record<string, string> = {
    Teeth: 'resources/toothPlanks.png',
    Stone: 'resources/sepulcherStone.png',
    Marrow: 'resources/marrowGrain.png',
    Dust: 'resources/boneDust.png',
    Bile: 'resources/amnioticWater.png',
    Loaf: 'resources/funeralLoaf.png',
  };
  const image = imageMap[resourceFileByLabel[label]];

  return (
    <div className={`resource-chip resource-chip--${tone}`}>
      {image ? <img src={image} alt="" aria-hidden="true" /> : null}
      <span>{label}</span>
      <strong>{value}</strong>
    </div>
  );
}
