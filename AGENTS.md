# AGENTS.md — LUMET repository instructions

## Mission

Build a mobile-first, stack-agnostic developer learning product: read code, trace state, review behavior, and verify understanding. Do not narrow the product to a single language. Lumet is a temporary brand, not a cleared trademark.

## Required reading before planning changes

1. `README.md`
2. `docs/product/PRD-v0.2.md`
3. `docs/architecture/ARCHITECTURE.md`
4. `docs/design/DESIGN.md` and its dark/light design tokens
5. Relevant ADRs under `docs/adr/`

## Delivery protocol

- For nontrivial work: give a small implementation plan, list affected files, state assumptions and acceptance criteria.
- Keep pull requests focused. Do not silently add major dependencies, cloud services, authentication, payments, or arbitrary code execution.
- Prefer readable implementation over clever compact syntax. In Java prefer explicit `if` blocks to nested ternary expressions.
- Add/update tests for behavior changes and document architecture decisions in `docs/adr/` when consequential.
- At task completion: summarize changes, user-visible behavior, commands run, actual test outcomes, limitations and follow-up issue(s). Do not claim tests were run if they were not.
- Do not create GitHub repos, push commits, deploy, purchase domains or enable billing without explicit instruction and correct authorization.

## Core invariants

1. **No fabricated trace:** curated simulation vs. recorded runtime data vs. AI interpretation must be visibly distinct.
2. **Tech-specific correctness:** preserve language/version/assumptions and tests. An unavailable stack must show an honest unavailable/interest state, never silently replay an unrelated language.
3. **One playback state:** step index drives code highlights, variable snapshot and explanation together. Stop intervals on navigation/unmount.
4. **No untrusted code in API:** future code execution requires a separate reviewed isolation boundary, quotas, timeouts, privilege and network restrictions.
5. **Privacy:** treat pasted code and repository data as possibly confidential; never log secrets or store code by default without explicit user consent.
6. **Accessible by default:** keyboard interaction, semantic controls, text labels, focus visibility and reduced motion.
7. **Theme correctness:** implement system-default dark/light mode, explicit user override, storage persistence, both-theme readability and reduced-motion.
8. **Free core loop:** do not gate explanation or basic trace behind payment.

## Current prototype

- The `prototype/` directory is a **design prototype** written in dependency-free HTML/CSS/JS, not the production React app or actual code runner.
- Run: `python3 -m http.server 4173 --directory prototype`.
- Check: `python3 scripts/check_project.py`.
- Future production migration may adopt React + TypeScript + Vite; preserve behavior and tests before deleting the prototype.

## Suggested first task

Implement a React/TypeScript/Vite PWA that reproduces the home, stack picker, trace player and review experience in `prototype/`, while keeping the language-independent data contract. Add test coverage for step bounds, play/pause, navigation cleanup and language-specific fixtures. Do not implement arbitrary code execution.