#!/usr/bin/env node
/**
 * news-image-20261122 entry.
 *
 * Renders ONE deterministic 1024x1024 PNG that summarises 6-10 real world-news
 * stories of 22 November 2026. Everything is drawn by hand into an RGB raster
 * with a 5x7 bitmap font, then encoded as a PNG using node:zlib only.
 *
 * Stdlib only. No network, no clock, no randomness -> two runs are byte-identical.
 * Output path: $MAKEFUN_OUTPUT_DIR/entry.png (default ./output/entry.png)
 * License: MIT
 */
import { deflateSync } from 'node:zlib';
import { mkdirSync, writeFileSync } from 'node:fs';
import { resolve } from 'node:path';

/* ------------------------------------------------------------------ */
/* 1. The news: eight real stories of 21-22 November 2026             */
/* ------------------------------------------------------------------ */
type Item = { region: string; color: [number, number, number]; text: string };

const NEWS: Item[] = [
  {
    region: 'TURKEY / GLOBAL CLIMATE',
    color: [86, 196, 138],
    text: 'COP31 in Antalya nears final deal; draft drops fossil-fuel phase-out, 1.5C already breached',
  },
  {
    region: 'FINLAND / BALTIC',
    color: [104, 176, 255],
    text: 'Russian cargo ship Sparta II hit by drones in Gulf of Finland; PM Orpo says war is spilling over',
  },
  {
    region: 'UKRAINE',
    color: [255, 214, 92],
    text: 'Ballistic missiles hit Kryvyi Rih, Zelenskyy hometown: 2 dead, 73 wounded, 25 buildings damaged',
  },
  {
    region: 'INDONESIA',
    color: [255, 138, 128],
    text: 'Magnitude 7.2 quake off Maluku, 43km NW of SW Maluku, depth 125km; no tsunami threat',
  },
  {
    region: 'INDONESIA / EU',
    color: [255, 174, 108],
    text: 'Jakarta and EU sign IEU-CEPA trade pact and Investment Protection Agreement',
  },
  {
    region: 'MYANMAR / MALAYSIA',
    color: [198, 160, 255],
    text: 'ICJ rules Myanmar committed genocide against Rohingya; Malaysia says it respects the ruling',
  },
  {
    region: 'IRAN / USA',
    color: [255, 106, 106],
    text: 'Iran calls US blockade an act of war and says its missile hit a US F-16; Centcom denies it',
  },
  {
    region: 'ETHIOPIA / BRAZIL',
    color: [120, 220, 224],
    text: '700,000 displaced by clashes in Somali and Oromia; Brazil storm kills 3, wrecks thousands of homes',
  },
];

const DATE_LINE = '22 NOVEMBER 2026';
const TITLE = 'WORLD IN BRIEF';
const FOOT_LEFT = '8 STORIES · REUTERS AP BERNAMA ANTARA RFI BORNEO POST';
const FOOT_RIGHT = 'BUILT LOCALLY · NO NETWORK · MIT';

/* ------------------------------------------------------------------ */
/* 2. 5x7 bitmap font                                                 */
/* ------------------------------------------------------------------ */
const GLYPHS: Record<string, string[]> = {
  A: ['.###.', '#...#', '#...#', '#####', '#...#', '#...#', '#...#'],
  B: ['####.', '#...#', '#...#', '####.', '#...#', '#...#', '####.'],
  C: ['.###.', '#...#', '#....', '#....', '#....', '#...#', '.###.'],
  D: ['####.', '#...#', '#...#', '#...#', '#...#', '#...#', '####.'],
  E: ['#####', '#....', '#....', '####.', '#....', '#....', '#####'],
  F: ['#####', '#....', '#....', '####.', '#....', '#....', '#....'],
  G: ['.###.', '#...#', '#....', '#.###', '#...#', '#...#', '.###.'],
  H: ['#...#', '#...#', '#...#', '#####', '#...#', '#...#', '#...#'],
  I: ['#####', '..#..', '..#..', '..#..', '..#..', '..#..', '#####'],
  J: ['..###', '...#.', '...#.', '...#.', '...#.', '#..#.', '.##..'],
  K: ['#...#', '#..#.', '#.#..', '##...', '#.#..', '#..#.', '#...#'],
  L: ['#....', '#....', '#....', '#....', '#....', '#....', '#####'],
  M: ['#...#', '##.##', '#.#.#', '#.#.#', '#...#', '#...#', '#...#'],
  N: ['#...#', '##..#', '#.#.#', '#..##', '#...#', '#...#', '#...#'],
  O: ['.###.', '#...#', '#...#', '#...#', '#...#', '#...#', '.###.'],
  P: ['####.', '#...#', '#...#', '####.', '#....', '#....', '#....'],
  Q: ['.###.', '#...#', '#...#', '#...#', '#.#.#', '#..#.', '.##.#'],
  R: ['####.', '#...#', '#...#', '####.', '#.#..', '#..#.', '#...#'],
  S: ['.####', '#....', '#....', '.###.', '....#', '....#', '####.'],
  T: ['#####', '..#..', '..#..', '..#..', '..#..', '..#..', '..#..'],
  U: ['#...#', '#...#', '#...#', '#...#', '#...#', '#...#', '.###.'],
  V: ['#...#', '#...#', '#...#', '#...#', '#...#', '.#.#.', '..#..'],
  W: ['#...#', '#...#', '#...#', '#.#.#', '#.#.#', '##.##', '#...#'],
  X: ['#...#', '#...#', '.#.#.', '..#..', '.#.#.', '#...#', '#...#'],
  Y: ['#...#', '#...#', '.#.#.', '..#..', '..#..', '..#..', '..#..'],
  Z: ['#####', '....#', '...#.', '..#..', '.#...', '#....', '#####'],
  '0': ['.###.', '#...#', '#..##', '#.#.#', '##..#', '#...#', '.###.'],
  '1': ['..#..', '.##..', '..#..', '..#..', '..#..', '..#..', '#####'],
  '2': ['.###.', '#...#', '....#', '...#.', '..#..', '.#...', '#####'],
  '3': ['####.', '....#', '....#', '.###.', '....#', '....#', '####.'],
  '4': ['...#.', '..##.', '.#.#.', '#..#.', '#####', '...#.', '...#.'],
  '5': ['#####', '#....', '####.', '....#', '....#', '#...#', '.###.'],
  '6': ['..##.', '.#...', '#....', '####.', '#...#', '#...#', '.###.'],
  '7': ['#####', '....#', '...#.', '..#..', '.#...', '.#...', '.#...'],
  '8': ['.###.', '#...#', '#...#', '.###.', '#...#', '#...#', '.###.'],
  '9': ['.###.', '#...#', '#...#', '.####', '....#', '...#.', '.##..'],
  ' ': ['.....', '.....', '.....', '.....', '.....', '.....', '.....'],
  '.': ['.....', '.....', '.....', '.....', '.....', '.##..', '.##..'],
  ',': ['.....', '.....', '.....', '.....', '.##..', '.##..', '.#...'],
  ':': ['.....', '.##..', '.##..', '.....', '.##..', '.##..', '.....'],
  '-': ['.....', '.....', '.....', '#####', '.....', '.....', '.....'],
  "'": ['..#..', '..#..', '.#...', '.....', '.....', '.....', '.....'],
  '"': ['.#.#.', '.#.#.', '.....', '.....', '.....', '.....', '.....'],
  '(': ['...#.', '..#..', '.#...', '.#...', '.#...', '..#..', '...#.'],
  ')': ['..#..', '.#...', '.#...', '.#...', '.#...', '.#...', '..#..'],
  '/': ['....#', '....#', '...#.', '..#..', '.#...', '#....', '#....'],
  '+': ['.....', '..#..', '..#..', '#####', '..#..', '..#..', '.....'],
  '!': ['..#..', '..#..', '..#..', '..#..', '..#..', '.....', '..#..'],
  '?': ['.###.', '#...#', '....#', '...#.', '..#..', '.....', '..#..'],
  '&': ['.##..', '#..#.', '#.#..', '.#...', '#.#.#', '#..#.', '.##.#'],
  '%': ['#...#', '...#.', '..#..', '.#...', '#....', '#...#', '.....'],
  '#': ['.#.#.', '#####', '.#.#.', '.#.#.', '#####', '.#.#.', '.....'],
  '*': ['.....', '#.#.#', '.###.', '#####', '.###.', '#.#.#', '.....'],
  '=': ['.....', '.....', '#####', '.....', '#####', '.....', '.....'],
  '>': ['#....', '.#...', '..#..', '...#.', '..#..', '.#...', '#....'],
  '<': ['...#.', '..#..', '.#...', '#....', '.#...', '..#..', '...#.'],
};

/* ------------------------------------------------------------------ */
/* 3. Raster                                                          */
/* ------------------------------------------------------------------ */
const W = 1024;
const H = 1024;
const px = new Uint8Array(W * H * 3); // RGB raster, 3 bytes/pixel

function blend(x: number, y: number, c: [number, number, number], a = 1): void {
  if (x < 0 || y < 0 || x >= W || y >= H) return;
  const i = (y * W + x) * 3;
  px[i] = Math.round(px[i] * (1 - a) + c[0] * a);
  px[i + 1] = Math.round(px[i + 1] * (1 - a) + c[1] * a);
  px[i + 2] = Math.round(px[i + 2] * (1 - a) + c[2] * a);
}

function fillRect(x: number, y: number, w: number, h: number, c: [number, number, number], a = 1): void {
  for (let j = y; j < y + h; j++) for (let i = x; i < x + w; i++) blend(i, j, c, a);
}

function roundRect(x: number, y: number, w: number, h: number, r: number, c: [number, number, number], a = 1): void {
  for (let j = y; j < y + h; j++) {
    for (let i = x; i < x + w; i++) {
      const dx = i < x + r ? x + r - i : i >= x + w - r ? i - (x + w - r - 1) : 0;
      const dy = j < y + r ? y + r - j : j >= y + h - r ? j - (y + h - r - 1) : 0;
      if (dx * dx + dy * dy <= r * r) blend(i, j, c, a);
    }
  }
}

/** Draw one character. scale 1 = 5x7, scale 2 = 10x14. Returns advance width. */
function drawChar(
  ch: string,
  x: number,
  y: number,
  scale: number,
  c: [number, number, number],
  a = 1,
): number {
  const g = GLYPHS[ch.toUpperCase()] ?? GLYPHS['?'];
  for (let row = 0; row < 7; row++) {
    for (let col = 0; col < 5; col++) {
      if (g[row][col] !== '#') continue;
      const bx = x + col * scale;
      const by = y + row * scale;
      if (scale === 1) blend(bx, by, c, a);
      else fillRect(bx, by, scale, scale, c, a);
    }
  }
  return 6 * scale; // 5 columns + 1 column gap
}

/** Measure a string's pixel width (advance of the last char is excluded). */
function textWidth(s: string, scale: number): number {
  return s.length * 6 * scale - scale;
}

function drawText(s: string, x: number, y: number, scale: number, c: [number, number, number], a = 1): void {
  let cx = x;
  for (const ch of s) cx += drawChar(ch, Math.round(cx), y, scale, c, a);
}

/** Greedy word wrap to a pixel width; falls back to hard breaks for long tokens. */
function wrap(s: string, scale: number, maxWidth: number): string[] {
  const words = s.split(' ');
  const lines: string[] = [];
  let line = '';
  for (const w of words) {
    const cand = line ? line + ' ' + w : w;
    if (textWidth(cand, scale) <= maxWidth) {
      line = cand;
      continue;
    }
    if (line) lines.push(line);
    if (textWidth(w, scale) > maxWidth) {
      // hard-break an over-long token
      let rest = w;
      while (textWidth(rest, scale) > maxWidth) {
        let n = 1;
        while (n < rest.length && textWidth(rest.slice(0, n + 1), scale) <= maxWidth) n++;
        lines.push(rest.slice(0, n));
        rest = rest.slice(n);
      }
      line = rest;
    } else {
      line = w;
    }
  }
  if (line) lines.push(line);
  return lines;
}

/* ------------------------------------------------------------------ */
/* 4. Layout                                                          */
/* ------------------------------------------------------------------ */
const BG: [number, number, number] = [12, 17, 27];
const PANEL: [number, number, number] = [22, 30, 46];
const FG: [number, number, number] = [236, 240, 248];
const DIM: [number, number, number] = [150, 164, 190];
const ACCENT: [number, number, number] = [255, 200, 87];

function render(): void {
  fillRect(0, 0, W, H, BG);

  // subtle vertical texture bands so the canvas is not flat
  for (let y = 0; y < H; y += 4) fillRect(0, y, W, 1, [16, 22, 35]);

  // header band
  fillRect(0, 0, W, 104, PANEL);
  fillRect(0, 104, W, 3, ACCENT);

  // accent block + title
  fillRect(40, 34, 10, 46, ACCENT);
  drawText(TITLE, 64, 40, 4, FG);
  const dateW = textWidth(DATE_LINE, 2);
  drawText(DATE_LINE, W - 40 - dateW, 52, 2, ACCENT);

  // items
  const top = 124;
  const bottom = 952;
  const n = NEWS.length;
  const slot = Math.floor((bottom - top) / n);
  const cardW = W - 80;
  for (let k = 0; k < n; k++) {
    const item = NEWS[k];
    const cy = top + k * slot;
    const ch = slot - 12;
    roundRect(40, cy, cardW, ch, 6, PANEL, 1);
    fillRect(40, cy, 6, ch, item.color); // region colour spine

    // region tag
    drawText(item.region, 66, cy + 14, 1, item.color, 1);
    // index number, right aligned
    const num = String(k + 1).padStart(2, '0');
    const numW = textWidth(num, 1);
    drawText(num, W - 40 - 14 - numW, cy + 14, 1, DIM, 1);

    // headline, up to three lines at scale 2
    const lines = wrap(item.text, 2, cardW - 52);
    const maxLines = 3;
    for (let l = 0; l < Math.min(maxLines, lines.length); l++) {
      drawText(lines[l], 66, cy + 36 + l * 20, 2, FG, 1);
    }
  }

  // footer
  fillRect(0, 960, W, 3, [56, 68, 92]);
  drawText(FOOT_LEFT, 40, 984, 1, DIM, 1);
  const frW = textWidth(FOOT_RIGHT, 1);
  drawText(FOOT_RIGHT, W - 40 - frW, 984, 1, DIM, 1);
}

/* ------------------------------------------------------------------ */
/* 5. PNG encoder (RGB, filter 0, node:zlib)                          */
/* ------------------------------------------------------------------ */
const CRC_TABLE: number[] = (() => {
  const t: number[] = [];
  for (let n = 0; n < 256; n++) {
    let c = n;
    for (let k = 0; k < 8; k++) c = c & 1 ? 0xedb88320 ^ (c >>> 1) : c >>> 1;
    t[n] = c >>> 0;
  }
  return t;
})();

function crc32(buf: Uint8Array): number {
  let c = 0xffffffff;
  for (let i = 0; i < buf.length; i++) c = CRC_TABLE[(c ^ buf[i]) & 0xff] ^ (c >>> 8);
  return (c ^ 0xffffffff) >>> 0;
}

function chunk(type: string, data: Uint8Array): Buffer {
  const out = Buffer.alloc(8 + data.length + 4);
  out.writeUInt32BE(data.length, 0);
  out.write(type, 4, 'ascii');
  Buffer.from(data).copy(out, 8);
  const crcBuf = Buffer.alloc(4 + data.length);
  crcBuf.write(type, 0, 'ascii');
  Buffer.from(data).copy(crcBuf, 4);
  out.writeUInt32BE(crc32(crcBuf), 8 + data.length);
  return out;
}

function encodePng(width: number, height: number, rgb: Uint8Array): Buffer {
  // raw scanlines, each prefixed by filter byte 0
  const stride = width * 3;
  const raw = Buffer.alloc((stride + 1) * height);
  for (let y = 0; y < height; y++) {
    raw[y * (stride + 1)] = 0;
    Buffer.from(rgb.buffer, rgb.byteOffset + y * stride, stride).copy(raw, y * (stride + 1) + 1);
  }
  const ihdr = Buffer.alloc(13);
  ihdr.writeUInt32BE(width, 0);
  ihdr.writeUInt32BE(height, 4);
  ihdr[8] = 8; // bit depth
  ihdr[9] = 2; // colour type: truecolour RGB
  ihdr[10] = 0; // compression
  ihdr[11] = 0; // filter
  ihdr[12] = 0; // interlace
  return Buffer.concat([
    Buffer.from([0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a]),
    chunk('IHDR', ihdr),
    chunk('IDAT', deflateSync(raw, { level: 9 })),
    chunk('IEND', new Uint8Array(0)),
  ]);
}

/* ------------------------------------------------------------------ */
/* 6. Main                                                            */
/* ------------------------------------------------------------------ */
render();
const png = encodePng(W, H, px);

// Verify the encoded buffer before writing it out.
const PNG_MAGIC = Buffer.from([0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a]);
if (!png.subarray(0, 8).equals(PNG_MAGIC)) throw new Error('bad PNG magic');
if (png.readUInt32BE(16) !== W || png.readUInt32BE(20) !== H) {
  throw new Error('IHDR size mismatch');
}

const outDir = process.env.MAKEFUN_OUTPUT_DIR
  ? resolve(process.env.MAKEFUN_OUTPUT_DIR)
  : resolve('output');
mkdirSync(outDir, { recursive: true });
const outPath = resolve(outDir, 'entry.png');
writeFileSync(outPath, png);
process.stdout.write(
  `${outPath} ${png.length} bytes ${W}x${H} ${NEWS.length} stories\n`,
);
