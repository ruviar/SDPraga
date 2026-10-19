// Punto de entrada: Lenis (scroll suave) sincronizado con el ticker de GSAP + módulos por sección.
import { gsap } from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { SplitText } from 'gsap/SplitText';
import Lenis from 'lenis';
import { initButtons } from './buttons';
import { initNav } from './nav';
import { initStory } from './story';
import { initValues } from './values';
import { initFamily } from './family';
import { initSponsors } from './sponsors';
import { initContact } from './contact';
import { initMoments } from './moments';

gsap.registerPlugin(ScrollTrigger, SplitText);
gsap.defaults({ ease: 'expo.out', duration: 0.9 });

const reduce = matchMedia('(prefers-reduced-motion: reduce)').matches;

let lenis: Lenis | null = null;
if (!reduce) {
  lenis = new Lenis({ lerp: 0.12, anchors: false });
  lenis.on('scroll', ScrollTrigger.update);
  gsap.ticker.add((t) => lenis?.raf(t * 1000));
  gsap.ticker.lagSmoothing(0);
}

export type Ctx = {
  gsap: typeof gsap;
  ScrollTrigger: typeof ScrollTrigger;
  SplitText: typeof SplitText;
  lenis: Lenis | null;
};
const ctx: Ctx = { gsap, ScrollTrigger, SplitText, lenis };

// Arranque troceado: cada módulo en su propia tarea para no bloquear el hilo principal
// (TBT). El orden sigue al DOM para que ScrollTrigger mida en secuencia.
const steps: Array<() => void> = [
  initButtons,
  () => initNav(ctx),
  () => initStory(ctx),
  () => initValues(ctx),
  () => initFamily(ctx),
  () => initMoments(ctx),
  () => initSponsors(ctx),
  () => initContact(ctx),
];
const nextTask = () => new Promise<void>((r) => setTimeout(r, 0));
(async () => {
  for (const step of steps) {
    step();
    await nextTask();
  }
  ScrollTrigger.refresh();
  // Las fuentes y las secciones con content-visibility cambian alturas al pintarse:
  // recalcular posiciones cuando cambie el alto de la página.
  document.fonts?.ready.then(() => ScrollTrigger.refresh());
  let lastH = document.documentElement.scrollHeight;
  let t: number | undefined;
  new ResizeObserver(() => {
    const h = document.documentElement.scrollHeight;
    if (Math.abs(h - lastH) < 2) return;
    lastH = h;
    clearTimeout(t);
    t = window.setTimeout(() => ScrollTrigger.refresh(), 150);
  }).observe(document.body);
})();
