// keystatic.config.ts
import { config, fields, collection } from "@keystatic/core";
import { createElement } from "react";
import { inline } from "@keystatic/core/content-components";

export default config({
  // storage: {
  //   kind: 'github',
  //   repo: {
  //     owner: 'Ayan-Choudhury-dev',
  //     name: 'ayan-choudhury-blog',
  //   },
  //   branchPrefix: 'keystatic-cms/',
  // },

  storage: {
    kind: "cloud",
  },
  cloud: {
    project: "solo-blogger/ayan-choudhury-blog",
  },

  collections: {
    snippets: collection({
      label: "✨ Hero Snippets",
      slugField: "title",
      columns: ["title", "date"],

      path: "src/content/snippets/**",

      format: { contentField: "content" },

      schema: {
        title: fields.slug({ name: { label: "Snippet Title" } }),

        content: fields.markdoc({
          label: "Snippet Text",
        }),

        date: fields.date({
          label: "Created",
        }),

        draft: fields.checkbox({
          label: "Draft",
          description: "Hide this snippet from the homepage",
        }),
      },
    }),
    posts: collection({
      label: "✍️ Posts",
      entryLayout: "content",
      columns: ["date", "title"],

      //Slugfield
      slugField: "title",

      //Document_path
      path: "src/content/blog/**",
      // path: url,

      format: { contentField: "content" },

      //Schema: Customize Fields here
      schema: {
        title: fields.slug({ name: { label: "Title" } }),
        // description: fields.text({ label: "Post Description" }),

        cover: fields.image({
          label: "Cover Image (Optional)",
          directory: "src/assets/images/posts",
          // Use the @assets path alias
          publicPath: "/src/assets/images/posts/",
        }),

        //Draft label
        draft: fields.checkbox({
          label: "Draft",
          description: "Set this post as draft to prevent it from being published",
        }),

        date: fields.date({
          label: "Date published",
        }),

        content: fields.markdoc({
          label: "Content",
          options: {
            image: {
              directory: "src/assets/images/posts",
              // Use the @assets path alias
              publicPath: "@assets/images/posts/",
            },
          },
          // Footnote system. These two inline components serialize to the
          // `{% footnote %}` / `{% backlink %}` Markdoc tags that
          // `markdoc.config.mjs` renders. Keep the names and schemas in sync —
          // the tag name is the component key, and the attribute names are the
          // schema keys.
          components: {
            footnote: inline({
              label: "Footnote reference",
              description:
                "Citation mark in the text. Its number must match a backlink in the References list.",
              schema: {
                n: fields.integer({
                  label: "Number",
                  description: "Same number as its entry in References.",
                  validation: { min: 1 },
                }),
                ref: fields.text({
                  label: "Repeat suffix",
                  description:
                    "Leave blank on the first citation. Add b, c, … only when the same source is cited again.",
                  validation: { length: { max: 1 } },
                }),
              },
              // Shown inside the editor document as a superscript chip, so the
              // author sees "2" rather than an opaque component block.
              ContentView: ({ value }) =>
                createElement(
                  "sup",
                  {
                    style: {
                      fontFamily: "monospace",
                      fontSize: "0.8em",
                      color: "var(--accent, #c66353)",
                    },
                  },
                  value.n ?? "?",
                ),
            }),
            backlink: inline({
              label: "Footnote backlink",
              description:
                "Return link. Place it at the end of the matching entry in References — one per entry.",
              schema: {
                n: fields.integer({
                  label: "Number",
                  description: "Same number as the citation it returns to.",
                  validation: { min: 1 },
                }),
              },
              ContentView: ({ value }) =>
                createElement(
                  "span",
                  {
                    style: {
                      fontFamily: "monospace",
                      fontSize: "0.8em",
                      color: "var(--accent, #c66353)",
                    },
                  },
                  `↩${value.n ?? "?"}`,
                ),
            }),
          },
        }),

        //Tags
        tags: fields.array(fields.text({ label: "Tags" }), {
          label: "Tags",
          itemLabel: (props) => props.value,
        }),
      },
    }),
    music: collection({
      label: "🎧 Jukebox",
      slugField: "name",
      columns: ["name", "date"],

      //Document_path
      path: "src/content/music/**",

      schema: {
        type: fields.select({
          label: "Type",
          description: "Select whether this is an album or a track",
          options: [
            { label: "Album", value: "album" },
            { label: "Track", value: "track" },
          ],
          defaultValue: "track",
        }),

        name: fields.slug({ name: { label: "Name" } }),

        artist: fields.text({
          label: "Artist Name",
        }),

        date: fields.date({
          label: "Added",
          description: "Track added on",
        }),

        draft: fields.checkbox({
          label: "Draft",
          description: "Set this entry as draft to prevent it from being published",
        }),

        artURL: fields.text({
          label: "Art URL",
          description: "URL for the album/song artwork",
        }),

        trackURL: fields.text({
          label: "Track URL",
          description: "URL for the music track",
        }),

        spoURL: fields.text({
          label: "Spo URL",
          description: "Spo URL for the track",
        }),
      },
    }),
  },
  //UI PARAMETERS FOR CMS
  ui: {
    brand: { name: "Ayan's Blog" },
  },
});
