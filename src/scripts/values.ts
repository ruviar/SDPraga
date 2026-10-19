// Valores: las tres palabras llegan sueltas en vertical (giradas, con anchuras distintas) y,
// con el scroll, encajan en columna igualando su ancho con el eje wdth de Anybody; después
// aparecen "+", "=" y "Sentimiento de equipo". La pista se dibuja de fondo.
import type { Ctx } from './main';

export function initValues({ gsap }: Ctx) {
  const section = document.querySelector<HTMLElement>('[data-values]');
  if (!section) return;
  const words = gsap.utils.toArray<HTMLElement>('[data-word]', section);
  const ops = gsap.utils.toArray<HTMLElement>('[data-op]', section);
  const result = section.querySelector<HTMLElement>('[data-result]')!;
  const stroke = result.querySelector<HTMLElement>('.brush__stroke');
  const court = section.querySelector<HTMLElement>('.values__court');
  const eq = section.querySelector<HTMLElement>('[data-values-eq]')!;

  // Busca el wdth (50–150) con el que cada palabra mide `target` px.
  const fitted: number[] = [];
  const fit = () => {
    const prev = words.map((w) => w.style.getPropertyValue('--wdth'));
    words.forEach((w) => w.style.setProperty('--wdth', '100'));
    const natural = words.map((w) => w.getBoundingClientRect().width);
    const avail = eq.getBoundingClientRect().width;
    const target = Math.min(Math.max(...natural), avail);
    words.forEach((w, i) => {
      let lo = 50, hi = 150;
      for (let k = 0; k < 9; k++) {
        const mid = (lo + hi) / 2;
        w.style.setProperty('--wdth', String(mid));
        if (w.getBoundingClientRect().width > target) hi = mid;
        else lo = mid;
      }
      fitted[i] = Math.round(lo * 10) / 10;
    });
    words.forEach((w, i) => w.style.setProperty('--wdth', prev[i] || String(fitted[i])));
  };

  const mm = gsap.matchMedia();
  // Solo escritorio: en móvil la ecuación se muestra montada, sin animación.
  mm.add('(prefers-reduced-motion: no-preference) and (min-width: 1024px)', (self) => {
    section.dataset.mode = 'scrub';
    // La línea de tiempo (y las mediciones del ajuste de ancho) se crean al acercarse
    // a la sección: así no pesan en la carga inicial.
    let tl: gsap.core.Timeline | null = null;
    const io = new IntersectionObserver(
      (entries) => {
        if (tl || !entries.some((e) => e.isIntersecting)) return;
        io.disconnect();
        self.add(() => (tl = build()));
      },
      { rootMargin: '120% 0px 120% 0px' },
    );
    io.observe(section);

    return () => {
      io.disconnect();
      delete section.dataset.mode;
      words.forEach((w) => w.style.removeProperty('--wdth'));
    };
  });

  function build() {
    fit();
    // Llegan en vertical: una cae desde arriba, dos suben desde abajo, giradas y con anchos distintos
    const scatter = [
      { y: '-30vh', rotate: -7, wdth: 150 },
      { y: '24vh', rotate: 6, wdth: 52 },
      { y: '50vh', rotate: -5, wdth: 128 },
    ];
    const tl = gsap.timeline({
      defaults: { ease: 'power3.inOut' },
      scrollTrigger: {
        trigger: section,
        start: 'top top',
        end: 'bottom bottom',
        scrub: 0.6,
        invalidateOnRefresh: true,
        onRefreshInit: () => fit(),
      },
    });
    if (court) tl.fromTo(court, { '--draw': 0 }, { '--draw': 1, ease: 'none', duration: 1.6 }, 0);
    words.forEach((w, i) => {
      const s = scatter[i];
      tl.fromTo(
        w,
        { y: s.y, rotate: s.rotate, '--wdth': s.wdth },
        { y: 0, rotate: 0, '--wdth': () => fitted[i], duration: 1 },
        i * 0.12,
      );
    });
    tl.fromTo(ops.slice(0, 2), { scale: 0, opacity: 0 }, { scale: 1, opacity: 1, duration: 0.3, stagger: 0.12, ease: 'back.out(2.2)' }, 1.05);
    tl.fromTo(ops[2], { scale: 0, opacity: 0 }, { scale: 1, opacity: 1, duration: 0.3, ease: 'back.out(2.2)' }, 1.4);
    tl.fromTo(result, { clipPath: 'inset(110% -5% -30% -5%)', y: 30 }, { clipPath: 'inset(-10% -5% -30% -5%)', y: 0, duration: 0.6, ease: 'power2.out' }, 1.5);
    if (stroke) tl.fromTo(stroke, { clipPath: 'inset(0 100% 0 0)' }, { clipPath: 'inset(0 0% 0 0)', duration: 0.4, ease: 'power2.out' }, 1.95);
    tl.to({}, { duration: 0.45 });
    return tl;
  }
}
