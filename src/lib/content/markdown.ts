import { unified } from 'unified';
import remarkParse from 'remark-parse';
import remarkGfm from 'remark-gfm';
import remarkDirective from 'remark-directive';
import remarkRehype from 'remark-rehype';
import rehypeAutolinkHeadings from 'rehype-autolink-headings';
import rehypePrettyCode from 'rehype-pretty-code';
import rehypeStringify from 'rehype-stringify';
import { remarkCallouts } from './callouts';
import { rehypeHeadingSlugs } from './headings';

/**
 * Turns a lesson's Markdown body into HTML at build time. Everything expensive
 * — syntax highlighting above all — happens here, once, so the reading path
 * ships zero client JavaScript for it (AGENTS.md: the payload budget is a
 * feature).
 */
const processor = unified()
  .use(remarkParse)
  .use(remarkGfm)
  .use(remarkDirective)
  .use(remarkCallouts)
  // `allowDangerousHtml` is deliberately off: lesson bodies are trusted (we
  // author them) but there is no reason to carry raw HTML through, and leaving
  // it off keeps the output to the closed set of elements the stylesheet knows.
  .use(remarkRehype)
  .use(rehypeHeadingSlugs)
  .use(rehypeAutolinkHeadings, {
    // Append a self-link after the heading text rather than wrapping it, so the
    // heading stays a plain heading for screen readers and the anchor is an
    // extra, labelled affordance.
    behavior: 'append',
    properties: { className: ['heading-anchor'], 'aria-label': 'Link para esta seção' },
    content: { type: 'text', value: '#' },
  })
  .use(rehypePrettyCode, {
    // Dual theme: Shiki emits both palettes as CSS variables and the stylesheet
    // (B.1) switches them under prefers-color-scheme. Decided here so dark mode
    // never has to reopen the build pipeline.
    theme: { light: 'github-light', dark: 'github-dark' },
    // Let the stylesheet own the code background so it matches the page in both
    // themes, instead of Shiki hard-coding one.
    keepBackground: false,
  })
  .use(rehypeStringify);

/** Renders trusted lesson/course Markdown to an HTML string. */
export async function renderMarkdown(markdown: string): Promise<string> {
  const file = await processor.process(markdown);
  return String(file);
}
