import { describe, expect, it } from 'vitest';
import { ContentError } from './errors';
import { renderMarkdown } from './markdown';

describe('renderMarkdown', () => {
  it('gives every heading a slug id and an appended anchor link', async () => {
    const html = await renderMarkdown('## O que é um programa?\n\nTexto.');

    // Slug is derived from the heading text, unaccented — it is the in-page
    // anchor URL, so it follows the same stability rules as a lesson slug.
    expect(html).toMatch(/<h2[^>]*id="o-que-e-um-programa"/);
    expect(html).toContain('class="heading-anchor"');
    expect(html).toContain('aria-label="Link para esta seção"');
  });

  it('highlights a Python code block at build time', async () => {
    const html = await renderMarkdown('```python\nprint("olá")\n```');

    expect(html).toContain('data-language="python"');
    // Shiki emits per-token colour as CSS variables; their presence proves
    // highlighting ran in the build rather than being deferred to the client.
    expect(html).toMatch(/--shiki-light:#[0-9A-Fa-f]{6}/);
    expect(html).toContain('olá');
  });

  it('keeps both light and dark palettes for theme switching', async () => {
    const html = await renderMarkdown('```python\nx = 1\n```');

    // Dual-theme output carries the dark palette as a CSS variable so the
    // stylesheet can switch without re-highlighting on the client.
    expect(html).toMatch(/--shiki-dark/);
  });

  it('renders a :::nota callout as a titled aside', async () => {
    const html = await renderMarkdown(':::nota\nCuidado com a indentação.\n:::');

    expect(html).toMatch(/<aside[^>]*class="callout callout--nota"/);
    expect(html).toContain('class="callout__title"');
    expect(html).toContain('Nota');
    expect(html).toContain('Cuidado com a indentação.');
  });

  it('uses an author-supplied callout title when given', async () => {
    const html = await renderMarkdown(
      ':::aviso[Atenção]\nIsto quebra em Python 2.\n:::',
    );

    expect(html).toContain('class="callout callout--aviso"');
    expect(html).toContain('Atenção');
    expect(html).not.toContain('>Aviso<');
  });

  it('renders :::solucao as a collapsible details block', async () => {
    const html = await renderMarkdown(':::solucao\nUse um laço `for`.\n:::');

    expect(html).toMatch(/<details[^>]*class="callout callout--solucao"/);
    expect(html).toContain('<summary');
    expect(html).toContain('Solução');
  });

  it('fails the build on an unknown callout rather than dropping it', async () => {
    // A mistyped directive shipping as an empty element is the silent failure
    // the schema validation exists to prevent.
    await expect(renderMarkdown(':::avsio\nOops.\n:::')).rejects.toThrow(ContentError);
    await expect(renderMarkdown(':::avsio\nOops.\n:::')).rejects.toThrow(
      /unknown callout/,
    );
  });

  it('supports GitHub-flavoured Markdown tables', async () => {
    const html = await renderMarkdown('| a | b |\n| - | - |\n| 1 | 2 |');

    expect(html).toContain('<table>');
  });
});
