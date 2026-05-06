import React from 'react';
import { useShallow } from 'zustand/react/shallow';
import { player1Id, useGameStore } from '../../store/game.store';
import imageMap from '../../pixi/utils/vite-asset-loader';
import { ResourceType } from '../../game/core/economy.types';
import { CONTENT_CATALOG } from '../../game/core/content.catalog';

const resourceFileByLabel: Record<string, string> = {
  Teeth: 'resources/toothPlanks.png',
  Stone: 'resources/sepulcherStone.png',
  Marrow: 'resources/marrowGrain.png',
  Dust: 'resources/boneDust.png',
  Bile: 'resources/amnioticWater.png',
  Fish: 'resources/eyelessFish.png',
  Salt: 'resources/brainSalt.png',
  Loaf: 'resources/funeralLoaf.png',
  Tools: 'resources/tormentInstrument.png',
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
type ResourceTone = 'bone' | 'stone' | 'marrow' | 'bile' | 'flesh' | 'salt';
type DisplayResource = {
  label: string;
  key: ResourceType;
  tone: ResourceTone;
};

const DISPLAY_RESOURCES: DisplayResource[] = [
  { label: 'Teeth', key: 'toothPlanks', tone: 'bone' },
  { label: 'Stone', key: 'sepulcherStone', tone: 'stone' },
  { label: 'Marrow', key: 'marrowGrain', tone: 'marrow' },
  { label: 'Dust', key: 'boneDust', tone: 'bone' },
  { label: 'Bile', key: 'amnioticWater', tone: 'bile' },
  { label: 'Fish', key: 'eyelessFish', tone: 'flesh' },
  { label: 'Salt', key: 'brainSalt', tone: 'salt' },
  { label: 'Loaf', key: 'funeralLoaf', tone: 'flesh' },
  { label: 'Tools', key: 'tormentInstrument', tone: 'bone' },
];

type ResourceSnapshot = Record<ResourceType, number>;

export function ResourceBar() {
  const resourceSnapshot = useGameStore(
    useShallow((state) => {
      const player = state.gameState.players[player1Id] ?? Object.values(state.gameState.players)[0];
      const stock = player?.stock ?? {};

      return {
        queuedJobs: state.gameState.transport.queuedJobCount ?? 0,
        trendBucket: Math.floor(state.gameState.ageOfTeeth / 5),
        toothPlanks: stock.toothPlanks ?? 0,
        sepulcherStone: stock.sepulcherStone ?? 0,
        marrowGrain: stock.marrowGrain ?? 0,
        boneDust: stock.boneDust ?? 0,
        amnioticWater: stock.amnioticWater ?? 0,
        eyelessFish: stock.eyelessFish ?? 0,
        brainSalt: stock.brainSalt ?? 0,
        funeralLoaf: stock.funeralLoaf ?? 0,
        tormentInstrument: stock.tormentInstrument ?? 0,
      };
    })
  );
  const { queuedJobs, trendBucket } = resourceSnapshot;
  const values = React.useMemo(() => ({
    toothPlanks: resourceSnapshot.toothPlanks,
    sepulcherStone: resourceSnapshot.sepulcherStone,
    marrowGrain: resourceSnapshot.marrowGrain,
    boneDust: resourceSnapshot.boneDust,
    amnioticWater: resourceSnapshot.amnioticWater,
    eyelessFish: resourceSnapshot.eyelessFish,
    brainSalt: resourceSnapshot.brainSalt,
    funeralLoaf: resourceSnapshot.funeralLoaf,
    tormentInstrument: resourceSnapshot.tormentInstrument,
  } as ResourceSnapshot), [resourceSnapshot]);
  const trendRef = React.useRef<{ bucket: number; values: ResourceSnapshot } | null>(null);
  const [trendPerMin, setTrendPerMin] = React.useState<TrendMap>({});

  React.useEffect(() => {
    const previous = trendRef.current;
    if (!previous) {
      trendRef.current = { bucket: trendBucket, values: { ...values } };
      return;
    }
    const elapsedSec = (trendBucket - previous.bucket) * 5;
    // Always keep the baseline current so stock changes while paused (e.g. building
    // placement costs) don't produce a bogus spike when the simulation resumes.
    if (!Number.isFinite(elapsedSec) || elapsedSec <= 0) {
      trendRef.current = { bucket: trendBucket, values: { ...values } };
      return;
    }
    const nextTrend: TrendMap = {};
    for (const { key: resource } of DISPLAY_RESOURCES) {
      const prev = previous.values[resource] ?? 0;
      const curr = values[resource] ?? 0;
      nextTrend[resource] = ((curr - prev) / elapsedSec) * 60;
    }
    setTrendPerMin(nextTrend);
    trendRef.current = { bucket: trendBucket, values: { ...values } };
  }, [trendBucket, values]);

  return (
    <div className="resource-strip" aria-label="Resources">
      {DISPLAY_RESOURCES.map((resource) => (
        <ResourceChip
          key={resource.label}
          label={resource.label}
          value={values[resource.key] ?? 0}
          trendPerMin={trendPerMin[resource.key] ?? 0}
          queuedJobs={queuedJobs}
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
  queuedJobs: number;
  tone: ResourceTone;
};

const ResourceChip = React.memo(function ResourceChip({ label, value, trendPerMin, queuedJobs, tone }: ResourceChipProps) {
  const image = imageMap[resourceFileByLabel[label]];
  const formattedValue = compactNumberFormatter.format(value);
  const trendLabel = `${signedCompactFormatter.format(trendPerMin)}/m`;
  const trendClass = trendPerMin >= 0 ? 'resource-chip__trend--up' : 'resource-chip__trend--down';
  const catalogTooltip = CONTENT_CATALOG.resources.find((entry) => entry.label === label || entry.type === label)?.tooltip;
  const tooltip = `${catalogTooltip ?? label} Stock ${exactNumberFormatter.format(value)}. Trend ${trendLabel}. Delivery queue ${queuedJobs}.`;

  return (
    <div
      className={`resource-chip resource-chip--${tone}`}
      title={tooltip}
      aria-label={tooltip}
    >
      {image ? <img src={image} alt="" aria-hidden="true" /> : null}
      <span>{label}</span>
      <strong>{formattedValue}</strong>
      <small className={`resource-chip__trend ${trendClass}`}>{trendLabel}</small>
    </div>
  );
});
