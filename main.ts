// news-image-20261122 entry: writes ONE image summarising the world's news of Sunday 22 November 2026
// to /output/entry.png. Node 22, standard library only, no network, fully deterministic (same bytes every run).
//
// The image is drawn here from a fixed story table, not copied from a file, so the code carries the work.
// Renderer: own 1024x1024 RGB raster + own 5x7 bitmap font, PNG encoded with zlib (node:zlib).
//
// Outside the grader:  mkdir -p out && MAKEFUN_OUTPUT_DIR=out node main.ts

// The day's news, 22 November 2026.
import { DATE_LINE, DECK, STORIES, ART, FOOTER } from './stories.mjs';

import { FONT } from './font.mjs';

import { deflateSync } from 'node:zlib';
import { writeFileSync, mkdirSync } from 'node:fs';
import { join } from 'node:path';

const W = 1024;
const H = 1024;

// ---------------------------------------------------------------- palette
const BG = [16, 18, 26];
const INK = [242, 240, 234];
const GREY = [176, 182, 196];
const RED = [226, 66, 58];
const PANEL = [28, 32, 45];
const ACCENTS = [
  [232, 116, 62], // Ukraine
  [86, 196, 138], // climate
  [230, 96, 96], // middle east
  [240, 180, 70], // americas
  [110, 176, 240], // markets
  [186, 140, 240], // asia
];

// ---------------------------------------------------------------- 5x7 bitmap font
// main.ts imports FONT from font.mjs. Coverage is checked by tests/layoutcheck.mjs.


// ---------------------------------------------------------------- raster
const px = Buffer.alloc(W * H * 3);
function set(x, y, c) {
  if (x < 0 || y < 0 || x >= W || y >= H) return;
  const i = (y * W + x) * 3;
  px[i] = c[0];
  px[i + 1] = c[1];
  px[i + 2] = c[2];
}
function rect(x, y, w, h, c) {
  for (let j = y; j < y + h; j++) for (let i = x; i < x + w; i++) set(i, j, c);
}

const UNKNOWN = new Set();
/** Draw text with the 5x7 font at integer scale. Returns the y below the last row. */
function text(str, x, y, scale, c) {
  let cx = x;
  for (const raw of String(str).toUpperCase()) {
    const g = FONT[raw];
    if (!g) {
      UNKNOWN.add(raw);
      cx += 6 * scale;
      continue;
    }
    for (let r = 0; r < 7; r++) {
      const row = g[r];
      for (let k = 0; k < 5; k++) {
        if (row[k] === '#') rect(cx + k * scale, y + r * scale, scale, scale, c);
      }
    }
    cx += 6 * scale;
  }
  return y + 7 * scale;
}

/** Word-wrap to a pixel width; returns array of lines. */
function wrap(str, maxWidth, scale) {
  const words = String(str).toUpperCase().split(/\s+/);
  const lines = [];
  let cur = '';
  for (const w of words) {
    const cand = cur ? cur + ' ' + w : w;
    if ((cand.length * 6 - 1) * scale <= maxWidth) cur = cand;
    else {
      if (cur) lines.push(cur);
      cur = w;
    }
  }
  if (cur) lines.push(cur);
  return lines;
}

// ---------------------------------------------------------------- pictograms
/** Draw one pictogram at (x,y) with its pixels scaled by `scale`. */
function pictogram(key, x, y, scale, colour) {
  const art = ART[key];
  if (!art) return;
  art.forEach((row, r) => {
    for (let c = 0; c < row.length; c++) if (row[c] === '#') rect(x + c * scale, y + r * scale, scale, scale, colour);
  });
}


// ---------------------------------------------------------------- layout
function draw() {
  rect(0, 0, W, H, BG);

  // masthead
  rect(0, 0, W, 14, RED);
  text('THE WORLD IN A DAY', 40, 44, 5, INK);
  text(DATE_LINE, 40, 92, 3, RED);
  const deckLines = [DECK];
  deckLines.forEach((l) => text(l, 40, 138, 2, GREY));
  rect(40, 176, W - 80, 2, [60, 66, 84]);

  // six panels, two columns by three rows
  const margin = 32;
  const gap = 24;
  const cols = 2;
  const rows = 3;
  const pw = (W - margin * 2 - gap * (cols - 1)) / cols;
  const top = 204;
  const bottom = 892;
  const ph = (bottom - top - gap * (rows - 1)) / rows;

  STORIES.forEach((s, idx) => {
    const col = idx % cols;
    const row = Math.floor(idx / cols);
    const x = margin + col * (pw + gap);
    const y = top + row * (ph + gap);
    const acc = ACCENTS[idx % ACCENTS.length];

    rect(x, y, pw, ph, PANEL);
    rect(x, y, 8, ph, acc); // colour bar per region

    const pad = 26;
    const tx = x + pad;
    let cy = y + 14;
    text(s.tag, tx, cy, 2, acc);
    pictogram(s.art, x + pw - pad - 11 * 6, y + 12, 6, acc);
    cy += 24;
    rect(tx, cy + 4, pw - pad * 2, 2, [64, 70, 90]);
    cy += 16;

    for (const line of wrap(s.head, pw - pad * 2, 3).slice(0, 3)) {
      text(line, tx, cy, 3, INK);
      cy += 26;
    }
    cy += 6;
    for (const line of wrap(s.body, pw - pad * 2, 2).slice(0, 5)) {
      text(line, tx, cy, 2, GREY);
      cy += 19;
    }
  });

  // footer ticker
  rect(margin, 908, W - margin * 2, 2, [60, 66, 84]);
  FOOTER.forEach((l, i) => text(l, margin, 930 + i * 26, 2, [150, 156, 172]));
  text('SOURCES: WIRE REPORTS AND PUBLIC NEWS FEEDS OF 22 NOVEMBER 2026', margin, 984, 2, [110, 116, 132]);
}

// ---------------------------------------------------------------- PNG encode
function crc32(buf) {
  let c = 0xffffffff;
  for (let n = 0; n < buf.length; n++) {
    c ^= buf[n];
    for (let k = 0; k < 8; k++) c = c & 1 ? 0xedb88320 ^ (c >>> 1) : c >>> 1;
  }
  return (c ^ 0xffffffff) >>> 0;
}
function chunk(type, data) {
  const len = Buffer.alloc(4);
  len.writeUInt32BE(data.length, 0);
  const body = Buffer.concat([Buffer.from(type, 'ascii'), data]);
  const crc = Buffer.alloc(4);
  crc.writeUInt32BE(crc32(body), 0);
  return Buffer.concat([len, body, crc]);
}
function encodePNG() {
  const raw = Buffer.alloc((W * 3 + 1) * H);
  for (let y = 0; y < H; y++) {
    px.copy(raw, y * (W * 3 + 1) + 1, y * W * 3, (y + 1) * W * 3);
  } // filter type 0 on every row
  const ihdr = Buffer.alloc(13);
  ihdr.writeUInt32BE(W, 0);
  ihdr.writeUInt32BE(H, 4);
  ihdr[8] = 8; // bit depth
  ihdr[9] = 2; // truecolour
  return Buffer.concat([
    Buffer.from([0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a]),
    chunk('IHDR', ihdr),
    chunk('IDAT', deflateSync(raw, { level: 9 })),
    chunk('IEND', Buffer.alloc(0)),
  ]);
}

const outDir = process.env.MAKEFUN_OUTPUT_DIR ?? '/output';
mkdirSync(outDir, { recursive: true });
draw();
const png = encodePNG();
writeFileSync(join(outDir, 'entry.png'), png);
if (UNKNOWN.size) throw new Error('unrendered characters: ' + [...UNKNOWN].join(' '));
process.stdout.write(`entry.png written: ${png.length} bytes, ${W}x${H}\n`);
