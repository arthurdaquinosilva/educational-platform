# Implementation Plan

<!--
  Phase 5 of the framework, kept current through Phase 7 (the build loop).
  Tasks are small enough to review in a single diff. Ordered so something runs
  end-to-end early. Check tasks off as they land. See FRAMEWORK.md → Phase 5 & 7.
-->

## Legend

- `[ ]` not started · `[~]` in progress · `[x]` done
- **Depends on:** which task(s) must land first.
- **Done when:** the verifiable check that closes the task.

---

## The two decisions this plan locks down first

Both were flagged in `tech-stack.md` as hard to reverse. They are settled here,
**before any code**, and recorded in `decisions.md`.

### URL structure

```
/                                     → static redirect to /pt-br/
/pt-br/                               → home: the shelf of courses
/pt-br/{course}/                      → course table of contents
/pt-br/{course}/{lesson}/             → a lesson (the reading page)
```

- **The locale is always in the path**, including the default one. No content is
  ever served from two URLs, so there is no duplicate-content penalty and no
  redirect to unwind when English ships.
- **The module is NOT in the URL.** Modules group lessons in the table of
  contents, and grouping is the thing most likely to be reshuffled while
  authoring. Keeping it out of the path means re-organising modules never breaks
  a URL — and URLs are the one thing we cannot afford to break, because organic
  search is our only acquisition channel.
- **Slugs are Portuguese, unaccented, and stable** (`o-que-e-um-programa`). They
  are the SEO surface for a Portuguese-speaking audience.
- Trailing slashes on, matching `output: 'export'`, which emits `.../index.html`.

### Content schema (`course → module → lesson`)

```
content/
  pt-br/
    fundamentos-de-programacao/
      course.md                       # course metadata + module list + intro
      01-o-que-e-um-programa.md       # a lesson; numeric prefix = reading order
      02-seus-primeiros-programas.md
```

`course.md` frontmatter declares the ordered modules; each lesson names the
module it belongs to, and Zod fails the build if it names one that doesn't
exist. The numeric filename prefix drives reading order (and prev/next), so
ordering is never duplicated in two places. Body content is plain Markdown;
callouts are `remark-directive` (`:::nota`, `:::aviso`, `:::solucao`).

---

## Phase A: Walking skeleton — one real lesson, end to end

The goal is a deployable site rendering one real lesson from one real Markdown
file as early as possible. Everything after that is widening, not proving.

### A.1 — Scaffold the Next.js app

- [x] **Task.** Next.js (App Router, TypeScript, `output: 'export'`), ESLint +
      Prettier, Vitest, `.gitignore`, `npm run dev` serving a placeholder page.
      Fill in `AGENTS.md` and replace the framework-guide `CLAUDE.md` with
      project context.
- **Depends on:** none
- **Done when:** `npm run dev` serves a page; `npm run lint`, `npm run test` and
  `npm run build` all pass on a clean checkout.

### A.2 — Content schema + loader

- [x] **Task.** Zod schemas for course/module/lesson frontmatter; a loader that
      reads `content/`, validates it, derives slugs and reading order, and throws a
      readable error on malformed content. Unit-tested against fixtures.
- **Depends on:** A.1
- **Done when:** `npm run test` proves a good course parses and each malformed
  case (missing title, unknown module, duplicate order) fails loudly.

### A.3 — Markdown → HTML pipeline

- [x] **Task.** unified/remark/rehype: GFM, `remark-directive` callouts, heading
      slugs + anchors, and Shiki syntax highlighting at build time (zero client JS).
- **Depends on:** A.2
- **Done when:** a fixture lesson with a callout and a Python code block renders
  to highlighted, anchored HTML in a unit test.

### A.4 — Routes and the reading page

- [x] **Task.** `/[locale]/[course]/[lesson]` plus `generateStaticParams`;
      minimal lesson layout with prev/next. Static, unstyled but correct.
- **Depends on:** A.3
- **Done when:** `npm run build` emits static HTML for a real lesson and
  prev/next walks the whole course.

### A.5 — Deploy to GitHub Pages

- [x] **Task.** GitHub Actions workflow: install → lint → test → build → deploy.
      `basePath` handled so assets resolve on Pages. Draft `deployment.md`.
- **Depends on:** A.4
- **Done when:** the walking skeleton is reachable at its public URL and a push
  to `main` redeploys it with no manual steps.
- **Status.** Live and verified. Run 29377135362 deployed green; the lesson URL
  returns 200 with assets resolving under `/educational-platform/`, and every
  page carries `noindex` until launch. Push-to-`main` auto-deploy confirmed.

---

## Phase B: The reading experience

### B.1 — Design tokens + base stylesheet

- [ ] **Task.** CSS custom properties (colour, type scale, spacing), a
      readable-measure prose layout, dark mode via `prefers-color-scheme`. BEM,
      hand-written, global stylesheets.
- **Depends on:** A.4
- **Done when:** a lesson is comfortable to read on a 360px phone and a desktop.

### B.2 — Site chrome: header, footer, course ToC

- [ ] **Task.** Header, footer (with the donation link), course table of contents
      grouped by module, and an in-page "on this page" list from the lesson's `h2`s.
- **Depends on:** B.1
- **Done when:** you can navigate home → course → lesson → next lesson entirely
  by clicking, on mobile and desktop.

### B.3 — Code blocks: copy button

- [ ] **Task.** A copy-to-clipboard button on every code block. The one piece of
      client JS the MVP genuinely needs — progressively enhanced, tiny.
- **Depends on:** B.1
- **Done when:** one tap copies the exact source (no line numbers, no prompts)
  on a phone; the page still renders and reads fine with JS disabled.

### B.4 — Home page (the shelf)

- [ ] **Task.** Course listing with the "Zero to Hired" ordering visible as
      suggested reading order — a list, not a guided-path UI (that's deferred).
- **Depends on:** B.2
- **Done when:** the home page lists the shipped course and links into it.

---

## Phase C: Make it findable and sustainable

### C.1 — SEO

- [ ] **Task.** Per-page `<title>`/meta description from frontmatter, Open Graph,
      canonical URLs, `hreflang` (ready for English), `sitemap.xml`, `robots.txt`,
      and JSON-LD `Course` structured data.
- **Depends on:** B.4
- **Done when:** every emitted page has a unique title and description and
  appears in `sitemap.xml`; a build-time check enforces it.

### C.2 — Analytics + errata link

- [ ] **Task.** Cloudflare Web Analytics (cookieless, no consent banner) and a
      per-lesson "encontrou um erro?" link that opens a pre-filled GitHub issue for
      that exact lesson.
- **Depends on:** B.2
- **Done when:** the errata link lands on a GitHub issue naming the lesson; the
  analytics beacon is present and sets no cookies.

### C.3 — Donation link

- [ ] **Task.** Footer donation link, including Pix.
- **Depends on:** B.2
- **Done when:** it's live. **BLOCKED on the author's Pix key** — until then it
  ships behind a config value with a placeholder, so nothing else waits on it.

---

## Phase D: The content migration

### D.1 — Legacy HTML → Markdown converter

- [ ] **Task.** A one-shot script (`scripts/`, not shipped) converting
      `websites/foundations_mastery.html` into lesson Markdown: headings, prose,
      lists, blockquotes → callouts, `<details>Solution` → `:::solucao`, and
      Pygments-highlighted `<pre>` back to plain fenced code with an inferred
      language.
- **Depends on:** A.2
- **Done when:** all 18 chapters emit schema-valid Markdown that the loader
  accepts, with no HTML tags left in the body.

### D.2 — Translate & polish, chapter by chapter

- [ ] **Task.** Translate each chapter to pt-BR and fix what the converter got
      wrong (fence languages, ASCII diagrams, exercise formatting). **One chapter,
      one commit** — this is content work, and it is the real bottleneck.
- **Depends on:** D.1, B.3
- **Done when:** _Fundamentos de Programação_ reads end to end in Portuguese.

---

## Phase E: Verify & harden

### E.1 — Test plan + suite

- [ ] **Task.** `test-plan.md`; Vitest for the schema/loader/pipeline; one
      Playwright pass over the critical flow (home → course → lesson → copy code).
- **Depends on:** D.2
- **Done when:** every MVP success criterion has a test or a documented reason
  it has none; the suite passes in CI.

### E.2 — Pre-launch review

- [ ] **Task.** Framework Phase 9: security, edge cases, error handling, docs.
      Lighthouse mobile ≥ 90. README that lets a stranger clone and run it.
- **Depends on:** E.1
- **Done when:** no blockers outstanding; Lighthouse mobile performance ≥ 90.

---

## Deviations from plan

<!-- When the build reveals the plan was wrong, note what changed and why here,
     and split or re-order tasks above. Cross-reference decisions.md. -->

- **2026-07-14 — the legacy HTML is machine-generated _from_ Markdown.** Its
  blockquotes, `<details>` solutions, slugged headings and Pygments blocks are
  all artefacts of a Markdown→HTML pipeline. The migration (D.1) is therefore a
  mechanical reversal, not the lossy scrape `mvp.md` feared — the risk moves
  almost entirely to translation (D.2). Fence languages are the one real loss:
  Pygments highlighted everything as Python, including ASCII diagrams and shell
  output, so the converter has to infer the language and D.2 must verify it.

- **2026-07-14 (A.3) — dropped `rehype-slug` for a custom heading-slug plugin.**
  Its slugger keeps accents, so a Portuguese heading would anchor at
  `#o-que-é-um-programa` — an accented fragment, fragile when shared and
  inconsistent with the site's unaccented slug rule. Replaced by a one-file
  plugin over a shared `slugify` (`src/lib/content/slug.ts`) that strips
  diacritics, so headings, the D.1 converter and any lesson-slug tooling all
  emit byte-identical slugs.
