/**
 * Word-level ink variation — the effect that reads as "hand-printed".
 * Wraps words in <span class="op-w"> with seeded per-word jitter:
 * uneven plate pressure (opacity), baseline drift (y), tilt (rotate),
 * rare dropouts. DOM text stays real; unwrapping restores it exactly.
 */

import type { Rng } from './rng';

const SKIP_SELECTOR =
  'pre, code, kbd, samp, textarea, script, style, svg, math, [data-op-skip], .op-w';

/** Safety valve for pathological pages. */
export const WORD_CAP = 6000;

export interface InkOptions {
  /** Extra selectors whose text is left pristine. */
  ignore?: string[];
}

function makeFilter(ignore: string[]): NodeFilter {
  const ignoreSel = ignore.length ? ignore.join(',') : null;
  return {
    acceptNode(node: Text): number {
      const el = node.parentElement;
      if (!el) return NodeFilter.FILTER_REJECT;
      if (el.closest(SKIP_SELECTOR)) return NodeFilter.FILTER_REJECT;
      if (ignoreSel && el.closest(ignoreSel)) return NodeFilter.FILTER_REJECT;
      if (!node.nodeValue || !node.nodeValue.trim()) return NodeFilter.FILTER_REJECT;
      return NodeFilter.FILTER_ACCEPT;
    },
  };
}

/**
 * Wrap eligible words under `root`. Returns how many words were wrapped.
 * Deterministic given (rng state, DOM order).
 */
export function processInk(root: HTMLElement, rng: Rng, opts: InkOptions = {}): number {
  const walker = document.createTreeWalker(
    root,
    NodeFilter.SHOW_TEXT,
    makeFilter(opts.ignore ?? []),
  );

  // Snapshot first: mutating during traversal is undefined behavior bait.
  const nodes: Text[] = [];
  let seenWords = 0;
  while (walker.nextNode()) {
    if (seenWords > WORD_CAP) break;
    seenWords += (walker.currentNode as Text).nodeValue?.split(/\s+/).length ?? 0;
    nodes.push(walker.currentNode as Text);
  }

  let wrapped = 0;
  for (const node of nodes) {
    if (wrapped >= WORD_CAP) break;
    const text = node.nodeValue ?? '';
    const frag = document.createDocumentFragment();
    let touched = false;

    for (const part of text.split(/(\s+)/)) {
      if (!part) continue;
      if (/^\s+$/.test(part) || wrapped >= WORD_CAP) {
        frag.appendChild(document.createTextNode(part));
        continue;
      }
      const span = document.createElement('span');
      span.className = 'op-w';
      span.style.setProperty('--opw-o', (0.74 + rng() * 0.24).toFixed(3));
      span.style.setProperty('--opw-y', `${((rng() * 2 - 1) * 0.6).toFixed(2)}px`);
      span.style.setProperty('--opw-r', `${((rng() * 2 - 1) * 0.8).toFixed(2)}deg`);
      if (rng() < 0.005) span.classList.add('op-drop');
      span.textContent = part;
      frag.appendChild(span);
      wrapped++;
      touched = true;
    }

    if (touched) node.parentNode?.replaceChild(frag, node);
  }
  return wrapped;
}

/** Unwrap every injected span under `root`, restoring original text nodes. */
export function clearInk(root: ParentNode = document.body): void {
  root.querySelectorAll?.('.op-w').forEach((span) => {
    span.parentNode?.replaceChild(document.createTextNode(span.textContent ?? ''), span);
  });
  document.normalize?.();
}

/* — Mutation watching: keep dynamic/SPA content aged — */

let observer: MutationObserver | null = null;
let pending = false;
let applying = false;

export function startInkObserver(
  target: HTMLElement,
  rerun: (root: HTMLElement) => void,
): void {
  stopInkObserver();
  observer = new MutationObserver(() => {
    if (applying || pending) return;
    pending = true;
    setTimeout(() => {
      pending = false;
      if (!applying) rerun(target);
    }, 180);
  });
  observer.observe(target, { childList: true, subtree: true });
}

export function runGuarded(root: HTMLElement, fn: (root: HTMLElement) => number): number {
  applying = true;
  try {
    return fn(root);
  } finally {
    applying = false;
  }
}

export function stopInkObserver(): void {
  observer?.disconnect();
  observer = null;
}
