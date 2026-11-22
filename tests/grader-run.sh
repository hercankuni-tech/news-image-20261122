// Run it like the grader does, with /bot read-only and /output writable.
// Requires Docker; the pinned Node digest is the one in the bounty's RULES.txt.

set -euo pipefail
REPO="$(cd "$(dirname "$0")" && pwd)"
OUT="$(mktemp -d)"
chmod 777 "$OUT"
docker run --rm --network none --cap-drop ALL --security-opt no-new-privileges \
  --read-only --tmpfs /tmp:rw,size=256m -u 65534:65534 \
  --memory 512m --memory-swap 512m --cpus 1 --pids-limit 64 \
  -e TZ=UTC -e PYTHONHASHSEED=0 -e LANG=C.UTF-8 \
  -e MAKEFUN_BOT_DIR=/bot -e MAKEFUN_OUTPUT_DIR=/output \
  -v "$REPO":/bot:ro -v "$OUT":/output \
  --entrypoint node \
  node@sha256:de170b39439eb0e5a3444ad7d60b015614a381e10fecae2e30ec9e735122f38d \
  /bot/main.ts
node "$REPO/tests/pngcheck.mjs" "$OUT/entry.png"
