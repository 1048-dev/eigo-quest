#!/bin/sh
# reset worlds 31-32 to HEAD, apply all patches (00-20) in order, mark reviewed, re-dump
set -e
cd "$(dirname "$0")/.."
git checkout -- content/curriculum/worlds/world-31.json content/curriculum/worlds/world-32.json
node .run9-w3132/apply.mjs --mark "$@"
node .run9-w3132/dump.mjs . .run9-w3132/dump
