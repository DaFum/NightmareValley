import React from 'react';
import { useShallow } from 'zustand/react/shallow';
import { useGameStore } from '../../store/game.store';
import imageMap from '../../pixi/utils/vite-asset-loader';
import { ResourceType } from '../../game/core/economy.types';

const resourceFileByLabel: Record<string, string> = {
  Teeth: 'resources/toothPlanks.png',
  Stone: 'resources/sepulcherStone.png',
  Marrow: 'resources/marrowGrain.png',
  Dust: 'resources/boneDust.png',
  Bile: 'resources/amnioticWater.png',
  Loaf: 'resources/funeralLoaf.png',
};

const compactNumberFormatter = new Intl.NumberFormat(undefined, {
  notation: 'compact',
  maximumFractionDigits: 1,
});

const exactNumberFormatter = new Intl.NumberFormat();
const signedCompactFormatter = new Intl.NumberFormat(undefined, {
  notation: 'compact',
  maximumFractionDigits: 1,
  signDisplay: 'always',
});

type TrendMap = Partial<Record<ResourceType, number>>;

export function ResourceBar() {
  const { ageOfTeeth, buildings, transport, stock } = useGameStore(
    useShallow((state) => {
      const playerIds = Object.keys(state.gameState.players);
      return {
        ageOfTeeth: state.gameState.ageOfTeeth,
        buildings: state.gameState.buildings,
        transport: state.gameState.transport,
        stock: playerIds.length > 0 ? state.gameState.players[playerIds[0]].stock : {},
      };
    })
  );
  const trendRef = React.useRef<{ age: number; stock: TrendMap } | null>(null);
  const [trendPerMin, setTrendPerMin] = React.useState<TrendMap>({});

  React.useEffect(() => {
    const previous = trendRef.current;
    if (!previous) {
      trendRef.current = { age: ageOfTeeth, stock: { ...stock } };
      return;
    }
    const elapsedSec = ageOfTeeth - previous.age;
    // Always keep the baseline current so stock changes while paused (e.g. building
    // placement costs) don't produce a bogus spike when the simulation resumes.
    if (!Number.isFinite(elapsedSec) || elapsedSec <= 0) {
      trendRef.current = { age: ageOfTeeth, stock: { ...stock } };
      return;
    }
    // Sample at most once per 5 game-seconds. Shorter windows produce
    // noisy, flickering values when a single recipe completes in one tick.
    if (elapsedSec < 5.0) return;
    const nextTrend: TrendMap = {};
    const keys = new Set([...Object.keys(stock), ...Object.keys(previous.stock)]);
    for (const key of keys) {
      const resource = key as ResourceType;
      const prev = previous.stock[resource] ?? 0;
      const curr = (stock[resource] as number | undefined) ?? 0;
      nextTrend[resource] = ((curr - prev) / elapsedSec) * 60;
    }
    setTrendPerMin(nextTrend);
    trendRef.current = { age: ageOfTeeth, stock: { ...stock } };
  }, [ageOfTeeth, stock]);

  const topStats = React.useMemo(() => {
    const sources: Partial<Record<ResourceType, number>> = {};
    const sinks: Partial<Record<ResourceType, number>> = {};
    for (const building of Object.values(buildings)) {
      for (const [resource, amount] of Object.entries(building.outputBuffer)) {
        sources[resource as ResourceType] = (sources[resource as ResourceType] ?? 0) + (amount ?? 0);
      }
      for (const [resource, amount] of Object.entries(building.inputBuffer)) {
        sinks[resource as ResourceType] = (sinks[resource as ResourceType] ?? 0) + (amount ?? 0);
      }
    }
    return { sources, sinks, queuedJobs: transport.queuedJobCount ?? 0 };
  }, [buildings, transport.queuedJobCount]);

  const resources = [
    { label: 'Teeth', key: 'toothPlanks' as const, value: stock.toothPlanks ?? 0, tone: 'bone' as const },
    { label: 'Stone', key: 'sepulcherStone' as const, value: stock.sepulcherStone ?? 0, tone: 'stone' as const },
    { label: 'Marrow', key: 'marrowGrain' as const, value: stock.marrowGrain ?? 0, tone: 'marrow' as const },
    { label: 'Dust', key: 'boneDust' as const, value: stock.boneDust ?? 0, tone: 'bone' as const },
    { label: 'Bile', key: 'amnioticWater' as const, value: stock.amnioticWater ?? 0, tone: 'bile' as const },
    { label: 'Loaf', key: 'funeralLoaf' as const, value: stock.funeralLoaf ?? 0, tone: 'flesh' as const },
  ];

  return (
    <div className="resource-strip" aria-label="Resources">
      {resources.map((resource) => (
        <ResourceChip
          key={resource.label}
          label={resource.label}
          value={resource.value}
          trendPerMin={trendPerMin[resource.key] ?? 0}
          topSource={topStats.sources[resource.key] ?? 0}
          topSink={topStats.sinks[resource.key] ?? 0}
          queuedJobs={topStats.queuedJobs}
          tone={resource.tone}
        />
      ))}
    </div>
  );
}

type ResourceChipProps = {
  label: string;
  value: number;
  trendPerMin: number;
  topSource: number;
  topSink: number;
  queuedJobs: number;
  tone: 'bone' | 'stone' | 'marrow' | 'bile' | 'flesh';
};

function ResourceChip({ label, value, trendPerMin, topSource, topSink, queuedJobs, tone }: ResourceChipProps) {
  const image = imageMap[resourceFileByLabel[label]];
  const formattedValue = compactNumberFormatter.format(value);
  const trendLabel = `${signedCompactFormatter.format(trendPerMin)}/m`;
  const trendColor = trendPerMin >= 0 ? '#7ee787' : '#ff7b72';
  const tooltip = `${label}: ${exactNumberFormatter.format(value)} | Trend ${trendLabel} | Source buffer ${exactNumberFormatter.format(topSource)} | Sink buffer ${exactNumberFormatter.format(topSink)} | Queue ${queuedJobs}`;

  return (
    <div
      className={`resource-chip resource-chip--${tone}`}
      title={tooltip}
      aria-label={tooltip}
    >
      {image ? <img src={image} alt="" aria-hidden="true" /> : null}
      <span>{label}</span>
      <strong>{formattedValue}</strong>
      <small style={{ color: trendColor }}>{trendLabel}</small>
    </div>
  );
}
