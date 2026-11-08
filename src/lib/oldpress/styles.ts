/**
 * CSS construction for oldpress. Everything is runtime-injected so the
 * library stays a single portable folder with zero build assumptions.
 */

import type { ThemeParams } from './themes';

export interface Textures {
  paperTile: string;
  grainTile: string;
  aging: string;
}

const UNDERLAY_Z = -1;
const GRAIN_Z = 2147483001;

/** Compose the full stylesheet for an active session. */
export function buildStyles(theme: ThemeParams, tex: Textures): string {
  const vignetteAlpha = (0.18 + 0.5 * theme.vignette).toFixed(3);
  return /* css */ `
html.op-on {
  --op-paper: ${theme.paper};
  --op-img-filter: ${theme.imgFilter};
  color-scheme: light;
}
html.op-on,
html.op-on body {
  background: transparent !important;
}

/* — Paper sheet: sits behind all content — */
#op-underlay {
  position: fixed;
  inset: 0;
  z-index: ${UNDERLAY_Z};
  pointer-events: none;
  background-color: var(--op-paper);
  background-image:
    radial-gradient(120% 95% at 50% 42%, rgba(0,0,0,0) 52%, rgba(58,40,14,${vignetteAlpha}) 118%),
    url("${tex.aging}"),
    url("${tex.paperTile}");
  background-size:
    100% 100%,
    cover,
    ${256}px ${256}px;
  background-repeat: no-repeat, no-repeat, repeat;
}

/* — Print grain: multiplies noise over everything, above content — */
#op-grain {
  position: fixed;
  inset: 0;
  z-index: ${GRAIN_Z};
  pointer-events: none;
  background-image: url("${tex.grainTile}");
  background-repeat: repeat;
  mix-blend-mode: multiply;
  opacity: ${theme.grainOpacity.toFixed(3)};
}

/* — Ink treatment: press-roughened text inside the content area — */
html.op-on main {
  filter: url(#op-ink);
}

/* — Word-level print jitter (spans injected by text.ts) — */
html.op-on {
  --op-misreg: ${theme.misreg.toFixed(2)}px;
}
html.op-on main .op-w {
  display: inline-block;
  opacity: var(--opw-o, 1);
  transform: translateY(var(--opw-y, 0px)) rotate(var(--opw-r, 0deg));
  /* CMYK misregistration + faint ghost double-strike */
  text-shadow:
    var(--op-misreg) 0 rgba(178, 60, 52, 0.16),
    calc(-1 * var(--op-misreg)) 0 rgba(58, 96, 158, 0.14),
    0.7px 0.45px 0 rgba(38, 30, 20, 0.1);
}
html.op-on main .op-w.op-drop {
  opacity: 0.07;
}

/* — Media ages with the page — */
html.op-on img {
  filter: var(--op-img-filter);
}
html.op-on img[data-op-skip],
html.op-on [data-op-skip] img {
  filter: none;
}

/* — Ink-colored selection — */
html.op-on ::selection {
  background: rgba(122, 82, 34, 0.28);
}

/* — Theme switcher pill (dev/testing) — */
#op-switcher {
  position: fixed;
  right: 16px;
  bottom: 16px;
  z-index: ${2147483002};
  display: flex;
  gap: 2px;
  padding: 4px;
  border-radius: 999px;
  background: rgba(28, 24, 18, 0.9);
  box-shadow: 0 4px 18px rgba(0, 0, 0, 0.35);
}
#op-switcher button {
  appearance: none;
  border: 0;
  cursor: pointer;
  padding: 5px 10px;
  border-radius: 999px;
  background: transparent;
  color: rgba(246, 239, 223, 0.75);
  font-family: ui-monospace, SFMono-Regular, Menlo, monospace;
  font-size: 11px;
  letter-spacing: 0.04em;
}
#op-switcher button:hover {
  color: #fff;
}
#op-switcher button:focus-visible {
  outline: 1.5px solid rgba(246, 239, 223, 0.9);
  outline-offset: 1px;
}
#op-switcher button[aria-pressed='true'] {
  background: rgba(246, 239, 223, 0.92);
  color: #2a2117;
  font-weight: 600;
}

/* Respect forced-colors / high-contrast modes: strip decoration entirely. */
@media (forced-colors: active) {
  #op-underlay,
  #op-grain {
    display: none;
  }
  html.op-on main,
  html.op-on img {
    filter: none;
  }
}
`.trim();
}

/**
 * SVG filter defs — the multi-stage press simulation:
 * edge wobble → bleed blur → alpha-gamma pooling → speckle pinholes.
 */
export function buildFilterSvg(theme: ThemeParams, seedA: number, seedB: number): string {
  const ef = theme.inkEdgeFreq.toFixed(4);
  const efY = (theme.inkEdgeFreq * 1.6).toFixed(4);

  // Speckle mask: alpha = SP*R - T. Lower threshold => more pinholes.
  const sp = 1.9;
  const threshold = (0.95 - 0.43 * Math.min(1, Math.max(0, theme.speckle))).toFixed(3);

  return /* html */ `
<svg id="op-filters" aria-hidden="true" focusable="false"
     style="position:absolute;width:0;height:0;overflow:hidden">
  <defs>
    <filter id="op-ink" x="-6%" y="-6%" width="112%" height="112%"
            color-interpolation-filters="sRGB">
      <feTurbulence type="fractalNoise" baseFrequency="${ef} ${efY}"
                    numOctaves="3" seed="${seedA}" result="rough"/>
      <feDisplacementMap in="SourceGraphic" in2="rough"
                         scale="${theme.inkDisplace.toFixed(2)}"
                         xChannelSelector="R" yChannelSelector="G" result="wobbled"/>
      <feGaussianBlur in="wobbled" stdDeviation="${theme.inkBlur.toFixed(2)}" result="bleed"/>
      <feComponentTransfer in="bleed" result="pooled">
        <feFuncA type="gamma" amplitude="${theme.inkPoolAmp.toFixed(3)}"
                 exponent="${theme.inkPoolExp.toFixed(3)}" offset="0"/>
      </feComponentTransfer>
      <feTurbulence type="fractalNoise" baseFrequency="0.72 0.78"
                    numOctaves="2" seed="${seedB}" result="speck"/>
      <feColorMatrix in="speck" type="matrix"
                     values="0 0 0 0 0  0 0 0 0 0  0 0 0 0 0  ${sp} 0 0 0 -${threshold}"
                     result="speckA"/>
      <feComposite in="pooled" in2="speckA" operator="out"/>
    </filter>
  </defs>
</svg>`.trim();
}
