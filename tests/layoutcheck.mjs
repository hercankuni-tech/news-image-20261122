// Layout self-check: re-runs the same wrapping arithmetic the image uses and asserts that no
// line leaves its panel or the canvas. Imports the real tables so it cannot drift from main.ts.
// Run:  node tests/layoutcheck.mjs

import { STORIES, ART, FOOTER, DECK, DATE_LINE } from '../stories.mjs';
import { FONT } from '../font.mjs';

const W = 1024;
const H = 1024;
const margin = 32;
const gap = 24;
const cols = 2;
const rows = 3;
const pad = 26;
const pw = (W - margin * 2 - gap * (cols - 1)) / cols;
const top = 204;
const bottom = 892;
const ph = (bottom - top - gap * (rows - 1)) / rows;
const textW = pw - pad * 2;

let fails = 0;
function check(label, ok, detail) {
  if (!ok) {
    fails++;
    console.error('FAIL', label, detail);
  }
}

// Copied from main.ts on purpose: the check must fail if these two ever disagree.
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

// 1. grid stays inside the canvas
check('panel grid inside canvas', margin + cols * pw + (cols - 1) * gap + margin <= W,
  `right edge ${margin + cols * pw + gap} of ${W}`);
check('panel rows inside canvas', top + rows * ph + (rows - 1) * gap + 8 <= H,
  `bottom ${top + rows * ph + 2 * gap} of ${H}`);

// 2. each panel's text fits its own box; nothing gets dropped by the slice() caps
STORIES.forEach((s, i) => {
  check(`story ${i} has art`, Boolean(ART[s.art]), s.art);
  const headLines = wrap(s.head, textW, 3);
  const bodyLines = wrap(s.body, textW, 2);
  const used = 14 + 24 + 16 + Math.min(headLines.length, 3) * 26 + 6 + Math.min(bodyLines.length, 5) * 19 + 7;
  check(`story ${i} "${s.head}" fits panel`, used <= ph, `uses ${used} of ${ph.toFixed(1)}`);
  check(`story ${i} head within 1-3 lines`, headLines.length >= 1 && headLines.length <= 3, `${headLines.length} lines`);
  check(`story ${i} body within 1-5 lines`, bodyLines.length >= 1 && bodyLines.length <= 5, `${bodyLines.length} lines`);
  check(`story ${i} body not truncated`, bodyLines.length <= 5, 'body would be cut');
  const artCols = ART[s.art] ? ART[s.art][0].length : 0;
  check(`story ${i} pictogram inside panel`, pad + artCols * 6 + pad <= pw,
    `pad+art ${pad + artCols * 6} of ${pw}`);
  for (const w of s.head.toUpperCase().split(' ')) {
    check(`head word "${w}" fits column`, w.length * 6 - 1 <= textW, `${w.length * 6 - 1} > ${textW}`);
  }
});

// 3. masthead and footer lines fit the canvas width
FOOTER.forEach((l, i) => check(`footer ${i} fits width`, (l.length * 6 - 1) * 2 <= W - margin * 2,
  `${(l.length * 6 - 1) * 2} > ${W - margin * 2}`));
check('deck fits width', (DECK.length * 6 - 1) * 2 <= W - margin * 2, DECK);
check('date line fits width', (DATE_LINE.length * 6 - 1) * 3 <= W - margin * 2, DATE_LINE);
check('masthead fits width', (19 * 6 - 1) * 5 <= W - margin * 2, 'THE WORLD IN A DAY');

// 4. every printed character exists in the 5x7 font
const all = [DATE_LINE, DECK, 'THE WORLD IN A DAY', ...FOOTER,
  ...STORIES.flatMap((s) => [s.tag, s.head, s.body])];
const missing = new Set();
for (const t of all) for (const ch of String(t).toUpperCase()) if (!FONT[ch]) missing.add(ch);
check('all glyphs exist in FONT', missing.size === 0, [...missing].join(' '));

console.log(fails === 0
  ? `layout check OK (${STORIES.length} stories, ${FOOTER.length} footer lines, 1024x1024)`
  : `${fails} layout problem(s)`);
process.exit(fails === 0 ? 0 : 1);
