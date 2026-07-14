import { visit } from 'unist-util-visit';
import type { Plugin } from 'unified';
import type { Node, Parent } from 'unist';
import { ContentError } from './errors';

/**
 * Callouts are authored as remark-directive container blocks (`:::nota`), the
 * one bit of non-standard Markdown the schema allows. They map to a fixed,
 * closed set — an unknown one fails the build rather than silently vanishing,
 * because a mistyped `:::avsio` shipping as an empty div is exactly the kind of
 * broken page the build-time validation exists to catch.
 *
 * Labels are Portuguese because they are reading content, not UI chrome; when
 * English ships the map becomes per-locale. The directive *name* stays
 * language-neutral so a lesson's source never has to change.
 */
const CALLOUTS = {
  nota: { tag: 'aside', label: 'Nota' },
  aviso: { tag: 'aside', label: 'Aviso' },
  solucao: { tag: 'details', label: 'Solução' },
} as const;

type CalloutName = keyof typeof CALLOUTS;

function isCalloutName(name: string): name is CalloutName {
  return Object.prototype.hasOwnProperty.call(CALLOUTS, name);
}

interface DirectiveNode extends Parent {
  type: 'containerDirective';
  name: string;
  data?: {
    hName?: string;
    hProperties?: Record<string, unknown>;
    directiveLabel?: boolean;
  };
}

function isContainerDirective(node: Node): node is DirectiveNode {
  return node.type === 'containerDirective';
}

/**
 * The `:::name[optional title]` label, if the author wrote one, arrives as the
 * first child paragraph flagged `directiveLabel`. Pull it out so it becomes the
 * callout's heading rather than a stray paragraph in its body.
 */
function takeCustomTitle(node: DirectiveNode): Node[] | null {
  const [first] = node.children;
  if (
    first &&
    'data' in first &&
    (first.data as { directiveLabel?: boolean })?.directiveLabel
  ) {
    node.children.shift();
    return (first as Parent).children;
  }
  return null;
}

function titleNode(tag: string, className: string, children: Node[]): Node {
  return {
    type: 'paragraph',
    data: { hName: tag, hProperties: { className: [className] } },
    children,
  } as Node;
}

/** Rewrites `:::nota` / `:::aviso` / `:::solucao` blocks into semantic HTML. */
export const remarkCallouts: Plugin = () => (tree) => {
  visit(tree as Node, isContainerDirective, (node) => {
    if (!isCalloutName(node.name)) {
      throw new ContentError(
        `unknown callout ":::${node.name}" — allowed: ${Object.keys(CALLOUTS).join(', ')}`,
      );
    }
    const { tag, label } = CALLOUTS[node.name];

    const custom = takeCustomTitle(node);
    const titleChildren = custom ?? [{ type: 'text', value: label } as Node];
    // <details> needs a <summary>; <aside> gets a titled paragraph. Both carry
    // the same class hook so the stylesheet treats them uniformly.
    const heading = titleNode(
      tag === 'details' ? 'summary' : 'p',
      'callout__title',
      titleChildren,
    );
    node.children.unshift(heading);

    node.data = {
      ...node.data,
      hName: tag,
      hProperties: { className: ['callout', `callout--${node.name}`] },
    };
  });
};
