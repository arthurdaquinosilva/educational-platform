# Tech Stack

## Constraints

- **$0 budget, forever.** No paid hosting, no backend, no paid SaaS. Donations
  may never materialise, so the stack must stay viable at zero cost indefinitely.
- **Static hosting only** (GitHub Pages). No server, no database, no runtime
  secrets.
- **Content portability is the top architectural priority.** The content must be
  liftable into a professional platform later with minimal rework — that future
  migration is the entire reason Next.js was chosen over a simpler generator.
- **Performance budget matters.** Primary audience is Brazilian, reading on
  phones, sometimes on slow mobile connections. Payload is a feature.
- **SEO is the only acquisition channel.** No marketing, no community, no
  contact by deliberate choice — organic search is the sole way anyone finds this.
- **No CSS framework.** Author preference: hand-written CSS with BEM.
- **Must be i18n-ready** (pt-BR now, en later) without a later rewrite.
- **Solo maintainer.** The agent writes the code, the author reviews. Favour
  proven, boring libraries over clever or hand-rolled ones; fewer moving parts.

## Stack

| Layer                    | Choice                                                                                                      | Why                                                                                                                                                                     | Alternative considered                                                                                                                                                                            |
| ------------------------ | ----------------------------------------------------------------------------------------------------------- | ----------------------------------------------------------------------------------------------------------------------------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Language                 | **TypeScript**                                                                                              | Type-safety across the content schema and components; standard for Next.js.                                                                                             | Plain JS — rejected, no schema safety.                                                                                                                                                            |
| Framework                | **Next.js (App Router), static export** (`output: 'export'`)                                                | Ships pure static files now, and the same codebase can grow a backend later **without a rewrite** — the migration story that justified it.                              | **Astro** — genuinely a better fit for a content site, but a weaker in-place upgrade path to a real platform.                                                                                     |
| Content format           | **Markdown (`.md`) + YAML frontmatter**, callouts via **remark-directive** (`:::note`)                      | Maximum portability: plain files any platform can read. Directives keep rich callouts **without coupling content to React**.                                            | **MDX** — rejected _for now_: JSX in content ties it to React and undercuts the portability that is this project's whole point. `.md → .mdx` is an easy upgrade later if we ever need components. |
| Content pipeline         | **gray-matter** (frontmatter) + **Zod** (schema validation) + **unified/remark/rehype** → rendered at build | Boring, proven, zero lock-in. Zod enforces the `course → module → lesson` schema at build time, so a malformed lesson fails the build instead of shipping.              | **Velite / Contentlayer** — an extra abstraction layer; Contentlayer is effectively unmaintained.                                                                                                 |
| Data store               | **None** — content is files in git                                                                          | Static site; git _is_ the CMS. Deferred progress tracking will use `localStorage`.                                                                                      | Headless CMS — rejected: cost, lock-in, and it breaks portability.                                                                                                                                |
| Styling                  | **Hand-written CSS: BEM + CSS custom properties** (design tokens), global stylesheets                       | Author preference _and_ genuinely right for a light reading site: zero dependencies, zero runtime, full control of the payload.                                         | Tailwind — rejected (framework unwanted). **CSS Modules — rejected**: they auto-scope class names, which double-scopes and mangles BEM's deliberate manual naming.                                |
| Syntax highlighting      | **Shiki** (via `rehype-pretty-code`), at **build time**                                                     | Produces pre-highlighted HTML with **zero client-side JavaScript** — directly protects the mobile performance budget.                                                   | Prism / highlight.js in the browser — rejected: ships JS and slows first paint for no benefit.                                                                                                    |
| i18n                     | **Native App Router `[locale]` segment + typed per-locale string dictionaries**                             | The site has few UI strings; a typed dictionary is data, not a hand-rolled library. Keeps moving parts down.                                                            | **next-intl** — the alternative if we later need pluralisation/date formatting.                                                                                                                   |
| Analytics                | **Cloudflare Web Analytics** (free, cookieless)                                                             | Free forever, no cookies → **no consent banner**, no personal data. The only behavioural signal we have.                                                                | **GoatCounter** (free, open-source) — equally viable fallback. Plausible/Fathom rejected: paid.                                                                                                   |
| Search _(deferred)_      | **Pagefind**                                                                                                | Purpose-built for static sites: builds a **chunked, lazily-loaded index** so we never ship megabytes of index to a phone. Matches the scoping design in `decisions.md`. | FlexSearch / MiniSearch — rejected: we'd have to hand-build the chunking Pagefind gives us.                                                                                                       |
| Hosting / infra          | **GitHub Pages**                                                                                            | $0 forever, static, and the content repo _is_ the deploy source.                                                                                                        | Cloudflare Pages / Netlify — viable free alternatives; kept as escape hatches if Pages' limits bind.                                                                                              |
| Tooling (lint, test, CI) | **ESLint + Prettier**, **Vitest** (unit), **Playwright** (e2e), **GitHub Actions** (CI/CD)                  | Proven and free. Vitest covers schema/util logic; Playwright covers the critical reading flow; Actions makes deploys repeatable rather than improvised.                 | Jest — rejected (slower, more ESM/TS config). Biome — faster, but a smaller ecosystem.                                                                                                            |

## Hard-to-reverse decisions

- **URL structure and locale routing** (e.g. `/{locale}/{course}/{lesson}`).
  **The most dangerous item on this list.** SEO is our _only_ acquisition
  channel, and changing URLs later forfeits accumulated search ranking. Get this
  right before launch, not after.
- **Content format (`.md` + directives, not MDX).** The content _is_ the asset;
  reformatting hundreds of lessons later is expensive. We deliberately chose the
  most portable option, and the `.md → .mdx` upgrade path stays open (a superset).
- **The content schema** (`course → module → lesson`, frontmatter fields). Every
  lesson file encodes it. Zod validation makes drift loud, but a schema change
  still means touching every file. Design it carefully in Phase 5.
- **Next.js + App Router** as the app shell. Reversible in principle — the
  content is plain Markdown and survives any framework change — but it would mean
  rebuilding the presentation layer.
- **Static export.** Rules out server-only features (middleware, SSR, image
  optimisation, server actions). Accepted deliberately: it is what makes $0
  hosting possible, and it is exactly what we turn off when we migrate.

## Deliberately kept out

- **CSS framework / UI component library** (Tailwind, MUI…) — author preference,
  and a reading site does not need one.
- **CSS Modules** — would fight BEM's manual scoping.
- **Database / headless CMS** — git is the CMS; a DB would break the $0 constraint.
- **Content layer abstraction** (Contentlayer, Velite) — an extra dependency
  between us and plain files, for a schema Zod validates in a few lines.
- **State management library** (Redux, Zustand) — there is no global client state
  to manage. Deferred progress tracking needs `localStorage`, not a store.
- **Cookie-based analytics** — would require a consent banner and process personal
  data, for signal we don't need.
- **Feedback email** — see `decisions.md`: it recreates the support burden the
  author explicitly ruled out.
- **In-browser code execution / sandboxes** — out of scope entirely; this is a
  book, and the examples are meant to be run on the reader's own machine.
