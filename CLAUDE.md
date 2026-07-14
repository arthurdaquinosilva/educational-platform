# CLAUDE.md

The project scaffold now exists, so the framework-guide instructions that lived
here have done their job (see the framework's Phase 6: _"replace the contents of
this file with project-specific context"_).

**See [AGENTS.md](./AGENTS.md)** — project overview, run/test commands,
conventions, guardrails, and the artifact map all live there. This file exists
only so that reading it leads you there.

## Working model

The **agent builds; the author reviews**. Review happens _after_ the fact, by
reading the commit history — which is why commits must be **atomic** and their
messages must explain the _why_. Do not batch unrelated changes into one commit.

Where the framework's build loop applies (Phase 7): frame → build → verify →
record the _why_ in `docs/decisions.md` → commit.
