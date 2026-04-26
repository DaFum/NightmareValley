import { useMemo } from 'react';
import { useShallow } from 'zustand/react/shallow';
import { useGameStore, player1Id } from '../../store/game.store';
import imageMap from '../../pixi/utils/vite-asset-loader';
import { ResourceType } from '../../game/core/economy.types';

type VaultEntry = {
  resource: ResourceType;
  stored: number;
  inTransit: number;
  inTransitOut: number;
};

export default function WarehousePanel(): JSX.Element | null {
  const { buildings, transport } = useGameStore(
    useShallow((s) => ({
      buildings: s.gameState.buildings,
      transport: s.gameState.transport,
    }))
  );

  const entries = useMemo((): VaultEntry[] => {
    const stored: Partial<Record<ResourceType, number>> = {};
    for (const b of Object.values(buildings)) {
      if (b.type !== 'vaultOfDigestiveStone' || b.ownerId !== player1Id) continue;
      for (const [res, amt] of Object.entries(b.outputBuffer)) {
        const r = res as ResourceType;
        stored[r] = (stored[r] ?? 0) + (amt ?? 0);
      }
    }

    const inTransitIn: Partial<Record<ResourceType, number>> = {};
    const inTransitOut: Partial<Record<ResourceType, number>> = {};
    for (const task of Object.values(transport.activeCarrierTasks)) {
      if (task.phase !== 'toDropoff') continue;
      const targetBuilding = buildings[task.dropoffBuildingId];
      if (!targetBuilding) continue;
      const r = task.resourceType as ResourceType;
      if (targetBuilding.type === 'vaultOfDigestiveStone' && targetBuilding.ownerId === player1Id) {
        inTransitIn[r] = (inTransitIn[r] ?? 0) + task.amount;
      } else if (targetBuilding.type !== 'vaultOfDigestiveStone' && targetBuilding.ownerId === player1Id) {
        inTransitOut[r] = (inTransitOut[r] ?? 0) + task.amount;
      }
    }

    const allRes = new Set([
      ...Object.keys(stored),
      ...Object.keys(inTransitIn),
      ...Object.keys(inTransitOut),
    ]) as Set<ResourceType>;

    return Array.from(allRes)
      .map((resource) => ({
        resource,
        stored: stored[resource] ?? 0,
        inTransit: inTransitIn[resource] ?? 0,
        inTransitOut: inTransitOut[resource] ?? 0,
      }))
      .filter((e) => e.stored > 0 || e.inTransit > 0 || e.inTransitOut > 0)
      .sort((a, b) => (b.stored + b.inTransit + b.inTransitOut) - (a.stored + a.inTransit + a.inTransitOut));
  }, [buildings, transport.activeCarrierTasks]);

  if (entries.length === 0) return null;

  return (
    <section className="warehouse-panel macabre-panel" aria-label="Vault inventory">
      <h3 className="warehouse-panel__title">Vault</h3>
      <div className="warehouse-panel__grid">
        {entries.map(({ resource, stored, inTransit, inTransitOut }) => {
          const imgSrc = imageMap[`resources/${resource}.png`];
          return (
            <div key={resource} className="warehouse-entry" title={resource}>
              <div className="warehouse-entry__icon">
                {imgSrc ? (
                  <img src={imgSrc} alt="" aria-hidden="true" />
                ) : (
                  <span className="warehouse-entry__fallback">
                    {(resource.charAt(0) || '?').toUpperCase()}
                  </span>
                )}
              </div>
              <span className="warehouse-entry__count">{stored}</span>
              {inTransit > 0 && (
                <span className="warehouse-entry__transit" title="Incoming">+{inTransit}</span>
              )}
              {inTransitOut > 0 && (
                <span className="warehouse-entry__transit warehouse-entry__transit--out" title="Outgoing">-{inTransitOut}</span>
              )}
            </div>
          );
        })}
      </div>
    </section>
  );
}
