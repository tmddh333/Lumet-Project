# Reviewer-first learning validation

Verified locally on 2026-11-06 (KST), macOS arm64 with Node 26.3.1, npm 11.16.0, JDK 17, Python 3.14 and Playwright Chromium.

| Executed command | Actual outcome |
| --- | --- |
| `npm run check` | Passed the full sequence below |
| `npm run typecheck` | Passed |
| `npm run lint` | Passed, zero warnings/errors |
| `npm test` | 44 passed across 4 files |
| `npm run test:runtime` | 39 passed, zero skipped |
| `npm run build` | 9 fixtures validated; static PWA built successfully |
| `npm run test:e2e` | 24 passed across 360px, 390px and 1280px Chromium projects |
| `git diff --check` | Passed |

Runtime checks compare every displayed snapshot in all nine fixtures, including Java's thrown collection exception, shared Python objects and the controlled Promise sequence. All six correction examples are executed and checked against regression requirements. Additional checks include different coupon text, either response completion order, three overlapping requests, explicitly supplied empty Python lists and nested-copy identity. These are trusted repository-only tests, never an execution API.

Component checks cover required nonblank reasoning, feedback/correction reveal timing, hints, diff reconstruction/line mapping, theme changes, returning to submitted reviews, language-specific trace alignment, topic/level filters, unknown/malformed stored values, consent, coarse-progress allowlisting, resume, deletion and storage failure. Free text is not auto-graded.

Browser checks include the original free loop plus practical review before/after submission, expanded corrections, keyboard line selection, theme-preserved inputs, trace delta values, saved-position reload and opt-out deletion, planned framework states and offline practical review. Both themes are scanned with axe at all three widths: 48 scans total with no WCAG 2 A/AA or 2.1 AA violations detected. Mobile review and desktop comparison screenshots were visually inspected. CI uploads browser reports/screenshots separately.

An initial browser failure identified ambiguous exact label lookup for topic/level selects; the controls now use explicit label/ID associations. Earlier component assertions were adjusted for normalized whitespace in indented code and accessible names. The table above records the final successful end-to-end run.

## Limits and follow-up

- No AI API or generated free-text grading. Broader feedback evaluation is a separate feature, with the learner's own analysis remaining first.
- No real repository PR ingestion, arbitrary execution, heap/call-stack renderer or new language runner. The new cases are six curated practical examples in the existing three languages.
- Physical Android/iOS installation, Safari/Firefox, screen-reader manual testing and user understanding studies remain separate validation work.
- Trace reveal is a learning UX convention; fixture answers are inspectable in a static offline app.
- This record describes local results. The pull request links the independent CI outcome; no automatic merge or deployment is performed.
