# IoT Dashboard

An operations dashboard for monitoring station tanks, dispensers, and nozzles.

## Requirements

- Node.js compatible with the installed Next.js version
- npm

## Development

Install dependencies with `npm install`, then start the local server with `npm run dev`. Open <http://localhost:3000>.

## Quality checks

- `npm run lint` — ESLint
- `npm run typecheck` — TypeScript check
- `npm run build` — production build

## Architecture

The codebase is organized by feature. Route files under `app/` delegate to feature modules; domain types and demo data stay with the feature that owns them. See [ARCHITECTURE.md](ARCHITECTURE.md) for the folder map, dependency rules, and steps for adding a feature.
