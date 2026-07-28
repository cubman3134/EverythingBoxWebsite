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
  // sitemap reads `site` above, so it follows the deploy target automatically. Excluded:
  // /404 (a fallback, not a destination) and /auth/* (reached from the app's sign-in
  // flow, meaningless to arrive at cold from a search result).
  integrations: [
    mdx(),
    sitemap({ filter: (page) => !page.includes('/404') && !page.includes('/auth/') }),
  ],
  output: 'static',
  vite: { plugins: [tailwindcss()] },
});
