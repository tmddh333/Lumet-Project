# ADR-0002: Static React PWA with independently verified curated content

Status: Proposed in Issue #1 implementation

## Context

Issue #1 requests a mobile-first React/TypeScript/Vite PWA. The repository contains product/design documents but no runnable `prototype/`. ADR-0001 prohibits conflating curated content with recorded execution. An API, account system, arbitrary execution, analytics and payments are outside M1.

## Decisions

- Use an npm workspace at `apps/web`. React and React DOM are the only application runtime dependencies. Vite and TypeScript provide development/build tooling. Native HTML controls and CSS tokens avoid a component library, icon library, router, theme package or global state package for four screens.
- Use hash routes (`#home`, `#stacks`, `#trace/<id>`, `#review/<id>`) so browser back/forward and direct lesson links work on a static origin without server rewrites. Unknown IDs produce an unavailable page. A scenario-keyed trace component owns one reducer index; code, variables and explanation derive from it. Effects clean up intervals on pause, completion, speed change and unmount; document visibility pauses playback.
- Keep `Scenario`, `TraceStep` and `Visualization` in a versioned JSON Schema and TypeScript contract. Only checked-in fixtures enter the catalog, through a single documented assertion. Ajv runs during build/tests, not in the browser. A future remote-content boundary must validate before rendering; this assertion is not reusable for external data. Semantic validation also rejects out-of-range lines, invalid answers and inconsistent variable fields.
- Preserve per-language display values and assumptions, with renderer dispatch by `visualization.type`/version. V1 implements variables only. Unknown renderers fail visibly. `executionKind` labels curated and recorded data differently; M1 build validation accepts curated fixtures only. Any optional AI interpretation occupies a separate explicitly labeled field.
- Verify all displayed statement-boundary snapshots using Node, Java and Python in a **development-only** test harness. It executes only maintainer-authored repository fixtures with fixed commands, timeouts and output limits. No harness code, subprocess access or user-code input enters the frontend bundle. This is not a future execution service or sandbox design.
- Follow OS theme by default, apply the theme before first paint and listen for OS changes while in system mode. Store explicit theme and opt-in local stack interests only; blocked storage degrades to in-memory behavior with a visible notice. Theme changes do not remount learning screens. Review drafts remain in component memory.
- Generate a web manifest and icons from central brand configuration at build time. A small native service worker precaches the complete static app, including bundled fixtures, using a content-derived cache name. Cache only explicit same-origin build assets. Do not cache arbitrary requests, runtime data, code input or external links. Wait for old clients to close before activating updates; delete only this app's old caches on activation. Root-origin hosting is an explicit M1 limitation.
- Use Vitest/Testing Library for state and interaction tests, Ajv for schema checks and Playwright/axe for browser geometry, keyboard, theme contrast and offline checks. Use maintained ESLint 10 with TypeScript/React Hooks rules. The JSX accessibility lint plugin currently requires ESLint ≤9; instead check rendered accessibility with axe and keyboard tests, avoiding an unsupported ESLint dependency or forced peer overrides. No PWA/Workbox dependency is needed for this fixed, small asset set.

## Consequences

All three learning loops are free and offline-capable after the first successful cache installation. Initial download includes all M1 fixtures; larger catalogs will need deliberate partitioning and cache migration. Existing tabs keep their current content version until closed. Native install UX, HTTPS hosting, Safari/Firefox, real-device testing and real user feedback still need separate verification. No claim of those results is implied by Chromium tests.

Brand-facing names live in `src/brand.json`; HTML title and web manifest are generated from it. Storage keys/cache namespace remain stable across a display-name change to preserve existing preferences. Geometry is source-controlled SVG/PNG generation, with no remote assets or fonts.

References: [Vite](https://vite.dev/guide/), [React effect cleanup](https://react.dev/reference/react/useEffect), [MDN PWA caching](https://developer.mozilla.org/en-US/docs/Web/Progressive_web_apps/Guides/Caching). Language references are included in each fixture and exposed in the UI.
