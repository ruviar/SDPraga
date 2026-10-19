// Patrocinadores: el título sube palabra a palabra (SplitText) y los logos suben uno
// detrás de otro al entrar la banda (solo movimiento vertical).
import type { Ctx } from './main';

export function initSponsors({ gsap, SplitText }: Ctx) {
  const section = document.querySelector<HTMLElement>('[data-sponsors]');
  if (!section) return;
  const title = section.querySelector<HTMLElement>('[data-split]')!;
  const logos = gsap.utils.toArray<HTMLElement>('[data-sponsor]', section);

  gsap.matchMedia().add('(prefers-reduced-motion: no-preference)', () => {
    const split = SplitText.create(title, { type: 'words', mask: 'words' });
    gsap.from(split.words, { yPercent: 105, stagger: 0.06, duration: 1, scrollTrigger: { trigger: title, start: 'top 85%' } });
    gsap.from(logos, {
      y: 28,
      opacity: 0,
      duration: 0.8,
      stagger: 0.12,
      scrollTrigger: { trigger: section.querySelector('.sponsors__band'), start: 'top 85%' },
    });
    return () => split.revert();
  });
}
