// Familia: la cortina de franjas del escudo se abre (clip-path) sobre la ilustración,
// con un zoom lento 1 -> 1.05; después el pincel subraya el lema.
import type { Ctx } from './main';

export function initFamily({ gsap }: Ctx) {
  const section = document.querySelector<HTMLElement>('[data-family]');
  if (!section) return;
  const media = section.querySelector<HTMLElement>('[data-family-media]')!;
  const bands = gsap.utils.toArray<HTMLElement>('[data-curtain] span', section);
  const img = section.querySelector<HTMLElement>('.family__img');
  const stroke = section.querySelector<HTMLElement>('.family__brush .brush__stroke');

  const mm = gsap.matchMedia();
  mm.add('(prefers-reduced-motion: no-preference)', () => {
    section.dataset.mode = 'curtain';
    gsap.fromTo(
      bands,
      { clipPath: 'inset(0% 0 0% 0)' },
      {
        clipPath: (i: number) => (i % 2 ? 'inset(100% 0 0% 0)' : 'inset(0% 0 100% 0)'),
        ease: 'power3.inOut',
        stagger: { each: 0.07, from: 'center' },
        scrollTrigger: { trigger: media, start: 'top 82%', end: 'top 22%', scrub: 0.5 },
      },
    );
    if (img) {
      gsap.fromTo(img, { scale: 1 }, { scale: 1.05, ease: 'none', scrollTrigger: { trigger: media, start: 'top bottom', end: 'bottom top', scrub: true } });
    }
    if (stroke) {
      gsap.fromTo(stroke, { clipPath: 'inset(0 100% 0 0)' }, { clipPath: 'inset(0 0% 0 0)', duration: 0.9, delay: 0.15, scrollTrigger: { trigger: stroke, start: 'top 88%' } });
    }
    return () => {
      delete section.dataset.mode;
    };
  });
}
