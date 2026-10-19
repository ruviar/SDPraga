// Valida contraste WCAG de los pares de color usados en la web y exporta OKLCH de los tokens.
// Uso: node scripts/contrast.mjs  -> .claude/qa/contrast.md
import fs from 'node:fs';
const T = {
  'azul-escudo': '#074D88', 'azul-camiseta': '#0A35BC', marino: '#08122B', rojo: '#CB302C',
  crema: '#FDFAF5', cian: '#50C4F5', oro: '#F2B21B', 'crema-2': '#F3EDE2', 'tinta-2': '#3A4257',
  'claro-2': '#D2DCE6', 'rojo-texto': '#B02E2D', 'rojo-osc': '#A42623', 'azul-medio': '#0A41A6',
};
const rgb = (h) => [1, 3, 5].map((i) => parseInt(h.slice(i, i + 2), 16) / 255);
const lin = (c) => (c <= 0.04045 ? c / 12.92 : ((c + 0.055) / 1.055) ** 2.4);
const L = (h) => { const [r, g, b] = rgb(h).map(lin); return 0.2126 * r + 0.7152 * g + 0.0722 * b; };
const ratio = (a, b) => { const [x, y] = [L(a), L(b)].sort((p, q) => q - p); return (x + 0.05) / (y + 0.05); };
function oklch(h) {
  const [r, g, b] = rgb(h).map(lin);
  const l = Math.cbrt(0.4122214708 * r + 0.5363325363 * g + 0.0514459929 * b);
  const m = Math.cbrt(0.2119034982 * r + 0.6806995451 * g + 0.1073969566 * b);
  const s = Math.cbrt(0.0883024619 * r + 0.2817188376 * g + 0.6299787005 * b);
  const Lk = 0.2104542553 * l + 0.793617785 * m - 0.0040720468 * s;
  const A = 1.9779984951 * l - 2.428592205 * m + 0.4505937099 * s;
  const B = 0.0259040371 * l + 0.7827717662 * m - 0.808675766 * s;
  const C = Math.hypot(A, B); let H = (Math.atan2(B, A) * 180) / Math.PI; if (H < 0) H += 360;
  return `oklch(${(Lk * 100).toFixed(1)}% ${C.toFixed(3)} ${H.toFixed(1)})`;
}
const pairs = [
  ['marino', 'crema', 'texto base'], ['tinta-2', 'crema', 'texto secundario'], ['azul-escudo', 'crema', 'titulares / enlaces'],
  ['crema', 'azul-escudo', 'texto botón primario'], ['crema', 'rojo', 'texto botón secundario'], ['rojo', 'crema', 'acentos rojos (solo grande)'],
  ['azul-camiseta', 'crema', 'acentos vivos'], ['marino', 'crema-2', 'texto sobre tarjeta'], ['crema', 'marino', 'texto sobre marino'],
  ['cian', 'marino', 'acento sobre marino'], ['oro', 'marino', 'marcador'], ['rojo', 'marino', 'rojo sobre marino (solo formas)'],
  ['marino', 'cian', 'anillo foco: marino vs cian'], ['cian', 'crema', 'cian sobre crema (no usar en texto)'],
  ['crema', 'azul-camiseta', 'texto sobre camiseta (hero, cap. 03)'], ['claro-2', 'azul-escudo', 'secundario sobre azul'],
  ['claro-2', 'marino', 'secundario sobre marino'], ['oro', 'azul-escudo', '"Sentimiento de equipo" (grande)'],
  ['oro', 'azul-camiseta', '"S.D." del hero (grande)'], ['cian', 'azul-escudo', 'operadores + = (grandes)'],
  ['cian', 'azul-medio', 'operadores sobre azul medio'], ['crema', 'rojo-osc', 'texto sobre franja oscura'],
  ['rojo-texto', 'crema-2', 'número de capítulo'], ['crema', 'azul-medio', 'texto sobre azul medio'],
];
let md = '# Contraste (WCAG 2.x)\n\nGenerado por `scripts/contrast.mjs`.\n\n| Token | Hex | OKLCH |\n|---|---|---|\n';
for (const [k, v] of Object.entries(T)) md += `| --${k} | ${v} | ${oklch(v)} |\n`;
md += '\n| Texto | Fondo | Uso | Ratio | AA normal (4.5) | AA grande (3) |\n|---|---|---|---|---|---|\n';
for (const [f, b, u] of pairs) { const r = ratio(T[f], T[b]); md += `| ${f} | ${b} | ${u} | ${r.toFixed(2)} | ${r >= 4.5 ? 'sí' : 'NO'} | ${r >= 3 ? 'sí' : 'NO'} |\n`; }
fs.mkdirSync('.claude/qa', { recursive: true });
fs.writeFileSync('.claude/qa/contrast.md', md);
console.log(md);
