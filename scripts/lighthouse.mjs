// Lighthouse (móvil, Moto G Power simulado) contra un servidor con compresión, como en producción.
// Uso: npx serve dist -l 4323  (otra terminal)  y luego: node scripts/lighthouse.mjs [URL] [n.º de pasadas]
import { execFileSync } from 'node:child_process';
import fs from 'node:fs';
const URL = process.argv[2] || 'http://localhost:4323/';
const runs = +(process.argv[3] || 3);
fs.mkdirSync('.claude/qa/lighthouse', { recursive: true });
const rows = [];
for (let i = 1; i <= runs; i++) {
  const out = `.claude/qa/lighthouse/run-${i}`;
  try {
    execFileSync('npx', ['-y', 'lighthouse@12', URL, '--quiet', '--chrome-flags=--headless=new', '--output=json', '--output=html', `--output-path=${out}`, '--only-categories=performance,accessibility,best-practices,seo'], { stdio: 'ignore', shell: true });
  } catch {} // en Windows chrome-launcher falla al borrar su carpeta temporal, el informe ya está escrito
  const r = JSON.parse(fs.readFileSync(`${out}.report.json`, 'utf8'));
  const a = r.audits;
  rows.push({
    run: i,
    perf: Math.round(r.categories.performance.score * 100),
    a11y: Math.round(r.categories.accessibility.score * 100),
    bp: Math.round(r.categories['best-practices'].score * 100),
    seo: Math.round(r.categories.seo.score * 100),
    FCP: a['first-contentful-paint'].displayValue,
    LCP: a['largest-contentful-paint'].displayValue,
    TBT: a['total-blocking-time'].displayValue,
    CLS: a['cumulative-layout-shift'].displayValue,
    SI: a['speed-index'].displayValue,
  });
}
console.table(rows);
fs.writeFileSync('.claude/qa/lighthouse/summary.json', JSON.stringify(rows, null, 2));
