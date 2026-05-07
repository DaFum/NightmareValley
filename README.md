# NightmareValley

Minimal local instructions and quick reference.

Prerequisites

- Node.js 18+ (recommended)

Quick start

```bash
# install dependencies
npm ci

# run dev server (Vite)
npm run dev

# run tests
npm test

# build production bundle (Vite)
npm run build:vite

# preview built bundle
npm run preview
```

Mounting the app

`src/App.tsx` exports both a named and default `App` component. The normal Vite entrypoint in `src/main.tsx` mounts it like this:

```tsx
import React from 'react';
import { createRoot } from 'react-dom/client';
import App from './App';

createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>
);
```

Route behavior:
- `/` and `/game` mount the runtime game route.
- `/debug` is loaded lazily and only available in development builds (`__DEV__`/`NODE_ENV !== "production"`).
- Unknown paths render the Not Found route with recovery actions.

Playable slice:
- The default game starts from a deterministic seeded map with a player vault, starter roads, stocked warehouse resources, workers, and hostile territory on the far edge.
- Build categories are `Basic`, `Processing`, `Storage`, `Military`, and `Road`. Place buildings only on owned valid terrain; road tools build or clear scar paths tile by tile.
- The top HUD controls pause plus `1x`, `2x`, and `4x` simulation speeds.
- The Settlement Brief summarizes the next campaign order, live economy bottlenecks, transport blockers, carrier load, defense strength, and enemy pressure.
- `spireOfJurisdiction` buildings expand and defend territory. `pitOfWarBirth` and spires can recruit `warInfant` soldiers when the vault has the required supplies.
- The Military panel shows enemy pressure, soldiers, spire defense, raid timing, vault integrity, and a recruit action.
- Campaign victory now requires the full industry chain, stored rations/tools, a war pit, a jurisdiction spire, enough controlled territory, enough defense strength, and at least one repelled raid.
- Development `/debug` includes seed, tick, world metrics, pathing, transport, AI, and military diagnostics.

Basic play loop:
1. Build or staff extraction buildings for timber, stone, water, fish, and grain.
2. Connect workplaces to the vault with roads so carriers can move goods.
3. Add processing buildings for planks, bone dust, bread, iron bars, and blades.
4. Upgrade key buildings from the inspector once the vault can afford the cost.
5. Build a Pit of War Birth, raise spires at the frontier, recruit soldiers, and survive raid pressure.
6. Win by meeting the campaign economy, expansion, defense, and survival conditions; lose if the vault is destroyed.

Gameplay reference:
- See [docs/gameplay.md](docs/gameplay.md) for the current start state, production chains, campaign chapters, military loop, save/load behavior, and acceptance checks.

Provider behavior:
- `RootLayout` composes `AppProviders` for the whole app shell.
- `AppProviders` exposes `errorFallback`, `onError`, and `enableStoreBootstrap` for runtime wiring.
- In development builds, provider bootstrap marks store readiness on `window.__nvStoresReady`.

Troubleshooting

- If the dev server fails to start, ensure no other process is using the default Vite port (5173) or set `--port`.
- If dependencies are inconsistent, remove `node_modules` and `package-lock.json`, then run `npm ci`.
- For runtime errors related to textures or spritesheets, check `src/assets/spritesheets/manifest.json` and ensure assets referenced exist.
- Refresh the symbol index with `npm run symbols:generate` (writes `symbols.json`).

See [Architektur.md](Architektur.md) for project structure and developer guidance.
