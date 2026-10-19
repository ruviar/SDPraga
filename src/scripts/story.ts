// Historia (solo movimiento vertical): el título sube palabra a palabra y, en cada banda,
// el encabezado y el texto suben al entrar. La foto de los Mazo cae y se asienta, y la
// pista del saque inicial se dibuja.
import type { Ctx } from './main';

export function initStory({ gsap, SplitText }: Ctx) {
  const section = document.querySelector<HTMLElement>('[data-story]');
  if (!section) return;
  const title = section.querySelector<HTMLElement>('[data-story-title]')!;
  const bands = gsap.utils.toArray<HTMLElement>('[data-chapter]', section);

  gsap.matchMedia().add('(prefers-reduced-motion: no-preference)', () => {
    const split = SplitText.create(title, { type: 'words', mask: 'words' });
    gsap.from(split.words, { yPercent: 105, stagger: 0.07, duration: 1, scrollTrigger: { trigger: title, start: 'top 85%' } });

    for (const band of bands) {
      gsap.from(band.querySelectorAll('.chapter__head, [data-reveal]'), {
        y: 44,
        opacity: 0,
        stagger: 0.1,
        duration: 1,
        scrollTrigger: { trigger: band, start: 'top 72%' },
      });
    }

    // 02 · la copia impresa baja girada y se asienta
    const print = section.querySelector('[data-print]');
    if (print) {
      gsap.fromTo(
        print,
        { y: -60, rotate: 7, opacity: 0 },
        { y: 0, rotate: -2.5, opacity: 1, duration: 1.1, ease: 'power3.out', scrollTrigger: { trigger: print, start: 'top 85%' } },
      );
    }
    // 04 · la pista del saque inicial se dibuja
    const kick = section.querySelector<HTMLElement>('[data-kickoff] .court');
    if (kick) {
      gsap.fromTo(kick, { '--draw': 0 }, { '--draw': 1, duration: 1.6, ease: 'power3.inOut', scrollTrigger: { trigger: kick.closest('[data-chapter]'), start: 'top 65%' } });
    }
    return () => split.revert();
  });
}
