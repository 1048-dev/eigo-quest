#!/bin/sh
# copy the W29-30 toolkit and adapt it to worlds 31-32 (L901-960)
set -e
cd "$(dirname "$0")/../.."
mkdir -p .run9-w3132/patches .run9-w3132/notes
for f in lib.mjs dump.mjs apply.mjs check.ts checkall.ts partner.ts scan.mjs ctx.mjs items.mjs changes.mjs build-doc.mjs reapply.sh; do
  sed -e 's/w2930/w3132/g' -e 's/\[29, 30\]/[31, 32]/g' -e 's/n <= 870 ? 29 : 30/n <= 930 ? 31 : 32/' \
      -e 's/841/901/g' -e 's/<= 900/<= 960/g' -e 's/> 900/> 960/g' -e 's/W29-30/W31-32/g' \
      -e 's/world-29\.json/world-31.json/g' -e 's/world-30\.json/world-32.json/g' -e 's/worlds 29-30/worlds 31-32/g' \
      ".run9-w2930/$f" > ".run9-w3132/$f"
done
grep -n -E "29|30|84[0-9]|87[0-9]|900" .run9-w3132/*.mjs .run9-w3132/*.ts .run9-w3132/*.sh | grep -v "1 << 28" || true
