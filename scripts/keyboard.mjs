import { chromium } from 'playwright-core';
const b = await chromium.launch({ channel: 'chrome' });
const out = '.claude/qa/shots';
// Escritorio
let p = await b.newPage({ viewport: { width: 1440, height: 900 } });
await p.goto('http://localhost:4322/', { waitUntil: 'networkidle' });
await p.waitForTimeout(2000);
const seq = [];
for (let i = 0; i < 12; i++) {
  await p.keyboard.press('Tab');
  seq.push(await p.evaluate(() => { const a = document.activeElement; return `${a.tagName}${a.className ? '.' + String(a.className).split(' ')[0] : ''} "${(a.textContent || a.getAttribute('aria-label') || '').trim().slice(0, 28)}"`; }));
  if (i === 0) await p.screenshot({ path: `${out}/kbd-skip.png`, clip: { x: 0, y: 0, width: 600, height: 120 } });
  if (i === 7) await p.screenshot({ path: `${out}/kbd-cta.png` });
}
console.log('desktop tab order:\n ' + seq.join('\n '));
// Ancla por teclado: Enter en "Conoce nuestra historia" -> foco en #historia
await p.evaluate(() => document.querySelector('.hero__ctas a').focus());
await p.keyboard.press('Enter');
await p.waitForTimeout(1600);
console.log('after Enter on CTA: focus =', await p.evaluate(() => document.activeElement.id), 'scrollY =', await p.evaluate(() => Math.round(scrollY)));
await p.close();
// Móvil: menú
p = await b.newPage({ viewport: { width: 375, height: 812 }, isMobile: true, hasTouch: true });
await p.goto('http://localhost:4322/', { waitUntil: 'networkidle' });
await p.waitForTimeout(2000);
await p.focus('[data-menu-toggle]');
await p.keyboard.press('Enter');
await p.waitForTimeout(400);
console.log('menu open:', await p.evaluate(() => ({ hidden: document.querySelector('[data-sheet]').hidden, expanded: document.querySelector('[data-menu-toggle]').getAttribute('aria-expanded'), focus: document.activeElement.textContent.trim() })));
await p.screenshot({ path: `${out}/kbd-menu-375.png` });
await p.keyboard.press('Escape');
await p.waitForTimeout(200);
console.log('menu closed:', await p.evaluate(() => ({ hidden: document.querySelector('[data-sheet]').hidden, focusIsToggle: document.activeElement.hasAttribute('data-menu-toggle') })));
await b.close();
