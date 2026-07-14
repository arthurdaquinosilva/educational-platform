import { mkdtempSync, mkdirSync, rmSync, writeFileSync } from 'node:fs';
import { tmpdir } from 'node:os';
import path from 'node:path';
import { afterEach, describe, expect, it } from 'vitest';
import { ContentError } from './errors';
import { lessonNeighbours, lessonsByModule, loadCourse, loadCourses } from './loader';

/**
 * Fixtures are written to a temp tree rather than committed as files, so each
 * malformed case is legible right where it is asserted.
 */
const roots: string[] = [];

function writeTree(files: Record<string, string>): string {
  const root = mkdtempSync(path.join(tmpdir(), 'content-'));
  roots.push(root);
  for (const [file, contents] of Object.entries(files)) {
    const full = path.join(root, file);
    mkdirSync(path.dirname(full), { recursive: true });
    writeFileSync(full, contents);
  }
  return root;
}

afterEach(() => {
  for (const root of roots.splice(0)) rmSync(root, { recursive: true, force: true });
});

const COURSE = `---
title: Fundamentos de Programação
description: Aprenda a programar do zero.
order: 1
modules:
  - id: primeiros-passos
    title: Primeiros Passos
  - id: dados
    title: Dados
---
Bem-vindo ao curso.
`;

function lesson(title: string, module: string) {
  return `---
title: ${title}
description: Uma lição sobre ${title}.
module: ${module}
---
O corpo da lição.
`;
}

const GOOD: Record<string, string> = {
  'pt-br/fundamentos-de-programacao/course.md': COURSE,
  'pt-br/fundamentos-de-programacao/01-o-que-e-um-programa.md': lesson(
    'O que é um programa?',
    'primeiros-passos',
  ),
  'pt-br/fundamentos-de-programacao/02-seus-primeiros-programas.md': lesson(
    'Seus primeiros programas',
    'primeiros-passos',
  ),
  'pt-br/fundamentos-de-programacao/03-variaveis-e-tipos.md': lesson(
    'Variáveis e tipos',
    'dados',
  ),
};

/** The good tree with one file replaced or added. */
function variant(overrides: Record<string, string>, drop: string[] = []): string {
  const files = { ...GOOD, ...overrides };
  for (const file of drop) delete files[file];
  return writeTree(files);
}

const load = (root: string) => loadCourse('pt-br', 'fundamentos-de-programacao', root);

describe('loadCourse', () => {
  it('parses a well-formed course', () => {
    const course = load(writeTree(GOOD));

    expect(course.title).toBe('Fundamentos de Programação');
    expect(course.slug).toBe('fundamentos-de-programacao');
    expect(course.locale).toBe('pt-br');
    expect(course.body).toBe('Bem-vindo ao curso.');
    expect(course.lessons).toHaveLength(3);
  });

  it('derives the slug from the filename without its ordering prefix', () => {
    // The prefix must stay out of the slug: re-ordering lessons would otherwise
    // churn URLs, which is the one unforgivable mistake (docs/decisions.md).
    const course = load(writeTree(GOOD));

    expect(course.lessons.map((l) => l.slug)).toEqual([
      'o-que-e-um-programa',
      'seus-primeiros-programas',
      'variaveis-e-tipos',
    ]);
  });

  it('reads lessons in the order the filename prefixes declare', () => {
    // Not the order readdir happens to return them in.
    const course = load(
      variant({
        'pt-br/fundamentos-de-programacao/10-ultima.md': lesson('Última', 'dados'),
        'pt-br/fundamentos-de-programacao/09-penultima.md': lesson(
          'Penúltima',
          'dados',
        ),
      }),
    );

    expect(course.lessons.map((l) => l.order)).toEqual([1, 2, 3, 9, 10]);
  });

  it('keeps the lesson body as raw Markdown', () => {
    const course = load(writeTree(GOOD));

    expect(course.lessons[0]?.body).toBe('O corpo da lição.');
  });
});

describe('loadCourse — malformed content fails the build', () => {
  it('rejects a lesson with no title', () => {
    const root = variant({
      'pt-br/fundamentos-de-programacao/01-o-que-e-um-programa.md': `---
description: Sem título.
module: primeiros-passos
---
Corpo.
`,
    });

    expect(() => load(root)).toThrow(ContentError);
    expect(() => load(root)).toThrow(/title/);
  });

  it('rejects a lesson naming a module the course never declared', () => {
    const root = variant({
      'pt-br/fundamentos-de-programacao/01-o-que-e-um-programa.md': lesson(
        'O que é um programa?',
        'modulo-inexistente',
      ),
    });

    expect(() => load(root)).toThrow(/unknown module "modulo-inexistente"/);
    // The message has to list the valid options, or the author is left guessing.
    expect(() => load(root)).toThrow(/primeiros-passos/);
  });

  it('rejects two lessons claiming the same reading order', () => {
    const root = variant({
      'pt-br/fundamentos-de-programacao/01-outra-licao.md': lesson('Outra', 'dados'),
    });

    expect(() => load(root)).toThrow(/duplicate reading order 1/);
  });

  it('rejects two lessons claiming the same slug', () => {
    // Different prefix, same slug — they would fight over one URL.
    const root = variant({
      'pt-br/fundamentos-de-programacao/07-o-que-e-um-programa.md': lesson(
        'Cópia',
        'dados',
      ),
    });

    expect(() => load(root)).toThrow(/duplicate lesson slug "o-que-e-um-programa"/);
  });

  it('rejects an accented or uppercase filename slug', () => {
    const root = variant({
      'pt-br/fundamentos-de-programacao/04-variaveis-e-tipos-avancados.md': lesson(
        'Ok',
        'dados',
      ),
      'pt-br/fundamentos-de-programacao/05-lição-com-acento.md': lesson(
        'Acento',
        'dados',
      ),
    });

    expect(() => load(root)).toThrow(/filename slug/);
  });

  it('rejects a lesson filename with no ordering prefix', () => {
    const root = variant({
      'pt-br/fundamentos-de-programacao/sem-prefixo.md': lesson('Sem prefixo', 'dados'),
    });

    expect(() => load(root)).toThrow(/<order>-<slug>\.md/);
  });

  it('rejects a course declaring the same module twice', () => {
    const root = variant({
      'pt-br/fundamentos-de-programacao/course.md': `---
title: Curso
description: Descrição.
order: 1
modules:
  - id: dados
    title: Dados
  - id: dados
    title: Dados de novo
---
Intro.
`,
    });

    expect(() => load(root)).toThrow(/duplicate module id "dados"/);
  });

  it('rejects a course with no course.md', () => {
    const root = variant({}, ['pt-br/fundamentos-de-programacao/course.md']);

    expect(() => load(root)).toThrow(/missing its course.md/);
  });

  it('rejects a course with no lessons', () => {
    const root = writeTree({ 'pt-br/fundamentos-de-programacao/course.md': COURSE });

    expect(() => load(root)).toThrow(/no lessons/);
  });

  it('names the offending file in the error', () => {
    const root = variant({
      'pt-br/fundamentos-de-programacao/02-seus-primeiros-programas.md': `---
title: Sem descrição
module: dados
---
Corpo.
`,
    });

    expect(() => load(root)).toThrow(/02-seus-primeiros-programas\.md/);
  });
});

describe('loadCourses', () => {
  it('returns courses in shelf order, not alphabetical order', () => {
    const root = variant({
      'pt-br/git/course.md': COURSE.replace('order: 1', 'order: 0').replace(
        'title: Fundamentos de Programação',
        'title: Git',
      ),
      'pt-br/git/01-commits.md': lesson('Commits', 'dados'),
    });

    expect(loadCourses('pt-br', root).map((c) => c.slug)).toEqual([
      'git',
      'fundamentos-de-programacao',
    ]);
  });

  it('returns nothing for a locale with no content yet', () => {
    // English is architected for but unwritten; that must not break the build.
    expect(loadCourses('en', writeTree(GOOD))).toEqual([]);
  });
});

describe('lessonNeighbours', () => {
  it('walks the course in reading order and stops at both ends', () => {
    const course = load(writeTree(GOOD));

    expect(lessonNeighbours(course, 'o-que-e-um-programa').previous).toBeNull();
    expect(lessonNeighbours(course, 'o-que-e-um-programa').next?.slug).toBe(
      'seus-primeiros-programas',
    );
    expect(lessonNeighbours(course, 'seus-primeiros-programas').previous?.slug).toBe(
      'o-que-e-um-programa',
    );
    expect(lessonNeighbours(course, 'variaveis-e-tipos').next).toBeNull();
  });
});

describe('lessonsByModule', () => {
  it('groups lessons under the modules the course declares, in that order', () => {
    const grouped = lessonsByModule(load(writeTree(GOOD)));

    expect(grouped.map((g) => g.module.id)).toEqual(['primeiros-passos', 'dados']);
    expect(grouped[0]?.lessons.map((l) => l.slug)).toEqual([
      'o-que-e-um-programa',
      'seus-primeiros-programas',
    ]);
    expect(grouped[1]?.lessons.map((l) => l.slug)).toEqual(['variaveis-e-tipos']);
  });
});
