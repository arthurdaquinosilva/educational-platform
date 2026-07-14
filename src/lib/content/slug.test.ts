import { describe, expect, it } from 'vitest';
import { SLUG_PATTERN } from './schema';
import { slugify } from './slug';

describe('slugify', () => {
  it('strips Portuguese accents down to their base letters', () => {
    expect(slugify('O que é um programa?')).toBe('o-que-e-um-programa');
    expect(slugify('Introdução à Programação')).toBe('introducao-a-programacao');
    expect(slugify('Condições e Repetição')).toBe('condicoes-e-repeticao');
  });

  it('collapses punctuation and whitespace into single hyphens', () => {
    expect(slugify('Big-O   Notation!')).toBe('big-o-notation');
    expect(slugify('  espaços  nas  bordas  ')).toBe('espacos-nas-bordas');
  });

  it('always produces a string that satisfies the slug schema', () => {
    for (const input of ['Já!', 'Ção — ção', 'A/B testing', '  ', '123 abc']) {
      const slug = slugify(input);
      if (slug) expect(slug).toMatch(SLUG_PATTERN);
    }
  });
});
