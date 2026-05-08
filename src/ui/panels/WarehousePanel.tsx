import { useMemo } from 'react';
import { useGameStore, player1Id } from '../../store/game.store';
import imageMap from '../../pixi/utils/vite-asset-loader';
import { ResourceType } from '../../game/core/economy.types';
import { getResourceLedger } from '../../store/resourceSummaryDomain';
import { resourceLabel } from '../../store/economy.utils';

type VaultEntry = {
  resource: ResourceType;
  stored: number;
  available: number;
  reserved: number;
  inTransit: number;
  inTransitOut: number;
};

export default function WarehousePanel(): JSX.Element | null {
  const gameState = useGameStore((s) => s.gameState);
  const { buildings, transport } = useMemo(() => ({
    buildings: gameState.buildings,
    transport: gameState.transport,
  }), [gameState]);

  const ledger = useMemo(() => getResourceLedger(gameState, player1Id), [gameState]);

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
        const sourceBuilding = buildings[task.pickupBuildingId];
        if (sourceBuilding?.type === 'vaultOfDigestiveStone') {
          inTransitOut[r] = (inTransitOut[r] ?? 0) + task.amount;
        }
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
        available: ledger[resource].available,
        reserved: ledger[resource].reserved,
        inTransit: inTransitIn[resource] ?? 0,
        inTransitOut: inTransitOut[resource] ?? 0,
      }))
      .filter((e) => e.stored > 0 || e.inTransit > 0 || e.inTransitOut > 0)
      .sort((a, b) => (b.stored + b.inTransit + b.inTransitOut) - (a.stored + a.inTransit + a.inTransitOut));
  }, [buildings, ledger, transport.activeCarrierTasks]);

  if (entries.length === 0) return null;

  return (
    <section className="warehouse-panel macabre-panel" aria-label="Vault inventory">
      <h3 className="warehouse-panel__title">Vault</h3>
      <p className="warehouse-panel__note">Authoritative vault storage: available excludes reserved outgoing deliveries.</p>
      <div className="warehouse-panel__grid">
        {entries.map(({ resource, stored, available, reserved, inTransit, inTransitOut }) => {
          const imgSrc = imageMap[`resources/${resource}.png`];
          return (
            <div key={resource} className="warehouse-entry" title={`${resourceLabel(resource)}: ${available} available, ${reserved} reserved, ${inTransit} incoming, ${inTransitOut} outgoing`}>
              <div className="warehouse-entry__icon">
                {imgSrc ? (
                  <img src={imgSrc} alt="" aria-hidden="true" />
                ) : (
                  <span className="warehouse-entry__fallback">
                    {(resource.charAt(0) || '?').toUpperCase()}
                  </span>
                )}
              </div>
              <span className="warehouse-entry__count">{available}</span>
              {reserved > 0 && (
                <span className="warehouse-entry__transit warehouse-entry__transit--reserved" title={`${stored} stored, ${reserved} reserved`}>r{reserved}</span>
              )}
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
