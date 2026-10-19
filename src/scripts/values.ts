// Valores (solo escritorio): con la sección fija en pantalla, el scroll va mostrando
// ESFUERZO, CONFIANZA y DIVERSIÓN una a una, en su sitio (suben un poco desde su propia
// línea, recortadas por abajo), después «=» y «Sentimiento de equipo» con el pincel.
// La pista se dibuja de fondo. En móvil la ecuación se muestra montada, sin animación.
import type { Ctx } from './main';

export function initValues({ gsap }: Ctx) {
  const section = document.querySelector<HTMLElement>('[data-values]');
  if (!section) return;
  const words = gsap.utils.toArray<HTMLElement>('[data-word]', section);
  const ops = gsap.utils.toArray<HTMLElement>('[data-op]', section);
  const result = section.querySelector<HTMLElement>('[data-result]')!;
  const stroke = result.querySelector<HTMLElement>('.brush__stroke');
  const court = section.querySelector<HTMLElement>('.values__court');

  gsap.matchMedia().add('(prefers-reduced-motion: no-preference) and (min-width: 1024px)', () => {
    section.dataset.mode = 'scrub';
    const show = { clipPath: 'inset(-10% -5% -15% -5%)', y: 0, opacity: 1, duration: 0.3, ease: 'power3.out' };
    // Recorte cerrado también por arriba: ni la tilde de DIVERSIÓN asoma antes de tiempo
    const hidden = { clipPath: 'inset(110% -5% -15% -5%)', y: '0.3em', opacity: 1 };
    const tl = gsap.timeline({
      scrollTrigger: { trigger: section, start: 'top top', end: 'bottom bottom', scrub: 0.5 },
    });
    if (court) tl.fromTo(court, { '--draw': 0 }, { '--draw': 1, ease: 'none', duration: 1.6 }, 0);
    // Cada palabra (y el signo que la precede) aparece en su sitio
    words.forEach((w, i) => {
      const at = 0.15 + i * 0.35;
      if (i > 0) tl.fromTo(ops[i - 1], { opacity: 0, scale: 0.6 }, { opacity: 1, scale: 1, duration: 0.15, ease: 'power2.out' }, at - 0.08);
      tl.fromTo(w, hidden, show, at);
    });
    tl.fromTo(ops[2], { opacity: 0, scale: 0.6 }, { opacity: 1, scale: 1, duration: 0.15, ease: 'power2.out' }, 1.1);
    tl.fromTo(result, hidden, show, 1.2);
    if (stroke) tl.fromTo(stroke, { clipPath: 'inset(0 100% 0 0)' }, { clipPath: 'inset(0 0% 0 0)', duration: 0.3, ease: 'power2.out' }, 1.45);
    tl.to({}, { duration: 0.3 });
    return () => {
      delete section.dataset.mode;
    };
  });
}
