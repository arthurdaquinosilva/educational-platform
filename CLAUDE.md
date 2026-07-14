# CLAUDE.md

The project scaffold now exists, so the framework-guide instructions that lived
here have done their job (see the framework's Phase 6: *"replace the contents of
this file with project-specific context"*).

**See [AGENTS.md](./AGENTS.md)** — project overview, run/test commands,
conventions, guardrails, and the artifact map all live there. This file exists
only so that reading it leads you there.

## Working model

The **agent builds; the author reviews**. Review happens *after* the fact, by
reading the commit history — which is why commits must be **atomic** and their
messages must explain the *why*. Do not batch unrelated changes into one commit.

Where the framework's build loop applies (Phase 7): frame → build → verify →
record the *why* in `docs/decisions.md` → commit.
