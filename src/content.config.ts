import { defineCollection } from "astro:content";
import { z } from "astro:schema";
import { glob } from "astro/loaders";

// Astro v6 Content Layer Config
// Relative paths in 'base' are relative to the project root.

const blog = defineCollection({
  loader: glob({ pattern: "**/*.{md,mdx,mdoc}", base: "./src/content/blog" }),
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
  loader: glob({ pattern: "**/*.yaml", base: "./src/content/music" }),
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
  loader: glob({ pattern: "**/*.md", base: "./src/content/work" }),
  schema: z.object({
    company: z.string(),
    role: z.string(),
    dateStart: z.coerce.date(),
    dateEnd: z.union([z.coerce.date(), z.string()]),
  }),
});

const projects = defineCollection({
  loader: glob({ pattern: "**/index.md", base: "./src/content/projects" }),
  schema: z.object({
    title: z.string(),
    description: z.string(),
    date: z.coerce.date(),
    draft: z.boolean().optional(),
    demoURL: z.string().optional(),
    repoURL: z.string().optional(),
  }),
});

const snippets = defineCollection({
  loader: glob({ pattern: "**/*.{md,mdoc}", base: "./src/content/snippets" }),
  schema: z.object({
    title: z.string(),
    date: z.coerce.date(),
    draft: z.boolean().optional(),
  }),
});

export const collections = { blog, music, work, projects, snippets };
