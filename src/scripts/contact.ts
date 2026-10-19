// Contacto: el centro de la pista se dibuja al entrar y el título sube.
import type { Ctx } from './main';

export function initContact({ gsap }: Ctx) {
  const section = document.querySelector<HTMLElement>('[data-contact]');
  if (!section) return;
  const court = section.querySelector<HTMLElement>('.contact__court');
  const title = section.querySelector<HTMLElement>('.contact__title');

  gsap.matchMedia().add('(prefers-reduced-motion: no-preference)', () => {
    section.dataset.mode = 'draw';
    const st = { trigger: section, start: 'top 85%', end: 'top 15%', scrub: 0.6 };
    if (court) gsap.fromTo(court, { '--draw': 0 }, { '--draw': 1, ease: 'none', scrollTrigger: st });
    // El título sube desde abajo, recortado por su propia caja (solo vertical)
    if (title) gsap.fromTo(title, { yPercent: 60, clipPath: 'inset(0 0 100% 0)' }, { yPercent: 0, clipPath: 'inset(0 0 0% 0)', duration: 1, ease: 'expo.out', scrollTrigger: { trigger: section, start: 'top 70%' } });
    return () => {
      delete section.dataset.mode;
    };
  });
}
