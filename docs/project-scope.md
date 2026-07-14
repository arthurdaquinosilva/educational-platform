# Project Scope

## Problem

Learning software development from scratch is expensive. The author experienced
this firsthand — going through real financial hardship while trying to learn,
often without the money to pay for good material. The author already owns 17
self-contained course websites (zero-to-hero, one per technology), but deploying
and maintaining many separate sites across different hosts is impractical, and
their code is low-quality and unmaintainable.

## Solution

A **free, high-quality, bilingual online "book" library** of programming courses
— professionally presented content that you read to learn, with copy-paste
examples you practice on your own machine.

Think "a great technical book with runnable examples," **not** an interactive
coding platform. There is no in-browser code execution; learners copy examples
and run them locally.

Core principles:

- **Free forever**, sustained by voluntary donations.
- **Professional quality** content, at the level people would otherwise pay for.
- **Brazilian Portuguese first**, English later.
- **Zero infrastructure cost** for v1: ships as a static site on GitHub Pages.
- **Portable by design**: content is separated from presentation, so the whole
  thing can migrate to a professional platform later, once donations fund it,
  with minimal rework.

Inspired by boot.dev's quality bar, but explicitly **not** its interactivity or
gamification — this is a reading-and-practicing experience.

### Content model (key architectural decision)

- Courses authored as **structured, locale-keyed content files** (Markdown/MDX),
  organized as **course → module → lesson**, kept **separate from presentation**.
- The static site is **generated** from that content.
- The existing 17 courses are **rewritten** into this clean structure.
- Rationale: avoids recreating today's unmaintainable monolithic-HTML problem,
  and makes the future migration cheap (port the content, not bespoke HTML).

### Bilingual approach

- UI strings externalized into per-locale files (`pt-BR`, `en`).
- Content authored as **separate per-locale versions**, human-quality, keyed by
  language. Machine translation is acceptable only as a **first-pass draft the
  author polishes** — never shipped raw.
- A **language switcher** between pre-authored versions (not a live
  auto-translate button). Visitors from Brazil **default to Portuguese**.
- **v1 ships PT-BR only.** The architecture is bilingual-ready from day one;
  English is a later milestone.

> **NOTE (working model).** The **agent builds the project; the author reviews**
> every diff. Technology is therefore chosen to be **best for the product**, not
> as a learning exercise: proven libraries are preferred over hand-rolled ones.
> The author's preference for **hand-written CSS using BEM (no CSS framework)**
> is kept, because it genuinely suits a lightweight content site.

## Users

Primary and effectively only audience for v1: **complete beginners who want to
learn to program** and grow into mastery of the technologies covered by the
existing courses. Brazilian Portuguese speakers first, English speakers second.
Secondary: working programmers using the courses to deepen specific skills.

There is **no author/admin persona in the product** — the author edits content
directly in the source files. The author wants to release it, for free, and let
people learn **without ongoing 1:1 contact or support obligations**.

## Features

- Read high-quality course content in the browser.
- Copy-paste code examples (practiced locally, not run in-app).
- **Lightweight progress**, stored **device-local** (anonymous, no accounts):
  "mark lesson complete" and "continue where you left off." Does not sync across
  devices.
- **Navigation both ways**: browse and pick any course freely (a shelf of
  books), **plus** an optional guided **"Zero to Hired" learning path** that
  sequences the courses.
- **Client-side full-text search** across all courses.
- **Donations**: a simple external link, **including Pix** (Brazilian audience).

## Out of scope

- **User accounts, login, and cross-device sync** — progress is device-local
  only. Deferred until donations fund a backend.
- **In-browser code execution / sandboxes** — removed entirely; examples are
  copy-paste-and-run-locally.
- **Certificates / proof of completion.**
- **Gamification** (XP, streaks, badges, leaderboards).
- **Mobile apps** (iOS/Android) — web first; mobile can come later.
- **Live/on-the-fly machine translation button.**
- **English content at launch** (architecture ready; content comes later).
- **Community/forums, comments, Q&A, and any 1:1 support.**
- **Any paid backend or non-static hosting** for v1.

## Open questions

- Exact content schema for course → module → lesson (frontmatter fields, locale
  handling, ordering). Settled in Phase 5 / early Phase 7.
- How the 17 existing courses map onto the new structure, and whether all 17 ship
  at launch or a subset first — decided in `mvp.md` (Phase 3).
- Donation provider(s) for the link (Pix key, and any others). Needs the author's
  actual Pix key before launch.

## Future (post-donation phase)

When donations make it viable, migrate the same structured content to a
professional platform and revisit: user accounts + cross-device progress sync,
English content, certificates, and mobile apps.
