// Momentos: la portada de recuerdo, inclinada, se endereza con el scroll.
import type { Ctx } from './main';

export function initMoments({ gsap }: Ctx) {
  const frame = document.querySelector<HTMLElement>('[data-moments-frame]');
  if (!frame) return;
  gsap.matchMedia().add('(prefers-reduced-motion: no-preference)', () => {
    gsap.fromTo(frame, { rotate: -7, y: 40 }, { rotate: 0, y: 0, ease: 'none', scrollTrigger: { trigger: frame, start: 'top bottom', end: 'center 55%', scrub: 0.6 } });
  });
}
