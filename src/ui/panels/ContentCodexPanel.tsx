import { useMemo, useState } from 'react';
import { CONTENT_CATALOG } from '../../game/core/content.catalog';
import { BUILDING_DEFINITIONS, WORKER_DEFINITIONS } from '../../game/core/economy.data';
import imageMap from '../../pixi/utils/vite-asset-loader';

type CodexTab = 'buildings' | 'workers' | 'resources';

export default function ContentCodexPanel(): JSX.Element {
  const [open, setOpen] = useState(false);
  const [tab, setTab] = useState<CodexTab>('buildings');
  const stats = useMemo(() => ({
    buildings: CONTENT_CATALOG.buildings.length,
    workers: CONTENT_CATALOG.workers.length,
    resources: CONTENT_CATALOG.resources.length,
  }), []);

  return (
    <div className="content-codex">
      <button
        className={`macabre-panel content-codex__toggle ${open ? 'active' : ''}`}
        onClick={() => setOpen((value) => !value)}
        aria-expanded={open}
        aria-controls="content-codex-panel"
      >
        Codex
      </button>

      {open && (
        <section id="content-codex-panel" className="macabre-panel content-codex__panel" aria-label="Game content codex">
          <header className="content-codex__header">
            <div>
              <h2>Nightmare Economy Codex</h2>
              <p>{stats.buildings} buildings · {stats.workers} workers · {stats.resources} resources</p>
            </div>
            <nav className="content-codex__tabs" aria-label="Codex sections">
              {(['buildings', 'workers', 'resources'] as CodexTab[]).map((key) => (
                <button
                  key={key}
                  className={`build-menu-tab ${tab === key ? 'active' : ''}`}
                  onClick={() => setTab(key)}
                  aria-pressed={tab === key}
                >
                  {key}
                </button>
              ))}
            </nav>
          </header>

          <div className="content-codex__list">
            {tab === 'buildings' && CONTENT_CATALOG.buildings.map((entry) => (
              <article key={entry.type} className="content-codex__entry">
                <img src={imageMap[`buildings/stage4/${entry.type}.png`]} alt="" aria-hidden="true" />
                <div>
                  <h3>{entry.name}</h3>
                  <p>{entry.description}</p>
                  <CodexMeta label="Workers" values={entry.workers.map((worker) => WORKER_DEFINITIONS[worker]?.name ?? worker)} />
                  <CodexMeta label="Consumes" values={entry.consumes} />
                  <CodexMeta label="Produces" values={entry.produces} />
                </div>
              </article>
            ))}

            {tab === 'workers' && CONTENT_CATALOG.workers.map((entry) => (
              <article key={entry.type} className="content-codex__entry">
                <img src={imageMap[`workers/${entry.type}.png`] ?? imageMap[`workers/${entry.type}.svg`]} alt="" aria-hidden="true" />
                <div>
                  <h3>{entry.name}</h3>
                  <p>{entry.description}</p>
                  <CodexMeta label="Hire cost" values={Object.entries(entry.hireCost.resources).map(([resource, amount]) => `${amount} ${resource}`)} />
                  <CodexMeta label="Works at" values={entry.buildings.map((building) => BUILDING_DEFINITIONS[building]?.name ?? building)} />
                </div>
              </article>
            ))}

            {tab === 'resources' && CONTENT_CATALOG.resources.map((entry) => (
              <article key={entry.type} className="content-codex__entry content-codex__entry--resource" title={entry.tooltip}>
                <img src={imageMap[`resources/${entry.type}.png`]} alt="" aria-hidden="true" />
                <div>
                  <h3>{entry.label}</h3>
                  <CodexMeta label="Produced by" values={entry.producedBy.map((building) => BUILDING_DEFINITIONS[building]?.name ?? building)} />
                  <CodexMeta label="Consumed by" values={entry.consumedBy.map((building) => BUILDING_DEFINITIONS[building]?.name ?? building)} />
                </div>
              </article>
            ))}
          </div>
        </section>
      )}
    </div>
  );
}

function CodexMeta({ label, values }: { label: string; values: string[] }) {
  if (values.length === 0) return null;

  return (
    <div className="content-codex__meta">
      <span>{label}</span>
      <strong>{values.join(', ')}</strong>
    </div>
  );
}
