# BEDRO — Frontend

React + TanStack Start + Vite + Tailwind CSS. Talks to the BEDRO backend API (`../Backend`).

## Run

```sh
npm install
npm run dev        # http://localhost:8080 (port expected by the backend's CORS settings)
```

Set the API address in `.env.local` (see `.env.example`), e.g. `VITE_API_BASE_URL=http://localhost:8000`.

## Test and build

```sh
npm test                        # vitest
npm run build                   # production build (Nitro, Node server preset)
node .output/server/index.mjs   # serve the production build (PORT env var, default 3000)
```
