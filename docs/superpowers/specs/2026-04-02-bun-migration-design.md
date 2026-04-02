# Bun Migration Design

**Date:** 2026-04-02  
**Status:** Approved

## Goal

Migrate the `ayan-choudhury-blog` Astro project from npm + Node to Bun as both the package manager and JS runtime. Deploy target is Vercel.

## Scope

- Root project only (`/`)
- Delete the unused `astro-app/` subdirectory
- No changes to application source code (`src/`)

## Local Setup Changes

1. Delete `astro-app/` directory
2. Delete `package-lock.json`
3. Run `bun install` to generate `bun.lockb`
4. Add `"packageManager": "bun@1.x"` to `package.json`
5. Add `package-lock.json` to `.gitignore`
6. Commit `bun.lockb`

No changes needed to `astro.config.mjs`, `tailwind.config.mjs`, `tsconfig.json`, or any `src/` files.

## Vercel Deployment

Add `"packageManager": "bun@1.x"` to `package.json`. Vercel reads this field and automatically uses Bun for install and runtime. No changes to `vercel.json` required.

The `@astrojs/vercel` adapter remains unchanged.

## Compatibility Notes

- **`sharp`**: Has official Bun support. If install fails, re-run `bun add sharp --optional`.
- **`concurrently`**, **`onchange`**: Work fine under Bun.
- **`vercel` CLI**: Listed as a dependency (not devDep) — no issue with Bun.
- No native Node addons that would block migration.

## Out of Scope

- Bun test runner (no tests in this project)
- Bun bundler (Astro uses Vite internally)
- Monorepo / workspace restructure
