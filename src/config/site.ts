/**
 * Single source of truth for the deployment-dependent values. Everything that
 * changes when the site moves (custom domain, different repo) lives here, so
 * moving it is a one-file change.
 */
export const site = {
  name: 'Curso de Programação',
  /** Absolute origin, used for canonical URLs, Open Graph and sitemap.xml. */
  url: process.env.NEXT_PUBLIC_SITE_URL ?? 'http://localhost:3000',
  /** Empty locally; set to '/<repo>' when served from a GitHub Pages subpath. */
  basePath: process.env.NEXT_PUBLIC_BASE_PATH ?? '',
  /** Where the "found an error?" links file their issues. */
  repo: 'arthurdaquinosilva/educational-platform',
  /**
   * Off by default: the pipeline deploys continuously, but the site stays
   * `noindex` until the first course is actually ready to launch. Search is the
   * only acquisition channel and lesson slugs freeze the moment Google crawls
   * them, so we do not let it index a thin, unstyled work-in-progress. Flip to
   * `true` (via NEXT_PUBLIC_INDEXABLE) only at the deliberate public launch.
   */
  indexable: process.env.NEXT_PUBLIC_INDEXABLE === 'true',
} as const;

/** Absolute URL for a site-root-relative path (`/pt-br/...`). */
export function absoluteUrl(path: string): string {
  return `${site.url}${site.basePath}${path}`;
}
