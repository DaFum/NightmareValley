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

Troubleshooting

- If the dev server fails to start, ensure no other process is using the default Vite port (5173) or set `--port`.
- If dependencies are inconsistent, remove `node_modules` and `package-lock.json`, then run `npm ci`.
- For runtime errors related to textures or spritesheets, check `src/assets/spritesheets/manifest.json` and ensure assets referenced exist.

See [Architektur.md](Architektur.md) for project structure and developer guidance.
