# Architecture

This application uses Next.js App Router for URL routing and a feature-first structure for product code. Route files stay deliberately small; feature modules own the UI, domain types, and data for their part of the dashboard.

## Project layout

```text
app/                         URL routes, root layout, global styles
  (auth)/                    Public authentication routes/layouts
  (dashboard)/               Dashboard shell and routes
    tanks/                    Tank overview, detail, and reports
    dispensers/               Dispenser overview and dynamic detail
    nozzles/                  Nozzle overview and dynamic detail
components/ui/               Reusable low-level UI primitives
components/equipment/        Shared overview, detail, status, and loading UI
components/                  Shared application shell and cross-feature UI
features/
  auth/                      Login experience and auth service contracts
  dashboard/                 Station overview
  dispensers/                Dispenser screens, types, and data
  tanks/                     Tank screens, types, and data
  nozzles/                   Nozzle screens, types, and data
hooks/                       Reusable React hooks
lib/                         Small app-wide utilities only
public/                      Static assets
```

Feature modules keep server-side async query functions in `repository.ts` and screens beside them. Shared MongoDB equipment shapes and query helpers live in `features/equipment/`; they normalize current inventory and telemetry collections before the UI consumes them. As a feature grows, split into `components/`, `hooks/`, `services/`, `types/`, and `data/` subfolders only when that makes ownership or reuse clearer; avoid empty folders and abstraction for its own sake.

## Dependency rules

1. `app/` owns URL composition, metadata, layouts, and route-level loading or error boundaries. Route groups separate auth and dashboard shells without changing public URLs.
2. A feature owns its domain types, feature-specific UI, and data access. Keep fixture records in `data.ts`; keep data access behind server-only asynchronous functions in `repository.ts`.
3. Features may depend on `components/ui/`, `components/`, `hooks/`, and `lib/`. Shared modules must not import from a feature.
4. Cross-feature dependencies should be explicit and small. Move code to a shared location only after there is a genuine shared use case.
5. Keep shared `lib/` utilities framework-neutral where possible. Do not use it as a catch-all for domain data.
6. Keep client components (`"use client"`) at the smallest interactive boundary. A route can remain a Server Component while rendering a client feature component.

## Adding a feature

1. Add a folder under `features/` and keep its types/data next to its screens.
2. Implement the feature entry screen there, using shared UI primitives where appropriate.
3. Add a thin `app/<route>/page.tsx` that imports and renders the feature entry.
4. Add feature-local tests alongside the feature when a test runner is introduced; do not add unrelated test infrastructure to a feature change.
5. Run `npm run lint`, `npm run typecheck`, and `npm run build` before merging.

## Current data boundary

Equipment screens read outlet-scoped records from `tanks`, `tank_telemetry`, `dispensers`, and `dispensers_telemetry` using `MONGODB_RETAIL_OUTLET_ID`. Nozzles are derived from unique `(serial_no, nza)` telemetry pairs because there is no standalone nozzle collection in this schema. Configure `MONGODB_URI`, `MONGODB_DATABASE`, and `MONGODB_RETAIL_OUTLET_ID` in `.env.local`. Keep database access in server-only repositories; pass normalized display data to client components rather than importing MongoDB code into them. Reads run uncached so screens reflect current database records. The former demo fixture seeder is retired because it targets the old schema.

## Authentication status

The `/login` page is currently a UI preview generated from shadcn's `login-02` pattern. It does not send SMS, verify credentials or OTPs, create sessions, or protect dashboard routes. Do not deploy it as active authentication.

The auth contract is in `features/auth/contracts.ts`. When wiring the existing MySQL database and MSG91, implement that contract only on the server (for example with Server Actions or Route Handlers), store OTP challenges with short expiry and attempt limits, never store plaintext passwords or OTPs, and issue an HTTP-only, Secure, SameSite session cookie after successful verification. Enforce authorization in the server-side dashboard layout and again at each protected data access boundary; a Proxy check alone is not an authorization boundary. Keep MySQL credentials and MSG91 keys in server environment variables.
