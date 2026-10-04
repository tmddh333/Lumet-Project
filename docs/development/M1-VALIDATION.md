# M1 validation — Issue #1

Local verification on macOS arm64, Node 26.3.1, npm 11.16.0, OpenJDK 17.0.19, Python 3.14.6 and Playwright Chromium 153.0.8010.12. CI independently repeats the checks on Linux with Node 24, Java 17 and Python 3.11.

| Executed command | Actual result |
| --- | --- |
| `npm run typecheck` | Passed; TypeScript reports no errors |
| `npm run lint` | Passed; ESLint reports no errors or warnings |
| `npm test` | 24 tests passed in 3 files |
| `npm run test:runtime` | 9 passed; every displayed statement-boundary snapshot compared with Java/Node/Python |
| `npm run build` | Passed; 3 fixtures validated, Vite bundle and 7-asset PWA cache generated |
| `npm run test:e2e` | 15 passed across 360px, 390px and 1280px Chromium projects |
| `npm run check` | Full sequence above passed end to end |
| `git diff --check` | Passed |

The browser suite scans all four screens in both themes for each viewport (24 axe scans, no WCAG 2 A/AA or 2.1 AA violations detected), checks page overflow and captures screenshots. It also verifies keyboard focus, browser-back playback cleanup, review feedback, saved theme/interest state, manifest/PNG dimensions and offline trace/review after service-worker installation. Selected mobile and desktop screenshots were visually inspected.

During verification, a rapid route change followed by browser back exposed playback continuing when React batched the route updates. Playback now pauses on the hash navigation event as well as component unmount. A regression test covers this path. Initial test configuration/timer-count issues were also corrected; the results above are from the final passing run.

## Limits and follow-up

- No deployment or automatic merge was performed. The install manifest and offline behavior were tested locally, but physical Android/iOS installation over HTTPS remains unverified.
- Safari, Firefox and assistive-technology manual testing remain follow-up work. Automated axe checks are not proof of complete accessibility.
- At least five user feedback sessions required by the wider PRD remain a separate product validation task.
- M1 serves at origin root and precaches three curated examples. Arbitrary execution, remote content, accounts, analytics and payments remain out of scope.

CI status and its browser screenshots/report are available on the pull request; a successful local run is not a claim about a CI run that has not completed.
