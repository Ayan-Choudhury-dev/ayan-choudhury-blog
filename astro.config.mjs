import { defineConfig } from "astro/config";
import mdx from "@astrojs/mdx";
import sitemap from "@astrojs/sitemap";
import tailwind from "@astrojs/tailwind";
import react from "@astrojs/react";
import markdoc from "@astrojs/markdoc";
import keystatic from '@keystatic/astro';

import vercel from "@astrojs/vercel";

// https://astro.build/config
export default defineConfig({
  site: "https://blog.ayanchoudhury.in",
  integrations: [mdx(), sitemap(), tailwind(), react({ experimentalReactChildren: true, }), markdoc(), keystatic()],
  image: {
    service: {
      entrypoint: 'astro/assets/services/sharp',
      config: {
        limitInputPixels: false,
      },
    },
    // We strictly want WebP for performance - AVIF is too slow to build
    domains: [],
    remotePatterns: [{ protocol: "https" }],
  },
  output: "static",
  adapter: vercel({
    imageService: true,
    imagesConfig: {
      sizes: [320, 640, 1280],
      formats: ['image/webp'], // Force Vercel to only optimize to WebP, skipping AVIF
    },
  }),
});