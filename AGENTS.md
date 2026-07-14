# AGENTS.md

Read this first, on any task.

## Project overview

A **free, bilingual, static "online book"** of programming courses — content you
*read* to learn, with copy-paste examples you run on your own machine. Not an
interactive or gamified platform: no accounts, no in-browser code execution, no
certificates. The primary audience is **Brazilian beginners reading on phones**,
so it ships in pt-BR first and the payload budget is a feature, not a nicety.

It is free forever, funded by donations, and hosted on GitHub Pages at **$0**.
Two constraints follow from that and drive most decisions:

- **The site must stay viable at $0 indefinitely.** No paid service, ever.
- **SEO is the only acquisition channel** (no marketing, no community, no
  contact, by deliberate choice). Churning URLs is the one unforgivable mistake.

## Run & test

```bash
npm install         # install
npm run dev         # run locally (http://localhost:3000)
npm run build       # static export → out/
npm run start       # serve the built output
npm run test        # vitest
npm run lint        # eslint
npm run typecheck   # tsc --noEmit
npm run format      # prettier --write .
```

## Conventions

- **TypeScript, strict.** `@/*` maps to `src/*`.
- **Content is data, code is presentation.** Publishing a lesson must mean
  adding *one Markdown file* and touching **zero** components. If a content
  change needs a code change, the abstraction is wrong.
- **CSS is hand-written: BEM + custom properties**, global stylesheets. No CSS
  framework, no CSS Modules (they would fight BEM's manual scoping), no
  CSS-in-JS.
- **Zero client-side JavaScript unless a feature genuinely needs it.** Syntax
  highlighting happens at build time. The copy-to-clipboard button is the only
  client component the MVP is allowed.
- **Commits are atomic** — one task, one focused diff, one commit. The commit
  history is the author's review surface, so the message must explain the *why*,
  not restate the diff. **No `Co-Authored-By` trailers.**
- Comments explain *why*, never *what*.

## Guardrails

Do not, without asking:

- **Change a published URL or lesson slug.** Search ranking is the whole
  acquisition strategy; slugs are frozen once live. See `docs/decisions.md`.
- **Change the content schema.** It is encoded in every lesson file.
- **Add a dependency** that isn't already in `docs/tech-stack.md` — the stack is
  deliberately unpadded — or **anything with a recurring cost**, which would
  break the $0 constraint outright.
- Add anything that ships client JS to the reading path, or sets a cookie
  (cookies would force a consent banner).
- Commit secrets. There is no backend, so there should be nothing to commit.

## Artifact map

- Scope & requirements — `docs/project-scope.md`
- MVP definition — `docs/mvp.md`
- Tech stack — `docs/tech-stack.md`
- Implementation plan — `docs/implementation-plan.md`
- Test plan — `docs/test-plan.md`
- Deployment — `docs/deployment.md`
- **Decision log — `docs/decisions.md`** (read before touching URLs or the schema)
- Legacy course sites (migration source, not shipped) — `websites/`
