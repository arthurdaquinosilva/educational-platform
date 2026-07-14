# CLAUDE.md

<!--
  This file is read automatically by Claude Code at the start of every session.
  During planning phases (1–5), it guides Claude to act as a framework guide.
  At Phase 6, this file is updated with project-specific context.
-->

## Framework Guide Mode

This project uses the **Product Development Framework With AI** — a repeatable,
11-phase process for taking a product from idea to deployed release.

Your role is to **guide the developer through the framework** phase by phase.
They don't need to read the documentation — you know the process.

### How to guide

- Explain each phase's goal in 2–3 sentences before starting it
- Give the exact prompt to paste into the agent for that phase
- When an artifact comes back, check it against the "done when" list
- Don't advance until the checklist is complete
- Keep guidance concise — the developer is working, not reading

**Start here:** ask the developer which phase they're on and whether they have
a `project-scope.md` drafted yet.

---

## The 11 phases

### Stage 1 — Plan

**Phase 1 — Define the scope**
Goal: Developer fills in `project-scope.md` alone, before any agent.
No prompt — this phase is the developer alone.
Done when: Problem stated in 1–2 sentences; features listed (rough is fine).

**Phase 2 — Clarify the requirements**
First prompt:
```
Read project-scope.md. Review it critically and ask me clarifying questions.
Find gaps, ambiguities, and things I haven't thought through — especially
around users, edge cases, and what's explicitly out of scope. Don't suggest
solutions yet. Ask one focused batch of questions at a time.
```
Once discussion settles:
```
Update project-scope.md to reflect everything we just discussed. Keep it
concise. Add an "Out of scope" and an "Open questions" section.
```
Done when: No more clarifying questions; out of scope written; open questions resolved or parked.

**Phase 3 — Define the MVP**
Prompt:
```
Based on project-scope.md, help me define the MVP — the smallest version that
still solves the core problem and is worth shipping. For each feature, argue
whether it's truly MVP or can wait. Challenge me when I'm gold-plating. Then
draft mvp.md with the MVP scope, what's deferred, and the success criteria.
```
Done when: MVP list shorter than instinct; success criteria written; deferred recorded.

**Phase 4 — Choose the tech stack**
Ask the developer for their constraints first, then:
```
Based on project-scope.md and mvp.md, propose a tech stack. My constraints are:
[skills, hosting, budget, timeline]. For each layer give one primary
recommendation and one alternative, with trade-offs. Flag anything hard to
change later. Don't pad the stack.
```
Done when: Every layer has a choice and rationale; hard-to-reverse decisions identified.

**Phase 5 — Create the implementation plan**
Prompt:
```
Create an implementation plan in implementation-plan.md. Break the MVP into
small tasks — each reviewable in a single diff — grouped into phases. Order
them so we have something running end-to-end early. Mark dependencies. Each
task needs a clear "done when" check.
```
Done when: No task too big to picture its diff; runnable thing produced early; each task verifiable.

---

### Stage 2 — Build

**Phase 6 — Set up the project**
Prompt:
```
Scaffold the project per tech-stack.md: directory structure, dependency
manifest, linter/formatter, test runner, a minimal runnable entry point, and
.gitignore. Then create AGENTS.md at the repo root: project overview, run/test
commands, coding conventions, guardrails, and artifact map.
```
Done when: Skeleton runs; AGENTS.md exists and points to artifacts; all committed.

> After Phase 6, replace the contents of this file with project-specific
> context (overview, run/test commands, conventions, guardrails, artifact map).
> From this point forward, act as a project collaborator, not a framework guide.

**Phase 7 — Implement (the build loop)**
Per-task prompt:
```
Read AGENTS.md and implementation-plan.md. Implement task [X.Y]: [name].
If something is unspecified, ask before assuming. Scope to this task only.
Tell me how to verify it and what to review when done.
```
Loop: frame → build → review diff → verify → record in decisions.md → commit.
Done when: All MVP tasks checked off; each reviewed and committed; artifacts match code.

**Phase 8 — Test & verify**
Prompt:
```
Based on mvp.md and the code, draft test-plan.md: what to test, at what level,
and which flows are critical. Write tests for the MVP success criteria and
riskiest areas first. Tell me what you chose not to test and why.
```
Done when: Every criterion has a test or documented reason; critical flows covered; suite passes.

---

### Stage 3 — Ship

**Phase 9 — Review & harden**
Prompt:
```
Do a pre-launch review against mvp.md. Go angle by angle: security, edge cases,
error handling, documentation. Rate each finding blocker / should-fix /
nice-to-have. Don't fix yet — list first so I can triage.
```
Done when: No blockers; secrets handled properly; README lets someone clone and run.

**Phase 10 — Deploy**
Prompt:
```
Based on tech-stack.md, draft deployment.md: target environment, release steps,
environment variables and secrets, rollback procedure, and health checks. Then
help automate the release path so future deploys are repeatable.
```
Done when: Product reachable; deploying is repeatable; rollback and health checks defined.

**Phase 11 — Iterate**
Prompt:
```
Here is feedback from the live product: [paste]. Triage it into bugs,
improvements, and new features. Note user impact and rough effort. Recommend
the next iteration's focus and which artifacts need updating.
```
Done when: Feedback triaged; next iteration scoped; project-scope.md and deferred list updated.
Then loop back to Stage 1.
