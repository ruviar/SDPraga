// Navegación: anclas con scroll suave + foco accesible y enlace activo.
import type { Ctx } from './main';

export function initNav({ lenis }: Ctx) {
  // El panel móvil se gestiona en boot.ts (funciona antes de cargar este paquete).
  // Anclas internas: scroll suave y foco en la sección de destino
  document.addEventListener('click', (e) => {
    const a = (e.target as HTMLElement).closest<HTMLAnchorElement>('a[href^="#"]');
    if (!a) return;
    const id = a.getAttribute('href')!.slice(1);
    const target = id ? document.getElementById(id) : null;
    if (!target) return;
    e.preventDefault();
    // Maqueta todas las secciones para que la posición de destino sea exacta
    document.documentElement.classList.add('cv-off');
    const done = () => {
      if (!target.hasAttribute('tabindex')) target.setAttribute('tabindex', '-1');
      target.focus({ preventScroll: true });
    };
    // En escritorio la barra fija (68 px + franjas) tapa el borde superior
    const offset = innerWidth >= 1024 && id !== 'inicio' ? -73 : 0;
    if (lenis) lenis.scrollTo(target, { offset, duration: 1.2, onComplete: done });
    else {
      scrollTo({ top: target.getBoundingClientRect().top + scrollY + offset });
      done();
    }
    history.replaceState(null, '', `#${id}`);
  });

  // Enlace activo según la sección visible
  const links = new Map<string, HTMLAnchorElement[]>();
  document.querySelectorAll<HTMLAnchorElement>('[data-nav-link]').forEach((a) => {
    const id = a.hash.slice(1);
    links.set(id, [...(links.get(id) ?? []), a]);
  });
  const io = new IntersectionObserver(
    (entries) => {
      for (const en of entries) {
        if (!en.isIntersecting) continue;
        links.forEach((as) => as.forEach((a) => a.removeAttribute('aria-current')));
        links.get(en.target.id)?.forEach((a) => a.setAttribute('aria-current', 'location'));
      }
    },
    { rootMargin: '-45% 0px -50% 0px' },
  );
  for (const id of ['inicio', ...links.keys()]) {
    const el = document.getElementById(id);
    if (el) io.observe(el);
  }
}
