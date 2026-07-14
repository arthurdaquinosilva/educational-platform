/**
 * The one place a human-readable string becomes a URL segment. Portuguese is
 * full of accents and URLs must be unaccented and stable (docs/decisions.md),
 * so this is deliberately shared: heading anchors, and later the D.1 converter
 * and any lesson-slug tooling, must all produce byte-identical slugs, or the
 * same heading would anchor at two different fragments.
 *
 * The output always satisfies SLUG_PATTERN in schema.ts.
 */
export function slugify(text: string): string {
  return text
    .normalize('NFD') // split accented letters into base + combining mark…
    .replace(/[̀-ͯ]/g, '') // …then drop the marks: ção → cao
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '');
}
