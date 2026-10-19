// @ts-check
import { defineConfig } from 'astro/config';
import { siteConfig } from './src/site.config.ts';

export default defineConfig({
  // Dominio público (PENDIENTE): se define en src/site.config.ts o con SITE_URL.
  site: process.env.SITE_URL || siteConfig.url || undefined,
  output: 'static',
  trailingSlash: 'ignore',
  build: { inlineStylesheets: 'always', assets: 'assets' },
  compressHTML: true,
  devToolbar: { enabled: false },
  vite: { build: { assetsInlineLimit: 0 } },
});
