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
