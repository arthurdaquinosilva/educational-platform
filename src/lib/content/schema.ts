import { z } from 'zod';

/**
 * Frontmatter is the contract every lesson file encodes, so it is deliberately
 * small: anything derivable (reading order, slug) is derived rather than
 * declared, because two sources of truth drift. See docs/decisions.md.
 */

/**
 * Slugs are URL segments and URLs are frozen once published, so the shape is
 * enforced at build time rather than trusted: lowercase, unaccented, single
 * hyphens. A stray accent or capital would otherwise ship a URL we can never
 * take back.
 */
export const SLUG_PATTERN = /^[a-z0-9]+(?:-[a-z0-9]+)*$/;

export const slugSchema = z
  .string()
  .regex(
    SLUG_PATTERN,
    'must be lowercase and unaccented, with words separated by single hyphens',
  );

const nonEmpty = z.string().trim().min(1);

/** A grouping of lessons in the table of contents. Never appears in a URL. */
export const moduleSchema = z.object({
  id: slugSchema,
  title: nonEmpty,
});

export const courseFrontmatterSchema = z.object({
  title: nonEmpty,
  /** Doubles as the meta description; SEO is the only acquisition channel. */
  description: nonEmpty,
  /**
   * Position on the home-page shelf — the "Zero to Hired" reading order.
   * Lessons take their order from a filename prefix, but a course's directory
   * name *is* its URL, so a course cannot carry one and declares it instead.
   */
  order: z.number().int().nonnegative(),
  modules: z.array(moduleSchema).min(1),
});

export const lessonFrontmatterSchema = z.object({
  title: nonEmpty,
  description: nonEmpty,
  /** Must match a module `id` declared by the course, or the build fails. */
  module: slugSchema,
});

export type Module = z.infer<typeof moduleSchema>;
export type CourseFrontmatter = z.infer<typeof courseFrontmatterSchema>;
export type LessonFrontmatter = z.infer<typeof lessonFrontmatterSchema>;

export interface Lesson extends LessonFrontmatter {
  /** URL segment, from the filename with its ordering prefix stripped. */
  slug: string;
  /** Reading order within the course, from the numeric filename prefix. */
  order: number;
  /** Raw Markdown; the pipeline (A.3) turns it into HTML. */
  body: string;
}

export interface Course extends CourseFrontmatter {
  /** URL segment, from the directory name. */
  slug: string;
  locale: string;
  /** Course intro, raw Markdown. */
  body: string;
  /** Every lesson, in reading order. */
  lessons: Lesson[];
}
