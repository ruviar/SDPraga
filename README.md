# S.D. Praga · web del club

Landing de una sola página para S.D. Praga, club de fútbol para niños. Astro 5 + TypeScript, HTML estático, sin cookies ni analítica ni formularios.

## Comandos

```bash
npm install          # dependencias
npm run assets       # regenera derivados de imagen, escudo vectorial, favicon, OG y métricas de fuentes
npm run dev          # desarrollo en http://localhost:4321
npm run build        # genera dist/
npm run preview      # sirve dist/ en http://localhost:4322
```

Verificación (con `npm run preview` en marcha y, para Lighthouse, `npx serve dist -l 4323`, que comprime como un CDN):

```bash
node scripts/screenshots.mjs           # capturas 375/768/1440 + reduced-motion, errores de consola, 404 y scroll horizontal
node scripts/keyboard.mjs              # orden de tabulación, anclas y menú móvil por teclado
node scripts/lighthouse.mjs http://localhost:4323/ 3   # Lighthouse móvil x3 -> .claude/qa/lighthouse/
node scripts/contrast.mjs              # contraste WCAG de todos los pares de color -> .claude/qa/contrast.md
```

## Cambiar contenido (sin tocar componentes)

- `src/site.config.ts`: contacto (`phone`, `email`, `whatsapp`), `social.instagram`, dominio (`url`), nombres de los hermanos Mazo (`founders`), enlaces de colaboradores, interruptores `showFoundersPhoto` y `showMoments`.
  - Contacto vacío → «Próximamente». Al rellenarlo aparecen los botones Llamar / Escribir / WhatsApp / Instagram y el JSON-LD se actualiza solo.
- `src/content.ts`: todos los textos, con su fuente comentada. Ver `CONTENT-AUDIT.md`.
- Imágenes originales en `src/assets/source/` (solo lectura). Tras cambiar alguna: `npm run assets`.

## Despliegue

Cloudflare Pages, Netlify o Vercel: comando `npm run build`, carpeta `dist`. Definir `SITE_URL` (o `url` en `site.config.ts`) cuando exista el dominio para canonical y URLs absolutas de Open Graph. `public/_headers` deja en caché larga imágenes y fuentes (Cloudflare Pages y Netlify lo leen).

## Estructura

```
src/
  site.config.ts      datos del club y conmutadores
  content.ts          textos (con fuente)
  layouts/Base.astro  <head>, SEO, JSON-LD, intro de franjas
  components/         Nav, Hero, Crest, Story, Values, Family, Moments, Sponsors (patrocinadores), Contact, Footer, Button, Court, Brush, Picture
  scripts/boot.ts     ≈1 KB: menú móvil + carga bajo demanda del paquete de movimiento
  scripts/main.ts     GSAP + ScrollTrigger + SplitText + Lenis, por secciones
  generated/          escudo.json (trazados vectoriales) e images.json (manifest de derivados)
scripts/prepare-assets.mjs   pipeline de imágenes (sharp + potrace)
public/img/                  AVIF + WebP + JPG/PNG en varios anchos
```

## Resultados de verificación (19-10-2026)

- Lighthouse móvil (simulado, 3 pasadas, servidor con compresión): Rendimiento 97–99 · Accesibilidad 100 · Buenas prácticas 100 · SEO 100 · LCP 1,8–1,9 s · CLS 0 · TBT 0–110 ms. Informes en `.claude/qa/lighthouse/` (`summary.json` + HTML).
- Capturas a 375, 768 y 1440 px, con y sin reduced-motion: `.claude/qa/shots/`. Consola sin errores, sin 404, sin scroll horizontal accidental.
- Escudo vectorial frente al original: 0 % de diferencia en el interior de las formas (`.claude/qa/escudo-diff.png`).
- JS: 1 KB en la carga; el paquete de movimiento (57 KB gzip) se pide con la primera interacción.

## Decisiones de diseño (una línea cada una)

- **La página se lee como el escudo**: banda azul (hero), línea negra, franjas rojas (Familia), marino de las sudaderas (Historia, Contacto). Fondos solo en colores del equipo, a petición del cliente.
- **Hero**: de fondo, la ilustración del equipo difuminada y oscurecida, empezando bajo la barra; el nombre encima. En escritorio, el escudo suelto (sin recuadro) a la derecha, con sombra fija.
- **Cabecera de club a todo el ancho** en todos los tamaños, con el escudo sobresaliendo por encima de las 7 franjas; inspirada en webs de clubes profesionales, sin copiar ninguna. En móvil y tableta, botón de menú que abre un panel a pantalla completa.
- **Solo movimiento vertical**: Historia son cuatro bandas de color (marino, azul, amarillo pabellón, rojo) que alternan texto a la izquierda y a la derecha; en escritorio, en Valores las palabras aparecen una a una al bajar, bajo el título grande (en móvil se muestra montado).
- **Todo cabe en pantalla con margen**: Valores centrado y limitado por el alto de la ventana; la ilustración de Familia se dimensiona para verse entera sin scroll.
- **Patrocinadores**: banda blanca a todo el ancho sobre el azul, logos en fila sin recuadros, mismo peso visual por altura óptica.
- **Anybody con eje de anchura**: «PRAGA» se ensancha una vez al cargar; en Valores las tres palabras se igualan al mismo ancho al encajar.
- **Familia sobre su propia lámina crema**: la ilustración necesita fondo claro para el `multiply`; la lámina vive sobre el campo de franjas rojas.
- **Derivados de imagen por script** (no `astro:assets`): el recorte, la corrección de perspectiva y el escudo vectorial se hacen una vez y quedan versionados.
- **Rendimiento**: GSAP/Lenis se cargan con la primera interacción y las secciones bajo el pliegue usan `content-visibility`. El hero se anima solo con CSS.
- **Un solo tema** (oscuro en colores del club). Radios: controles y tarjetas 14 px, páginas de Historia 22 px, papel/fotos 3 px.

## Preguntas pendientes para el cliente

| # | Pregunta | Bloques que dependen |
|---|---|---|
| 1 | Nombres confirmados (Mateo y José Luis; img2 son ellos). Falta: quién es presidente y quién entrenador | Historia 02 (texto), JSON-LD `founder` |
| 2 | Fecha o año de fundación. La portada dice 2025, la foto 2026 y «acaban de empezar»: ¿cuál es la cronología? | Historia 04, JSON-LD `foundingDate` |
| 3 | ¿La portada (img1) es un regalo o montaje? ¿Se puede publicar? ¿Qué torneo fue el 3-1 contra La Mina FC? | Sección Momentos (oculta) |
| 4 | Consentimiento de las familias para publicar caras de menores (img1 tiene niños reconocibles; la ilustración y el fondo de img2 también muestran niños) | Momentos, Familia, Historia 02 |
| 5 | Ortografía del patrocinador: el logo dice AGUERO®, las camisetas de la ilustración dicen «AGUERA». URL de cada patrocinador | Patrocinadores (texto alternativo y enlaces) |
| 6 | Teléfono, email, Instagram y dominio | Contacto, JSON-LD, canonical y Open Graph |
| 7 | Localidad o barrio, y si quieren mostrar dónde entrenan | Nueva sección o dato en Contacto (no existe ahora) |
| 8 | URL de la web de referencia «Hawaya» (no se encontró) | Tono del relato de Historia |
| 9 | ¿Os vale el texto provisional «Aquí nadie juega solo.»? | Historia 01 |
