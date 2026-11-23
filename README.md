# Periodic Table Explorer

An interactive periodic table built with React, Vite, TypeScript, and Express. Select an element to see its properties, search by name or symbol, and filter by element family.

## Requirements

- Node.js 20.19+ or 22.12+
- npm

## Start the app

From the repository root:

```bash
npm install
npm run dev
```

Open the frontend at [http://localhost:5173](http://localhost:5173). The API runs at [http://localhost:3001](http://localhost:3001), and Vite proxies `/api` requests to it.

## Other commands

```bash
npm run build       # Type-check and build the frontend, then build the backend
npm run typecheck --workspace frontend  # Type-check the React frontend
npm run test        # Run backend service tests
npm run start       # Start the compiled backend
```

## Project structure

- `frontend/` — typed React UI in TSX, search, family filters, and element details dialog.
- `backend/` — typed REST API, bundled element data, and deterministic agent services.
- `backend/agents/` and `.github/agents/` — role and workflow instructions for the chemistry agents and coding assistants.

The local agent services summarize facts from the bundled dataset; they do not call an external AI service or invent missing measurements. Agent definitions are in Markdown and can guide future AI integrations.

## API

- `GET /api/elements` — list elements; accepts `q` and `category` query parameters.
- `GET /api/elements/:atomicNumber` — element facts.
- `GET /api/elements/:atomicNumber/research` — deterministic research, chemistry, and fact-check summary.
- `GET /api/health` — service health.

Element measurements and classifications are presented as a learning aid. Isotope-dependent values, especially for synthetic elements, are conventional reference values rather than claims about a single stable isotope.
