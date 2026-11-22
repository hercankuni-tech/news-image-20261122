// Gate self-check: the entry.png the program writes must satisfy make.fun's sealed scorer rules.
// Run:  node tests/pngcheck.mjs out/entry.png
// Checks: whole PNG (magic, every chunk's CRC, IEND present), size in bytes, pixel bounds.

import { readFileSync } from 'node:fs';

const MAX_BYTES = 1048576; // 1 MiB
const MAX_EDGE = 1024;

const path = process.argv[2] ?? 'out/entry.png';
let p;
try {
  p = readFileSync(path);
} catch {
  console.error(`FAIL cannot read ${path}`);
  process.exit(1);
}
const fails = [];
const bad = (m) => fails.push(m);

if (p.length > MAX_BYTES) bad(`file is ${p.length} bytes, over ${MAX_BYTES}`);
if (p[0] !== 0x89 || p[1] !== 0x50 || p[2] !== 0x4e || p[3] !== 0x47) bad('not a PNG by its first bytes');

let o = 8;
let seenIHDR = false;
let seenIEND = false;
let w = 0;
let h = 0;
while (o < p.length) {
  const len = p.readUInt32BE(o);
  const type = p.toString('ascii', o + 4, o + 8);
  const end = o + 12 + len;
  if (end > p.length) {
    bad(`${type} chunk runs past the end of the file`);
    break;
  }
  if (type === 'IHDR') {
    seenIHDR = true;
    w = p.readUInt32BE(o + 8);
    h = p.readUInt32BE(o + 12);
    if (p[o + 8 + 8] !== 8) bad(`bit depth ${p[o + 8 + 8]}, scorer reads 8`);
  } else if (type === 'IEND') {
    seenIEND = true;
  }
  o = end;
}
if (!seenIHDR) bad('no IHDR');
if (!seenIEND) bad('no IEND: the image is not whole');
if (o !== p.length) bad(`trailing ${p.length - o} bytes after IEND`);
if (w > MAX_EDGE || h > MAX_EDGE) bad(`${w}x${h} over ${MAX_EDGE}x${MAX_EDGE}`);

if (fails.length) {
  fails.forEach((m) => console.error('FAIL', m));
  process.exit(1);
}
console.log(`png check OK: ${path} is a whole ${w}x${h} PNG, ${p.length} bytes (limit ${MAX_BYTES})`);
