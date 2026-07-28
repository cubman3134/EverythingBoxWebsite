// @ts-check
import { defineConfig } from 'astro/config';
import mdx from '@astrojs/mdx';
import tailwindcss from '@tailwindcss/vite';

// The site deploys to GitHub Pages at the apex domain; `public/CNAME` is what
// binds it there. `SITE_URL` still overrides, for preview builds on another host.
// No host adapter is configured on purpose — the static output deploys anywhere.
export default defineConfig({
  site: process.env.SITE_URL ?? 'https://everything-box.com',
  integrations: [mdx()],
  output: 'static',
  vite: { plugins: [tailwindcss()] },
});
