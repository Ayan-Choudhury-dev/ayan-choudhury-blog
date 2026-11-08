/**
 * oldpress — make any webpage look like it came off an old press.
 *
 * Tier 1 engine: procedural paper sheet + static print grain +
 * SVG ink-roughening filter. Import `press()` (or `autoPress()`)
 * and the page ages instantly. All DOM text stays real, selectable,
 * and screen-reader intact.
 */

import { hashSeed } from './rng';
import { ensureInk, ensureMounted, mount, recordOptions, unmount } from './inject';
import { DEFAULT_THEME, getTheme, type ThemeName } from './themes';
import { mountSwitcher, refreshSwitcher, unmountSwitcher } from './switcher';

export { THEME_NAMES, DEFAULT_THEME } from './themes';
export type { ThemeName, ThemeParams } from './themes';

const VT_EVENT = 'astro:after-swap';

export interface PressOptions {
  /** 'newspaper' | 'letterpress' | 'typewriter' | 'pulp' */
  theme?: ThemeName;
  /** 0..1 — scales every effect's strength. Default 0.8 */
  intensity?: number;
  /** Deterministic aging — same seed, same stains. Defaults to theme hash. */
  seed?: number;
  /** Selectors left untouched (reserved for Tier 2). */
  ignore?: string[];
  /** Remove `.dark` while active — old paper is light. Default true. */
  forceLight?: boolean;
}

export interface PressHandle {
  readonly active: boolean;
  destroy(): void;
  setTheme(name: string): void;
}

let current: PressHandle | null = null;
let onAstroSwap: (() => void) | null = null;

const switcherHandlers = {
  onSelect(theme: string): void {
    current?.setTheme(theme);
  },
  onOff(): void {
    current?.destroy();
  },
};

function activate(options: PressOptions): void {
  const themeName = options.theme ?? DEFAULT_THEME;
  const intensity = clamp01(options.intensity ?? 0.8);
  const seed = options.seed ?? hashSeed(themeName);
  const forceLight = options.forceLight ?? true;
  const ignore = options.ignore ?? [];

  recordOptions({ themeName, intensity, seed, forceLight, ignore });

  // Theme switches arrive while already mounted — force a full rebuild
  // so new textures/filters actually replace the old ones.
  if (document.getElementById('op-underlay')) unmount();
  mount({ themeName, intensity, seed, forceLight, ignore });
  mountSwitcher(switcherHandlers);

  if (!onAstroSwap) {
    onAstroSwap = () => {
      ensureMounted();
      ensureInk();
      refreshSwitcher();
    };
    window.addEventListener(VT_EVENT, onAstroSwap);
  }
}

function deactivate(): void {
  unmount();
  unmountSwitcher();
  if (onAstroSwap) {
    window.removeEventListener(VT_EVENT, onAstroSwap);
    onAstroSwap = null;
  }
}

/** Turn the press on. Safe to call repeatedly — returns the live handle. */
export function press(options: PressOptions = {}): PressHandle {
  activate(options);

  if (!current) {
    current = {
      get active() {
        return document.documentElement.classList.contains('op-on');
      },
      destroy(): void {
        deactivate();
        current = null;
      },
      setTheme(name: string): void {
        getTheme(name); // validates + falls back safely
        const html = document.documentElement;
        activate({
          theme: name as ThemeName,
          intensity: parseFloat(html.dataset.opIntensity ?? '0.8'),
          seed: parseInt(html.dataset.opSeed ?? '0', 10),
          forceLight: html.dataset.opForceLight !== 'false',
          ignore: (html.dataset.opIgnore ?? '').split(',').filter(Boolean),
        });
      },
    };
  }
  return current;
}

/**
 * Blog/testing helper: activates only when a URL param is present.
 * `?old` or `?old=1|true` → default theme; `?old=pulp&ops=7&opi=0.9`
 * for explicit control. Returns null when inactive.
 */
export function autoPress(param = 'old'): PressHandle | null {
  const q = new URLSearchParams(window.location.search);
  const raw = q.get(param);
  if (raw === null) return null;

  let theme: string | undefined;
  if (raw && raw !== '1' && raw !== 'true' && raw !== '') theme = raw;

  const seedParam = q.get('ops');
  const intensityParam = q.get('opi');

  return press({
    theme: theme as ThemeName | undefined, // getTheme() falls back safely
    seed: seedParam ? Number(seedParam) || hashSeed(String(seedParam)) : undefined,
    intensity: intensityParam ? clamp01(Number(intensityParam)) : undefined,
  });
}

function clamp01(n: number): number {
  return Number.isFinite(n) ? Math.max(0, Math.min(1, n)) : 0.8;
}
