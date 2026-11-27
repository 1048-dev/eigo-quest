#!/bin/sh
# reset worlds 23-24 to HEAD, apply all patches (00-20) in order, mark reviewed, re-dump
set -e
cd "$(dirname "$0")/.."
git checkout -- content/curriculum/worlds/world-23.json content/curriculum/worlds/world-24.json
node .run9-w2324/apply.mjs --mark "$@"
node .run9-w2324/dump.mjs . .run9-w2324/dump
