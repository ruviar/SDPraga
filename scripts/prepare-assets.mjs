// Prepara todos los activos derivados a partir de src/assets/source (solo lectura).
// Uso: npm run assets
//  - Vectoriza el escudo (potrace por capas de color) y lo compara por superposición con el original.
//  - Corrige la perspectiva de img1 (homografía de 4 puntos) y recorta al marco.
//  - Recorta img2, recorta márgenes de logos (Travion: fondo negro -> alfa).
//  - Genera AVIF + WebP + JPG/PNG en varios anchos + manifest para <picture>.
//  - Genera favicon, apple-touch-icon, imagen OG y métricas de fuentes fallback (size-adjust).
import sharp from 'sharp';
import fs from 'node:fs/promises';
import potrace from 'potrace';
import { fromFile } from '@capsizecss/unpack/fs';

const SRC = 'src/assets/source';
const PUB = 'public/img';
const GEN = 'src/generated';
const QA = '.claude/qa';
await Promise.all([PUB, GEN, QA].map((d) => fs.mkdir(d, { recursive: true })));

const manifest = {};
const hex = (c) => '#' + c.map((v) => Math.round(v).toString(16).padStart(2, '0')).join('').toUpperCase();

/* ------------------------------------------------------------------ */
/* Derivados responsive                                                */
/* ------------------------------------------------------------------ */
async function derive(name, input, { widths, formats = ['avif', 'webp', 'jpg'], alpha = false }) {
  const img = sharp(input);
  const meta = await img.metadata();
  const usable = widths.filter((w) => w <= meta.width);
  if (!usable.includes(meta.width) && usable.length < widths.length) usable.push(meta.width);
  const out = { width: meta.width, height: meta.height, widths: usable, formats, alpha };
  for (const w of usable) {
    for (const f of formats) {
      let p = sharp(input).resize({ width: w, kernel: 'lanczos3' });
      if (f === 'avif') p = p.avif({ quality: alpha ? 70 : 55, effort: 6 });
      if (f === 'webp') p = p.webp({ quality: alpha ? 90 : 78, effort: 6, alphaQuality: 100 });
      if (f === 'jpg') p = p.flatten({ background: '#FDFAF5' }).jpeg({ quality: 80, mozjpeg: true, progressive: true });
      if (f === 'png') p = p.png({ compressionLevel: 9, palette: false });
      await p.toFile(`${PUB}/${name}-${w}.${f}`);
    }
  }
  manifest[name] = out;
  console.log(`  ${name}: ${meta.width}x${meta.height} -> [${usable.join(', ')}] ${formats.join('/')}`);
}

/* ------------------------------------------------------------------ */
/* 1. Escudo: clasificación por color + potrace por capas              */
/* ------------------------------------------------------------------ */
// Clasificador robusto (cromático primero, luminancia después). El umbral de cada par
// está en ~50 % de mezcla para que los bordes vectoriales caigan donde el original.
const CREAM = 0, DARK = 1, BLUE = 2, RED = 3;
function classify(r, g, b) {
  if (r - b > 80) return RED;
  if (b - r > 65) return BLUE;
  return 0.2126 * r + 0.7152 * g + 0.0722 * b > 135 ? CREAM : DARK;
}

function classMap(data, W, H, C) {
  const cls = new Uint8Array(W * H);
  for (let i = 0; i < W * H; i++) cls[i] = classify(data[i * C], data[i * C + 1], data[i * C + 2]);
  return cls;
}

function floodOutside(cls, W, H) {
  const out = new Uint8Array(W * H);
  const stack = [];
  for (let x = 0; x < W; x++) stack.push(x, (H - 1) * W + x);
  for (let y = 0; y < H; y++) stack.push(y * W, y * W + W - 1);
  while (stack.length) {
    const i = stack.pop();
    if (out[i] || cls[i] !== CREAM) continue;
    out[i] = 1;
    const x = i % W, y = (i / W) | 0;
    if (x > 0) stack.push(i - 1);
    if (x < W - 1) stack.push(i + 1);
    if (y > 0) stack.push(i - W);
    if (y < H - 1) stack.push(i + W);
  }
  return out;
}

async function maskToPng(mask, W, H) {
  const buf = Buffer.alloc(W * H);
  for (let i = 0; i < W * H; i++) buf[i] = mask[i] ? 0 : 255;
  return sharp(buf, { raw: { width: W, height: H, channels: 1 } }).png().toBuffer();
}

function trace(png) {
  return new Promise((res, rej) => {
    const p = new potrace.Potrace({
      turdSize: 10,
      alphaMax: 1,
      optCurve: true,
      optTolerance: 0.2,
      threshold: 128,
      blackOnWhite: true,
      turnPolicy: potrace.Potrace.TURNPOLICY_MINORITY,
    });
    p.loadImage(png, (err) => {
      if (err) return rej(err);
      const tag = p.getPathTag('#000');
      const d = (tag.match(/ d="([^"]+)"/) || [])[1] || '';
      // Enteros en espacio 2x = 0,5 px en el original (<0,25 px a tamaño de hero)
      res(d.replace(/-?\d+\.\d+/g, (n) => String(Math.round(parseFloat(n)))).replace(/\s+/g, ' ').trim());
    });
  });
}

async function vectorizeEscudo() {
  console.log('Escudo: vectorizando…');
  const S = 2;
  const { data, info } = await sharp(`${SRC}/escudo.jpeg`)
    .resize(1024 * S, 1536 * S, { kernel: 'lanczos3' })
    .raw()
    .toBuffer({ resolveWithObject: true });
  const W = info.width, H = info.height, C = info.channels;
  const cls = classMap(data, W, H, C);
  const outside = floodOutside(cls, W, H);
  const inside = outside.map((v) => (v ? 0 : 1));

  // Bounding box del escudo
  let minX = W, minY = H, maxX = 0, maxY = 0;
  for (let y = 0; y < H; y++) for (let x = 0; x < W; x++) if (inside[y * W + x]) {
    if (x < minX) minX = x; if (x > maxX) maxX = x; if (y < minY) minY = y; if (y > maxY) maxY = y;
  }

  // Línea negra que separa la banda azul de las franjas (columna al 30 %, lejos del balón)
  const colX = Math.round(W * 0.3);
  let divTop = 0, divBottom = 0;
  for (let y = Math.round(H * 0.36); y < Math.round(H * 0.5); y++) {
    const c = cls[y * W + colX];
    if (!divTop && c === DARK) divTop = y;
    if (divTop && c !== DARK) { divBottom = y; break; }
  }
  const divMid = Math.round((divTop + divBottom) / 2);

  // Colores reales muestreados (media por clase dentro del escudo)
  const acc = [[0, 0, 0, 0], [0, 0, 0, 0], [0, 0, 0, 0], [0, 0, 0, 0]];
  for (let i = 0; i < W * H; i++) if (inside[i]) {
    const k = cls[i];
    // solo píxeles interiores de cada clase (evita mezclas de borde)
    const x = i % W;
    if (x < 2 || x > W - 3 || cls[i - 2] !== k || cls[i + 2] !== k || cls[i - 2 * W] !== k || cls[i + 2 * W] !== k) continue;
    acc[k][0] += data[i * C]; acc[k][1] += data[i * C + 1]; acc[k][2] += data[i * C + 2]; acc[k][3]++;
  }
  const col = acc.map((a) => hex([a[0] / a[3], a[1] / a[3], a[2] / a[3]]));

  const N = W * H;
  const sil = inside;
  const band = new Uint8Array(N), letters = new Uint8Array(N), field = new Uint8Array(N), red = new Uint8Array(N);
  for (let i = 0; i < N; i++) {
    if (!inside[i]) continue;
    const y = (i / W) | 0, c = cls[i];
    if (y < divMid) {
      if (c !== DARK) band[i] = 1;
      if (c === CREAM && y < divTop) letters[i] = 1;
    } else if (y > divBottom) {
      if (c === CREAM || c === RED) field[i] = 1;
      if (c === RED) red[i] = 1;
    }
  }
  // La banda azul incluye las letras (sin huecos): la capa de letras va encima.
  const layers = [
    { id: 'sil', mask: sil, fill: col[DARK] },
    { id: 'band', mask: band, fill: col[BLUE] },
    { id: 'letters', mask: letters, fill: col[CREAM] },
    { id: 'field', mask: field, fill: col[CREAM] },
    { id: 'red', mask: red, fill: col[RED] },
  ];
  // Limpieza: los artefactos JPEG (halo oscuro alrededor de letras y bordes) generan
  // astillas de pocos px; se descartan subtrazados con caja < MIN_AREA (espacio 2x).
  // Banda y silueta: solo el contorno principal (las letras van en su propia capa).
  const MIN_AREA = 600;
  const bboxArea = (sp) => {
    const n = sp.match(/-?\d+(\.\d+)?/g).map(Number);
    const xs = n.filter((_, i) => i % 2 === 0), ys = n.filter((_, i) => i % 2 === 1);
    return (Math.max(...xs) - Math.min(...xs)) * (Math.max(...ys) - Math.min(...ys));
  };
  for (const l of layers) {
    const raw = await trace(await maskToPng(l.mask, W, H));
    let subs = raw.split(/(?=M)/).map((x) => x.trim()).filter(Boolean);
    if (l.id === 'sil' || l.id === 'band') subs = [subs.reduce((a, b) => (bboxArea(b) > bboxArea(a) ? b : a))];
    else subs = subs.filter((sp) => bboxArea(sp) >= MIN_AREA);
    l.d = subs.join(' ');
    console.log(`  capa ${l.id}: ${l.fill} (${(l.d.length / 1024).toFixed(1)} KB, ${(l.d.match(/M/g) || []).length} subtrazados)`);
  }

  const pad = 6;
  const vb = [minX - pad, minY - pad, maxX - minX + 2 * pad, maxY - minY + 2 * pad];
  const viewBox = vb.join(' ');
  const pathsSvg = layers.map((l) => `<path fill="${l.fill}" fill-rule="evenodd" d="${l.d}"/>`).join('');

  // Datos para componentes (símbolo inline + silueta para extrusión 3D / máscaras)
  await fs.writeFile(
    `${GEN}/escudo.json`,
    JSON.stringify({ viewBox, aspect: vb[2] / vb[3], colors: { dark: col[DARK], blue: col[BLUE], cream: col[CREAM], red: col[RED] }, layers: layers.map(({ id, fill, d }) => ({ id, fill, d })) }),
  );
  const standalone = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="${viewBox}">${pathsSvg}</svg>`;
  await fs.writeFile('public/escudo.svg', standalone);
  await fs.writeFile('public/favicon.svg', standalone);
  const silSvg = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="${viewBox}"><path fill-rule="evenodd" d="${layers[0].d}"/></svg>`;
  await fs.writeFile('public/escudo-silueta.svg', silSvg);

  // --- Comparación por superposición con el original (1x) ---
  const full = `<svg xmlns="http://www.w3.org/2000/svg" width="1024" height="1536" viewBox="0 0 ${W} ${H}"><rect width="${W}" height="${H}" fill="${col[CREAM]}"/>${pathsSvg}</svg>`;
  const vec = await sharp(Buffer.from(full)).flatten({ background: col[CREAM] }).raw().toBuffer({ resolveWithObject: true });
  const org = await sharp(`${SRC}/escudo.jpeg`).raw().toBuffer({ resolveWithObject: true });
  const w1 = 1024, h1 = 1536;
  const cO = classMap(org.data, w1, h1, org.info.channels);
  const cV = classMap(vec.data, w1, h1, vec.info.channels);
  let edge = 0, interior = 0, badInterior = 0, badEdge = 0;
  const diff = Buffer.alloc(w1 * h1 * 3);
  for (let y = 0; y < h1; y++) for (let x = 0; x < w1; x++) {
    const i = y * w1 + x;
    let isEdge = false;
    for (let dy = -1; dy <= 1 && !isEdge; dy++) for (let dx = -1; dx <= 1; dx++) {
      const xx = x + dx, yy = y + dy;
      if (xx < 0 || yy < 0 || xx >= w1 || yy >= h1) continue;
      if (cO[yy * w1 + xx] !== cO[i]) { isEdge = true; break; }
    }
    const bad = cO[i] !== cV[i];
    if (isEdge) { edge++; if (bad) badEdge++; } else { interior++; if (bad) badInterior++; }
    const g = 0.2126 * org.data[i * 3] + 0.7152 * org.data[i * 3 + 1] + 0.0722 * org.data[i * 3 + 2];
    const base = 150 + g * 0.4;
    diff[i * 3] = bad ? 255 : base; diff[i * 3 + 1] = bad ? (isEdge ? 170 : 0) : base; diff[i * 3 + 2] = bad ? 0 : base;
  }
  await sharp(diff, { raw: { width: w1, height: h1, channels: 3 } }).png().toFile(`${QA}/escudo-diff.png`);
  // Original | vector | mitad y mitad
  const vecPng = await sharp(Buffer.from(full)).png().toBuffer();
  const halfL = await sharp(`${SRC}/escudo.jpeg`).extract({ left: 0, top: 0, width: 512, height: 1536 }).toBuffer();
  const halfR = await sharp(vecPng).extract({ left: 512, top: 0, width: 512, height: 1536 }).toBuffer();
  await sharp({ create: { width: 1024 * 3, height: 1536, channels: 3, background: '#ffffff' } })
    .composite([
      { input: `${SRC}/escudo.jpeg`, left: 0, top: 0 },
      { input: vecPng, left: 1024, top: 0 },
      { input: halfL, left: 2048, top: 0 },
      { input: halfR, left: 2560, top: 0 },
    ])
    .png()
    .toBuffer()
    .then((b) => sharp(b).resize(1536).toFile(`${QA}/escudo-compare.png`));
  const report = {
    interiorMismatchPct: +(100 * badInterior / interior).toFixed(3),
    edgeMismatchPct: +(100 * badEdge / edge).toFixed(2),
    totalMismatchPct: +(100 * (badInterior + badEdge) / (w1 * h1)).toFixed(3),
    colors: { dark: col[DARK], blue: col[BLUE], cream: col[CREAM], red: col[RED] },
    svgBytes: Buffer.byteLength(standalone),
  };
  await fs.writeFile(`${QA}/escudo-report.json`, JSON.stringify(report, null, 2));
  console.log('  superposición:', report);

  // Raster fallback con alfa (fuera del escudo transparente), recortado al escudo
  const rgba = Buffer.alloc(w1 * h1 * 4);
  const inside1 = floodOutside(cO, w1, h1);
  for (let i = 0; i < w1 * h1; i++) {
    rgba[i * 4] = org.data[i * 3]; rgba[i * 4 + 1] = org.data[i * 3 + 1]; rgba[i * 4 + 2] = org.data[i * 3 + 2];
    rgba[i * 4 + 3] = inside1[i] ? 0 : 255;
  }
  const bx = Math.floor(minX / S) - 2, by = Math.floor(minY / S) - 2;
  const bw = Math.ceil((maxX - minX) / S) + 4, bh = Math.ceil((maxY - minY) / S) + 4;
  const rasterAlpha = await sharp(rgba, { raw: { width: w1, height: h1, channels: 4 } })
    .extract({ left: bx, top: by, width: bw, height: bh })
    .png()
    .toBuffer();
  await derive('escudo', rasterAlpha, { widths: [160, 320, 640], formats: ['avif', 'webp', 'png'], alpha: true });

  return { standalone, viewBox, vb, pathsSvg, colors: col };
}

/* ------------------------------------------------------------------ */
/* 2. img1: corrección de perspectiva (homografía 4 puntos)            */
/* ------------------------------------------------------------------ */
function solve(A, b) {
  const n = b.length;
  const M = A.map((row, i) => [...row, b[i]]);
  for (let c = 0; c < n; c++) {
    let p = c;
    for (let r = c + 1; r < n; r++) if (Math.abs(M[r][c]) > Math.abs(M[p][c])) p = r;
    [M[c], M[p]] = [M[p], M[c]];
    for (let r = 0; r < n; r++) {
      if (r === c) continue;
      const f = M[r][c] / M[c][c];
      for (let k = c; k <= n; k++) M[r][k] -= f * M[c][k];
    }
  }
  return M.map((row, i) => row[n] / row[i]);
}
// Homografía dst(u,v) -> src(x,y)
function homography(dst, src) {
  const A = [], b = [];
  for (let i = 0; i < 4; i++) {
    const [u, v] = dst[i], [x, y] = src[i];
    A.push([u, v, 1, 0, 0, 0, -u * x, -v * x]); b.push(x);
    A.push([0, 0, 0, u, v, 1, -u * y, -v * y]); b.push(y);
  }
  const h = solve(A, b);
  return (u, v) => {
    const w = h[6] * u + h[7] * v + 1;
    return [(h[0] * u + h[1] * v + h[2]) / w, (h[3] * u + h[4] * v + h[5]) / w];
  };
}

async function warpPortada() {
  console.log('Portada: corrigiendo perspectiva…');
  const { data, info } = await sharp(`${SRC}/img1.jpeg`).raw().toBuffer({ resolveWithObject: true });
  const W = info.width, H = info.height, C = info.channels;
  // Esquinas del marco en px originales (1536x2048), calibradas con rejilla (.claude/qa).
  // BL cae ~10 px por debajo del borde de la foto: se rellena con el borde más cercano.
  const src = [[98, 133], [1278, 296], [1264, 1680], [224, 2058]];
  const OW = 1200, OH = 1667; // proporción ≈ 0,72 (marco 50x70)
  const dst = [[0, 0], [OW, 0], [OW, OH], [0, OH]];
  const map = homography(dst, src);
  const out = Buffer.alloc(OW * OH * 3);
  for (let v = 0; v < OH; v++) for (let u = 0; u < OW; u++) {
    let [x, y] = map(u + 0.5, v + 0.5);
    x = Math.min(W - 1.001, Math.max(0, x - 0.5)); y = Math.min(H - 1.001, Math.max(0, y - 0.5));
    const x0 = Math.floor(x), y0 = Math.floor(y), fx = x - x0, fy = y - y0;
    const o = (v * OW + u) * 3;
    for (let k = 0; k < 3; k++) {
      const a = data[(y0 * W + x0) * C + k], b2 = data[(y0 * W + x0 + 1) * C + k];
      const c = data[((y0 + 1) * W + x0) * C + k], d = data[((y0 + 1) * W + x0 + 1) * C + k];
      out[o + k] = (a * (1 - fx) + b2 * fx) * (1 - fy) + (c * (1 - fx) + d * fx) * fy;
    }
  }
  // Recorte de 0,6 % por lado para eliminar el canto del cristal
  const cx = Math.round(OW * 0.006), cy = Math.round(OH * 0.006);
  const png = await sharp(out, { raw: { width: OW, height: OH, channels: 3 } })
    .extract({ left: cx, top: cy, width: OW - 2 * cx, height: OH - 2 * cy })
    .png()
    .toBuffer();
  await sharp(png).resize(600).toFile(`${QA}/portada-warp.png`);
  await derive('portada', png, { widths: [480, 720, 1000] });
}

/* ------------------------------------------------------------------ */
/* 3. img2: recorte caras + copa (fuera niños del fondo)               */
/* ------------------------------------------------------------------ */
async function cropMazo() {
  console.log('img2: recortando…');
  const png = await sharp(`${SRC}/img2.jpeg`)
    .extract({ left: 512, top: 102, width: 1024, height: 1127 }) // x 25–75 %, y 5–60 %
    .png()
    .toBuffer();
  await derive('mazo', png, { widths: [480, 720, 1024] });
}

/* ------------------------------------------------------------------ */
/* 4. Logos de colaboradores                                           */
/* ------------------------------------------------------------------ */
async function logos() {
  console.log('Logos: recortando…');
  // Dupla y Aguero: fondo blanco -> trim; se integran con multiply sobre crema.
  // Recorte a la caja de los píxeles con tinta real (min(R,G,B) < 170): ignora el blanco
  // y las líneas de marco casi invisibles del archivo (aguero.jpeg las tiene).
  const inkBox = async (file) => {
    const { data, info } = await sharp(file).raw().toBuffer({ resolveWithObject: true });
    let x0 = info.width, y0 = info.height, x1 = 0, y1 = 0;
    for (let y = 0; y < info.height; y++) for (let x = 0; x < info.width; x++) {
      const i = (y * info.width + x) * info.channels;
      if (Math.min(data[i], data[i + 1], data[i + 2]) < 170) { if (x < x0) x0 = x; if (x > x1) x1 = x; if (y < y0) y0 = y; if (y > y1) y1 = y; }
    }
    return { left: x0, top: y0, width: x1 - x0 + 1, height: y1 - y0 + 1 };
  };
  for (const n of ['dupla', 'aguero']) {
    const t = await sharp(`${SRC}/${n}.jpeg`).extract(await inkBox(`${SRC}/${n}.jpeg`)).png().toBuffer();
    const m = await sharp(t).metadata();
    const padded = await sharp(t)
      .extend({ top: Math.round(m.height * 0.04), bottom: Math.round(m.height * 0.04), left: Math.round(m.width * 0.04), right: Math.round(m.width * 0.04), background: '#ffffff' })
      .png()
      .toBuffer();
    await derive(`logo-${n}`, padded, { widths: [240, 480], formats: ['avif', 'webp', 'png'] });
  }
  // Travion: la transparencia original se perdió (fondo negro). Se recupera el alfa por
  // canal dominante: rojo -> alfa = R/R_puro, azul marino -> alfa = B/B_puro. Color puro intacto.
  const { data, info } = await sharp(`${SRC}/travion.jpeg`).raw().toBuffer({ resolveWithObject: true });
  const N = info.width * info.height;
  const NAVY = [0x0a, 0x24, 0x61], REDT = [0xd6, 0x1c, 0x29];
  const rgba = Buffer.alloc(N * 4);
  for (let i = 0; i < N; i++) {
    const r = data[i * 3], g = data[i * 3 + 1], b = data[i * 3 + 2];
    const isRed = r > b;
    const pure = isRed ? REDT : NAVY;
    const a = Math.min(1, isRed ? r / pure[0] : b / pure[2]);
    const a8 = a < 0.06 ? 0 : Math.round(a * 255);
    rgba[i * 4] = pure[0]; rgba[i * 4 + 1] = pure[1]; rgba[i * 4 + 2] = pure[2]; rgba[i * 4 + 3] = a8;
  }
  const t = await sharp(rgba, { raw: { width: info.width, height: info.height, channels: 4 } }).trim({ threshold: 10 }).png().toBuffer();
  const m = await sharp(t).metadata();
  const padded = await sharp(t)
    .extend({ top: Math.round(m.height * 0.08), bottom: Math.round(m.height * 0.08), left: Math.round(m.height * 0.08), right: Math.round(m.height * 0.08), background: { r: 0, g: 0, b: 0, alpha: 0 } })
    .png()
    .toBuffer();
  await derive('logo-travion', padded, { widths: [320, 640], formats: ['avif', 'webp', 'png'], alpha: true });
}

/* ------------------------------------------------------------------ */
/* 5. Ilustración del equipo (sin retoque)                             */
/* ------------------------------------------------------------------ */
async function equipo() {
  console.log('Equipo: derivados…');
  await derive('equipo', `${SRC}/equipo.jpeg`, { widths: [640, 960, 1280, 1402] });
}

/* ------------------------------------------------------------------ */
/* 6. Iconos y Open Graph a partir del escudo vectorial                */
/* ------------------------------------------------------------------ */
async function icons({ viewBox, vb, pathsSvg }) {
  console.log('Iconos y OG…');
  const ar = vb[2] / vb[3];
  const iconSvg = (size, padRatio, bg) => {
    const h = size * (1 - 2 * padRatio), w = h * ar;
    const x = (size - w) / 2, y = (size - h) / 2;
    return Buffer.from(`<svg xmlns="http://www.w3.org/2000/svg" width="${size}" height="${size}">${bg ? `<rect width="${size}" height="${size}" fill="${bg}"/>` : ''}<svg x="${x}" y="${y}" width="${w}" height="${h}" viewBox="${viewBox}">${pathsSvg}</svg></svg>`);
  };
  await sharp(iconSvg(32, 0.02)).png().toFile('public/favicon-32.png');
  await sharp(iconSvg(180, 0.1, '#FDFAF5')).png().toFile('public/apple-touch-icon.png');

  // OG 1200x630: azul de camiseta -> marino, pista en cian, franjas del escudo como zócalo.
  const OW = 1200, OHt = 630;
  const eh = 470, ew = eh * ar;
  let stripes = '';
  const sw = OW / 7;
  for (let i = 0; i < 7; i++) stripes += `<rect x="${i * sw}" y="${OHt - 32}" width="${sw + 1}" height="32" fill="${i % 2 ? '#FDFAF5' : '#CB302C'}"/>`;
  const og = `<svg xmlns="http://www.w3.org/2000/svg" width="${OW}" height="${OHt}">
  <defs><linearGradient id="g" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#0A35BC"/><stop offset=".6" stop-color="#074D88"/><stop offset="1" stop-color="#08122B"/></linearGradient>
  <radialGradient id="r" cx=".5" cy=".45" r=".45"><stop offset="0" stop-color="#1D4FD0" stop-opacity=".9"/><stop offset="1" stop-color="#1D4FD0" stop-opacity="0"/></radialGradient></defs>
  <rect width="${OW}" height="${OHt}" fill="url(#g)"/><rect width="${OW}" height="${OHt}" fill="url(#r)"/>
  <g fill="none" stroke="#50C4F5" stroke-opacity=".28" stroke-width="3"><rect x="40" y="36" width="1120" height="520"/><line x1="600" y1="36" x2="600" y2="556"/><circle cx="600" cy="296" r="92"/></g>
  <rect y="${OHt - 36}" width="${OW}" height="4" fill="#0F1511"/>${stripes}
  <g style="filter:drop-shadow(0 14px 18px rgba(0,0,0,.45))"><svg x="${(OW - ew) / 2}" y="${(OHt - 36 - eh) / 2}" width="${ew}" height="${eh}" viewBox="${viewBox}">${pathsSvg}</svg></g></svg>`;
  await sharp(Buffer.from(og)).png({ compressionLevel: 9 }).toFile('public/og.png');
}

/* ------------------------------------------------------------------ */
/* 7. Métricas de fuentes fallback (evita CLS al cargar las web fonts) */
/* ------------------------------------------------------------------ */
async function fontFallbacks() {
  console.log('Fuentes: métricas fallback…');
  const arial = { unitsPerEm: 2048, xWidthAvg: 904 };
  const fonts = [
    { family: 'Anybody Fallback', file: 'node_modules/@fontsource-variable/anybody/files/anybody-latin-wdth-normal.woff2' },
    { family: 'Instrument Sans Fallback', file: 'node_modules/@fontsource-variable/instrument-sans/files/instrument-sans-latin-wght-normal.woff2' },
  ];
  let css = '/* Generado por scripts/prepare-assets.mjs: fallbacks métricamente ajustados (CLS 0). */\n';
  for (const f of fonts) {
    const m = await fromFile(f.file);
    const sizeAdjust = m.xWidthAvg / m.unitsPerEm / (arial.xWidthAvg / arial.unitsPerEm);
    const pct = (v) => `${(v * 100).toFixed(2)}%`;
    css += `@font-face {\n  font-family: '${f.family}';\n  src: local('Arial'), local('ArialMT'), local('Helvetica'), local('Liberation Sans');\n  size-adjust: ${pct(sizeAdjust)};\n  ascent-override: ${pct(m.ascent / (m.unitsPerEm * sizeAdjust))};\n  descent-override: ${pct(Math.abs(m.descent) / (m.unitsPerEm * sizeAdjust))};\n  line-gap-override: ${pct(m.lineGap / (m.unitsPerEm * sizeAdjust))};\n}\n`;
  }
  await fs.writeFile('src/styles/fallbacks.css', css);
}


/* ------------------------------------------------------------------ */
/* 8. Grano de papel (ruido determinista, se usa al 3,5 % de opacidad) */
/* ------------------------------------------------------------------ */
async function grain() {
  const S = 120;
  const buf = Buffer.alloc(S * S);
  let seed = 20260519;
  for (let i = 0; i < S * S; i++) {
    seed = (seed * 1664525 + 1013904223) >>> 0;
    buf[i] = 96 + (seed >>> 24) * 0.62;
  }
  await sharp(buf, { raw: { width: S, height: S, channels: 1 } }).webp({ quality: 30 }).toFile(`${PUB}/grain.webp`);
}

await fs.mkdir('src/styles', { recursive: true });
const esc = await vectorizeEscudo();
await warpPortada();
await cropMazo();
await logos();
await equipo();
await icons(esc);
await fontFallbacks();
await grain();
await fs.writeFile(`${GEN}/images.json`, JSON.stringify(manifest, null, 2));
console.log('Listo.');
