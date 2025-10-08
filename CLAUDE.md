# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

This is "Dada's Sketchbook" - Ayan Choudhury's personal blog built with Astro, featuring a headless CMS powered by Keystatic. The site includes blog posts, music recommendations, work experience, and projects.

## Development Commands

### Essential Commands
- `npm run dev` - Start development server with hot reload
- `npm run build` - Build for production (includes type checking via `astro check`)
- `npm run preview` - Preview production build locally
- `npm start` - Start with auto-formatting watcher and dev server

### Code Quality
- `npm run lint` - Run ESLint
- `npm run lint:fix` - Auto-fix ESLint issues
- `npm run format` - Format all files with Prettier
- `npm run format:check` - Check formatting without changes

### Network Access
- `npm run dev:network` - Run dev server accessible on network
- `npm run preview:network` - Run preview accessible on network

## Architecture

### Content Management
- **Keystatic CMS**: Headless CMS for content editing at `/keystatic`
- **Content Collections**: Defined in `src/content/config.ts`
  - `blog` - Blog posts (Markdoc format in `src/content/blog/`)
  - `music` - Music recommendations (YAML data in `src/content/music/`)
  - `work` - Work experience (Markdown in `src/content/work/`)
  - `projects` - Project portfolio (Markdown in `src/content/projects/`)

### Key Configuration
- **Site config**: `src/consts.ts` contains site metadata, social links, and homepage display counts
- **Keystatic config**: `keystatic.config.ts` defines CMS schema and storage (currently using Keystatic Cloud)
- **Astro config**: `astro.config.mjs` includes MDX, Markdoc, Tailwind, React, and Vercel adapter

### Styling & UI
- **Tailwind CSS**: Primary styling framework
- **React components**: Located in `src/components/` (TypeScript JSX)
- **Astro components**: Also in `src/components/` (`.astro` files)
- **Custom fonts**: Sentient and other typography in `public/fonts/`

### Content Structure
- Posts support tags, draft status, cover images, and dates
- Images stored in `src/assets/images/posts/[post-slug]/`
- Music entries include track URLs, artwork, and Spotify links
- All content supports draft mode to prevent publishing

### Page Routing
- `/` - Homepage with recent posts, work, and projects
- `/blog/` - Blog listing with pagination
- `/blog/[slug]` - Individual blog posts
- `/music/` - Music recommendations
- `/work/` - Work experience
- `/projects/` - Project portfolio
- `/tags/` - Tag-based filtering

### Build & Deployment
- Static site generation for Vercel
- RSS feed generation at `/rss.xml`
- Sitemap generation included
- Vercel Analytics integration