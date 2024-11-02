import { defineConfig } from "astro/config";
import mdx from "@astrojs/mdx";
import sitemap from "@astrojs/sitemap";
import tailwind from "@astrojs/tailwind";
import react from "@astrojs/react";
import markdoc from "@astrojs/markdoc";
import keystatic from '@keystatic/astro';

import vercel from "@astrojs/vercel/serverless";

// https://astro.build/config
export default defineConfig({
  site: "https://blog.ayanchoudhury.in",
  integrations: [mdx(), sitemap(), tailwind(), react(), markdoc(), keystatic()],
  output: "hybrid",
  adapter: vercel(),
});