# ADR-0001: Curated traces before arbitrary execution

Status: Accepted for MVP

## Decision
Initial Lumet scenarios use versioned and testable curated trace fixtures instead of running arbitrary user code. Every scenario labels its execution kind as `curated_simulation`; real recorded runtime traces require a separate schema and verified isolated runner in a future milestone.

## Why
Early validation must focus on stack discovery, mobile trace readability, and review learning. Arbitrary code execution needs language-specific instrumentation, security isolation, quotas, and reliable correctness checks. AI-generated explanations must never be presented as observed runtime facts.

## Consequences
The MVP offers verified educational examples only. A future execution service cannot run in the main Spring Boot API process.
