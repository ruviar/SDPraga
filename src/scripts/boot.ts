// Arranque mínimo (≈1 KB). La web se ve completa y el hero se anima solo con CSS.
// - Menú móvil: funciona desde el primer toque (no depende del paquete de movimiento).
// - Paquete de movimiento (GSAP + Lenis, ~58 KB gzip): se pide con la primera
//   interacción (scroll, rueda, toque, ratón o teclado), así no compite con la carga.
// - Grano de textura: elemento propio añadido tras `load` (no recalcula estilos de toda la página).

/* ---------- Menú móvil ---------- */
const sheet = document.querySelector<HTMLElement>('[data-sheet]');
const toggle = document.querySelector<HTMLElement>('[data-menu-toggle]');
const label = toggle?.querySelector<HTMLElement>('[data-menu-label]');
const setOpen = (open: boolean, restoreFocus = true) => {
  if (!sheet || !toggle) return;
  sheet.hidden = !open;
  toggle.setAttribute('aria-expanded', String(open));
  document.documentElement.style.overflow = open ? 'hidden' : '';
  if (label) label.textContent = (open ? label.dataset.open : label.dataset.closed) ?? '';
  if (open) sheet.querySelector<HTMLElement>('a')?.focus();
  else if (restoreFocus) toggle.focus();
};
toggle?.addEventListener('click', () => setOpen(sheet?.hidden ?? false));
sheet?.addEventListener('click', (e) => {
  if ((e.target as HTMLElement).closest('a')) setOpen(false, false);
});
addEventListener('keydown', (e) => {
  if (e.key === 'Escape' && sheet && !sheet.hidden) setOpen(false);
});
addEventListener('pointerdown', (e) => {
  if (!sheet || sheet.hidden) return;
  const t = e.target as Node;
  if (!sheet.contains(t) && !toggle?.contains(t)) setOpen(false, false);
});

/* ---------- Paquete de movimiento bajo demanda ---------- */
const events = ['pointerdown', 'pointermove', 'keydown', 'wheel', 'touchstart', 'scroll'] as const;
let started = false;
const start = () => {
  if (started) return;
  started = true;
  events.forEach((e) => removeEventListener(e, start));
  import('./main');
};
events.forEach((e) => addEventListener(e, start, { once: true, passive: true }));
// Si la página se abre ya desplazada (ancla o recarga a mitad), arrancar sin esperar.
if (scrollY > 0 || location.hash) start();

/* ---------- Grano ---------- */
const grain = () => {
  const g = document.createElement('div');
  g.className = 'grain';
  g.setAttribute('aria-hidden', 'true');
  document.body.append(g);
};
if (document.readyState === 'complete') grain();
else addEventListener('load', grain, { once: true });
