# Web development and content verification

## Layout

| Path | Responsibility |
| --- | --- |
| `apps/web/src/screens/` | Home, StackPicker, TracePlayer, ReviewChallenge |
| `apps/web/src/domain/` | Versioned content contract, schema, pure playback reducer |
| `apps/web/src/content/` | Nine language-specific JSON scenarios and supported-stack catalog |
| `apps/web/src/components/` | Code, provenance, variables renderer and geometric icons |
| `apps/web/src/hooks/` | Theme preference and playback lifecycle |
| `apps/web/scripts/` | Schema validation and production PWA generation |
| `apps/web/tests/` | Unit/component, runtime and browser tests |
| `apps/web/src/brand.json` | Product name, Korean name, tagline and temporary-brand notice |

## Toolchain and commands

Use Node 24.15+ within 24.x (`nvm use`), npm and `npm ci` from the repository root. Node 22.22.2+ within 22.x and Node 26+ also satisfy the toolchain. The root engine constraint includes jsdom's requirements; unsupported Node versions fail during install. The lockfile is shared at the root. Local checks use Node 26; CI uses Node 24. `npm run dev` serves the app; production/offline tests use `npm run build` followed by `npm run test:e2e`, which starts its own Vite preview server on `127.0.0.1:4173`.

`npm run check` performs typecheck → ESLint (zero warnings) → Vitest → Node/Java/Python fixture verification → schema validation/production build → Playwright. Install Chromium once with `npx playwright install chromium`; Linux CI installs browser system dependencies with `--with-deps`. JDK 17+ and Python 3.11+ must be on PATH; absent runtimes fail explicitly.

Playwright projects cover widths 360, 390 and 1280. Each scans Home/Stacks/Trace/Review in **both** themes with axe and checks document overflow. Each also covers the free learning loop, keyboard focus, browser-back cleanup, interest persistence, manifest/icon metadata and offline trace/review. Successful screenshots are stored under `apps/web/test-results/`; HTML reports under `apps/web/playwright-report/`. CI uploads both for review. These tests do not replace mobile-device installation or screen-reader testing.

## Content lifecycle

### Reviewer-first extension

Scenario v2 (`src/domain/scenario.schema.json`) requires `level` and a `review.mode` discriminant. All nine bundled fixtures are migrated; v1 is retained as `scenario.v1.schema.json` for historical reference only. Add PR review content with a context, requirements, before-code, progressive hints, verified finding and correction. The viewer derives a unified diff with independent old/new line numbers. Runtime verification for practical fixtures is in `tests/runtime/pr-scenarios.test.mjs`; it compares every displayed statement/event boundary, every correction, reversed/third async responses and selected negative cases. New fixture IDs must have a verifier or tests fail.

Practical lessons enter at `#review/<id>` and redirect unreviewed `#trace/<id>` links back to review. Submission requires a selected line/type, nonblank condition and impact; test ideas are optional. Only structured selections are compared, never the correctness of free text. Feedback and official references appear after submission; correction is an additional opt-in disclosure. Inputs remain in memory, with submitted attempts retained across navigation but not reload. This is a learning UX rule, not protection against inspecting a static bundle.

`LearningProvider` owns session attempts and coarse progress. `lumet.progress.v1` is persisted only after `lumet.progress-consent` is enabled. The parser allowlists known lesson IDs, bounded positions, completion/revisit flags and last route; it strips arbitrary fields. Opt-out removes saved consent/progress, while the current in-memory session can continue. Reset also clears session attempts. Theme/interest storage policies remain independent. No review prose, code, external AI call or telemetry is persisted or transmitted.

The browser suite adds review-before/after comparisons in both themes, keyboard diff selection, accessible filters, progress reload/deletion and offline practical review. The full suite remains `npm run check`. Additional design reasoning: [ADR-0003](../adr/0003-reviewer-first-learning.md).

1. Add a language-specific JSON fixture with `schemaVersion: 2`, level, ID, language version, preconditions, source links and `executionKind: curated_simulation`.
2. Define the exact observation boundary for each step. M1 examples observe completed statements; expression-internal order is explained without fabricating intermediate runtime events.
3. Put display values in a `state` object and declare corresponding visualization fields with language-specific type names. `@1`/`@2` denote illustrative object identity, never real addresses.
4. Add the fixture to the catalog and its stack to `available`. Keep unsupported stacks `planned` or `preview` with explicit UI availability. Do not reuse another stack's fixture.
5. Add an independent verifier in `tests/runtime/scenarios.test.mjs`. It must derive observations from the actual fixture source, compare every displayed snapshot, preserve reference identity when relevant and fail for an unrecognized scenario. It is trusted maintainer tooling, never an arbitrary-code API.
6. For `quiz`, add choices with one matching answer ID and a language-correct rationale; for `pull_request`, add the context, diff source, hints, finding and tested correction. Run schema, unit, runtime and browser checks before changing a fixture's verified label.

Changes to the JSON contract must keep TypeScript and JSON Schema aligned. Add an explicit renderer/version before accepting a new visualization. The build rejects unknown schema versions/renderers, invalid line references and invalid review choices. Remote content is out of scope and would require validation at the ingestion boundary.

## PWA and storage policy

The build creates `/manifest.webmanifest`, `/icon-192.png`, `/icon-512.png` and `/sw.js`. Serve `dist/` at origin root using HTTPS (localhost is suitable for testing). Subpath deployment is not supported. Keep `sw.js` and HTML revalidatable; hashed assets may use immutable caching. Do not deploy automatically from CI.

The cache includes the shell, CSS/JS, local icons and bundled scenarios. OS fonts need no download. Cache identity derives from asset bytes. There is no runtime caching, no cross-origin caching and no `skipWaiting` that could replace an active learner's version. Close all existing tabs/windows of the PWA to allow a new worker to activate. First-time offline visits cannot install the app.

`lumet.theme` stores `system`, `dark` or `light`; `lumet.interests` stores explicitly selected unsupported-stack IDs. Coarse learning progress additionally uses the consent-based keys described above. Malformed or unavailable storage does not block learning. Stack selections and review text are memory state. No raw code, secrets, analytics events or review drafts are logged, persisted or sent to a server.

Future consent-based measurement could count `stack_selected`, `lesson_started`, `trace_completed` and `review_submitted` using only scenario/stack identifiers after opt-in. No collection is implemented in M1; implementing consent, retention and deletion needs separate review.

## Remaining acceptance work

- Physical Android/iOS PWA install and standalone checks over HTTPS, including update lifecycle.
- Safari/Firefox and screen-reader manual verification; Chromium emulation does not establish parity.
- Usability/understanding sessions with at least five people, recorded separately from code tests.
- Additional renderer kinds and reviewed learning content, without weakening language-specific verification.
