# Frontend conventions


- Workspace data flows through src/services/* adapters (catalog, requirements, matching, in-memory store); UI never fetches directly — so the backend team can swap adapters. Requirement files are parsed and stored by the backend (`/api/v1/requirement-batches`), not in the browser.
- No buyer requirement data is ever seeded. The supplier catalogue comes from the backend API (`src/services/catalog.ts` → `GET /api/v1/suppliers`, `/offerings`); the frontend never parses the supplier CSV.
