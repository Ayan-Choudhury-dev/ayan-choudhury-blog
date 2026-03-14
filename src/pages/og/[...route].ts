import { getCollection } from 'astro:content';
import { OGImageRoute } from 'astro-og-canvas';

const blogEntries = await getCollection('blog', ({ data }) => !data.draft);
const workEntries = await getCollection('work');
const projectEntries = await getCollection('projects', ({ data }) => !data.draft);

// Create pages object for blog posts, work, and projects
const pages: Record<string, { title: string; description: string; type?: string }> =
  Object.fromEntries([
    // Homepage
    [
      '',
      {
        title: "Dada's Sketchbook",
        description: 'Personal blog by Ayan Choudhury - thoughts on design, code, and life',
      },
    ],
    // Blog posts
    ...blogEntries.map(({ slug, data }) => [
      `blog/${slug}`,
      {
        title: data.title,
        description: data.description || 'A blog post by Ayan Choudhury',
        type: 'blog',
      },
    ]),
    // Work entries
    ...workEntries.map(({ slug, data }) => [
      `work/${slug}`,
      {
        title: `${data.role} at ${data.company}`,
        description: `Work experience: ${data.role} position`,
        type: 'work',
      },
    ]),
    // Project entries
    ...projectEntries.map(({ slug, data }) => [
      `projects/${slug}`,
      {
        title: data.title,
        description: data.description,
        type: 'project',
      },
    ]),
    // Static pages
    [
      'blog',
      {
        title: "Blog - Dada's Sketchbook",
        description: 'Thoughts on design, code, and life',
      },
    ],
    [
      'work',
      {
        title: "Work - Dada's Sketchbook",
        description: 'Professional experience and career journey',
      },
    ],
    [
      'projects',
      {
        title: "Projects - Dada's Sketchbook",
        description: 'Personal and professional projects',
      },
    ],
    [
      'music',
      {
        title: "Music - Dada's Sketchbook",
        description: 'Music recommendations and discoveries',
      },
    ],
  ]);

export const { getStaticPaths, GET } = await OGImageRoute({
  param: 'route',
  pages,
  getImageOptions: (_path, page) => ({
    title: page.title,
    description: page.description,
    // logo: {
    //   path: './public/astro-nano.png',
    //   size: [50, 50],
    // },
    font: {
      title: {
        families: ['Inter'],
        weight: 'Bold',
        size: 56,
      },
      description: {
        families: ['Inter'],
        weight: 'Normal',
        size: 28,
      },
    },
    fonts: ['https://fonts.googleapis.com/css2?family=Inter:wght@400;600;700&display=swap'],
    padding: 80,
    bgGradient: [
      [24, 24, 27], // zinc-900
      [9, 9, 11], // zinc-950
    ],
    border: {
      color: [63, 63, 70], // zinc-700
      width: 2,
    },
  }),
});
