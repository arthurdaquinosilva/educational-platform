import { visit } from 'unist-util-visit';
import type { Plugin } from 'unified';
import type { Node } from 'unist';
import { slugify } from './slug';

/**
 * Assigns every heading a slug `id` using the site's own slugify, so in-page
 * anchors are unaccented and match every other slug on the site. This replaces
 * rehype-slug, whose slugger keeps accents (`o-que-é-um-programa`) — fine for
 * English, wrong for a Portuguese site where every heading carries them.
 */
interface ElementNode extends Node {
  type: 'element';
  tagName: string;
  properties?: Record<string, unknown>;
  children: Node[];
}

interface TextNode extends Node {
  type: 'text';
  value: string;
}

function isElement(node: Node): node is ElementNode {
  return node.type === 'element';
}

const HEADING = /^h[1-6]$/;

/** Concatenates the text a heading contains, ignoring any nested markup. */
function textOf(node: ElementNode): string {
  let text = '';
  visit(node, 'text', (child) => {
    text += (child as TextNode).value;
  });
  return text;
}

export const rehypeHeadingSlugs: Plugin = () => (tree) => {
  // A heading text can legitimately repeat within one lesson ("Exercícios"),
  // and duplicate ids would make an anchor jump to the wrong one, so repeats
  // get a numeric suffix — the same disambiguation rehype-slug does.
  const seen = new Map<string, number>();

  visit(tree as Node, isElement, (node) => {
    if (!HEADING.test(node.tagName)) return;
    node.properties ??= {};
    if (typeof node.properties.id === 'string' && node.properties.id) return;

    const base = slugify(textOf(node));
    if (!base) return;

    const count = seen.get(base) ?? 0;
    seen.set(base, count + 1);
    node.properties.id = count === 0 ? base : `${base}-${count}`;
  });
};
