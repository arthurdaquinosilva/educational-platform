# Decision Log

<!--
  A running log, updated across every phase of the framework. Capture decisions
  that were non-obvious or hard to reverse — the ones future-you (or the agent)
  would otherwise have to reverse-engineer. Newest entry on top.
  Lightweight ADR style. See FRAMEWORK.md → Cross-cutting principles.
-->

## 2026-07-14 — URL structure: locale always in the path, module never in it

- **Context.** `tech-stack.md` flagged URL and locale routing as *"the most
  dangerous item on this list"*: SEO is the only acquisition channel, and
  changing URLs later forfeits accumulated ranking. It had to be settled before
  any code was written.
- **Decision.** `/{locale}/{course}/{lesson}/` — e.g.
  `/pt-br/fundamentos-de-programacao/o-que-e-um-programa/`. The **locale is
  always present**, including the default `pt-br`; `/` is a static redirect to
  it. The **module does not appear in the URL**. Slugs are Portuguese and
  unaccented. Trailing slashes on (matching `output: 'export'`).
- **Why.** Always prefixing the locale means no page is ever reachable at two
  URLs, so there is no duplicate content to penalise and no redirect to unwind
  when English ships — the alternative (bare `/` for pt-BR, `/en/` for English)
  buys prettier URLs today and pays for them with a migration later. Modules stay
  out of the path because grouping is the thing most likely to be reshuffled
  while authoring 18 chapters, and a reshuffle must never break a URL. Portuguese
  slugs because the audience searches in Portuguese.
- **Consequences.** Every URL carries a locale segment, which is slightly less
  pretty and requires a redirect at the root. Modules can be renamed or
  re-ordered freely; **renaming a lesson file is now the one destructive act**,
  so lesson slugs are frozen once published. Reversing any of this after launch
  costs search ranking.

---

## 2026-07-14 — Content schema: order from filenames, grouping from frontmatter

- **Context.** The schema is encoded in every lesson file, so changing it later
  means touching all of them. Needed: reading order, module grouping, and enough
  metadata to support the deferred search design.
- **Decision.** `content/{locale}/{course}/` holds a `course.md` (metadata +
  ordered module list) and one Markdown file per lesson. **Reading order comes
  from a numeric filename prefix**; **module membership comes from lesson
  frontmatter**; Zod validates both at build time and fails the build if a lesson
  names a module that doesn't exist. Body content is plain Markdown with
  `remark-directive` callouts.
- **Why.** Order lives in exactly one place — the filename — so it can't drift
  out of sync with a hand-maintained list, and the file tree reads in reading
  order. Grouping lives in frontmatter because it's metadata, not sequence. A
  malformed lesson failing the *build* (rather than shipping a broken page) is
  the whole point of validating with Zod.
- **Consequences.** Re-ordering lessons means renaming files — which changes
  slugs, which breaks URLs (see above), so the numeric prefix is deliberately
  **not** part of the slug. Inserting a lesson between two others needs either a
  gap-numbering convention or a renumber of the tail (renumbering is safe: it
  touches prefixes, not slugs).

---

## 2026-07-14 — Feedback signal: analytics + GitHub errata, not an email

- **Context.** The product deliberately has no accounts, no comments, no
  community and no 1:1 support. That left it with **zero feedback signal** — and
  the framework's Phase 11 (Iterate) has nothing to iterate on without one. The
  author proposed publishing a feedback email address.
- **Decision.** Ship **cookieless, free, privacy-respecting analytics** (page
  views per lesson, drop-off) **plus a per-lesson "found an error?" GitHub issue
  link**. **No feedback email.**
- **Why.** Email and analytics measure different things, and email is the weaker
  instrument: it yields sparse, self-selected opinions from the delighted and the
  furious, and tells you nothing about the silent majority who quietly abandon a
  course at lesson 3. Worse, an inbox recreates exactly the **support obligation
  the author explicitly set out to avoid** ("let people enjoy it without getting
  in touch with me"). The GitHub errata link captures the highest-value feedback
  for a technical book (wrong code examples) with **zero inbox and zero reply
  obligation**, and lets readers fix content via pull request — at $0.
- **Consequences.** We get behavioural data (quantitative) and errata
  (qualitative) without a support burden. Adds one third-party script (must stay
  cookieless so no consent banner is needed, and must remain free). Feedback is
  limited to readers willing to use GitHub — an acceptable filter for a
  programming-course audience. Revisit if donations ever fund a real backend.

---

## 2026-07-14 — Search: one index with a course field, scoped by default

- **Context.** Search is deferred out of the MVP, but the **content schema must
  support it now** or we'd pay a migration later. Question raised: should search
  be scoped per course or global?
- **Decision.** **One index carrying a `course` field**, so scoping is a *filter*
  rather than a separate index. Search **defaults to the current course** while
  reading ("find in this book"), with a "search all courses" escape hatch; from
  the home page it searches globally. Physically: a **per-course full-text index
  loaded lazily** on entering a course, plus a **lightweight global index**
  (titles + headings only).
- **Why.** Scoping is free once the index carries course metadata, so there is no
  reason to choose one behaviour. The split into per-course and global indexes is
  driven by **payload, not features**: a full-text index across 17 large courses
  is multiple MB, and the primary audience reads on phones on Brazilian mobile
  connections. Shipping megabytes of index to read a book is the wrong trade.
- **Consequences.** The content schema must carry course/lesson/heading metadata
  from day one. Cross-course search finds titles and headings but not arbitrary
  body text — an accepted limitation, revisitable if the library grows and users
  need deeper global search.

---

<!-- Copy the block above for each new decision. Example:

## 2026-05-14 — Use SQLite for the MVP data store

- **Context.** MVP is single-user and runs locally; no concurrent writers.
- **Decision.** SQLite, with a thin data-access layer to allow swapping later.
- **Why.** Zero infra, zero ops. Postgres was the alternative but adds a service
  to run for no MVP benefit. The data-access layer keeps the door open.
- **Consequences.** Trivial local setup; will need a migration path if we add
  multi-user sync (a known Phase 11 candidate).

-->
