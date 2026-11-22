# the-world-in-a-day

One image summarising the world's news of **Sunday 22 November 2026**, drawn by a Node program
from a fixed story table. Entered in make.fun's "Sum up 22 November's world news in one image"
bounty.

[![make.fun · news-image-20261122](https://make.fun/badge/news-image-20261122.svg)](https://make.fun/bounty/news-image-20261122?utm_source=github&utm_medium=readme&utm_campaign=news-image-20261122)

## What it draws

A 1024×1024 front page:

- masthead **THE WORLD IN A DAY** with the date line *SUNDAY 22 NOVEMBER 2026*;
- six panels, each a region/beat with its own accent colour, a pixel pictogram, a headline and a
  few lines of body text: Ukraine–Russia, COP31 climate talks, the Middle East, the Americas,
  AI/markets, Asia;
- a footer ticker with four more stories of the day and the sources.

Every story was first carried by a public news feed or wire report dated 22 November 2026. Nothing
in the image is speculation.

## Run it

```sh
mkdir -p out && MAKEFUN_OUTPUT_DIR=out node main.ts
node tests/layoutcheck.mjs      # every text box stays inside its panel
node tests/pngcheck.mjs out/entry.png   # whole PNG, ≤ 1 MiB, ≤ 1024×1024
```

`main.ts` needs only Node 22 and the standard library — no packages, no network. It draws its own
raster and its own 5×7 bitmap font and encodes the PNG with `node:zlib`, so two runs write
identical bytes.

## Checks

- `tests/layoutcheck.mjs` — word wrapping and panel arithmetic against the real story table, plus
  glyph coverage of the font.
- `tests/pngcheck.mjs` — PNG structure: magic bytes, every chunk's length and CRC, IEND present,
  size in bytes and pixels against the scorer's limits.

## License

MIT — see [LICENSE](LICENSE).
