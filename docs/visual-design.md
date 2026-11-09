# Visual design — source of truth

Read before touching fonts, sizes, colours, spacing, or links. If a change here
contradicts this file, update this file in the same commit. `CLAUDE.md` points here.

## Where things live

| Concern | File |
|---|---|
| `@font-face`, `@theme` tokens, prose/link/heading rules | `src/styles/global.css` |
| Pre-paint critical CSS, font preload, theme boot, reveal script | `src/components/Head.astro` |
| Text column | `src/components/Container.astro` |
| Site header, subscribe CTA, theme toggle | `src/components/Header.astro` |
| Post title + meta row | `src/components/PostHeader.astro` |
| Card title + meta row | `src/components/PostHeaderMini.astro` |
| Home card shell | `src/components/PostCardMini.astro` |
| Archive rows, filters, chips | `src/components/BlogList.astro`, `src/components/ArchivePostRow.astro` |
| Footnote tags | `markdoc.config.mjs`, `src/components/markdoc/` |

## Fonts

Three roles. Nothing else may appear.

| Role | Family | Used for |
|---|---|---|
| Prose + headings | **Literata** (`font-serif`) | article body, every heading, card titles, site name, nav, footer |
| UI chrome | **Geist** (`font-sans`) | subscribe CTA label only |
| Metadata | `ui-monospace` (`font-mono`) | dates, read time, entry counts, tags, filter chips, footnote marks |

Rules:

- Body prose is never sans. Controls that sit inside prose (e.g. "Continue
  reading") stay serif — they are content, not chrome.
- Metadata is always mono. Never split a row between mono and sans.
- Italic **must** have its own `@font-face`. Without it the browser synthesises
  an oblique from the upright face and both Merriweather and Literata look broken.
- Two variable faces load from `cdn.jsdelivr.net/fontsource`: `normal` + `italic`,
  `font-weight: 200 900`, `font-display: swap`, `unicode-range` limited to Latin.
  The italic file is only fetched on pages that actually use italics.

**Swapping the serif touches four places that must agree:**

1. `@theme { --font-serif: … }`
2. `@font-face` `normal`
3. `@font-face` `italic`
4. `Head.astro` — critical CSS `body { font-family }` **and** the `<link rel=preload>` href

Miss any one and you get a flash of fallback serif, or silent faux italics.

## Type scale

| Element | Size | Weight | Leading | Notes |
|---|---|---|---|---|
| Body | 15px | 400 | 26px (1.733) | `text-wrap: pretty` |
| Post title (`h1`) | 28px | **300** | 1.15 | big + thin, `text-wrap: balance` |
| Article `h2`–`h6` | 19px | 500 | 1.35 | `text-wrap: balance` |
| Card title | 19px | 500 | snug | same as `h2` |
| Archive row title | 15px | 500 | snug | list, not a heading |
| Metadata | 12–14px | 400 | — | mono, `tabular-nums` |

- Weights in use: **300, 400, 500**. Do not introduce 600/700/900.
- Measure: `36rem` (576px). `Container` is `max-w-[38.5rem]` (616px) + `px-5` (20px).
- Rhythm: 26px between blocks, 52px above a heading, 13px below; first child 0.
- Never set `letter-spacing`. Hierarchy comes from size + weight.
- `tabular-nums` on anything numeric and column-aligned (dates, counts).

## Colour

Tokens live in `:root` / `.dark` in `global.css`. `@theme` maps them to Tailwind
utilities through `rgb(var(--token))`, so both themes stay driven by one block.

| Token | Light | Dark | Use |
|---|---|---|---|
| `--background` | `#ede7de` | `#201f1d` | page |
| `--foreground` | `#3f546e` | `#ebebeb` | all text |
| `--card` | `#f7eee3` | `#2b2927` | cards |
| `--color-accent` | `#e17766` | `#e16c5a` | links, titles, tags |
| `--meta-ink` | `#4a6472` | `#a3a3a3` | secondary text (AA at 12–13px) |
| `--border` | `#d3cec5` | `#262626` | hairlines |

- One ink for text; accent only for links, titles, tags.
- Accent is identity, not decoration — never set body copy in it.
- Dark mode is `.dark` on `<html>`, applied pre-paint by the boot script.

## Links

- Accent colour, **no underline anywhere** — not at rest, not on hover.
- Hover shifts the hue to `--color-accent-subtle`; nothing else moves.
- Never underline nav, cards, buttons, or `Link.astro` output.
- `Link.astro` has no `underline` prop. Don't re-add one.

## Layout

- One column: 616px box, 20px side padding → 576px of text.
- Breakpoint of record: `sm` = 640px. Above it, card gutters widen 16px → 48px.
- No horizontal overflow at 390px or 1280px — check both.

## Post page

- Title 28/300 in accent, then a mono meta row (date · read time) in `--meta-ink`, 12px.
- Body sits in `<article class="mb-16">`; the article supplies prose via `@apply`.
- Post cover: `article #Cover { @apply mx-4 mb-4 }` → 16px inset left/right and
  below. Inset photo, not bleed. (Cards override this — see Post card.)

## Archive (`/blog`)

- `h1` 19/500 in ink (page titles are ink; only *post* titles are accent).
- Year separators are `h2` at 15/500 in accent.
- Row: mono date column, serif 15/500 title, mono tag list in accent, mono read time.
- Hover: background lift to `--secondary` + 2px accent bar on the left. No border recolour.

## Post card (`PostCardMini`)

- 16px outer radius, `--card` surface, 1px `--border`, `overflow-hidden`.
- Text gutter `px-4 sm:px-12` (16 / 48px) carries title, body and CTA.
- Cover: flat `1rem` inset on top/left/right at **every** breakpoint, so the photo
  is 542px of a 576px card — deliberately wider than the text gutter. Hero image,
  narrow measure. On mobile the two coincide at 16px.
- Inner radius 12px against the card's 16px so the curves nest instead of fighting.
- Cover image must be `display: block; margin: 0`. Typography sets
  `img { margin-block: 2em }`, which floats the photo inside its own box and reads
  as a broken inset.
- Card without a cover: `#meta:first-child` gets `padding-top: 1rem`.
- Cards are never edge-to-edge media; they are mounted prints.

## Footnotes

- Authored as Markdoc tags: `{% footnote n="2" ref="b" /%}` and `{% backlink n="2" /%}`.
- Rendered by `FootnoteRef.astro` / `FootnoteBacklink.astro`; both id and aria-label
  derive from `n`.
- Mark: `<sup>` at `0.72em`, `vertical-align: super`, mono, no underline.
- Jump target: `:target` gets `bg-accent-color/20` so an in-page jump is visible.
- Repeat citation of one source passes `ref`; backlinks always return to the first.

## Gotchas that have already caused bugs

1. **`Head.astro` critical CSS is unlayered.** Unlayered beats every `@layer`, so
   it silently overrides `global.css`. Keep both in sync — this is how every link
   went grey once.
2. **Tailwind v4 `@plugin` output is unlayered.** Typography's `article :where(a)`
   outranks anything in `@layer utilities`. Post-level overrides must be
   unlayered, or set the plugin's own vars (`--tw-prose-links`).
3. **`.prose` is not a class on `<article>`** — prose arrives via `@apply`, so
   `.prose a` matches nothing on post pages. Style `article a`.
4. **The home feed is nested inside an `<article>`**, so `article #Cover` and
   `article .prose *` leak into cards. Card overrides need `.postcard`.
5. **Reveal animations are gated on `html.js`** (added by the pre-paint script).
   `.animate` defaults to `opacity: 1`; only `html.js .animate` starts hidden.
   Never invert this — a script failure would blank the page.
6. **Typography's `img { margin-block: 2em }`** floats any image inside its own
   container. Zero it wherever the container owns the spacing.
7. **Tailwind v4 renames:** `bg-gradient-to-*` → `bg-linear-*`, `flex-shrink-*` →
   `shrink-*`. The old names compile to nothing, silently.
8. Fonts come from a CDN; the `preload` href must match the `@font-face` `src`.

## Verify

```sh
bun run build          # astro check + build → dist/client
```

Then measure in a browser, don't eyeball. Minimum sweep: `/`, `/blog/`,
`/blog/<post>/`, `/music/`, `/projects/`, `/subscribe/`, `/tags/<tag>/` at 1280px
and 390px, light and dark, asserting: body 15/400, `h1` 19/500 (28/300 on a post),
zero underlined anchors, zero horizontal overflow, card cover inset 16px.

## Non-goals

- No heavy elevation, no decorative gradients.
- No border recolouring on hover (lift the surface tone instead).
- No `!important` beyond the existing `article .prose *:not(a)` ink lock.
