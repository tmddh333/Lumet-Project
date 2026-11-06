# ADR-0003: Reviewer-first practical lessons and consent-based local progress

Status: Proposed in the follow-up to PR #2

## Decision

Add two practical scenarios per supported language, alongside the three foundation quizzes. Expose language/framework/database categories and topic/level filters. Frameworks without verified content remain explicitly unavailable. Keep the free loop and system/light/dark parity.

Scenario **v2** requires a level and a discriminated review mode: `quiz` or `pull_request`. Migrate all nine bundled fixtures atomically; preserve `scenario.v1.schema.json` as the historical contract. No remote v1 content is ingested. The variables renderer remains schema v1; a scenario version change does not change its format.

A PR lesson shows the change request, behavior requirements, unified diff with old/new line numbers, and a form. Learners select a new-code line and issue type, then describe a triggering condition and impact. A test idea is optional. Only a valid nonblank submission reveals a verified finding, conditions, impact and suggested test. The correction is a separate explicit disclosure after submission. Hints are requested individually. Old code remains visible as in an ordinary diff, including when a proposed change regresses previously correct behavior.

Compare **structured selections only** with the fixture's known finding. Do not pretend to assess the truth of free text through keywords or a single exact answer. Indicate that wording is not automatically graded and that other valid findings/solutions can exist. A differing selection suggests revisiting; learners can change their own revisit flag. No external AI, automatic generated review, backend, new runtime dependency or payment gate is introduced.

Practical lessons enter via review; direct trace links redirect to review until that lesson has a submitted review in session or consented local progress. This is a **learning UX rule**, not a security/anti-cheating boundary: offline static bundles necessarily contain the fixtures. Existing foundation quizzes retain trace-first access. Theme changes preserve inputs; submitted attempts remain in session memory across navigation. Inputs edited after a submission hide stale feedback. No attempt text is saved across reloads.

The trace player still has one index. Record a paused position for resume and display changed values beside their previous step value. This iteration does not claim to implement heap graphs, call stacks, arbitrary code execution or expression-level runtime tracing.

## Progress and privacy

Default to memory-only progress. An explicit home-screen checkbox permits `lumet.progress.v1` and `lumet.progress-consent`. Persist an allowlisted structure: scenario IDs, bounded step indices, reviewed/revisit booleans and last lesson route. Never serialize review drafts, submitted reasoning or source code. Parse stored values against current content IDs and bounds. Opt-out removes stored consent and progress; reset clears progress and session attempts. Storage failure leaves learning usable and visibly reports that persistence/deletion may not have succeeded. Progress can remain in memory after opt-out until the page reloads.

## Verification and consequences

Each curated PR includes runtime-tested statement/event boundary snapshots, a tested correction and regression requirements. Async search uses explicitly controlled Promise doubles, no network or invented event timing; both completion orders and a third request are tested. Tests are maintainer-only repository tooling and never bundled. UI tests check reveal timing, hints, line mapping, theme input preservation, progress consent/deletion, malformed storage and resumed positions. Browser tests cover mobile 360/390px and desktop, both themes, axe and offline review.

Content breadth remains three supported languages with three lessons each. SQL/TypeScript/framework content needs separate reviewed producers and verification. Real AI feedback, real repository PRs, call-stack/heap renderers, physical installation and user research remain follow-up work.
