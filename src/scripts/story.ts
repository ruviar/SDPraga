// Historia (solo movimiento vertical).
// ≥768 px: páginas sticky apiladas; cuando sube la siguiente, la anterior se encoge y se
// oscurece (scrub ligado al scroll). Móvil: cada página entra con un barrido de abajo arriba.
// En ambos casos el título y los textos suben palabra a palabra / línea a línea.
import type { Ctx } from './main';

export function initStory({ gsap, SplitText }: Ctx) {
  const section = document.querySelector<HTMLElement>('[data-story]');
  if (!section) return;
  const title = section.querySelector<HTMLElement>('[data-story-title]')!;
  const pages = gsap.utils.toArray<HTMLElement>('[data-chapter]', section);

  const mm = gsap.matchMedia();
  mm.add(
    { stack: '(min-width: 768px)', reduce: '(prefers-reduced-motion: reduce)' },
    (c) => {
      const { stack, reduce } = c.conditions as { stack: boolean; reduce: boolean };
      if (reduce) return;

      const split = SplitText.create(title, { type: 'words', mask: 'words' });
      gsap.from(split.words, { yPercent: 105, stagger: 0.07, duration: 1, scrollTrigger: { trigger: title, start: 'top 85%' } });

      pages.forEach((page, i) => {
        // Contenido de cada página: sube al entrar
        gsap.from(page.querySelectorAll('.chapter__head, [data-reveal], .chapter__link'), {
          y: 48,
          opacity: 0,
          stagger: 0.09,
          duration: 1,
          scrollTrigger: { trigger: page, start: stack ? 'top 70%' : 'top 82%' },
        });

        if (stack) {
          // La página anterior se hunde mientras la siguiente sube por encima
          const next = pages[i + 1];
          if (!next) return;
          const st = { trigger: next, start: 'top bottom', end: 'top 20%', scrub: true };
          gsap.to(page, { scale: 0.93, ease: 'none', scrollTrigger: st });
          gsap.to(page.querySelector('.chapter__shade'), { opacity: 0.28, ease: 'none', scrollTrigger: { ...st } });
        } else {
          // Móvil: barrido vertical de la página
          gsap.fromTo(
            page,
            { clipPath: 'inset(14% 0% 0% 0% round 22px)' },
            { clipPath: 'inset(0% 0% 0% 0% round 22px)', duration: 1.1, ease: 'power3.inOut', scrollTrigger: { trigger: page, start: 'top 92%' } },
          );
        }
      });

      // 02 · la copia impresa cae y se asienta (vertical + giro)
      const print = section.querySelector('[data-print]');
      if (print) {
        gsap.fromTo(
          print,
          { y: 90, rotate: 9 },
          { y: 0, rotate: 2.5, ease: 'none', scrollTrigger: { trigger: print.closest('[data-chapter]'), start: 'top bottom', end: 'top 25%', scrub: 0.6 } },
        );
      }
      // 04 · la pista del saque inicial se dibuja
      const kick = section.querySelector<HTMLElement>('[data-kickoff] .court');
      if (kick) {
        gsap.fromTo(kick, { '--draw': 0 }, { '--draw': 1, duration: 1.6, ease: 'power3.inOut', scrollTrigger: { trigger: kick.closest('[data-chapter]'), start: 'top 60%' } });
      }
      return () => split.revert();
    },
  );
}
