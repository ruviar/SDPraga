// Capturas de verificación a 375 / 768 / 1440 px con Chrome del sistema (playwright-core).
// Uso: npm run build && npm run preview (puerto 4322) y luego: npm run shots [-- URL]
// Salida: .claude/qa/shots/*.png + .claude/qa/console.json (errores de consola y 4xx/5xx)
import { chromium } from 'playwright-core';
import fs from 'node:fs/promises';

const URL = process.argv[2] || 'http://localhost:4322/';
const OUT = '.claude/qa/shots';
await fs.mkdir(OUT, { recursive: true });

const widths = [
  { name: '375', width: 375, height: 812, mobile: true },
  { name: '768', width: 768, height: 1024, mobile: true },
  { name: '1440', width: 1440, height: 900, mobile: false },
];
const log = [];

const browser = await chromium.launch({ channel: 'chrome', headless: true });
for (const v of widths) {
  for (const reduced of [false, true]) {
    const ctx = await browser.newContext({
      viewport: { width: v.width, height: v.height },
      deviceScaleFactor: 1,
      isMobile: v.mobile,
      hasTouch: v.mobile,
      reducedMotion: reduced ? 'reduce' : 'no-preference',
    });
    const page = await ctx.newPage();
    page.on('console', (m) => (m.type() === 'error' || m.type() === 'warning') && log.push({ w: v.name, reduced, type: m.type(), text: m.text() }));
    page.on('pageerror', (e) => log.push({ w: v.name, reduced, type: 'pageerror', text: String(e) }));
    page.on('response', (r) => r.status() >= 400 && log.push({ w: v.name, reduced, type: 'http', text: `${r.status()} ${r.url()}` }));
    await page.goto(URL, { waitUntil: 'load', timeout: 30000 });
    await page.waitForTimeout(2200);
    const tag = `${v.name}${reduced ? '-reduced' : ''}`;
    if (reduced) {
      // Recorre la página para que carguen las imágenes lazy antes de la captura completa
      await page.evaluate(async () => {
        for (let i = 0, y = 0; i < 80 && y < document.documentElement.scrollHeight; i++, y += innerHeight / 2) {
          scrollTo(0, y);
          await new Promise((r) => setTimeout(r, 120));
        }
        scrollTo(0, 0);
      });
      await page.waitForTimeout(800);
      await page.screenshot({ path: `${OUT}/${tag}-full.png`, fullPage: true });
    } else {
      await page.screenshot({ path: `${OUT}/${tag}-0-inicio.png` });
      // Recorrido por el scroll: posiciones intermedias para estados scrubbed
      const steps = 16;
      for (let i = 1; i <= steps; i++) {
        // El alto se recalcula en cada paso (content-visibility lo ajusta al pintar)
        await page.evaluate((k) => window.scrollTo(0, Math.round((document.documentElement.scrollHeight - innerHeight) * k)), i / steps);
        await page.waitForTimeout(900);
        await page.screenshot({ path: `${OUT}/${tag}-s${String(i).padStart(2, '0')}.png` });
      }
      // Desbordamiento horizontal accidental
      const overflow = await page.evaluate(() => document.documentElement.scrollWidth - innerWidth);
      if (overflow > 0) log.push({ w: v.name, reduced, type: 'overflow-x', text: `${overflow}px` });
    }
    await ctx.close();
  }
}
await browser.close();
await fs.writeFile('.claude/qa/console.json', JSON.stringify(log, null, 2));
console.log(`capturas en ${OUT}; incidencias: ${log.length}`);
for (const l of log.slice(0, 30)) console.log(l);
