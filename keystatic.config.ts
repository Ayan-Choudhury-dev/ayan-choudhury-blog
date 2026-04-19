// keystatic.config.ts
import { config, fields, collection } from "@keystatic/core";

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

        content: fields.text({
          label: "Snippet Text",
          multiline: true,
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
