// @ts-check
import { defineConfig } from 'astro/config';
import mdx from '@astrojs/mdx';
import tailwindcss from '@tailwindcss/vite';

// `site` is a placeholder until a deploy target is chosen; it only affects
// absolute URLs in generated metadata, not local development. No host adapter
// is configured on purpose — the static output deploys anywhere.
export default defineConfig({
  site: process.env.SITE_URL ?? 'https://everythingbox.example',
  integrations: [mdx()],
  output: 'static',
  vite: { plugins: [tailwindcss()] },
});
