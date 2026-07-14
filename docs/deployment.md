# Deployment

<!--
  Phase 10 of the framework. The goal is a REPEATABLE release, not a one-off.
  If a step only lives in your head, it isn't done. See FRAMEWORK.md → Phase 10.
-->

## Target environment

- **Host:** GitHub Pages, served from the `github-pages` environment, deployed
  by GitHub Actions (not the legacy `gh-pages` branch). $0, no server, no
  managed services — the whole point (see `AGENTS.md`).
- **Artifact:** a pure static export (`out/`), produced by `next build` with
  `output: 'export'`. There is no runtime; every page is prebuilt HTML.
- **URL:** a project site, so it lives under a subpath —
  `https://arthurdaquinosilva.github.io/educational-platform/`. The `basePath`
  that makes assets resolve there is injected at build time, not hard-coded.
- **Build runtime:** Node 22 on `ubuntu-latest` (CI only; nothing runs in prod).

## One-time repository setup

Done once by the repo owner, outside the pipeline:

1. **Settings → Pages → Build and deployment → Source: GitHub Actions.**
   This is what lets `actions/configure-pages` read the site's path/origin and
   what authorises `actions/deploy-pages`. Until it is set, the deploy job fails.

## Release process

Fully automated; a push is the whole release.

1. Push (or merge) to `main`.
2. The **build** job runs `lint → typecheck → test → build`, then uploads `out/`
   as a Pages artifact. Pull requests run this same job and **stop here** — they
   validate but never deploy.
3. The **deploy** job (main only) publishes the artifact to GitHub Pages.
4. The live URL appears on the `github-pages` environment and in the job summary.

Manual re-run: **Actions → Deploy to GitHub Pages → Run workflow**
(`workflow_dispatch`).

## Environment variables & secrets

No secrets — there is no backend, so there is nothing to sign or authenticate.
The build reads three public, non-sensitive values, all set **in the workflow**,
not committed:

| Variable                | Purpose                                  | Where it's set                         |
| ----------------------- | ---------------------------------------- | -------------------------------------- |
| `NEXT_PUBLIC_BASE_PATH` | Subpath assets resolve under on Pages    | `configure-pages` output (`base_path`) |
| `NEXT_PUBLIC_SITE_URL`  | Absolute origin for canonical/OG/sitemap | `configure-pages` output (`origin`)    |
| `NEXT_PUBLIC_INDEXABLE` | `'false'` keeps the site out of search   | Hard-coded `'false'` in `deploy.yml`   |

Locally all three are unset: `basePath` and origin fall back to `''` /
`localhost` (`config/site.ts`), and the site is `noindex` by default.

## The indexing gate

The pipeline deploys continuously, but the site ships **`noindex, nofollow`**
until the deliberate public launch — search is the only acquisition channel and
lesson slugs freeze the moment Google crawls them, so we do not let it index a
thin, unstyled work-in-progress. To launch: set `NEXT_PUBLIC_INDEXABLE: 'true'`
in `deploy.yml` and push. Confirm with the health check below.

## Health checks

After a deploy, confirm:

1. **It's up:** the lesson URL returns 200 and renders, e.g.
   `…/educational-platform/pt-br/fundamentos-de-programacao/o-que-e-um-programa/`.
2. **Assets resolved:** the page is styled and `/_next/` assets load (no 404s in
   the console) — proves `basePath` is correct.
3. **Indexing state is intended:** pre-launch, every page carries
   `<meta name="robots" content="noindex, nofollow">`; post-launch, it's gone.
   `curl -s <url> | grep -o '<meta name="robots"[^>]*>'`

## Rollback

The last good build is one revert away — Pages serves whatever the newest
successful run produced.

1. `git revert <bad-commit>` and push to `main` (fastest; keeps history honest).
2. Or **Actions → a previous green run → Re-run all jobs** to redeploy that
   artifact without touching history.

There is no data and no migration, so a rollback can never lose state — it only
swaps which static bundle is served.

## Known operational risks

- **Deploy job fails with a Pages permission/404 error** → the one-time Pages
  source setting (above) isn't set to "GitHub Actions". Fix it in Settings.
- **Live pages 404 on `/_next/` assets** → `basePath` mismatch (e.g. a repo
  rename). `configure-pages` should track it automatically; if it drifts, that
  is the first place to look.
- **Accidental indexing** → `NEXT_PUBLIC_INDEXABLE` flipped to `'true'` before
  the course is ready. Caught by health check #3.
