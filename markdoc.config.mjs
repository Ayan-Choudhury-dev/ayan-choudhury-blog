import { defineMarkdocConfig, component, nodes } from '@astrojs/markdoc/config';

/**
 * Footnote system.
 *
 * Keystatic stores a footnote as two Markdoc tags, so the editor, the source
 * file and the rendered page agree on one shape:
 *
 *   {% footnote n="2" /%}   → citation mark inside the text
 *   {% backlink n="2" /%}   → return link at the end of its References entry
 *
 * The tag pair exists because Markdoc has no footnote construct and no
 * document-level transform hook — so the number is authored, exactly as GFM's
 * `[^2]` makes an author write it. Uniqueness, numbering display and a11y
 * roles live in the two Astro components; nothing here duplicates that.
 *
 * A source cited twice passes `ref` (e.g. `ref="b"`) on every citation after
 * the first: `id="fnref-2"`, `id="fnref-2-b"`. Both link forward to the same
 * `id="ref-2"` entry, whose backlink returns to the first citation.
 *
 * Authoring in Keystatic: `/footnote` and `/backlink` in the slash menu, wired
 * in `keystatic.config.ts` → `fields.markdoc({ components })`.
 */
export default defineMarkdocConfig({
  nodes: {
    image: {
      ...nodes.image,
      render: component('./src/components/markdoc/Figure.astro'),
    },
  },
  tags: {
    footnote: {
      attributes: {
        n: { type: String, required: true },
        ref: { type: String },
      },
      selfClosing: true,
      render: component('./src/components/markdoc/FootnoteRef.astro'),
    },
    backlink: {
      attributes: {
        n: { type: String, required: true },
      },
      selfClosing: true,
      render: component('./src/components/markdoc/FootnoteBacklink.astro'),
    },
  },
});
