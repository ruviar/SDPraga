# Contexto del proyecto · S.D. Praga

- **Qué es**: landing de una sola página para S.D. Praga, club de fútbol para niños recién fundado por los hermanos Mazo. Público: padres desde el móvil (llegan por WhatsApp), patrocinadores, familia.
- **Regla de oro**: cero inventos. Única fuente de verdad = chat del cliente + lo que se lee en las imágenes. Ver `CONTENT-AUDIT.md`. Si falta un dato, se oculta o se muestra «Muy pronto».
- **Stack**: Astro 5.18 (estático, `lang="es"`) + TypeScript · GSAP 3.15 (ScrollTrigger, SplitText) + Lenis · Fontsource (Anybody variable wdth+wght, Instrument Sans) · sharp + potrace para activos.
- **Skills relevantes**: diseño frontend (impeccable, design-taste-frontend, frontend-design), navegador integrado/Playwright para verificación. Nada de backend.
- **Datos editables**: `src/site.config.ts` (contacto, dominio, nombres, conmutadores `showMoments`, `showFoundersPhoto`) y `src/content.ts` (textos con fuente).
- **Activos**: originales en `src/assets/source/` (solo lectura). `npm run assets` regenera todo en `public/img`, `public/escudo*.svg`, `public/og.png`, `src/generated/`.
- **Verificación**: `scripts/screenshots.mjs`, `scripts/keyboard.mjs`, `scripts/lighthouse.mjs`, `scripts/contrast.mjs`. Evidencias en `.claude/qa/`.
- **Servidores**: `.claude/launch.json` (dev 4321, preview 4322). Lighthouse contra `npx serve dist -l 4323` (con compresión).
