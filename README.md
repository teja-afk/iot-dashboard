# IoT Dashboard

An operations dashboard for monitoring station tanks, dispensers, and nozzles.

## Requirements

- Node.js compatible with the installed Next.js version
- npm

## Development

Install dependencies with `npm install`, copy `.env.example` to `.env.local`, set `MONGODB_URI`, `MONGODB_DATABASE`, and `MONGODB_RETAIL_OUTLET_ID`, then start the local server with `npm run dev`. Open <http://localhost:3000>.

## MongoDB data

The station overview reads the `tanks`, `tank_telemetry`, `dispensers`, and `dispensers_telemetry` collections. It filters by `MONGODB_RETAIL_OUTLET_ID` (defaults to `31483`), matching either numeric or string outlet IDs. Telemetry records drive daily transaction counts, the 12-hour activity chart, observed nozzle counts, tank reading coverage, and probe alerts. Reads happen on the server; do not expose MongoDB credentials in client code. Configure the dashboard to match the outlet ID used by your documents.

Keep `.env.local` private and never commit MongoDB credentials.

## Quality checks

- `npm run lint` — ESLint
- `npm run typecheck` — TypeScript check
- `npm run build` — production build

## Architecture

The codebase is organized by feature. Route files under `app/` delegate to feature modules; domain types and demo data stay with the feature that owns them. See [ARCHITECTURE.md](ARCHITECTURE.md) for the folder map, dependency rules, and steps for adding a feature.
