/**
 * Floating theme switcher — dev/testing affordance.
 * Pure DOM: no oldpress internals, callbacks supplied by index.ts.
 */

import { THEME_NAMES } from './themes';

const ID = 'op-switcher';

export interface SwitcherCallbacks {
  /** User picked a theme name. */
  onSelect(theme: string): void;
  /** User picked "off". */
  onOff(): void;
}

let cb: SwitcherCallbacks | null = null;

function labelFor(name: string): string {
  return name.charAt(0).toUpperCase() + name.slice(1);
}

/** Current theme name from the recorded session options (null when off). */
export function activeThemeName(): string | null {
  return document.documentElement.dataset.opTheme || null;
}

/** Sync aria-pressed states against the recorded session. */
export function refreshSwitcher(): void {
  const nav = document.getElementById(ID);
  if (!nav) return;
  const cur = (activeThemeName() ?? '').toLowerCase();
  nav.querySelectorAll('button[data-theme]').forEach((b) => {
    const on = (b as HTMLButtonElement).dataset.theme === cur;
    b.setAttribute('aria-pressed', String(on));
  });
}

export function mountSwitcher(callbacks: SwitcherCallbacks): void {
  cb = callbacks;
  if (document.getElementById(ID)) {
    refreshSwitcher();
    return;
  }

  const nav = document.createElement('div');
  nav.id = ID;
  nav.setAttribute('role', 'group');
  nav.setAttribute('aria-label', 'oldpress theme picker');
  nav.dataset.opSkip = '';

  const mkBtn = (text: string, theme: string | null): HTMLButtonElement => {
    const b = document.createElement('button');
    b.type = 'button';
    b.textContent = text;
    if (theme) b.dataset.theme = theme;
    else b.dataset.off = '';
    b.addEventListener('click', () => {
      if (theme) cb?.onSelect(theme);
      else cb?.onOff();
    });
    return b;
  };

  nav.appendChild(mkBtn('Off', null));
  THEME_NAMES.forEach((t) => nav.appendChild(mkBtn(labelFor(t), t)));
  document.documentElement.appendChild(nav);
  refreshSwitcher();
}

export function unmountSwitcher(): void {
  document.getElementById(ID)?.remove();
  cb = null;
}
