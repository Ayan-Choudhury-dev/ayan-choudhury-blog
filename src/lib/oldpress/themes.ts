/**
 * Theme presets — pure data bundles. Every visual effect reads its
 * parameters from here, scaled by the user's `intensity` (0..1).
 */

export type ThemeName = 'newspaper' | 'letterpress' | 'typewriter' | 'pulp';

export interface ThemeParams {
  name: ThemeName;
  /** Base sheet color */
  paper: string;
  /** Fiber streak tint in the paper tile */
  fiber: string;
  /** Hue of foxing/stains */
  stainColor: string;
  /** 0..1 fiber prominence in paper tile */
  paperRoughness: number;
  /** 0..1 contrast of the grain tile */
  grainStrength: number;
  /** Overlay opacity of grain layer */
  grainOpacity: number;
  /** Foxing spot density 0..1 */
  agingSpots: number;
  /** Yellowing patch density 0..1 */
  agingBlotches: number;
  /** Probability of a coffee ring 0..1 */
  coffeeRing: number;
  /** Edge darkening strength 0..1 */
  vignette: number;

  /* — Ink engine (text) — */
  /** feDisplacementMap scale — glyph edge wobble, px */
  inkDisplace: number;
  /** Turbulence frequency for the edge-wobble noise */
  inkEdgeFreq: number;
  /** Ink-bleed blur sigma, px */
  inkBlur: number;
  /** Alpha-gamma exponent <1 floods edges opaque = pooling */
  inkPoolExp: number;
  /** Alpha-gamma amplitude (>1 thickens) */
  inkPoolAmp: number;
  /** 0..1 pinhole/speckle density from worn plates */
  speckle: number;
  /** CMYK misregistration offset, px */
  misreg: number;
  /** CSS filter applied to images */
  imgFilter: string;
}

const themes: Record<ThemeName, ThemeParams> = {
  /** Coarse newsprint: cold gray sheet, harsh grain, heavy speckle. */
  newspaper: {
    name: 'newspaper',
    paper: '#eae5d8',
    fiber: '#78705f',
    stainColor: '#7d7460',
    paperRoughness: 0.75,
    grainStrength: 0.72,
    grainOpacity: 0.17,
    agingSpots: 0.12,
    agingBlotches: 0.18,
    coffeeRing: 0,
    vignette: 0.28,
    inkDisplace: 4.6,
    inkEdgeFreq: 0.16,
    inkBlur: 0.45,
    inkPoolExp: 0.6,
    inkPoolAmp: 1.5,
    speckle: 0.45,
    misreg: 0.5,
    imgFilter: 'grayscale(0.55) sepia(0.38) contrast(0.92) brightness(1.02)',
  },

  /** Fine pressed paper: warm cream, visible impression, restrained decay. */
  letterpress: {
    name: 'letterpress',
    paper: '#f6efdf',
    fiber: '#9c8b66',
    stainColor: '#8b6c42',
    paperRoughness: 0.42,
    grainStrength: 0.4,
    grainOpacity: 0.09,
    agingSpots: 0.1,
    agingBlotches: 0.16,
    coffeeRing: 0.04,
    vignette: 0.16,
    inkDisplace: 3.4,
    inkEdgeFreq: 0.09,
    inkBlur: 0.5,
    inkPoolExp: 0.55,
    inkPoolAmp: 1.55,
    speckle: 0.25,
    misreg: 0.35,
    imgFilter: 'sepia(0.32) saturate(0.82) contrast(0.97)',
  },

  /** Ivory bond paper, crisp strike, faint ribbon unevenness to come. */
  typewriter: {
    name: 'typewriter',
    paper: '#f2ead6',
    fiber: '#8f8264',
    stainColor: '#8a744e',
    paperRoughness: 0.5,
    grainStrength: 0.48,
    grainOpacity: 0.12,
    agingSpots: 0.18,
    agingBlotches: 0.22,
    coffeeRing: 0.08,
    vignette: 0.2,
    inkDisplace: 2.6,
    inkEdgeFreq: 0.05,
    inkBlur: 0.3,
    inkPoolExp: 0.65,
    inkPoolAmp: 1.4,
    speckle: 0.15,
    misreg: 0.2,
    imgFilter: 'sepia(0.36) saturate(0.75) contrast(0.95)',
  },

  /** Cheap pulp: tan stock, heavy foxing, dramatic decay everywhere. */
  pulp: {
    name: 'pulp',
    paper: '#eddbb3',
    fiber: '#96794f',
    stainColor: '#7a5a30',
    paperRoughness: 0.62,
    grainStrength: 0.58,
    grainOpacity: 0.15,
    agingSpots: 0.6,
    agingBlotches: 0.65,
    coffeeRing: 0.55,
    vignette: 0.4,
    inkDisplace: 4.2,
    inkEdgeFreq: 0.12,
    inkBlur: 0.7,
    inkPoolExp: 0.45,
    inkPoolAmp: 1.7,
    speckle: 0.55,
    misreg: 0.55,
    imgFilter: 'sepia(0.52) saturate(0.7) contrast(0.9) brightness(0.98)',
  },
};

export const THEME_NAMES: readonly ThemeName[] = ['newspaper', 'letterpress', 'typewriter', 'pulp'];

export const DEFAULT_THEME: ThemeName = 'letterpress';

export function getTheme(name: string | undefined): ThemeParams {
  if (name && name in themes) return themes[name as ThemeName];
  return themes[DEFAULT_THEME];
}

/**
 * Scale every "amount" knob by user intensity while keeping character.
 * Pooling interpolates from identity gamma so intensity 0 = no effect.
 */
export function applyIntensity(t: ThemeParams, intensity: number): ThemeParams {
  const k = Math.max(0, Math.min(1, intensity));
  const f = 0.25 + 0.75 * k; // soft floor so even low intensity stays "printed"
  return {
    ...t,
    paperRoughness: t.paperRoughness * (0.55 + 0.45 * k),
    grainOpacity: t.grainOpacity * k,
    agingSpots: t.agingSpots * k,
    agingBlotches: t.agingBlotches * k,
    vignette: t.vignette * k,
    inkDisplace: t.inkDisplace * f,
    inkBlur: t.inkBlur * f,
    inkPoolExp: 1 + (t.inkPoolExp - 1) * f,
    inkPoolAmp: 1 + (t.inkPoolAmp - 1) * f,
    speckle: t.speckle * k,
    misreg: t.misreg * f,
  };
}
