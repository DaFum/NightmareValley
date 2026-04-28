import { useMemo } from 'react';
import { useShallow } from 'zustand/react/shallow';
import { getSelectionSummary } from '../../game/ui/selection-summary';
import { useGameStore } from '../../store/game.store';
import { useSelectionStore } from '../../store/selection.store';

export default function SelectionStatusChip(): JSX.Element | null {
  const selection = useSelectionStore(useShallow((state) => ({
    selectedBuildingId: state.selectedBuildingId,
    selectedWorkerId: state.selectedWorkerId,
    selectedTileId: state.selectedTileId,
  })));
  const selectionKey = `${selection.selectedBuildingId ?? ''}:${selection.selectedWorkerId ?? ''}:${selection.selectedTileId ?? ''}`;
  const stateVersion = useGameStore((state) => state.gameState.tick);
  const summary = useMemo(
    () => getSelectionSummary(useGameStore.getState().gameState, selection),
    [selection, selectionKey, stateVersion]
  );

  if (!summary) return null;

  return (
    <section className={`selection-status selection-status--${summary.tone}`} aria-label="Current selection">
      <span>{summary.kind}</span>
      <strong>{summary.title}</strong>
      <small>{summary.detail}</small>
    </section>
  );
}
