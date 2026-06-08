import { defineConfig } from "astro/config";
import mdx from "@astrojs/mdx";
import sitemap from "@astrojs/sitemap";
import tailwind from "@astrojs/tailwind";
import react from "@astrojs/react";
import markdoc from "@astrojs/markdoc";
import keystatic from '@keystatic/astro';







import cloudflare from "@astrojs/cloudflare";

// https://astro.build/config
import path from "node:path";
import { fileURLToPath } from "node:url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const canvaskitWasmDir = JSON.stringify(path.join(__dirname, 'node_modules/canvaskit-wasm/bin'));

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
  adapter: cloudflare(),

  vite: {
    plugins: [
      {
        name: 'inject-dirname',
        enforce: 'pre',
        transform(code, id) {
          if (id.includes('canvaskit_') || id.includes('canvaskit-wasm')) {
            return code.replace(/__dirname/g, canvaskitWasmDir);
          }
        }
      }
    ]
  },
});