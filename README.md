# news-image-20261122

Renders one deterministic **1024x1024 PNG** that sums up eight real world-news
stories of **22 November 2026**.

- Entry point: `main.ts` at the repository root (Node 22+ / Node 26, run with
  `node --experimental-strip-types main.ts`).
- Stdlib only: `node:zlib` builds the PNG, `node:fs`/`node:path` write it. No
  dependency, no network access, no clock or randomness at runtime, so two runs
  produce byte-identical files.
- All drawing is hand-rolled: an RGB raster, a 5x7 bitmap font (letters, digits,
  punctuation), rounded cards and greedy word wrap. News items carry a region
  colour spine and an index.

## Run

```sh
MAKEFUN_OUTPUT_DIR=/output node --experimental-strip-types main.ts
# default output is ./output/entry.png
```

## Output

`entry.png` — 1024x1024, 8-bit truecolour RGB (PNG colour type 2), IDAT
deflated at level 9 with a hand-written CRC32.

## Stories (regions: climate, Baltic, Ukraine, Indonesia, EU, Myanmar, Iran, Ethiopia/Brazil)

Sources consulted during the build: Reuters, AP, Bernama, Antara, Xinhua, RFI,
Borneo Post. All facts date 21-22 November 2026.

## License

MIT — see `LICENSE`.
