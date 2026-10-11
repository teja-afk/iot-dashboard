# IoT Dashboard

An operations dashboard for monitoring station tanks, dispensers, and nozzles.

## Requirements

- Node.js compatible with the installed Next.js version
- npm

## Development

Install dependencies with `npm install`, copy `.env.example` to `.env.local`, set `MONGODB_URI` and (if needed) `MONGODB_DATABASE` and `MONGODB_STATION_ID`, then start the local server with `npm run dev`. Open <http://localhost:3000>.

## MongoDB data

The dashboard stores records in separate `stations`, `tanks`, `dispensers`, `nozzles`, and `transactions` collections. Equipment and transaction records include a `stationId`; repository queries scope reads to `MONGODB_STATION_ID` (defaults to `STATION-001`). From Compass, create/connect to the configured database, then run `npm run seed:mongodb` to upsert the exported `seedData` from `features/data.ts` into the separate collections and create relationship indexes. Set `MONGODB_URI` in `.env.local` first. Reads happen on the server; the interactive report screens receive only their required records as props. There is no mock-data fallback if the connection or seed records are missing.

Keep `.env.local` private and never commit MongoDB credentials.

## Quality checks

- `npm run lint` — ESLint
- `npm run typecheck` — TypeScript check
- `npm run build` — production build

## Architecture

The codebase is organized by feature. Route files under `app/` delegate to feature modules; domain types and demo data stay with the feature that owns them. See [ARCHITECTURE.md](ARCHITECTURE.md) for the folder map, dependency rules, and steps for adding a feature.
