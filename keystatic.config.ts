// keystatic.config.ts
import { config, fields, collection } from '@keystatic/core';

export default config({
  storage: {
    // kind: 'local',
    kind: 'github',
   repo: {
     owner: "Ayan-Choudhury-dev",
     name: "ayan-choudhury-blog"
   }
  },

  collections: {
    posts: collection({
      label: 'Posts',
      entryLayout: 'content',
      columns: ['title', 'date'],

      //Slugfield
      slugField: 'title',

      //Document_path
      path: 'src/content/blog/**',
      // path: url,

      format: { contentField: 'content' },

      //Schema: Customize Fields here
      schema: {
        title: fields.slug({ name: { label: 'Title' } }),
        description: fields.text({ label: 'Post Description' }),

        cover: fields.image({
          label: 'Cover Image (Optional)',
          directory: 'src/assets/images/posts',
          // Use the @assets path alias
          publicPath: '/src/assets/images/posts/',
        }),

        //Draft label
        draft: fields.checkbox({
          label: 'Draft',
          description:
            'Set this post as draft to prevent it from being published',
        }),

        date: fields.date({
          label: 'Date published',
        }),

        content: fields.mdx({
          label: 'Content',
          options: {
            image: {
              directory: 'src/assets/images/posts',
              // Use the @assets path alias
              publicPath: '@assets/images/posts/',
            },
          },
        }),

        //Tags
        tags: fields.array(
          fields.text({ label: 'Tags' }),
          // Labelling options
          {
            label: 'Tags',
            itemLabel: (props) => props.value,
          }
        ),
        // richText: fields.mdx({
        //   label: 'Rich text',
        // }),
      },
    }),
  },
  //UI PARAMETERS FOR CMS
  ui: {
    brand: { name: "Ayan's Blog" },
  }
});
