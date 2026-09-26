# Architecture

This application uses Next.js App Router for URL routing and a feature-first structure for product code. Route files stay deliberately small; feature modules own the UI, domain types, and data for their part of the dashboard.

## Project layout

```text
app/                         URL routes, root layout, global styles
components/ui/               Reusable low-level UI primitives
components/                  Shared application shell and cross-feature UI
features/
  dashboard/                 Station overview
  dispensers/                Dispenser screens, types, and data
  tanks/                     Tank screens, types, and data
  nozzles/                   Nozzle screens, types, and data
hooks/                       Reusable React hooks
lib/                         Small app-wide utilities only
public/                      Static assets
```

Feature modules currently keep their closely related page components and `data.ts` together. As a feature grows, split it into `components/`, `hooks/`, `services/`, `types/`, and `data/` subfolders only when that makes ownership or reuse clearer; avoid empty folders and abstraction for its own sake.

## Dependency rules

1. `app/` owns URL composition, metadata, layouts, and route-level loading or error boundaries. It imports and renders from `features/`.
2. A feature owns its domain types, feature-specific UI, and data access. Keep feature-specific implementation inside that feature.
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

`features/*/data.ts` contains local demo fixtures today. When a backend is introduced, replace feature-local fixture imports with typed service/repository functions owned by the feature. Keep transport DTOs separate from UI view models when their shapes differ.
