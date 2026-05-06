import { useGameStore } from '../../store/game.store';
import { WorldEventLogEntry } from '../../game/world/world.types';

const EMPTY_EVENTS: WorldEventLogEntry[] = [];

import { useShallow } from 'zustand/react/shallow';

export default function EventLogPanel(): JSX.Element {
  const events = useGameStore(useShallow((state) => state.gameState.events?.log ?? EMPTY_EVENTS));
  const alert = events.find((event) => event.severity === 'danger')
    ?? events.find((event) => event.severity === 'warning');

  return (
    <section className="event-log macabre-panel" aria-label="World event log">
      <header className="event-log__header">
        <h2>Omens</h2>
        <span>{events.length}</span>
      </header>
      {events.length === 0 ? (
        <p className="event-log__empty">No omens recorded.</p>
      ) : (
        <>
          {alert && (
            <div className={`event-log__alert event-log__alert--${alert.severity}`} role="status">
              <strong>{alert.title}</strong>
              <span>{alert.description}</span>
            </div>
          )}
          <ol className="event-log__list">
            {events.slice(0, 4).map((event) => (
              <li key={event.id} className={`event-log__item event-log__item--${event.severity}`}>
                <strong>{event.title}</strong>
                <small>{Math.floor(event.age)}s</small>
                <p>{event.description}</p>
              </li>
            ))}
          </ol>
        </>
      )}
    </section>
  );
}
