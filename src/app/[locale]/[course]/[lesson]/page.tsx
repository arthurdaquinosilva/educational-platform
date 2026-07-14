import type { Metadata } from 'next';
import { notFound } from 'next/navigation';
import { PUBLISHED_LOCALES, isLocale } from '@/lib/i18n';
import { site } from '@/config/site';
import { lessonNeighbours, loadCourse, loadCourses } from '@/lib/content/loader';
import { ContentError } from '@/lib/content/errors';
import { renderMarkdown } from '@/lib/content/markdown';

interface RouteParams {
  locale: string;
  course: string;
  lesson: string;
}

/**
 * Enumerates every lesson URL for the static export. This is where the loader
 * runs at build time; a malformed lesson throws here and fails the build,
 * exactly as intended (docs/decisions.md).
 */
export function generateStaticParams(): RouteParams[] {
  return PUBLISHED_LOCALES.flatMap((locale) =>
    loadCourses(locale).flatMap((course) =>
      course.lessons.map((lesson) => ({
        locale,
        course: course.slug,
        lesson: lesson.slug,
      })),
    ),
  );
}

/** Loads the lesson for a set of route params, or null if nothing matches. */
function findLesson(params: RouteParams) {
  if (!isLocale(params.locale)) return null;
  try {
    const course = loadCourse(params.locale, params.course);
    const lesson = course.lessons.find((l) => l.slug === params.lesson);
    return lesson ? { course, lesson } : null;
  } catch (error) {
    // A missing course is a 404; a malformed one is a build bug we must not
    // swallow into a silent 404.
    if (error instanceof ContentError && /missing its course\.md/.test(error.message)) {
      return null;
    }
    throw error;
  }
}

export async function generateMetadata({
  params,
}: {
  params: Promise<RouteParams>;
}): Promise<Metadata> {
  const found = findLesson(await params);
  if (!found) return {};
  const { course, lesson } = found;
  return {
    title: `${lesson.title} · ${course.title}`,
    description: lesson.description,
  };
}

export default async function LessonPage({ params }: { params: Promise<RouteParams> }) {
  const resolved = await params;
  const found = findLesson(resolved);
  if (!found) notFound();

  const { course, lesson } = found;
  const { previous, next } = lessonNeighbours(course, lesson.slug);
  const html = await renderMarkdown(lesson.body);
  const href = (slug: string) =>
    `${site.basePath}/${resolved.locale}/${course.slug}/${slug}/`;

  return (
    <article>
      <div dangerouslySetInnerHTML={{ __html: html }} />

      <nav aria-label="Navegação entre lições">
        {previous ? (
          <a href={href(previous.slug)} rel="prev">
            ← {previous.title}
          </a>
        ) : null}
        {next ? (
          <a href={href(next.slug)} rel="next">
            {next.title} →
          </a>
        ) : null}
      </nav>
    </article>
  );
}
