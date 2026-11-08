/**
 * DOM mounting: texture generation, style/filter injection, layer lifecycle.
 */

import { hashSeed, mulberry32, type Rng } from './rng';
import { makeAgingLayer, makeGrainTile, makePaperTile } from './paper';
import { applyIntensity, getTheme, type ThemeParams } from './themes';
import { buildFilterSvg, buildStyles } from './styles';
import { clearInk, processInk, runGuarded, startInkObserver, stopInkObserver } from './text';

const STYLE_ID = 'op-style';
const FILTERS_ID = 'op-filters';
const UNDERLAY_ID = 'op-underlay';
const GRAIN_ID = 'op-grain';
const ROOT_CLASS = 'op-on';

export interface MountOptions {
  themeName: string | undefined;
  intensity: number;
  seed: number;
  /** Remove the site's dark class while active (old paper is light). */
  forceLight: boolean;
  /** Selectors whose text stays pristine. */
  ignore: string[];
}

let darkWasOn = false;
let inkRng: Rng | null = null;
let inkIgnore: string[] = [];

function inkWord(root: HTMLElement): number {
  if (!inkRng) return 0;
  return runGuarded(root, (r) => processInk(r, inkRng as Rng, { ignore: inkIgnore }));
}

/** Age text under <main> and watch for dynamic additions. */
function applyInk(): void {
  const mainEl = document.querySelector('main');
  if (!mainEl) return;
  const el = mainEl as HTMLElement;
  if (!el.querySelector('.op-w')) inkWord(el);
  startInkObserver(el, inkWord);
}

/** Generate all textures and mount every node. Idempotent per session. */
export function mount(opts: MountOptions): void {
  if (document.getElementById(UNDERLAY_ID)) return;

  const theme: ThemeParams = applyIntensity(getTheme(opts.themeName), opts.intensity);
  const rng = mulberry32(hashSeed(`${theme.name}:${opts.seed}`));

  const paperTile = makePaperTile((opts.seed ^ 0x9e3779b9) >>> 0, 256, {
    base: theme.paper,
    fiber: theme.fiber,
    roughness: theme.paperRoughness,
  });
  const grainTile = makeGrainTile((opts.seed ^ 0x85ebca6b) >>> 0, 144, {
    strength: theme.grainStrength,
  });
  const aging = makeAgingLayer((opts.seed ^ 0xc2b2ae35) >>> 0, {
    spots: theme.agingSpots,
    blotches: theme.agingBlotches,
    ring: theme.coffeeRing,
    color: theme.stainColor,
  });

  // <style> — sheet + grain + ink rules
  if (!document.getElementById(STYLE_ID)) {
    const style = document.createElement('style');
    style.id = STYLE_ID;
    style.textContent = buildStyles(theme, { paperTile, grainTile, aging });
    document.head.appendChild(style);
  }

  // SVG filter defs — press-roughened text (two seeded noise sources)
  document.getElementById(FILTERS_ID)?.remove();
  const tpl = document.createElement('template');
  tpl.innerHTML = buildFilterSvg(theme, Math.floor(rng() * 1000), Math.floor(rng() * 1000));
  document.head.appendChild(tpl.content.firstElementChild as Node);

  // Layers
  const underlay = document.createElement('div');
  underlay.id = UNDERLAY_ID;
  underlay.setAttribute('aria-hidden', 'true');
  document.documentElement.appendChild(underlay);

  const grain = document.createElement('div');
  grain.id = GRAIN_ID;
  grain.setAttribute('aria-hidden', 'true');
  document.documentElement.appendChild(grain);

  // Root state
  document.documentElement.classList.add(ROOT_CLASS);
  if (opts.forceLight) {
    darkWasOn = document.documentElement.classList.contains('dark');
    document.documentElement.classList.remove('dark');
  }

  // Word-level ink variation inside <main>
  inkRng = mulberry32(hashSeed(`ink:${theme.name}:${opts.seed}`));
  inkIgnore = opts.ignore;
  applyInk();
}

/** Tear down every injected node and restore the host page. */
export function unmount(): void {
  stopInkObserver();
  inkRng = null;
  clearInk();
  document.getElementById(STYLE_ID)?.remove();
  document.getElementById(FILTERS_ID)?.remove();
  document.getElementById(UNDERLAY_ID)?.remove();
  document.getElementById(GRAIN_ID)?.remove();
  document.documentElement.classList.remove(ROOT_CLASS);
  if (darkWasOn) {
    document.documentElement.classList.add('dark');
    darkWasOn = false;
  }
}

/**
 * Re-assert presence after Astro view transitions / SPA swaps.
 * Injected nodes live on <html>/<head>, which mostly survive swaps,
 * but attribute syncing can strip classes — cheap re-assert covers
 * that, and a full remount recovers from any node wipe.
 */
export function ensureMounted(): void {
  const html = document.documentElement;
  if (!document.getElementById(UNDERLAY_ID)) {
    unmount();
    mount({
      themeName: html.dataset.opTheme || undefined,
      intensity: parseFloat(html.dataset.opIntensity ?? '0.8'),
      seed: parseInt(html.dataset.opSeed ?? '0', 10),
      forceLight: html.dataset.opForceLight !== 'false',
      ignore: (html.dataset.opIgnore ?? '').split(',').filter(Boolean),
    });
    return;
  }
  html.classList.add(ROOT_CLASS);
  if (html.dataset.opForceLight !== 'false') html.classList.remove('dark');
}

/**
 * After view-transition swaps the layers persist but <main> is new —
 * re-age its text and re-arm the observer.
 */
export function ensureInk(): void {
  if (!document.documentElement.classList.contains(ROOT_CLASS) || !inkRng) return;
  applyInk();
}

export function recordOptions(opts: MountOptions): void {
  const html = document.documentElement;
  html.dataset.opTheme = opts.themeName ?? '';
  html.dataset.opIntensity = String(opts.intensity);
  html.dataset.opSeed = String(opts.seed);
  html.dataset.opForceLight = String(opts.forceLight);
  html.dataset.opIgnore = opts.ignore.join(',');
}
