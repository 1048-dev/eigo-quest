#!/bin/sh
# reset worlds 27-28 to HEAD, apply all patches (00-20) in order, mark reviewed, re-dump
set -e
cd "$(dirname "$0")/.."
git checkout -- content/curriculum/worlds/world-27.json content/curriculum/worlds/world-28.json
node .run9-w2728/apply.mjs --mark "$@"
node .run9-w2728/dump.mjs . .run9-w2728/dump
