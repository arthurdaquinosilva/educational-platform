# MVP Definition

## Core problem the MVP must solve

**A complete beginner in Brazil can start learning to program — for free, in
Portuguese, from professional-quality material — and practice the examples on
their own machine.**

If a motivated beginner cannot land on the site, read a real course end to end
in PT-BR (on a phone or a laptop), and copy the examples out to run locally,
the MVP has failed, no matter what else it does.

## In the MVP

Each item below is here because **the product fails without it**.

1. **The content pipeline.** Structured, locale-keyed Markdown/MDX
   (`course → module → lesson`) generated into static pages. This is the spine
   of the whole product: without it we're back to unmaintainable hand-written
   HTML, which is the problem we're solving.
2. **One complete course: `01 — Programming Foundations` (Python), rewritten and
   authored in PT-BR.** Content _is_ the product; a platform with no course
   teaches nobody. Foundations is chosen because it is the entry point of the
   "Zero to Hired" path and speaks to exactly our primary user: the absolute
   beginner. (18 sections.)
3. **Reading navigation.** Home/course listing → course table of contents →
   lesson page, with prev/next. Without navigation, a multi-lesson course is
   unreadable.
4. **Code blocks with syntax highlighting and a copy button.** Copy-paste _is_
   the practice mechanism — it's how learners get the examples onto their own
   machine. This is the one interaction the product cannot do without.
5. **Responsive reading experience.** The primary audience is Brazilian, and
   that audience reads on phones. A desktop-only book fails most of its readers.
6. **i18n-ready architecture** (locale in the content structure and routing),
   **shipping `pt-BR` only.** The _architecture_ is MVP because retrofitting
   locales later is a painful rewrite; the _language-switcher UI_ is not (see
   Deferred — there is nothing to switch to yet).
7. **Basic SEO / discoverability.** Unique titles + meta descriptions, semantic
   HTML, `sitemap.xml`, Open Graph tags. The author explicitly wants **no
   community, no marketing, and no 1:1 contact** — which makes organic search
   the _only_ channel through which a user will ever find this. Free content
   nobody can find is not a product.
8. **Live on GitHub Pages at $0.** "Free forever" is a core principle; an
   undeployed site solves nobody's problem.
9. **Donation link (incl. Pix) in the footer.** It is the entire sustainability
   model and costs one link to add.
10. **Cookieless, free analytics.** The _only_ behavioural feedback signal the
    product has. Without it we ship blind and Phase 11 (Iterate) has nothing to
    iterate on — we'd never learn that readers bail at lesson 3. Must be free,
    cookieless, and privacy-respecting (no consent banner, no personal data).
11. **"Found an error?" link on every lesson**, pointing at a GitHub issue for
    that page. Errata are the highest-value feedback for a technical book, and
    this collects them with **zero inbox and zero reply obligation** — readers
    can even fix content via pull request. Deliberately **not** an email address:
    an inbox would create exactly the support burden the author ruled out.

## Deferred (not now, not never)

- **The other 16 courses.** Once the pipeline exists, each new course is _just
  content_ — additive, no code. Blocking launch on rewriting and translating all
  17 courses solo would delay it by many months for zero extra proof.
- **Progress tracking** (mark-complete / continue-where-you-left-off). The
  closest call on this list: it's cheap and users will want it. But a reader can
  read a book without it — the core problem is still solved. **First candidate
  to add right after the MVP ships.**
- **Client-side full-text search.** Real work (index generation) for little value
  across a _single_ course. Its value grows with the course count; ship it when
  the library is big enough to need it.

  _Design already settled, so the content schema supports it from day one:_ one
  index carrying a `course` field, so **scoping is a filter, not a separate
  index**. While reading a course, search defaults to **that course** ("find in
  this book") with a "search all courses" escape hatch; from the home page it
  searches globally. Payload matters more than features here — a full-text index
  over 17 courses is multiple MB, which is the wrong thing to push to a phone on
  a slow connection. So: a **per-course full-text index loaded lazily** when you
  enter a course, plus a **lightweight global index** (lesson titles + headings
  only) for cross-course discovery.

- **The "Zero to Hired" guided path UI.** A guided path across one course is
  meaningless. Ships when there are enough courses to sequence.
- **Language-switcher UI + geo-detection (Brazil → PT-BR).** Nothing to switch
  to until English content exists. The _architecture_ supports it from day one.
- **English content.**
- Already out of scope entirely (see `project-scope.md`): accounts/sync,
  in-browser code execution, certificates, gamification, mobile apps,
  community/forums.

## Success criteria

Concrete and checkable — these become the Phase 8 test targets.

1. A visitor on a mid-range phone reaches the live URL, opens **Fundamentos de
   Programação**, reads every lesson in PT-BR, and copies a code example with a
   single tap.
2. **Publishing a new lesson requires adding one Markdown file** (plus
   frontmatter) — **zero** HTML/CSS/component edits. This is the proof that
   content and presentation are truly separated.
3. The site **builds to static files and deploys to GitHub Pages** with **$0**
   recurring cost.
4. **Portability check:** course content is plain Markdown that could be lifted
   into a different platform without rewriting it. (This is what buys the future
   migration.)
5. Every lesson page is **indexable**: unique `<title>`, meta description,
   semantic HTML, present in `sitemap.xml`.
6. **Mobile performance:** Lighthouse performance ≥ 90 on a mobile profile.

## Assumptions & risks

- **RISK — content workload is the real bottleneck, not the code.** Rewriting and
  translating 17 courses solo dwarfs the engineering effort. _Mitigation:_ the
  pipeline makes courses purely additive, and the MVP ships one course.
- **RISK — converting the legacy HTML is messy.** The 17 existing files are large
  monolithic HTML with inline styles/scripts. Extracting clean Markdown will need
  a semi-automated conversion plus a manual polish pass, and may be lossy.
- **RISK — discovery.** With no marketing, no community, and no contact by
  deliberate choice, organic search is the _only_ acquisition channel. Weak SEO
  means the product effectively does not exist. This is why SEO is in the MVP.
- **RESOLVED — the feedback signal.** No accounts, no contact and no comments
  would have shipped the product blind, leaving Phase 11 (Iterate) with nothing
  to iterate on. Settled: **cookieless analytics** (quantitative: where readers
  arrive and where they drop off) **+ a per-lesson GitHub errata link**
  (qualitative: "this example is wrong"). A **feedback email was considered and
  rejected** — it collects only sparse, self-selected opinions, tells you nothing
  about the silent majority who quietly leave, and creates precisely the inbox
  and support obligation the author set out to avoid.
- **RISK — GitHub Pages soft limits** (~1 GB repo, ~100 GB/month bandwidth). Text
  content is small, so this is unlikely to bind soon, but heavy images/traffic
  could. Worth watching, not worth solving now.
- **ASSUMPTION — donations will eventually fund the migration.** They may never
  materialize. The platform must therefore remain viable at **$0 indefinitely**,
  not merely until donations arrive.
- **ASSUMPTION — the author sustains PT-BR authoring** over many courses. If
  authoring stalls, the library stays thin regardless of platform quality.
