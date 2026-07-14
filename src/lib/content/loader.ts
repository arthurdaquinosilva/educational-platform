import { existsSync, readFileSync, readdirSync } from 'node:fs';
import path from 'node:path';
import matter from 'gray-matter';
import { z } from 'zod';
import type { Locale } from '@/lib/i18n';
import { ContentError } from './errors';
import {
  type Course,
  type Lesson,
  type Module,
  courseFrontmatterSchema,
  lessonFrontmatterSchema,
  slugSchema,
} from './schema';

/**
 * Reads and validates `content/`. Runs at build time only (it touches the
 * filesystem), which is what lets a malformed lesson break the build instead
 * of shipping a broken page.
 */

export const CONTENT_ROOT = path.join(process.cwd(), 'content');

const COURSE_FILE = 'course.md';

/**
 * `01-o-que-e-um-programa.md` → order 1, slug `o-que-e-um-programa`. The prefix
 * is *not* part of the slug: re-ordering lessons must never change a URL.
 */
const LESSON_FILE = /^(\d+)-(.+)\.md$/;

function parse<T>(schema: z.ZodType<T>, data: unknown, file: string): T {
  const result = schema.safeParse(data);
  if (!result.success) {
    const problems = result.error.issues
      .map((issue) => {
        const field = issue.path.join('.');
        return field ? `${field}: ${issue.message}` : issue.message;
      })
      .join('\n  ');
    throw new ContentError(`invalid frontmatter\n  ${problems}`, file);
  }
  return result.data;
}

function readLesson(file: string, dir: string, courseDir: string): Lesson {
  const relative = path.join(courseDir, file);
  const match = LESSON_FILE.exec(file);
  const prefix = match?.[1];
  const slug = match?.[2];
  if (prefix === undefined || slug === undefined) {
    throw new ContentError(
      'filename must be <order>-<slug>.md, e.g. 01-o-que-e-um-programa.md',
      relative,
    );
  }
  // The slug half of the filename is a URL segment, so it answers to the same
  // rule as every other slug.
  const slugCheck = slugSchema.safeParse(slug);
  if (!slugCheck.success) {
    throw new ContentError(
      `filename slug "${slug}" ${slugCheck.error.issues[0]?.message}`,
      relative,
    );
  }

  const { data, content } = matter(readFileSync(path.join(dir, file), 'utf8'));
  const frontmatter = parse(lessonFrontmatterSchema, data, relative);

  return { ...frontmatter, slug, order: Number(prefix), body: content.trim() };
}

/** Loads one course, or throws a ContentError naming the file at fault. */
export function loadCourse(
  locale: Locale,
  courseSlug: string,
  root: string = CONTENT_ROOT,
): Course {
  const dir = path.join(root, locale, courseSlug);
  const courseDir = path.join(locale, courseSlug);
  const coursePath = path.join(courseDir, COURSE_FILE);

  if (!existsSync(path.join(dir, COURSE_FILE))) {
    throw new ContentError('course is missing its course.md', coursePath);
  }

  const { data, content } = matter(readFileSync(path.join(dir, COURSE_FILE), 'utf8'));
  const frontmatter = parse(courseFrontmatterSchema, data, coursePath);

  const moduleIds = new Set<string>();
  for (const declared of frontmatter.modules) {
    if (moduleIds.has(declared.id)) {
      throw new ContentError(`duplicate module id "${declared.id}"`, coursePath);
    }
    moduleIds.add(declared.id);
  }

  const lessons = readdirSync(dir)
    .filter((file) => file.endsWith('.md') && file !== COURSE_FILE)
    .map((file) => readLesson(file, dir, courseDir))
    .sort((a, b) => a.order - b.order);

  if (lessons.length === 0) {
    throw new ContentError('course has no lessons', courseDir);
  }

  // Order and slug both have to be unique, and for different reasons: a
  // duplicate order makes reading order (and so prev/next) ambiguous, while a
  // duplicate slug makes two lessons fight over one URL.
  const seenOrder = new Map<number, string>();
  const seenSlug = new Set<string>();
  for (const lesson of lessons) {
    const clash = seenOrder.get(lesson.order);
    if (clash !== undefined) {
      throw new ContentError(
        `duplicate reading order ${lesson.order}, shared with "${clash}"`,
        path.join(courseDir, `${lesson.slug}.md`),
      );
    }
    seenOrder.set(lesson.order, lesson.slug);

    if (seenSlug.has(lesson.slug)) {
      throw new ContentError(`duplicate lesson slug "${lesson.slug}"`, courseDir);
    }
    seenSlug.add(lesson.slug);

    if (!moduleIds.has(lesson.module)) {
      throw new ContentError(
        `unknown module "${lesson.module}" — course.md declares: ${[...moduleIds].join(', ')}`,
        path.join(courseDir, `${lesson.slug}.md`),
      );
    }
  }

  return { ...frontmatter, slug: courseSlug, locale, body: content.trim(), lessons };
}

/** Every course in a locale, in shelf order. Empty if the locale has none yet. */
export function loadCourses(locale: Locale, root: string = CONTENT_ROOT): Course[] {
  const dir = path.join(root, locale);
  if (!existsSync(dir)) return [];

  return readdirSync(dir, { withFileTypes: true })
    .filter((entry) => entry.isDirectory())
    .map((entry) => loadCourse(locale, entry.name, root))
    .sort((a, b) => a.order - b.order || a.title.localeCompare(b.title));
}

/** The lesson before and after `slug` in reading order — for prev/next links. */
export function lessonNeighbours(
  course: Course,
  slug: string,
): { previous: Lesson | null; next: Lesson | null } {
  const index = course.lessons.findIndex((lesson) => lesson.slug === slug);
  if (index === -1) {
    throw new ContentError(`no lesson "${slug}" in course "${course.slug}"`);
  }
  return {
    previous: course.lessons[index - 1] ?? null,
    next: course.lessons[index + 1] ?? null,
  };
}

/** Lessons grouped by module, in the module order course.md declares. */
export function lessonsByModule(
  course: Course,
): { module: Module; lessons: Lesson[] }[] {
  return course.modules.map((declared) => ({
    module: declared,
    lessons: course.lessons.filter((lesson) => lesson.module === declared.id),
  }));
}
