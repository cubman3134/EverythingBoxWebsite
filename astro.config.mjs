// @ts-check
import { defineConfig } from 'astro/config';
import mdx from '@astrojs/mdx';
import sitemap from '@astrojs/sitemap';
import tailwindcss from '@tailwindcss/vite';

// The site deploys to GitHub Pages at the apex domain; `public/CNAME` is what
// binds it there. `SITE_URL` still overrides, for preview builds on another host.
// No host adapter is configured on purpose — the static output deploys anywhere.
export default defineConfig({
  site: process.env.SITE_URL ?? 'https://everything-box.com',
  // sitemap reads `site` above, so it follows the deploy target automatically. The 404
  // page is excluded — it is a fallback, not a destination a crawler should index.
  integrations: [mdx(), sitemap({ filter: (page) => !page.includes('/404') })],
  output: 'static',
  vite: { plugins: [tailwindcss()] },
});
