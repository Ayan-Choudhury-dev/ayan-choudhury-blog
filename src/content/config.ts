import { defineCollection, z } from "astro:content";

const blog = defineCollection({
  type: "content",
  schema: ({ image }) =>
    z.object({
      title: z.string(),
      description: z.string().optional(),
      date: z.coerce.date(),
      cover: image().optional(),
      draft: z.boolean().optional(),
      tags: z.array(z.string()).optional(),
    }),
});

const music = defineCollection({
  type: "data",
  schema: z.object({
    type: z.string(),
    name: z.string(),
    artist: z.string(),
    date: z.coerce.date(),
    draft: z.boolean(),
    artURL: z.string(),
    trackURL: z.string(),
    spoURL: z.string().optional(),
  }),
});

const work = defineCollection({
  type: "content",
  schema: z.object({
    company: z.string(),
    role: z.string(),
    dateStart: z.coerce.date(),
    dateEnd: z.union([z.coerce.date(), z.string()]),
  }),
});

const projects = defineCollection({
  type: "content",
  schema: z.object({
    title: z.string(),
    description: z.string(),
    date: z.coerce.date(),
    draft: z.boolean().optional(),
    demoURL: z.string().optional(),
    repoURL: z.string().optional(),
  }),
});

export const collections = { blog, music, work, projects };
// export const collections = { blog };
